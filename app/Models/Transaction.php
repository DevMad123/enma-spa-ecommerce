<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'sell_id',
        'payment_method_id',
        'transaction_id',
        'payment_id',
        'payer_id',
        'amount',
        'currency',
        'status',
        'type',
        'gateway_response',
        'processed_at',
        'notes'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'gateway_response' => 'array',
        'processed_at' => 'datetime',
    ];

    /**
     * Relations
     */
    
    public function sell()
    {
        return $this->belongsTo(Sell::class);
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    /**
     * Scopes
     */
    
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Méthodes d'état
     */
    
    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    public function isFailed()
    {
        return $this->status === 'failed';
    }

    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    /**
     * Méthodes de transition d'état
     */
    
    public function markAsCompleted($gatewayResponse = null)
    {
        $this->update([
            'status' => 'completed',
            'processed_at' => Carbon::now(),
            'gateway_response' => $gatewayResponse ?: $this->gateway_response,
        ]);
    }

    public function markAsFailed($gatewayResponse = null)
    {
        $this->update([
            'status' => 'failed',
            'processed_at' => Carbon::now(),
            'gateway_response' => $gatewayResponse ?: $this->gateway_response,
        ]);
    }

    public function markAsCancelled($notes = null)
    {
        $this->update([
            'status' => 'cancelled',
            'processed_at' => Carbon::now(),
            'notes' => $notes ?: $this->notes,
        ]);
    }

    /**
     * Accesseurs
     */
    
    public function getFormattedAmountAttribute()
    {
        return number_format((float) $this->amount, 0, ',', ' ') . ' ' . $this->currency;
    }

    public function getStatusBadgeAttribute()
    {
        $statuses = [
            'pending' => ['class' => 'warning', 'text' => 'En attente'],
            'completed' => ['class' => 'success', 'text' => 'Complété'],
            'failed' => ['class' => 'danger', 'text' => 'Échec'],
            'cancelled' => ['class' => 'secondary', 'text' => 'Annulé'],
        ];

        return $statuses[$this->status] ?? ['class' => 'dark', 'text' => 'Inconnu'];
    }
}
