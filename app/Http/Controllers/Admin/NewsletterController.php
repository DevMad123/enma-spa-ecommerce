<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Newsletter;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Carbon\Carbon;

class NewsletterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Newsletter::query();

        // Filtrage par période
        if ($request->filled('period')) {
            switch ($request->period) {
                case 'today':
                    $query->today();
                    break;
                case 'week':
                    $query->thisWeek();
                    break;
                case 'month':
                    $query->thisMonth();
                    break;
                case 'recent':
                    $query->recent(30);
                    break;
            }
        }

        // Recherche par email
        if ($request->filled('search')) {
            $query->where('email', 'like', "%{$request->search}%");
        }

        $newsletters = $query->orderBy('subscribed_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        // Statistiques détaillées
        $stats = [
            'total' => Newsletter::count(),
            'today' => Newsletter::today()->count(),
            'this_week' => Newsletter::thisWeek()->count(),
            'this_month' => Newsletter::thisMonth()->count(),
            'recent_30_days' => Newsletter::recent(30)->count(),
        ];

        // Évolution sur les 7 derniers jours
        $evolution = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $evolution[] = [
                'date' => $date->format('Y-m-d'),
                'count' => Newsletter::whereDate('subscribed_at', $date)->count(),
            ];
        }

        return Inertia::render('Admin/Newsletters/Index', [
            'newsletters' => $newsletters,
            'stats' => $stats,
            'evolution' => $evolution,
            'filters' => $request->only(['period', 'search']),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Newsletter $newsletter)
    {
        $newsletter->delete();

        return redirect()->route('admin.newsletters.index')
            ->with('success', 'Abonnement supprimé avec succès.');
    }

    /**
     * Bulk delete newsletters
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:newsletters,id',
        ]);

        $count = Newsletter::whereIn('id', $request->ids)->count();
        Newsletter::whereIn('id', $request->ids)->delete();

        return redirect()->route('admin.newsletters.index')
            ->with('success', "Suppression de {$count} abonnement(s) effectuée avec succès.");
    }

    /**
     * Export newsletters to CSV
     */
    public function export(Request $request)
    {
        $query = Newsletter::query();

        // Appliquer les mêmes filtres que l'index
        if ($request->filled('period')) {
            switch ($request->period) {
                case 'today':
                    $query->today();
                    break;
                case 'week':
                    $query->thisWeek();
                    break;
                case 'month':
                    $query->thisMonth();
                    break;
                case 'recent':
                    $query->recent(30);
                    break;
            }
        }

        if ($request->filled('search')) {
            $query->where('email', 'like', "%{$request->search}%");
        }

        $newsletters = $query->orderBy('subscribed_at', 'desc')->get();

        $filename = 'newsletters_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($newsletters) {
            $file = fopen('php://output', 'w');
            
            // En-têtes CSV
            fputcsv($file, ['ID', 'Email', 'Date d\'abonnement']);

            // Données
            foreach ($newsletters as $newsletter) {
                fputcsv($file, [
                    $newsletter->id,
                    $newsletter->email,
                    $newsletter->subscribed_at->format('d/m/Y H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get statistics for dashboard
     */
    public function statistics()
    {
        $stats = [
            'total_subscribers' => Newsletter::count(),
            'new_today' => Newsletter::today()->count(),
            'new_this_week' => Newsletter::thisWeek()->count(),
            'new_this_month' => Newsletter::thisMonth()->count(),
            'growth_rate' => Newsletter::getGrowthRate(),
        ];

        // Graphique des abonnements sur 30 jours
        $chartData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $chartData[] = [
                'date' => $date->format('d/m'),
                'count' => Newsletter::whereDate('subscribed_at', $date)->count(),
            ];
        }

        return response()->json([
            'stats' => $stats,
            'chart_data' => $chartData,
        ]);
    }
}
