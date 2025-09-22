<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Illuminate\Support\Facades\DB;

class BrandController extends Controller
{
    /**
     * Display a listing of the brands.
     */
    public function listBrands(Request $request)
    {
        $query = Brand::query()->whereNull('deleted_at');

        // Filtres
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        if ($request->filled('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        $sort = $request->get('sort', 'id');
        $direction = $request->get('direction', 'desc');
        $query->orderBy($sort, $direction);

        $perPage = $request->get('perPage', 10);
        $brandList = $query->paginate($perPage)->appends($request->all());

        return Inertia::render('Brands/list', [
            'title' => 'Brand List',
            'brandList' => $brandList,
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
     * Store a newly created brand in storage.
     */
    public function storeBrands(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'status' => 'required|in:0,1',
            ]);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $this->brandImageSave($request->file('image'));
            }

            $brand = new Brand();
            $brand->name = $validated['name'];
            $brand->image = $imagePath;
            $brand->status = $validated['status'];
            $brand->created_by = auth()->id();
            $brand->save();

            DB::commit();

            return redirect()->route('admin.brands.list')->with([
                'flash' => [
                    'success' => 'Brand created successfully!'
                ]
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'An error occurred while creating the brand'])->withInput();
        }
    }

    /**
     * Update the specified brand in storage.
     */
    public function updateBrands(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'status' => 'required|in:0,1',
            ]);

            $brand = Brand::findOrFail($id);

            // Gérer l'image
            $imagePath = $brand->image;
            if ($request->hasFile('image')) {
                // Supprimer l'ancienne image si elle existe
                if ($brand->image) {
                    $oldImagePath = str_replace('storage/', '', $brand->image);
                    if (Storage::disk('public')->exists($oldImagePath)) {
                        Storage::disk('public')->delete($oldImagePath);
                    }
                }
                $imagePath = $this->brandImageSave($request->file('image'));
            }

            $brand->name = $validated['name'];
            $brand->image = $imagePath;
            $brand->status = $validated['status'];
            $brand->updated_by = auth()->id();
            $brand->save();

            DB::commit();

            return redirect()->route('admin.brands.list')->with([
                'flash' => [
                    'success' => 'Brand updated successfully!'
                ]
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'An error occurred while updating the brand'])->withInput();
        }
    }

    /**
     * Remove the specified brand from storage (soft delete).
     */
    public function deleteBrands($id)
    {
        DB::beginTransaction();
        try {
            $brand = Brand::findOrFail($id);
            $brand->deleted_at = now();
            $brand->deleted_by = auth()->id();
            $brand->save();

            DB::commit();

            return redirect()->route('admin.brands.list')->with([
                'flash' => [
                    'success' => 'Brand deleted successfully!'
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'An error occurred while deleting the brand']);
        }
    }

    /**
     * Save and optimize the brand image.
     */
    protected function brandImageSave($image)
    {
        if ($image) {
            $fileName = "brand-" . time() . rand(1000, 9999) . '.webp';
            $filePath = 'brand_icons/' . $fileName;

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
