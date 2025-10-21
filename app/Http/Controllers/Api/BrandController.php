<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;

class BrandController extends Controller
{
    public function brandShow(){
        $brandList=Brand::get();
        return view('adminPanel.brand.brand')->with(compact('brandList'));
    }
    public function brandStore(Request $request){
        $brand=new Brand();
        $brand->name=$request->brand;
        $brand->image = $this->brandIcon($request->banner_img);
        $brand->save();

        return redirect()->back()->with('success', 'Product Brand Successfully Created');
    }



    public function brandUpdate(Request $request){

        $brand=Brand::find($request->id);
        $brand->name=$request->name;
        if($request->updateImage){
            $brand->image = $this->brandIcon($request->updateImage);
        }
        $brand->save();
        return redirect()->back()->with('success', 'Product Brand Successfully Updated');
    }

    public function brandIcon($image)
    {
        if (isset($image) && ($image != '') && ($image != null)) {
            $ext = explode('/', mime_content_type($image))[1];

            $logo_url = "brand_icons-" . time() . rand(1000, 9999) . '.' . $ext;
            $logo_directory = getUploadPath() . '/brand_icons/';
            $filePath = $logo_directory;
            $logo_path = $filePath . $logo_url;
            $db_media_img_path = 'storage/brand_icons/' . $logo_url;

            if (!file_exists($filePath)) {
                mkdir($filePath, 666, true);
            }

            $imageManager = new ImageManager(new GdDriver());
            try {
                $img = $imageManager->read($image);
            } catch (\Throwable $e) {
                \Log::warning('GD failed to read brand icon (API), trying Imagick: ' . $e->getMessage());
                try {
                    $imageManager = new ImageManager(new \Intervention\Image\Drivers\Imagick\Driver());
                    $img = $imageManager->read($image);
                } catch (\Throwable $e2) {
                    \Log::error('Imagick failed to read brand icon (API): ' . $e2->getMessage());
                    throw new \Exception("Format d'image non supporté");
                }
            }

            $img->resize(200, 200);
            $encoded = $img->toWebp(70);
            file_put_contents($logo_path, $encoded);

            return $db_media_img_path;

        }

    }
}
