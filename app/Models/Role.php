<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Role extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'description', 'status', 'created_by', 'updated_by', 'deleted_by'];

    protected $casts = [
        'status' => 'integer',
    ];

    // Scope for active roles
    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    // Check if role is active
    public function isActive()
    {
        return $this->status == 1;
    }

    // Get role name in lowercase
    public function getLowerNameAttribute()
    {
        return strtolower($this->name);
    }

    // Relationships
    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'role_permission');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_role');
    }

    // Helper methods
    public function assignPermission($permission)
    {
        $permission = is_string($permission) 
            ? Permission::where('name', $permission)->first()
            : $permission;
            
        if ($permission && !$this->permissions()->where('permission_id', $permission->id)->exists()) {
            $this->permissions()->attach($permission->id);
        }
    }

    public function removePermission($permission)
    {
        $permission = is_string($permission) 
            ? Permission::where('name', $permission)->first()
            : $permission;
            
        if ($permission) {
            $this->permissions()->detach($permission->id);
        }
    }

    public function hasPermission($permissionName)
    {
        return $this->permissions()->where('name', $permissionName)->exists();
    }
}
