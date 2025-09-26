<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactMessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = ContactMessage::query();

        // Filtrage par statut
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $messages = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Statistiques
        $stats = [
            'total' => ContactMessage::count(),
            'new' => ContactMessage::new()->count(),
            'in_progress' => ContactMessage::inProgress()->count(),
            'resolved' => ContactMessage::resolved()->count(),
            'recent' => ContactMessage::recent(7)->count(),
        ];

        return Inertia::render('Admin/ContactMessages/Index', [
            'messages' => $messages,
            'stats' => $stats,
            'statuses' => ContactMessage::getStatuses(),
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(ContactMessage $contactMessage)
    {
        return Inertia::render('Admin/ContactMessages/Show', [
            'message' => $contactMessage,
            'statuses' => ContactMessage::getStatuses(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ContactMessage $contactMessage)
    {
        $request->validate([
            'status' => 'required|in:' . implode(',', array_keys(ContactMessage::getStatuses())),
        ]);

        $contactMessage->update([
            'status' => $request->status,
        ]);

        return redirect()->back()->with('success', 'Statut du message mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ContactMessage $contactMessage)
    {
        $contactMessage->delete();

        return redirect()->route('admin.contact-messages.index')
            ->with('success', 'Message supprimé avec succès.');
    }

    /**
     * Bulk actions for multiple messages
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:delete,mark_as_resolved,mark_as_in_progress',
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:contact_messages,id',
        ]);

        $messages = ContactMessage::whereIn('id', $request->ids);

        switch ($request->action) {
            case 'delete':
                $count = $messages->count();
                $messages->delete();
                $message = "Suppression de {$count} message(s) effectuée avec succès.";
                break;

            case 'mark_as_resolved':
                $count = $messages->update(['status' => ContactMessage::STATUS_RESOLVED]);
                $message = "Marquage de {$count} message(s) comme résolu(s) effectué avec succès.";
                break;

            case 'mark_as_in_progress':
                $count = $messages->update(['status' => ContactMessage::STATUS_IN_PROGRESS]);
                $message = "Marquage de {$count} message(s) comme en cours effectué avec succès.";
                break;
        }

        return redirect()->route('admin.contact-messages.index')
            ->with('success', $message);
    }
}
