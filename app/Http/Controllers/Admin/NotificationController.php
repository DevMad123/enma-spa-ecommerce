<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $notifications = Notification::query()
            ->forUser(auth()->id())
            ->when($request->filled('type'), function ($query) use ($request) {
                $query->byType($request->type);
            })
            ->when($request->filled('read'), function ($query) use ($request) {
                if ($request->read === 'true') {
                    $query->read();
                } elseif ($request->read === 'false') {
                    $query->unread();
                }
            })
            ->latest()
            ->paginate(20)
            ->through(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'data' => $notification->data,
                    'is_read' => $notification->is_read,
                    'action_url' => $notification->action_url,
                    'icon' => $notification->icon,
                    'color' => $notification->color,
                    'time_ago' => $notification->time_ago,
                    'created_at' => $notification->created_at->format('d/m/Y H:i'),
                ];
            });

        $stats = [
            'total' => Notification::forUser(auth()->id())->count(),
            'unread' => Notification::forUser(auth()->id())->unread()->count(),
            'today' => Notification::forUser(auth()->id())->whereDate('created_at', today())->count(),
        ];

        return Inertia::render('Admin/Notifications/Index', [
            'notifications' => $notifications,
            'stats' => $stats,
            'filters' => $request->only(['type', 'read']),
        ]);
    }

    /**
     * Get notifications for header dropdown.
     */
    public function getForHeader()
    {
        $notifications = Notification::forUser(auth()->id())
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'is_read' => $notification->is_read,
                    'action_url' => $notification->action_url,
                    'icon' => $notification->icon,
                    'color' => $notification->color,
                    'time_ago' => $notification->time_ago,
                ];
            });

        $unreadCount = Notification::forUser(auth()->id())->unread()->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(Notification $notification)
    {
        // Vérifier que l'utilisateur peut accéder à cette notification
        if ($notification->user_id && $notification->user_id !== auth()->id()) {
            abort(403);
        }

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead()
    {
        Notification::forUser(auth()->id())
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Notification $notification)
    {
        // Vérifier que l'utilisateur peut accéder à cette notification
        if ($notification->user_id && $notification->user_id !== auth()->id()) {
            abort(403);
        }

        // Marquer automatiquement comme lue si ce n'est pas déjà fait
        if (!$notification->is_read) {
            $notification->markAsRead();
        }

        return Inertia::render('Admin/Notifications/Show', [
            'notification' => [
                'id' => $notification->id,
                'type' => $notification->type,
                'title' => $notification->title,
                'message' => $notification->message,
                'data' => $notification->data,
                'action_url' => $notification->action_url,
                'color' => $notification->color,
                'is_read' => $notification->is_read,
                'created_at_formatted' => $notification->created_at->format('d/m/Y à H:i'),
                'time_ago' => $notification->time_ago,
            ]
        ]);
    }

    /**
     * Redirect to notification action URL and mark as read.
     */
    public function redirect(Notification $notification)
    {
        // Vérifier que l'utilisateur peut accéder à cette notification
        if ($notification->user_id && $notification->user_id !== auth()->id()) {
            abort(403);
        }

        // Marquer comme lue
        $notification->markAsRead();

        // Rediriger vers l'URL d'action si elle existe
        if ($notification->action_url) {
            try {
                $actionUrl = $notification->action_url;
                
                // Corriger les URLs incorrectes
                if (str_contains($actionUrl, '/admin/sells/')) {
                    // Convertir /admin/sells/ID vers admin.orders.show
                    $orderId = str_replace('/admin/sells/', '', $actionUrl);
                    if (is_numeric($orderId)) {
                        return redirect()->route('admin.orders.show', $orderId);
                    }
                } elseif (str_contains($actionUrl, '/admin/contact-messages/')) {
                    // Convertir vers admin.contact-messages.show
                    $messageId = str_replace('/admin/contact-messages/', '', $actionUrl);
                    if (is_numeric($messageId)) {
                        return redirect()->route('admin.contact-messages.show', $messageId);
                    }
                } elseif (str_contains($actionUrl, '/admin/users/')) {
                    // Convertir vers admin.users.show
                    $userId = str_replace('/admin/users/', '', $actionUrl);
                    if (is_numeric($userId)) {
                        return redirect()->route('admin.users.show', $userId);
                    }
                }
                
                // Vérifier si l'URL est valide telle quelle
                if (filter_var($actionUrl, FILTER_VALIDATE_URL) || str_starts_with($actionUrl, '/')) {
                    return redirect($actionUrl);
                }
            } catch (\Exception $e) {
                // En cas d'erreur, rediriger vers la liste avec un message
                return redirect()->route('admin.notifications.index')
                    ->with('error', 'L\'action demandée n\'est plus disponible.');
            }
        }

        return redirect()->route('admin.notifications.index')
            ->with('info', 'Cette notification n\'a pas d\'action associée.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Notification $notification)
    {
        // Vérifier que l'utilisateur peut supprimer cette notification
        if ($notification->user_id && $notification->user_id !== auth()->id()) {
            abort(403);
        }

        $notification->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Bulk delete notifications.
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:notifications,id'
        ]);

        Notification::whereIn('id', $request->ids)
            ->forUser(auth()->id())
            ->delete();

        return response()->json(['success' => true]);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Non utilisé pour les notifications
        abort(404);
    }

    /**
     * Remove the specified resource from storage.
     */
}
