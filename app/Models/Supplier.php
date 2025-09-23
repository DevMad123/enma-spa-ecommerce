<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'supplier_name',
        'image',
        'supplier_phone_one',
        'supplier_phone_two',
        'company_name',
        'company_address',
        'supplier_address',
        'company_email',
        'company_phone',
        'supplier_email',
        'previous_due',
        'status',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'status' => 'boolean',
        'previous_due' => 'decimal:3',
    ];
}
