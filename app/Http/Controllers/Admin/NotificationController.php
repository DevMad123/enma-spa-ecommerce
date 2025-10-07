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

        // Marquer comme lue
        $notification->markAsRead();

        // Rediriger vers l'URL d'action si elle existe
        if ($notification->action_url) {
            return redirect($notification->action_url);
        }

        return redirect()->route('admin.notifications.index');
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
