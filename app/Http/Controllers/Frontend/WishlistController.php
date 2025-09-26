<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\WishlistItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WishlistController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $wishlistItems = $user->wishlistItems()
            ->with(['product.category', 'product.brand'])
            ->get();

        return Inertia::render('Frontend/Wishlist/Index', [
            'wishlistItems' => $wishlistItems,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        // Vérifier si le produit existe déjà dans la wishlist
        $existingItem = WishlistItem::where('user_id', $user->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existingItem) {
            return back()->with('info', 'Ce produit est déjà dans votre wishlist');
        }

        // Créer l'item wishlist
        WishlistItem::create([
            'user_id' => $user->id,
            'product_id' => $request->product_id,
        ]);

        return back()->with('success', 'Produit ajouté à votre wishlist');
    }

    public function destroy($productId)
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $wishlistItem = WishlistItem::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();

        if (!$wishlistItem) {
            return back()->with('error', 'Produit non trouvé dans votre wishlist');
        }

        $wishlistItem->delete();

        return back()->with('success', 'Produit retiré de votre wishlist');
    }

    public function clear()
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        WishlistItem::where('user_id', $user->id)->delete();

        return back()->with('success', 'Wishlist vidée');
    }
}
