<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class SettingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Récupérer tous les paramètres groupés
        $settings = Setting::getAllGrouped();
        
        // Définir les devises disponibles
        $currencies = [
            'XOF' => 'Franc CFA (XOF)',
            'EUR' => 'Euro (EUR)',
            'USD' => 'Dollar US (USD)',
            'GBP' => 'Livre Sterling (GBP)',
            'MAD' => 'Dirham Marocain (MAD)',
            'TND' => 'Dinar Tunisien (TND)',
            'NGN' => 'Naira Nigérian (NGN)',
            'GHS' => 'Cedi Ghanéen (GHS)',
            'KES' => 'Shilling Kenyan (KES)',
            'ZAR' => 'Rand Sud-Africain (ZAR)'
        ];
        
        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
            'currencies' => $currencies,
            'groups' => [
                'general' => 'Général',
                'appearance' => 'Apparence', 
                'ecommerce' => 'E-commerce'
            ],
        ]);
    }

    /**
     * Test messages page
     */
    public function testMessages()
    {
        return Inertia::render('Admin/Settings/TestMessages', [
            'upload_success' => session('upload_success'),
            'upload_error' => session('upload_error'),
            'delete_success' => session('delete_success'),
            'delete_error' => session('delete_error'),
        ]);
    }

    /**
     * Get a specific setting by key
     */
    public function getSetting($key)
    {
        $setting = Setting::where('key', $key)->first();
        
        if (!$setting) {
            return response()->json(['error' => 'Setting not found'], 404);
        }
        
        return response()->json([
            'setting' => $setting,
            'value' => Setting::get($key)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
        ]);

        if ($validator->fails()) {
            if ($request->expectsJson()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
            return back()->withErrors($validator)->withInput();
        }

        try {
            $updatedCount = 0;
            $createdCount = 0;
            
            foreach ($request->settings as $settingData) {
                $setting = Setting::where('key', $settingData['key'])->first();
                
                if ($setting) {
                    // Gérer les différents types de valeurs
                    $value = $settingData['value'];
                    
                    if ($setting->type === 'boolean') {
                        $value = $value ? '1' : '0';
                    } elseif ($setting->type === 'json' && is_array($value)) {
                        $value = json_encode($value);
                    }
                    
                    Setting::set($settingData['key'], $value);
                    $updatedCount++;
                } else {
                    // Créer le paramètre s'il n'existe pas
                    $group = 'general'; // par défaut
                    $type = 'string'; // par défaut
                    
                    // Déterminer le groupe et le type basé sur la clé
                    if (in_array($settingData['key'], ['show_popular_products', 'show_promotions', 'show_new_arrivals', 'show_categories', 'hero_banner', 'promo_banner'])) {
                        $group = 'appearance';
                        $type = str_starts_with($settingData['key'], 'show_') ? 'boolean' : 'file';
                    } elseif (in_array($settingData['key'], ['shipping_cost', 'free_shipping_threshold', 'tax_rate', 'allow_guest_checkout'])) {
                        $group = 'ecommerce';
                        $type = $settingData['key'] === 'allow_guest_checkout' ? 'boolean' : 'number';
                    }
                    
                    $value = $settingData['value'];
                    if ($type === 'boolean') {
                        $value = $value ? '1' : '0';
                    }
                    
                    Setting::create([
                        'key' => $settingData['key'],
                        'value' => $value,
                        'type' => $type,
                        'group' => $group,
                        'label' => ucfirst(str_replace('_', ' ', $settingData['key'])),
                        'description' => 'Paramètre créé automatiquement'
                    ]);
                    $createdCount++;
                }
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => "Paramètres mis à jour avec succès ! ({$updatedCount} mis à jour, {$createdCount} créés)",
                    'updated_count' => $updatedCount,
                    'created_count' => $createdCount
                ]);
            }

            return back()->with('success', "Paramètres mis à jour avec succès ! ({$updatedCount} mis à jour, {$createdCount} créés)");
            
        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de la mise à jour des paramètres : ' . $e->getMessage()
                ], 500);
            }
            
            return back()->with('error', 'Erreur lors de la mise à jour des paramètres : ' . $e->getMessage());
        }
    }

    /**
     * Upload a file for settings
     */
    public function uploadFile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:jpeg,png,jpg,gif,svg,pdf|max:2048',
            'key' => 'required|string'
        ]);

        if ($validator->fails()) {
            if ($request->expectsJson()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
            return back()->withErrors($validator)->withInput();
        }

        try {
            $file = $request->file('file');
            $key = $request->key;
            
            // Générer un nom de fichier unique
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            // Stocker le fichier dans le dossier public/settings
            $path = $file->storeAs('settings', $fileName, 'public');
            
            // Supprimer l'ancien fichier si il existe
            $oldValue = Setting::get($key);
            if ($oldValue && Storage::disk('public')->exists($oldValue)) {
                Storage::disk('public')->delete($oldValue);
            }
            
            // Mettre à jour le paramètre
            Setting::set($key, $path);
            
            // Pour les requêtes Inertia, rediriger avec un message de succès
            if ($request->header('X-Inertia')) {
                return back()->with('upload_success', [
                    'message' => 'Fichier uploadé avec succès !',
                    'path' => $path,
                    'url' => Storage::url($path),
                    'filename' => $file->getClientOriginalName()
                ]);
            }
            
            // Pour les requêtes AJAX classiques
            return response()->json([
                'success' => true,
                'message' => 'Fichier uploadé avec succès !',
                'path' => $path,
                'url' => Storage::url($path),
                'filename' => $file->getClientOriginalName()
            ]);
            
        } catch (\Exception $e) {
            if ($request->header('X-Inertia')) {
                return back()->with('upload_error', 'Erreur lors de l\'upload : ' . $e->getMessage());
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload : ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a file from settings
     */
    public function deleteFile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'key' => 'required|string'
        ]);

        if ($validator->fails()) {
            if ($request->expectsJson()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
            return back()->withErrors($validator)->withInput();
        }

        try {
            $key = $request->key;
            $filePath = Setting::get($key);
            
            if ($filePath && Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }
            
            // Mettre à jour le paramètre avec une valeur vide
            Setting::set($key, '');
            
            // Pour les requêtes Inertia, rediriger avec un message de succès
            if ($request->header('X-Inertia')) {
                return back()->with('delete_success', 'Fichier supprimé avec succès !');
            }
            
            // Pour les requêtes AJAX classiques
            return response()->json([
                'success' => true,
                'message' => 'Fichier supprimé avec succès !'
            ]);
            
        } catch (\Exception $e) {
            if ($request->header('X-Inertia')) {
                return back()->with('delete_error', 'Erreur lors de la suppression : ' . $e->getMessage());
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression : ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
