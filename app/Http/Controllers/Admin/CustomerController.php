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
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
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
        $query = Ecommerce_customer::query()->whereNull('deleted_at');

        // Ajouter le comptage des commandes
        $query->withCount('sells');

        // Recherche globale
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', '%' . $search . '%')
                  ->orWhere('last_name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%')
                  ->orWhere('phone_one', 'like', '%' . $search . '%');
            });
        }

        // Filtres par statut
        if ($request->filled('status') && $request->status !== '') {
            $query->where('status', $request->boolean('status'));
        }

        // Tri
        $sort = $request->get('sort', 'id');
        $direction = $request->get('direction', 'desc');
        $query->orderBy($sort, $direction);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $customerList = $query->paginate($perPage)->appends($request->all());

        // Enrichir les données avec les statistiques
        $customerList->getCollection()->transform(function ($customer) {
            $customer->total_orders = $customer->getTotalOrdersCount();
            $customer->total_amount = $customer->getTotalOrdersAmount();
            $customer->last_order_date = $customer->getLastOrderDate();
            $customer->full_name = $customer->first_name . ' ' . $customer->last_name;
            return $customer;
        });

        // Calcul des statistiques
        $stats = [
            'total_customers' => Ecommerce_customer::whereNull('deleted_at')->count(),
            'active_customers' => Ecommerce_customer::whereNull('deleted_at')->where('status', true)->count(),
            'inactive_customers' => Ecommerce_customer::whereNull('deleted_at')->where('status', false)->count(),
            'customers_with_orders' => Ecommerce_customer::whereNull('deleted_at')->has('sells')->count(),
        ];

        return Inertia::render('Admin/Customers/Index', [
            'title' => 'Gestion des clients',
            'customerList' => $customerList,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'per_page' => $perPage,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new customer.
     */
    public function create()
    {
        return Inertia::render('Admin/Customers/Create', [
            'title' => 'Nouveau client',
        ]);
    }

    /**
     * Store a newly created customer in storage.
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|email|unique:ecommerce_customers,email',
                'phone_one' => 'required|string|max:20',
                'phone_two' => 'nullable|string|max:20',
                'present_address' => 'required|string',
                'permanent_address' => 'nullable|string',
                'password' => 'required|string|min:8|confirmed',
                'image' => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp,image/gif,image/jpg,image/pjpeg,image/x-png,image/avif,application/octet-stream|mimes:jpg,jpeg,png,gif,webp,avif|max:2048',
                'status' => 'nullable',
            ]);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $this->customerImageSave($request->file('image'));
            }

            $customer = Ecommerce_customer::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone_one' => $validated['phone_one'],
                'phone_two' => $validated['phone_two'] ?? null,
                'present_address' => $validated['present_address'],
                'permanent_address' => $validated['permanent_address'] ?? null,
                'password' => Hash::make($validated['password']),
                'image' => $imagePath,
                'status' => $request->boolean('status'),
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);

            DB::commit();

            return redirect()->route('admin.customers.index')->with([
                'success' => 'Client créé avec succès!'
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la création du client: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la création du client'])->withInput();
        }
    }

    /**
     * Show the form for editing the specified customer.
     */
    public function edit(Ecommerce_customer $customer)
    {
        return Inertia::render('Admin/Customers/Edit', [
            'title' => 'Modifier le client - ' . $customer->first_name . ' ' . $customer->last_name,
            'customer' => $customer,
        ]);
    }

    /**
     * Display the specified customer.
     */
    public function show(Ecommerce_customer $customer)
    {
        return Inertia::render('Admin/Customers/Show', [
            'title' => 'Client - ' . $customer->first_name . ' ' . $customer->last_name,
            'customer' => $customer,
        ]);
    }

    /**
     * Update the specified customer in storage.
     */
    public function update(Request $request, Ecommerce_customer $customer)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|email|unique:ecommerce_customers,email,' . $customer->id,
                'phone_one' => 'required|string|max:20',
                'phone_two' => 'nullable|string|max:20',
                'present_address' => 'required|string',
                'permanent_address' => 'nullable|string',
                'password' => 'nullable|string|min:8|confirmed',
                'image' => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp,image/gif,image/jpg,image/pjpeg,image/x-png,image/avif,application/octet-stream|mimes:jpg,jpeg,png,gif,webp,avif|max:2048',
                'status' => 'nullable',
            ]);

            // Gérer l'image
            $imagePath = $customer->image;
            if ($request->hasFile('image')) {
                // Supprimer l'ancienne image
                if ($customer->image && Storage::disk('public')->exists(str_replace('storage/', '', $customer->image))) {
                    Storage::disk('public')->delete(str_replace('storage/', '', $customer->image));
                }
                $imagePath = $this->customerImageSave($request->file('image'));
            }

            $updateData = [
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone_one' => $validated['phone_one'],
                'phone_two' => $validated['phone_two'] ?? null,
                'present_address' => $validated['present_address'],
                'permanent_address' => $validated['permanent_address'] ?? null,
                'image' => $imagePath,
                'status' => $request->boolean('status'),
                'updated_by' => auth()->id(),
            ];

            // Gestion du mot de passe
            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            $customer->update($updateData);

            DB::commit();

            return redirect()->route('admin.customers.index')->with([
                'success' => 'Client modifié avec succès!'
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la modification du client: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la modification du client'])->withInput();
        }
    }

    /**
     * Remove the specified customer from storage (soft delete).
     */
    public function destroy(Ecommerce_customer $customer)
    {
        DB::beginTransaction();
        try {
            // Vérifier si le client a des commandes
            if ($customer->sells()->count() > 0) {
                return back()->withErrors(['error' => 'Impossible de supprimer ce client car il a ' . $customer->sells()->count() . ' commande(s) associée(s).']);
            }

            // Utiliser la méthode delete() du trait SoftDeletes
            $customer->delete();

            DB::commit();

            return redirect()->route('admin.customers.index')->with([
                'success' => 'Client supprimé avec succès!'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la suppression du client: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la suppression du client']);
        }
    }

    /**
     * Save and optimize the customer image.
     */
    protected function customerImageSave($image)
    {
        if ($image) {
            $fileName = "customer-" . time() . rand(1000, 9999) . '.webp';
            $filePath = 'customer_images/' . $fileName;

            $imageManager = new ImageManager(new GdDriver());
            try {
                $img = $imageManager->read($image);
            } catch (\Throwable $e) {
                \Log::warning('GD failed to read customer image, trying Imagick: ' . $e->getMessage());
                try {
                    $imageManager = new ImageManager(new \Intervention\Image\Drivers\Imagick\Driver());
                    $img = $imageManager->read($image);
                } catch (\Throwable $e2) {
                    \Log::error('Imagick failed to read customer image: ' . $e2->getMessage());
                    throw ValidationException::withMessages([
                        'image' => "Format d'image non supporté (activez AVIF ou utilisez JPG/PNG/WEBP)."
                    ]);
                }
            }
            $img->resize(300, 300);
            $encodedImageContent = $img->toWebp(70);

            Storage::disk('public')->put($filePath, $encodedImageContent);

            return 'storage/' . $filePath;
        }
        return null;
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
            try {
                $image = $manager->read($file);
            } catch (\Throwable $e) {
                \Log::warning('GD failed to read customer image (handleImageUpload), trying Imagick: ' . $e->getMessage());
                try {
                    $manager = new ImageManager(new \Intervention\Image\Drivers\Imagick\Driver());
                    $image = $manager->read($file);
                } catch (\Throwable $e2) {
                    \Log::error('Imagick failed to read customer image (handleImageUpload): ' . $e2->getMessage());
                    throw ValidationException::withMessages([
                        'image' => "Format d'image non supporté (activez AVIF ou utilisez JPG/PNG/WEBP)."
                    ]);
                }
            }
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
