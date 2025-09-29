<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Illuminate\Support\Facades\DB;

class SupplierController extends Controller
{
    /**
     * Display a listing of the suppliers.
     */
    public function listSuppliers(Request $request)
    {
        $query = Supplier::query()->whereNull('deleted_at');

        // Ajouter le comptage des produits
        $query->withCount('products');

        // Filtres
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('supplier_name', 'like', '%' . $request->search . '%')
                  ->orWhere('company_name', 'like', '%' . $request->search . '%')
                  ->orWhere('supplier_email', 'like', '%' . $request->search . '%');
            });
        }
        if ($request->filled('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        $sort = $request->get('sort', 'id');
        $direction = $request->get('direction', 'desc');
        $query->orderBy($sort, $direction);

        $perPage = $request->get('perPage', 10);
        $suppliers = $query->paginate($perPage)->appends($request->all());

        // Mapper les données pour correspondre aux attentes du frontend
        $suppliers->getCollection()->transform(function ($supplier) {
            return [
                'id' => $supplier->id,
                'company_name' => $supplier->company_name ?? $supplier->supplier_name,
                'contact_person' => $supplier->supplier_name,
                'email' => $supplier->supplier_email,
                'phone' => $supplier->supplier_phone_one,
                'address' => $supplier->supplier_address ?? $supplier->company_address,
                'city' => null, // Pas dans la base actuelle
                'country' => null, // Pas dans la base actuelle
                'logo' => $supplier->image,
                'status' => $supplier->status,
                'products_count' => $supplier->products_count,
                'created_at' => $supplier->created_at,
                'updated_at' => $supplier->updated_at,
            ];
        });

        return Inertia::render('Admin/Suppliers/Index', [
            'title' => 'Supplier List',
            'suppliers' => $suppliers,
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
     * Store a newly created supplier in storage.
     */
    public function storeSuppliers(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'supplier_name' => 'required|string|max:255',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'supplier_phone_one' => 'required|string|max:255',
                'supplier_phone_two' => 'nullable|string|max:255',
                'company_name' => 'nullable|string|max:255',
                'company_address' => 'nullable|string|max:500',
                'supplier_address' => 'nullable|string|max:500',
                'company_email' => 'nullable|email|max:255',
                'company_phone' => 'nullable|string|max:255',
                'supplier_email' => 'nullable|email|max:255',
                'previous_due' => 'nullable|numeric|min:0',
                'status' => 'required|boolean',
            ]);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $this->supplierImageSave($request->file('image'));
            }

            $supplier = new Supplier();
            $supplier->supplier_name = $validated['supplier_name'];
            $supplier->image = $imagePath;
            $supplier->supplier_phone_one = $validated['supplier_phone_one'];
            $supplier->supplier_phone_two = $validated['supplier_phone_two'];
            $supplier->company_name = $validated['company_name'];
            $supplier->company_address = $validated['company_address'];
            $supplier->supplier_address = $validated['supplier_address'];
            $supplier->company_email = $validated['company_email'];
            $supplier->company_phone = $validated['company_phone'];
            $supplier->supplier_email = $validated['supplier_email'];
            $supplier->previous_due = $validated['previous_due'] ?? 0;
            $supplier->status = $validated['status'];
            $supplier->created_at = now();
            $supplier->created_by = auth()->id();
            $supplier->save();

            DB::commit();

            return redirect()->route('admin.suppliers.list')->with([
                'flash' => [
                    'success' => 'Supplier created successfully!'
                ]
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'An error occurred while creating the supplier'])->withInput();
        }
    }

    /**
     * Update the specified supplier in storage.
     */
    public function updateSuppliers(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'supplier_name' => 'required|string|max:255',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'supplier_phone_one' => 'required|string|max:255',
                'supplier_phone_two' => 'nullable|string|max:255',
                'company_name' => 'nullable|string|max:255',
                'company_address' => 'nullable|string|max:500',
                'supplier_address' => 'nullable|string|max:500',
                'company_email' => 'nullable|email|max:255',
                'company_phone' => 'nullable|string|max:255',
                'supplier_email' => 'nullable|email|max:255',
                'previous_due' => 'nullable|numeric|min:0',
                'status' => 'required|boolean',
            ]);

            $supplier = Supplier::findOrFail($id);

            // Gérer l'image
            $imagePath = $supplier->image;
            if ($request->hasFile('image')) {
                // Supprimer l'ancienne image si elle existe
                if ($supplier->image) {
                    $oldImagePath = str_replace('storage/', '', $supplier->image);
                    if (Storage::disk('public')->exists($oldImagePath)) {
                        Storage::disk('public')->delete($oldImagePath);
                    }
                }
                $imagePath = $this->supplierImageSave($request->file('image'));
            }

            $supplier->supplier_name = $validated['supplier_name'];
            $supplier->image = $imagePath;
            $supplier->supplier_phone_one = $validated['supplier_phone_one'];
            $supplier->supplier_phone_two = $validated['supplier_phone_two'];
            $supplier->company_name = $validated['company_name'];
            $supplier->company_address = $validated['company_address'];
            $supplier->supplier_address = $validated['supplier_address'];
            $supplier->company_email = $validated['company_email'];
            $supplier->company_phone = $validated['company_phone'];
            $supplier->supplier_email = $validated['supplier_email'];
            $supplier->previous_due = $validated['previous_due'] ?? 0;
            $supplier->status = $validated['status'];
            $supplier->updated_at = now();
            $supplier->updated_by = auth()->id();
            $supplier->save();

            DB::commit();

            return redirect()->route('admin.suppliers.list')->with([
                'flash' => [
                    'success' => 'Supplier updated successfully!'
                ]
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'An error occurred while updating the supplier'])->withInput();
        }
    }

    /**
     * Remove the specified supplier from storage (soft delete).
     */
    public function deleteSuppliers($id)
    {
        DB::beginTransaction();
        try {
            $supplier = Supplier::findOrFail($id);
            $supplier->deleted_at = now();
            $supplier->deleted_by = auth()->id();
            $supplier->save();

            DB::commit();

            return redirect()->route('admin.suppliers.list')->with([
                'flash' => [
                    'success' => 'Supplier deleted successfully!'
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'An error occurred while deleting the supplier']);
        }
    }

    /**
     * Save and optimize the supplier image.
     */
    protected function supplierImageSave($image)
    {
        if ($image) {
            $fileName = "supplier-" . time() . rand(1000, 9999) . '.webp';
            $filePath = 'supplier_icons/' . $fileName;

            $imageManager = new ImageManager(new GdDriver());
            $img = $imageManager->read($image);
            $img->resize(200, 200);
            $encodedImageContent = $img->toWebp(70);

            Storage::disk('public')->put($filePath, $encodedImageContent);

            return 'storage/' . $filePath;
        }
        return null;
    }
}
