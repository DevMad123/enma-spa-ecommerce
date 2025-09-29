<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductSize;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ProductSizeController extends Controller
{
    /**
     * Display a listing of the sizes.
     */
    public function listSizes(Request $request)
    {
        $query = ProductSize::query();

        // Filtres
        if ($request->filled('search')) {
            $query->where('size', 'like', '%' . $request->search . '%');
        }

        $sort = $request->get('sort', 'id');
        $direction = $request->get('direction', 'desc');
        $query->orderBy($sort, $direction);

        // Récupérer toutes les tailles sans pagination pour simplifier
        $sizes = $query->get();

        return Inertia::render('Admin/Sizes/Index', [
            'title' => 'Size List',
            'sizes' => $sizes,
            'filters' => [
                'search' => $request->search,
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
     * Store a newly created size in storage.
     */
    public function storeSizes(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'size' => 'required|string|max:255|unique:product_sizes,size',
            ]);

            $size = new ProductSize();
            $size->size = $validated['size'];
            $size->save();

            DB::commit();

            return redirect()->route('admin.sizes.list')->with([
                'flash' => [
                    'success' => 'Size created successfully!'
                ]
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'An error occurred while creating the size'])->withInput();
        }
    }

    /**
     * Update the specified size in storage.
     */
    public function updateSizes(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'size' => 'required|string|max:255|unique:product_sizes,size,' . $id,
            ]);

            $size = ProductSize::findOrFail($id);
            $size->size = $validated['size'];
            $size->save();

            DB::commit();

            return redirect()->route('admin.sizes.list')->with([
                'flash' => [
                    'success' => 'Size updated successfully!'
                ]
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'An error occurred while updating the size'])->withInput();
        }
    }

    /**
     * Remove the specified size from storage.
     */
    public function deleteSizes($id)
    {
        DB::beginTransaction();
        try {
            $size = ProductSize::findOrFail($id);
            $size->delete();

            DB::commit();

            return redirect()->route('admin.sizes.list')->with([
                'flash' => [
                    'success' => 'Size deleted successfully!'
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'An error occurred while deleting the size']);
        }
    }
}
