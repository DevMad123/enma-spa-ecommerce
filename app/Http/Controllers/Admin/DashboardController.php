<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductColor;
use App\Models\ProductImage;
use App\Models\ProductSize;
use App\Models\ProductSubcategory;
use App\Models\Sell;
use App\Models\Supplier;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $startdate = Carbon::now()->subWeek()->startOfWeek()->format('Y-m-d H:i:s');
        $enddate = Carbon::now()->format('Y-m-d H:i:s');

        $totalOrder = Sell::where('sell_type', 2)
            ->where('order_status', '!=', 3)
            ->whereBetween('date', [$startdate, $enddate])
            ->count();

        $sell = DB::table("sell_details")
            ->join('products', 'sell_details.product_id', '=', 'products.id')
            ->whereBetween('sell_details.created_at', [$startdate, $enddate])
            ->select(
                DB::raw("SUM(sell_details.sale_quantity) as total_sell"),
                DB::raw("SUM(sell_details.unit_product_cost) as total_cost"),
                DB::raw("SUM(sell_details.unit_sell_price) as total_sell_price")
            )
            ->first();

        $sellProductList = DB::table("sell_details")
            ->join('products', 'sell_details.product_id', '=', 'products.id')
            ->select('products.*', DB::raw("SUM(sell_details.sale_quantity) as total_sell"))
            ->groupBy('sell_details.product_id', 'products.id', 'products.name', 'products.price', 'products.image') // Ajoute les colonnes groupées si besoin
            ->orderBy('total_sell', 'DESC')
            ->take(7)
            ->get();

        $productItem = Product::count();
        $customer = User::count();

        // Adaptation pour Inertia (React admin dashboard)
        return Inertia::render('Admin/Dashboard', [
            'totalOrder'      => $totalOrder,
            'sell'            => $sell,
            'customer'        => $customer,
            'sellProductList' => $sellProductList,
            'productItem'     => $productItem,
        ]);
    }
}
