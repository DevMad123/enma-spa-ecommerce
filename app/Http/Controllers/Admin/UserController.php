<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Http\Requests\Admin\User\StoreUserRequest;
use App\Http\Requests\Admin\User\UpdateUserRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roles');

        // Search functionality - Sécurisée
        if ($request->filled('search')) {
            $search = $request->search;
            $escapedSearch = addcslashes($search, '%_\\');
            $searchPattern = "%{$escapedSearch}%";
            $query->where(function ($q) use ($searchPattern) {
                $q->where('name', 'like', $searchPattern)
                  ->orWhere('email', 'like', $searchPattern)
                  ->orWhere('first_name', 'like', $searchPattern)
                  ->orWhere('last_name', 'like', $searchPattern);
            });
        }

        // Filter by role
        if ($request->filled('role')) {
            $query->withRole($request->role);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $users = $query->orderBy('created_at', 'desc')
                      ->paginate(15)
                      ->withQueryString();

        $roles = Role::where('status', 1)->get();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role', 'status']),
            'currentUserId' => auth()->id(),
        ]);
    }

    public function create()
    {
        $roles = Role::where('status', 1)->get();

        return Inertia::render('Admin/Users/create', [
            'roles' => $roles,
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();
        $validated['password'] = Hash::make($validated['password']);
        
        // Gérer l'upload de l'avatar
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $avatarPath;
        }
        
        $user = User::create($validated);

        // Assign roles if provided
        if ($request->has('roles')) {
            $user->roles()->sync($request->roles);
        }

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Utilisateur créé avec succès.');
    }

    public function show(User $user)
    {
        $user->load(['roles']);

        return Inertia::render('Admin/Users/show', [
            'user' => $user,
            'currentUserId' => auth()->id(),
        ]);
    }

    public function edit(User $user)
    {
        $user->load(['roles']);
        $roles = Role::where('status', 1)->get();

        return Inertia::render('Admin/Users/edit', [
            'user' => $user,
            'roles' => $roles,
            'currentUserId' => auth()->id(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $validated = $request->validated();
        
        // Gérer l'upload de l'avatar
        if ($request->hasFile('avatar')) {
            // Supprimer l'ancien avatar s'il existe
            if ($user->avatar && \Storage::disk('public')->exists($user->avatar)) {
                \Storage::disk('public')->delete($user->avatar);
            }
            
            // Stocker le nouvel avatar
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $avatarPath;
        }
        
        // Only hash password if provided
        if ($request->filled('password')) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        // Update roles if provided
        if ($request->has('roles')) {
            $user->roles()->sync($request->roles);
        }

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Utilisateur modifié avec succès.');
    }

    public function destroy(User $user)
    {
        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            return redirect()
                ->route('admin.users.index')
                ->with('error', 'Vous ne pouvez pas supprimer votre propre compte.');
        }

        // Detach all roles before deleting
        $user->roles()->detach();
        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Utilisateur supprimé avec succès.');
    }

    public function toggleStatus(User $user)
    {
        // Prevent self-status change
        if ($user->id === auth()->id()) {
            return redirect()
                ->route('admin.users.index')
                ->with('error', 'Vous ne pouvez pas modifier votre propre statut.');
        }

        $user->update([
            'status' => ($user->status == 1 || $user->status === '1') ? 0 : 1
        ]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Statut utilisateur modifié avec succès.');
    }

    /**
     * Export users to CSV.
     */
    public function export(Request $request)
    {
        $query = User::with('roles');

        // Apply same filters as index - Sécurisées
        if ($request->filled('search')) {
            $search = $request->search;
            $escapedSearch = addcslashes($search, '%_\\');
            $searchPattern = "%{$escapedSearch}%";
            $query->where(function ($q) use ($searchPattern) {
                $q->where('name', 'like', $searchPattern)
                  ->orWhere('email', 'like', $searchPattern)
                  ->orWhere('first_name', 'like', $searchPattern)
                  ->orWhere('last_name', 'like', $searchPattern);
            });
        }

        if ($request->filled('role')) {
            $query->withRole($request->role);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // If specific IDs are provided
        if ($request->filled('ids')) {
            $ids = explode(',', $request->ids);
            $query->whereIn('id', $ids);
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        $csvData = [];
        $csvData[] = [
            'ID',
            'Nom',
            'Prénom',
            'Nom complet',
            'Email',
            'Rôles',
            'Statut',
            'Dernière connexion',
            'Date de création'
        ];

        foreach ($users as $user) {
            $csvData[] = [
                $user->id,
                $user->first_name ?: '',
                $user->last_name ?: '',
                $user->name,
                $user->email,
                $user->roles->pluck('name')->join(', '),
                $user->status_text,
                $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i:s') : 'Jamais connecté',
                $user->created_at->format('Y-m-d H:i:s'),
            ];
        }

        $filename = 'users_export_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($csvData) {
            $file = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Delete user avatar
     */
    public function deleteAvatar(User $user)
    {
        if ($user->avatar && \Storage::disk('public')->exists($user->avatar)) {
            \Storage::disk('public')->delete($user->avatar);
            $user->update(['avatar' => null]);
            
            return back()->with('success', 'Avatar supprimé avec succès.');
        }
        
        return back()->with('error', 'Aucun avatar à supprimer.');
    }
}