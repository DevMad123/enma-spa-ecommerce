<?php

namespace App\Http\Controllers\Admin;


use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Validation\ValidationException;
use App\Models\ProductCategory;
use App\Models\ProductSubCategory;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Image;

class ProductCategoryController extends Controller
{
     /**
     * Display a list of product categories.
     *
     * @param  \Illuminate\Http\Request  $request
     */
    public function listCategory(Request $request)
    {
        // Start a new query for the ProductCategory model, excluding deleted records.
        $query = ProductCategory::query()
            ->with('subcategory') // Eager load subcategories if you need them.
            ->whereNull('deleted_at');

        // Global search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('note', 'like', "%$search%");
            });
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Sorting
        $sort = $request->get('sort', 'id');
        $direction = $request->get('direction', 'desc');
        $query->orderBy($sort, $direction);

        // Pagination
        $perPage = $request->get('perPage', 10);
        $categoryList = $query->paginate($perPage)->appends($request->all());

        // Return the Inertia view with the necessary data.
        return Inertia::render('categories/list', [
            'title' => 'Category List',
            'categoryList' => $categoryList,
            'filters' => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? '',
                'perPage' => $perPage,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }
    public function createCategory()
    {
        // $common_data = new Array_();
        // $common_data->title = 'Create Category';
        // return view('adminPanel.product_category.create_category')->with(compact('common_data'));
    }
    /**
     * Store a newly created product category in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function storeCategory(Request $request)
    {
        DB::beginTransaction();

        try {
            // Loggez l'intégralité de la requête pour le débogage
            \Log::info('Product category store request data: ', $request->all());

            // 1. Validation des données de la requête
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:product_categories,name',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
                'note' => 'nullable|string',
                'is_popular' => 'nullable|boolean',
                'status' => 'required|boolean',
            ]);

            // 2. Traitement de l'image si elle est présente
            $imagePath = null;
            if ($request->hasFile('image')) {
                // Vous devriez avoir une méthode 'imageSave' pour gérer l'upload
                // et la sauvegarde de l'image, comme dans votre ProductController.
                // Assurez-vous que cette méthode est disponible, par exemple en l'héritant d'un contrôleur de base ou en la créant ici.
                // Par exemple : $imagePath = $this->imageSave($request->file('image'), 'category_images');
                // Pour cet exemple, on utilise une méthode simulée.
                $imagePath = $this->categoryImageSave($request->file('image'));
            }

            // 3. Création de la catégorie
            $categoryData = $request->only(['name', 'note', 'is_popular', 'status']);
            
            // Assigner l'image et l'utilisateur qui a créé la catégorie
            $categoryData['image'] = $imagePath;
            $categoryData['created_by'] = auth()->id(); // Assurez-vous d'avoir l'authentification en place

            $category = new ProductCategory();
            $category->fill($categoryData);
            $category->save();

            DB::commit();

            // 4. Retour de la réponse
            return redirect()->back()->with('success', 'Catégorie créée avec succès !');

        } catch (ValidationException $e) {
            // Annuler la transaction en cas d'échec de la validation
            DB::rollBack();
            \Log::error('Validation failed during category creation: ' . json_encode($e->errors()));
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            // Annuler la transaction en cas d'erreur générale
            DB::rollBack();
            \Log::error('Erreur lors de la création de la catégorie : ' . $e->getMessage() . ' - Ligne: ' . $e->getLine());

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Erreur lors de la création de la catégorie.',
                    'error' => $e->getMessage()
                ], 422);
            }
            return back()->withErrors(['error' => 'Erreur lors de la création de la catégorie. Veuillez réessayer.'])->withInput();
        }
    }

    /**
     * Sauvegarde l'image de la catégorie.
     * Cette méthode est un exemple et devrait être adaptée à votre logique d'upload.
     *
     * @param  \Illuminate\Http\UploadedFile $imageFile
     * @return string
     */
    protected function categoryImageSave($imageFile)
    {
        // Exemple de sauvegarde de l'image dans le dossier 'public/storage/category_images'
        // et retourne le chemin d'accès public.
        return $imageFile->store('public/category_images');
    }

    public function productCategoryStore(Request $request)
    {
        $category = new ProductCategory();
        $category->name = $request->name;
        $category->note = $request->note;
        $category->image = $this->categoryIcon($request->banner_img);
        $category->created_at = Carbon::now();
        $category->save();
        return redirect()->back()->with('success', 'Successfully Added Category');
    }

    public function productCategoryUpdate(Request $request)
    {

        $subcategory = ProductCategory::find($request->category_id);
        $subcategory->name = $request->name;
        $subcategory->note = $request->note;
        if($request->updateImage){
            $subcategory->image = $this->categoryIcon($request->updateImage);
        }
        if($request->is_popular){
            $subcategory->is_popular = 1;
        }else{
            $subcategory->is_popular = 0;
        }
        $subcategory->save();
        return redirect()->back()->with('success', 'Category Successfully Updated');

    }
    public function productCategoryDelete(Request $request){
        $subcategory = ProductSubCategory::find($request->id);
        $subcategory->deleted=1;
        $subcategory->save();
        return redirect()->back()->with('success', 'Subcategory Successfully Deleted');
    }


    public function categoryIcon($image)
    {
        if (isset($image) && ($image != '') && ($image != null)) {
            $ext = explode('/', mime_content_type($image))[1];

            $logo_url = "category_icons-" . time() . rand(1000, 9999) . '.' . $ext;
            $logo_directory = getUploadPath() . '/category_icons/';
            $filePath = $logo_directory;
            $logo_path = $filePath . $logo_url;
            $db_media_img_path = 'storage/category_icons/' . $logo_url;

            if (!file_exists($filePath)) {
                mkdir($filePath, 666, true);
            }

            $logo_image = Image::make(file_get_contents($image))->resize(400, 400);
            $logo_image->brightness(8);
            $logo_image->contrast(11);
            $logo_image->sharpen(5);
            $logo_image->encode('webp', 70);
            $logo_image->save($logo_path);

            return $db_media_img_path;

        }

    }
}
