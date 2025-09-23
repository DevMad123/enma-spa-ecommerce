<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductColor;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ProductColorController extends Controller
{
    /**
     * Display a listing of the colors.
     */
    public function listColors(Request $request)
    {
        $query = ProductColor::query();

        // Filtres
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $sort = $request->get('sort', 'id');
        $direction = $request->get('direction', 'desc');
        $query->orderBy($sort, $direction);

        $perPage = $request->get('perPage', 10);
        $colorList = $query->paginate($perPage)->appends($request->all());

        return Inertia::render('Colors/list', [
            'title' => 'Color List',
            'colorList' => $colorList,
            'filters' => [
                'search' => $request->search,
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
     * Store a newly created color in storage.
     */
    public function storeColors(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:product_colors,name',
                'color_code' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            ]);

            $color = new ProductColor();
            $color->name = $validated['name'];
            $color->color_code = $validated['color_code'];
            $color->save();

            DB::commit();

            return redirect()->route('admin.colors.list')->with([
                'flash' => [
                    'success' => 'Color created successfully!'
                ]
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'An error occurred while creating the color'])->withInput();
        }
    }

    /**
     * Update the specified color in storage.
     */
    public function updateColors(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:product_colors,name,' . $id,
                'color_code' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            ]);

            $color = ProductColor::findOrFail($id);
            $color->name = $validated['name'];
            $color->color_code = $validated['color_code'];
            $color->save();

            DB::commit();

            return redirect()->route('admin.colors.list')->with([
                'flash' => [
                    'success' => 'Color updated successfully!'
                ]
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'An error occurred while updating the color'])->withInput();
        }
    }

    /**
     * Remove the specified color from storage.
     */
    public function deleteColors($id)
    {
        DB::beginTransaction();
        try {
            $color = ProductColor::findOrFail($id);
            $color->delete();

            DB::commit();

            return redirect()->route('admin.colors.list')->with([
                'flash' => [
                    'success' => 'Color deleted successfully!'
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'An error occurred while deleting the color']);
        }
    }
}
