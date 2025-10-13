<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SellOrderAddress extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sell_id',
        'user_id',
        'type',
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'zip',
        'country',
        'division_id',
        'district_id',
        'note',
    ];

    protected $casts = [
        'sell_id' => 'integer',
        'user_id' => 'integer',
        'division_id' => 'integer',
        'district_id' => 'integer',
    ];

    // Relations
    public function sell()
    {
        return $this->belongsTo(Sell::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeShipping($query)
    {
        return $query->where('type', 'shipping');
    }

    public function scopeBilling($query)
    {
        return $query->where('type', 'billing');
    }
}
