<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Log;

class Sell extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'order_reference',
        'invoice_id',
        'sell_type',
        'sell_by',
        'bank_id',
        'total_vat_amount',
        'shipping_cost',
        'shipping_method',
        'shipping_id',
        'shipping_status',
        'shipped_at',
        'delivered_at',
        'shipping_notes',
        'total_discount',
        'total_payable_amount',
        'grand_total',
        'total_paid',
        'total_due',
        'payment_type',
        'payment_method_id',
        'payment_status',
        'order_status',
        'notes',
        'date',
        'status',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'customer_id' => 'integer',
        'sell_type' => 'integer',
        'sell_by' => 'integer',
        'bank_id' => 'integer',
        'total_vat_amount' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'shipping_id' => 'integer',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'total_discount' => 'decimal:2',
        'total_payable_amount' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'total_paid' => 'decimal:2',
        'total_due' => 'decimal:2',
        'payment_type' => 'integer',
        'payment_status' => 'integer',
        'order_status' => 'integer',
        'status' => 'integer',
        'date' => 'datetime',
        'created_by' => 'integer',
        'updated_by' => 'integer',
        'deleted_by' => 'integer',
    ];

    // Relations
    public function customer()
    {
        return $this->belongsTo(Ecommerce_customer::class, 'customer_id');
    }

    public function sellDetails()
    {
        return $this->hasMany(Sell_details::class, 'sell_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'sell_id');
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_id');
    }

    public function shipping()
    {
        return $this->belongsTo(Shipping::class, 'shipping_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function deletedBy()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    public function orderAddress()
    {
        return $this->hasOne(SellOrderAddress::class, 'sell_id');
    }

    public function paymentInfo()
    {
        return $this->hasOne(PaymentInfo::class, 'sell_id');
    }

    // Accessors
    public function getOrderStatusTextAttribute()
    {
        $statuses = [
            0 => 'En attente',
            1 => 'En traitement',
            2 => 'En route',
            3 => 'Demande d\'annulation',
            4 => 'Annulation acceptée',
            5 => 'Processus d\'annulation terminé',
            6 => 'Commande terminée'
        ];
        
        return $statuses[$this->order_status] ?? 'Inconnu';
    }

    public function getPaymentStatusTextAttribute()
    {
        $statuses = [
            0 => 'Non payé',
            1 => 'Payé',
            2 => 'Partiellement payé',
            3 => 'Remboursé'
        ];
        
        return $statuses[$this->payment_status] ?? 'Inconnu';
    }

    public function getStatusTextAttribute()
    {
        return $this->status ? 'Terminé' : 'En cours';
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('status', 1);
    }

    public function scopePending($query)
    {
        return $query->where('status', 0);
    }

    public function scopeByCustomer($query, $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    public function scopeByOrderStatus($query, $status)
    {
        return $query->where('order_status', $status);
    }

    public function scopeByPaymentStatus($query, $status)
    {
        return $query->where('payment_status', $status);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('order_reference', 'like', '%' . $search . '%')
              ->orWhere('invoice_id', 'like', '%' . $search . '%')
              ->orWhereHas('customer', function ($customerQuery) use ($search) {
                  $customerQuery->where('first_name', 'like', '%' . $search . '%')
                               ->orWhere('last_name', 'like', '%' . $search . '%')
                               ->orWhere('email', 'like', '%' . $search . '%');
              });
        });
    }

    // Methods
    public function generateOrderReference()
    {
        if (!$this->order_reference) {
            $this->order_reference = 'ORD-' . date('Y') . '-' . str_pad($this->id, 6, '0', STR_PAD_LEFT);
            // Ne pas sauvegarder ici, cela sera fait par le parent
            // $this->save();
        }
        return $this->order_reference;
    }

    public function calculateTotals()
    {
        $subtotal = $this->sellDetails->sum('total_payable_amount');
        $this->total_payable_amount = $subtotal + $this->shipping_cost + $this->total_vat_amount - $this->total_discount;
        $this->grand_total = $this->total_payable_amount;
        $this->total_due = $this->total_payable_amount - $this->total_paid;
        return $this;
    }

    public function getTotalItemsCount()
    {
        return $this->sellDetails->sum('sale_quantity');
    }

    // Méthodes pour la gestion de la livraison
    public function getShippingStatusTextAttribute(): string
    {
        return match($this->shipping_status) {
            'pending' => 'En attente',
            'in_progress' => 'En cours de livraison',
            'delivered' => 'Livré',
            'cancelled' => 'Annulé',
            default => 'Non défini'
        };
    }

    public function getShippingStatusColorAttribute(): string
    {
        return match($this->shipping_status) {
            'pending' => 'yellow',
            'in_progress' => 'blue',
            'delivered' => 'green',
            'cancelled' => 'red',
            default => 'gray'
        };
    }

    public function markAsShipped(): bool
    {
        return $this->update([
            'shipping_status' => 'in_progress',
            'shipped_at' => now(),
        ]);
    }

    public function markAsDelivered(): bool
    {
        return $this->update([
            'shipping_status' => 'delivered',
            'delivered_at' => now(),
        ]);
    }

    public function cancelShipping(string $reason = null): bool
    {
        return $this->update([
            'shipping_status' => 'cancelled',
            'shipping_notes' => $reason ? "Annulé: {$reason}" : 'Livraison annulée',
        ]);
    }

    public function isShippable(): bool
    {
        return $this->shipping_status === 'pending' && $this->shipping_id !== null;
    }

    public function isShipped(): bool
    {
        return in_array($this->shipping_status, ['in_progress', 'delivered']);
    }

    public function isDelivered(): bool
    {
        return $this->shipping_status === 'delivered';
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($sell) {
            $sell->sell_type = 2; // E-commerce sell
            $sell->date = $sell->date ?? now();
        });

        static::created(function ($sell) {
            Log::info('📋 Événement Sell::created déclenché pour ID: ' . $sell->id);
            try {
                $sell->generateOrderReference();
                $sell->save(); // Sauvegarder après génération de la référence
                Log::info('✅ Référence générée: ' . $sell->order_reference);
            } catch (\Exception $e) {
                Log::error('❌ Erreur lors de la génération de référence: ' . $e->getMessage());
                throw $e;
            }
        });
    }
}
