<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Sell;
use App\Models\Sell_details;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    // public function index()
    // {
    //     return response()->json([
    //         'message' => 'Bienvenue sur le Dashboard Admin !',
    //     ]);
    // }
    // public function index(Request $request)
    // {
    //     $token = $request->bearerToken();  // récupère le token Bearer

    //     return response()->json([
    //         'bearer_token' => $token,
    //         'headers' => $request->header('Authorization'),
    //         'user' => $request->user(),  // peut être null si non authentifié
    //     ]);
    // }
    public function index()
    {
        $startdate = Carbon::now()->subWeek()->startOfWeek()->format('Y-m-d H:i:s');
        $enddate   = Carbon::now()->format('Y-m-d H:i:s');

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
            ->select('products.id', 'products.name', 'products.image_path',
                DB::raw("SUM(sell_details.sale_quantity) as total_sell"))
            ->groupBy('products.id', 'products.name', 'products.image_path')
            ->orderBy('total_sell', 'DESC')
            ->take(7)
            ->get();

        $productItem = Product::count();
        $customer    = User::count();

        return response()->json([
            'totalOrder'      => $totalOrder,
            'sell'            => $sell,
            'customer'        => $customer,
            'sellProductList' => $sellProductList,
            'productItem'     => $productItem,
        ]);
    }
}
