<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreCustomerRequest;
use App\Http\Requests\Customer\UpdateCustomerRequest;
use App\Models\Ecommerce_customer;
use App\Models\Sell;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    /**
     * Display a listing of the customers.
     */
    public function index(Request $request)
    {
        $query = Ecommerce_customer::query()->with(['sells']);

        // Filtres
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Tri
        $sort = $request->get('sort', 'id');
        $direction = $request->get('direction', 'desc');
        $query->orderBy($sort, $direction);

        // Pagination
        $perPage = $request->get('perPage', 15);
        $customerList = $query->paginate($perPage)->appends($request->all());

        // Enrichir les données avec les statistiques
        $customerList->getCollection()->transform(function ($customer) {
            $customer->total_orders = $customer->getTotalOrdersCount();
            $customer->total_amount = $customer->getTotalOrdersAmount();
            $customer->last_order_date = $customer->getLastOrderDate();
            return $customer;
        });

        return Inertia::render('Admin/Customers/Index', [
            'title' => 'Customer Management',
            'customers' => $customerList,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'perPage' => $perPage,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'flash' => [
                'success' => session('flash.success'),
                'error' => session('flash.error'),
            ],
        ]);
    }

    /**
     * Store a newly created customer in storage.
     */
    public function store(StoreCustomerRequest $request)
    {
        try {
            DB::beginTransaction();

            $validatedData = $request->validated();

            // Hash du mot de passe
            $validatedData['password'] = Hash::make($validatedData['password']);

            // Gestion de l'image
            if ($request->hasFile('image')) {
                $validatedData['image'] = $this->handleImageUpload($request->file('image'));
            }

            // Audit trail
            $validatedData['created_by'] = auth()->id();
            $validatedData['updated_by'] = auth()->id();

            $customer = Ecommerce_customer::create($validatedData);

            DB::commit();

            return redirect()->back()->with('flash.success', 'Customer created successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error creating customer: ' . $e->getMessage());
            return redirect()->back()->with('flash.error', 'Failed to create customer. Please try again.');
        }
    }

    /**
     * Display the specified customer.
     */
    public function show(Request $request, $id)
    {
        $customer = Ecommerce_customer::with([
            'sells' => function($query) {
                $query->with(['sellDetails.product', 'paymentInfo'])
                      ->orderBy('created_at', 'desc');
            }
        ])->findOrFail($id);

        // Statistiques du client
        $stats = [
            'total_orders' => $customer->getTotalOrdersCount(),
            'total_amount' => $customer->getTotalOrdersAmount(),
            'last_order_date' => $customer->getLastOrderDate(),
            'average_order_value' => $customer->total_orders > 0 
                ? $customer->getTotalOrdersAmount() / $customer->total_orders 
                : 0,
        ];

        // Filtres pour l'historique des commandes
        $ordersQuery = $customer->sells();

        if ($request->filled('order_search')) {
            $ordersQuery->where('invoice_no', 'like', '%' . $request->order_search . '%');
        }

        if ($request->filled('order_status')) {
            $ordersQuery->where('status', $request->order_status);
        }

        $orders = $ordersQuery->with(['sellDetails.product', 'paymentInfo'])
                             ->orderBy('created_at', 'desc')
                             ->paginate(10)
                             ->appends($request->all());

        return Inertia::render('Admin/Customers/show', [
            'title' => 'Customer Details',
            'customer' => $customer,
            'stats' => $stats,
            'orders' => $orders,
            'filters' => [
                'order_search' => $request->order_search,
                'order_status' => $request->order_status,
            ],
        ]);
    }

    /**
     * Update the specified customer in storage.
     */
    public function update(UpdateCustomerRequest $request, $id)
    {
        try {
            DB::beginTransaction();

            $customer = Ecommerce_customer::findOrFail($id);
            $validatedData = $request->validated();

            // Gestion du mot de passe
            if (!empty($validatedData['password'])) {
                $validatedData['password'] = Hash::make($validatedData['password']);
            } else {
                unset($validatedData['password']);
            }

            // Gestion de l'image
            if ($request->hasFile('image')) {
                // Supprimer l'ancienne image
                if ($customer->image && Storage::exists('public/' . $customer->image)) {
                    Storage::delete('public/' . $customer->image);
                }
                $validatedData['image'] = $this->handleImageUpload($request->file('image'));
            } elseif ($request->boolean('remove_image')) {
                // Supprimer l'image si demandé
                if ($customer->image && Storage::exists('public/' . $customer->image)) {
                    Storage::delete('public/' . $customer->image);
                }
                $validatedData['image'] = null;
            }

            // Audit trail
            $validatedData['updated_by'] = auth()->id();

            // Nettoyer les données avant la mise à jour
            unset($validatedData['remove_image']);
            unset($validatedData['password_confirmation']);

            $customer->update($validatedData);

            DB::commit();

            return redirect()->back()->with('flash.success', 'Customer updated successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error updating customer: ' . $e->getMessage());
            return redirect()->back()->with('flash.error', 'Failed to update customer. Please try again.');
        }
    }

    /**
     * Remove the specified customer from storage.
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $customer = Ecommerce_customer::findOrFail($id);

            // Vérifier s'il y a des commandes liées
            $hasOrders = $customer->sells()->exists();
            
            if ($hasOrders) {
                // Soft delete si il y a des commandes
                $customer->update([
                    'deleted_by' => auth()->id(),
                ]);
                $customer->delete();
                $message = 'Customer deactivated successfully (has order history).';
            } else {
                // Supprimer l'image
                if ($customer->image && Storage::exists('public/' . $customer->image)) {
                    Storage::delete('public/' . $customer->image);
                }
                // Hard delete si pas de commandes
                $customer->forceDelete();
                $message = 'Customer deleted permanently.';
            }

            DB::commit();

            return redirect()->back()->with('flash.success', $message);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error deleting customer: ' . $e->getMessage());
            return redirect()->back()->with('flash.error', 'Failed to delete customer. Please try again.');
        }
    }

    /**
     * Handle image upload with optimization.
     */
    private function handleImageUpload($file)
    {
        try {
            $manager = new ImageManager(new GdDriver());

            // Générer un nom unique
            $filename = 'customer_' . time() . '_' . uniqid() . '.webp';
            $path = 'customers/' . $filename;

            // Redimensionner et optimiser l'image
            $image = $manager->read($file);
            $image->scale(width: 400); // Redimensionner à 400px de largeur max
            $image->toWebp(90); // Convertir en WebP avec 90% de qualité

            // Sauvegarder
            Storage::put('public/' . $path, (string) $image->encode());

            return $path;

        } catch (\Exception $e) {
            \Log::error('Error uploading image: ' . $e->getMessage());
            throw new \Exception('Failed to upload image');
        }
    }

    /**
     * Export customers to CSV (bonus feature).
     */
    public function export(Request $request)
    {
        $query = Ecommerce_customer::query();

        // Appliquer les mêmes filtres que l'index
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        $customers = $query->orderBy('created_at', 'desc')->get();

        $csvData = [];
        $csvData[] = [
            'ID',
            'First Name',
            'Last Name',
            'Email',
            'Phone',
            'Status',
            'Total Orders',
            'Total Amount',
            'Last Order Date',
            'Created At'
        ];

        foreach ($customers as $customer) {
            $csvData[] = [
                $customer->id,
                $customer->first_name,
                $customer->last_name,
                $customer->email,
                $customer->phone_one,
                $customer->status_text,
                $customer->getTotalOrdersCount(),
                number_format($customer->getTotalOrdersAmount(), 2),
                $customer->getLastOrderDate()?->format('Y-m-d H:i:s') ?? 'N/A',
                $customer->created_at->format('Y-m-d H:i:s'),
            ];
        }

        $filename = 'customers_export_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($csvData) {
            $file = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Bulk delete customers.
     */
    public function bulkDelete(Request $request)
    {
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'integer|exists:ecommerce_customers,id'
            ]);

            DB::beginTransaction();

            $deletedCount = 0;
            $deactivatedCount = 0;

            foreach ($request->ids as $id) {
                $customer = Ecommerce_customer::findOrFail($id);
                
                // Vérifier s'il y a des commandes liées
                $hasOrders = $customer->sells()->exists();
                
                if ($hasOrders) {
                    // Soft delete si il y a des commandes
                    $customer->update(['deleted_by' => auth()->id()]);
                    $customer->delete();
                    $deactivatedCount++;
                } else {
                    // Hard delete si pas de commandes
                    if ($customer->image && \Storage::exists('public/' . $customer->image)) {
                        \Storage::delete('public/' . $customer->image);
                    }
                    $customer->forceDelete();
                    $deletedCount++;
                }
            }

            DB::commit();

            $message = '';
            if ($deletedCount > 0) {
                $message .= "$deletedCount client(s) supprimé(s). ";
            }
            if ($deactivatedCount > 0) {
                $message .= "$deactivatedCount client(s) désactivé(s) (avec historique de commandes).";
            }

            return redirect()->back()->with('flash.success', $message);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error bulk deleting customers: ' . $e->getMessage());
            return redirect()->back()->with('flash.error', 'Erreur lors de la suppression groupée.');
        }
    }

    /**
     * Bulk activate customers.
     */
    public function bulkActivate(Request $request)
    {
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'integer|exists:ecommerce_customers,id'
            ]);

            $count = Ecommerce_customer::whereIn('id', $request->ids)
                ->update([
                    'status' => 1,
                    'updated_by' => auth()->id()
                ]);

            return redirect()->back()->with('flash.success', "$count client(s) activé(s) avec succès.");

        } catch (\Exception $e) {
            \Log::error('Error bulk activating customers: ' . $e->getMessage());
            return redirect()->back()->with('flash.error', 'Erreur lors de l\'activation groupée.');
        }
    }

    /**
     * Bulk deactivate customers.
     */
    public function bulkDeactivate(Request $request)
    {
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'integer|exists:ecommerce_customers,id'
            ]);

            $count = Ecommerce_customer::whereIn('id', $request->ids)
                ->update([
                    'status' => 0,
                    'updated_by' => auth()->id()
                ]);

            return redirect()->back()->with('flash.success', "$count client(s) désactivé(s) avec succès.");

        } catch (\Exception $e) {
            \Log::error('Error bulk deactivating customers: ' . $e->getMessage());
            return redirect()->back()->with('flash.error', 'Erreur lors de la désactivation groupée.');
        }
    }
}