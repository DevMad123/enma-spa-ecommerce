<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sell_id',
        'method',
        'amount',
        'currency',
        'status',
        'transaction_reference',
        'payment_date',
        'notes',
        'metadata',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'sell_id' => 'integer',
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'metadata' => 'array',
        'created_by' => 'integer',
        'updated_by' => 'integer',
        'deleted_by' => 'integer',
    ];

    // Constantes pour les méthodes de paiement
    public const METHODS = [
        'cash' => 'Espèces',
        'paypal' => 'PayPal',
        'stripe' => 'Stripe',
        'orange_money' => 'Orange Money',
        'wave' => 'Wave',
        'card' => 'Carte bancaire',
        'bank_transfer' => 'Virement bancaire',
    ];

    // Constantes pour les statuts
    public const STATUSES = [
        'pending' => 'En attente',
        'success' => 'Réussi',
        'failed' => 'Échoué',
        'refunded' => 'Remboursé',
        'cancelled' => 'Annulé',
    ];

    // Relations
    public function sell()
    {
        return $this->belongsTo(Sell::class, 'sell_id');
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

    // Accessors
    public function getMethodTextAttribute()
    {
        return self::METHODS[$this->method] ?? 'Inconnu';
    }

    public function getStatusTextAttribute()
    {
        return self::STATUSES[$this->status] ?? 'Inconnu';
    }

    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending' => 'yellow',
            'success' => 'green',
            'failed' => 'red',
            'refunded' => 'orange',
            'cancelled' => 'gray',
            default => 'gray',
        };
    }

    public function getFormattedAmountAttribute()
    {
        return number_format($this->amount, 0, ',', ' ') . ' ' . $this->currency;
    }

    // Scopes
    public function scopeByMethod($query, $method)
    {
        return $query->where('method', $method);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeBySell($query, $sellId)
    {
        return $query->where('sell_id', $sellId);
    }

    public function scopeSuccessful($query)
    {
        return $query->where('status', 'success');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('payment_date', [$startDate, $endDate]);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('transaction_reference', 'like', '%' . $search . '%')
              ->orWhere('notes', 'like', '%' . $search . '%')
              ->orWhereHas('sell', function ($sellQuery) use ($search) {
                  $sellQuery->where('order_reference', 'like', '%' . $search . '%');
              });
        });
    }

    // Methods
    public function markAsSuccess($transactionRef = null)
    {
        $this->update([
            'status' => 'success',
            'transaction_reference' => $transactionRef ?? $this->transaction_reference,
            'updated_by' => auth()->id(),
        ]);

        // Mettre à jour le statut de paiement de la commande
        $this->updateSellPaymentStatus();
    }

    public function markAsFailed($reason = null)
    {
        $this->update([
            'status' => 'failed',
            'notes' => $reason ? ($this->notes . "\n" . $reason) : $this->notes,
            'updated_by' => auth()->id(),
        ]);

        $this->updateSellPaymentStatus();
    }

    public function refund($amount = null)
    {
        $refundAmount = $amount ?? $this->amount;
        
        if ($refundAmount > $this->amount) {
            throw new \Exception('Le montant du remboursement ne peut pas être supérieur au montant du paiement');
        }

        $this->update([
            'status' => 'refunded',
            'amount' => $this->amount - $refundAmount,
            'updated_by' => auth()->id(),
        ]);

        $this->updateSellPaymentStatus();
    }

    private function updateSellPaymentStatus()
    {
        $sell = $this->sell;
        if (!$sell) return;

        $totalPaid = $sell->payments()->successful()->sum('amount');
        $totalDue = $sell->total_payable_amount;

        if ($totalPaid >= $totalDue) {
            $sell->payment_status = 1; // Payé
        } elseif ($totalPaid > 0) {
            $sell->payment_status = 2; // Partiellement payé
        } else {
            $sell->payment_status = 0; // Non payé
        }

        $sell->total_paid = $totalPaid;
        $sell->total_due = $totalDue - $totalPaid;
        $sell->updated_by = auth()->id();
        $sell->save();
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            $payment->payment_date = $payment->payment_date ?? now();
        });

        static::created(function ($payment) {
            $payment->updateSellPaymentStatus();
        });

        static::updated(function ($payment) {
            if ($payment->wasChanged(['status', 'amount'])) {
                $payment->updateSellPaymentStatus();
            }
        });

        static::deleted(function ($payment) {
            $payment->updateSellPaymentStatus();
        });
    }
}