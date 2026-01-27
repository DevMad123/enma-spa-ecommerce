<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use App\Services\SettingsManagerService;
use App\Services\SettingsFileManagerService;
use App\Services\SettingsConfigurationService;

class SettingController extends Controller
{
    public function __construct(
        private SettingsManagerService $settingsManager,
        private SettingsFileManagerService $fileManager,
        private SettingsConfigurationService $configService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $settings = $this->settingsManager->getAllGrouped();
        $frontendConfig = $this->configService->getFrontendConfiguration();

        return Inertia::render('Admin/Settings/Index', array_merge([
            'settings' => $settings,
        ], $frontendConfig));
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
            'value' => $this->settingsManager->get($key)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        Log::info('Setting update request data: ', $request->all());
        
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
            // Traitement spécial pour la devise
            $settings = $this->preprocessCurrencySettings($request->settings);
            
            $result = $this->settingsManager->updateBatch($settings);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => $result['success'],
                    'message' => $this->generateUpdateMessage($result),
                    'updated_count' => $result['updated_count'] ?? 0,
                    'created_count' => $result['created_count'] ?? 0,
                    'errors' => $result['errors'] ?? []
                ]);
            }

            if ($result['success']) {
                return back()->with('success', $this->generateUpdateMessage($result));
            } else {
                return back()->with('error', $result['error'] ?? 'Erreur lors de la mise à jour');
            }
            
        } catch (\Exception $e) {
            Log::error('Settings update exception', [
                'error' => $e->getMessage(),
                'settings_count' => count($request->settings ?? [])
            ]);

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
        $key = (string) $request->input('key');

        $validator = Validator::make($request->all(), [
            'file' => $this->buildFileValidationRule($key),
            'key' => 'required|string'
        ]);

        if ($validator->fails()) {
            if ($request->expectsJson()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
            return back()->withErrors($validator)->withInput();
        }

        $result = $this->fileManager->uploadFile($request->file('file'), $key);

        if ($request->header('X-Inertia')) {
            if ($result['success']) {
                return back()->with('upload_success', $result);
            } else {
                return back()->with('upload_error', $result['message']);
            }
        }

        return response()->json($result, $result['success'] ? 200 : 500);
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

        $result = $this->fileManager->deleteFile($request->key);

        if ($request->header('X-Inertia')) {
            if ($result['success']) {
                return back()->with('delete_success', $result['message']);
            } else {
                return back()->with('delete_error', $result['message']);
            }
        }

        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Préprocesse les paramètres de devise
     */
    private function preprocessCurrencySettings(array $settings): array
    {
        $processedSettings = [];
        
        foreach ($settings as $settingData) {
            if ($settingData['key'] === 'default_currency') {
                // Décomposer en currency et currency_symbol
                $currencyValidation = $this->configService->validateCurrencyConfiguration($settingData['value']);
                
                if ($currencyValidation['valid']) {
                    $processedSettings[] = ['key' => 'currency', 'value' => $settingData['value']];
                    $processedSettings[] = ['key' => 'currency_symbol', 'value' => $currencyValidation['currency_symbol']];
                }
            } else {
                $processedSettings[] = $settingData;
            }
        }

        return $processedSettings;
    }

    /**
     * Génère le message de mise à jour
     */
    private function generateUpdateMessage(array $result): string
    {
        if (!$result['success']) {
            $errorCount = count($result['errors'] ?? []);
            return "Erreur lors de la mise à jour ($errorCount erreurs)";
        }

        $updated = $result['updated_count'] ?? 0;
        $created = $result['created_count'] ?? 0;
        
        return "Paramètres mis à jour avec succès ! ($updated mis à jour, $created créés)";
    }

    /**
     * Construit la règle de validation des fichiers
     */
    private function buildFileValidationRule(string $key): string
    {
        $allowedExtensions = $this->fileManager->getAllowedExtensions($key);
        $extensionsList = implode(',', $allowedExtensions);
        
        return "required|file|mimes:$extensionsList|max:2048";
    }

}
