<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'payment_infos';

    protected $fillable = [
        'sell_id',
        'payment_type',        // au lieu de 'method'
        'total_paid',          // au lieu de 'amount'
        'tnx_id',             // au lieu de 'transaction_reference'
        'card_brand',
        'card_last_digit',
        'payment_inv_link',
        'status',
        // Champs pour compatibilité mais pas dans la vraie table
        // 'method', 'amount', 'currency', 'transaction_reference', 'payment_date', 'notes', 'metadata'
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'sell_id' => 'integer',
        'total_paid' => 'decimal:2',
        'metadata' => 'array',
        'created_by' => 'integer',
        'updated_by' => 'integer',
        'deleted_by' => 'integer',
    ];

    // Ajouter les accesseurs au JSON automatiquement
    protected $appends = [
        'method',
        'amount', 
        'transaction_reference',
        'payment_date',
        'method_text',
        'status_text',
        'formatted_amount',
        'currency',
        'currency_symbol'
    ];

    // Constantes pour les méthodes de paiement (correspondant à payment_type dans payment_infos)
    public const METHODS = [
        'cash' => 'Espèces',
        'paypal' => 'PayPal',
        'card' => 'Carte bancaire',
        'bank_transfer' => 'Virement bancaire',
        'cash_on_delivery' => 'Paiement à la livraison',
        'wallet' => 'Portefeuille électronique',
        // Anciens types pour compatibilité
        'stripe' => 'Stripe',
        'orange_money' => 'Orange Money',
        'wave' => 'Wave',
    ];

    // Constantes pour les statuts (correspondant à status dans payment_infos)
    public const STATUSES = [
        'pending' => 'En attente',
        'paid' => 'Payé',
        'failed' => 'Échoué',
        'refunded' => 'Remboursé',
        // Anciens statuts pour compatibilité
        'success' => 'Réussi',
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

    // Accesseurs pour la compatibilité avec les anciens noms de champs
    public function getMethodAttribute()
    {
        return $this->payment_type;
    }

    public function setMethodAttribute($value)
    {
        $this->attributes['payment_type'] = $value;
    }

    public function getAmountAttribute()
    {
        return $this->total_paid;
    }

    public function setAmountAttribute($value)
    {
        $this->attributes['total_paid'] = $value;
    }

    public function getTransactionReferenceAttribute()
    {
        return $this->tnx_id;
    }

    public function setTransactionReferenceAttribute($value)
    {
        $this->attributes['tnx_id'] = $value;
    }

    public function getPaymentDateAttribute()
    {
        return $this->created_at;
    }

    public function setPaymentDateAttribute($value)
    {
        // Ignorer l'assignation de payment_date puisque ce champ n'existe pas
        // Utiliser created_at à la place
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
        $amount = $this->total_paid ?? 0;
        return format_currency($amount);
    }

    public function getCurrencyAttribute()
    {
        return get_currency();
    }

    public function getCurrencySymbolAttribute()
    {
        return get_currency_symbol();
    }

    // Scopes
    public function scopeByMethod($query, $method)
    {
        return $query->where('payment_type', $method);
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
        return $query->whereIn('status', ['paid', 'success']);
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
        return $query->whereBetween('created_at', [$startDate, $endDate]);
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
        $refundAmount = $amount ?? $this->total_paid;
        
        if ($refundAmount > $this->total_paid) {
            throw new \Exception('Le montant du remboursement ne peut pas être supérieur au montant du paiement');
        }

        $this->update([
            'status' => 'refunded',
            'total_paid' => $this->total_paid - $refundAmount,
            'updated_by' => auth()->id(),
        ]);

        $this->updateSellPaymentStatus();
    }

    private function updateSellPaymentStatus()
    {
        $sell = $this->sell;
        if (!$sell) return;

        $totalPaid = $sell->payments()->successful()->sum('total_paid');
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
            // payment_date n'existe pas dans la table, utiliser created_at automatiquement
        });

        static::created(function ($payment) {
            $payment->updateSellPaymentStatus();
        });

        static::updated(function ($payment) {
            if ($payment->wasChanged(['status', 'total_paid'])) {
                $payment->updateSellPaymentStatus();
            }
        });

        static::deleted(function ($payment) {
            $payment->updateSellPaymentStatus();
        });
    }
}