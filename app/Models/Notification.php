<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Notification extends Model
{
    protected $fillable = [
        'type',
        'title',
        'message',
        'data',
        'user_id',
        'read_at',
        'action_url',
        'icon',
        'color'
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    // Relations
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId)->orWhereNull('user_id');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Accessors
    public function getIsReadAttribute()
    {
        return !is_null($this->read_at);
    }

    public function getTimeAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    // Methods
    public function markAsRead()
    {
        if (!$this->is_read) {
            $this->update(['read_at' => now()]);
        }
        return $this;
    }

    public function markAsUnread()
    {
        if ($this->is_read) {
            $this->update(['read_at' => null]);
        }
        return $this;
    }

    // Static methods pour créer des notifications
    public static function createContactMessage($contactMessage)
    {
        return self::create([
            'type' => 'contact_message',
            'title' => 'Nouveau message de contact',
            'message' => "Message de {$contactMessage->name} ({$contactMessage->email})",
            'data' => [
                'contact_message_id' => $contactMessage->id,
                'sender_name' => $contactMessage->name,
                'sender_email' => $contactMessage->email,
            ],
            'action_url' => route('admin.contact-messages.show', $contactMessage->id),
            'icon' => 'mail',
            'color' => 'blue'
        ]);
    }

    public static function createNewOrder($order)
    {
        return self::create([
            'type' => 'new_order',
            'title' => 'Nouvelle commande',
            'message' => "Commande #{$order->id} pour {$order->total_amount}€",
            'data' => [
                'order_id' => $order->id,
                'amount' => $order->total_amount,
                'customer_name' => $order->customer->name ?? 'Client',
            ],
            'action_url' => route('admin.orders.show', $order->id),
            'icon' => 'shopping-cart',
            'color' => 'green'
        ]);
    }

    public static function createNewUser($user)
    {
        return self::create([
            'type' => 'new_user',
            'title' => 'Nouvel utilisateur inscrit',
            'message' => "Inscription de {$user->name} ({$user->email})",
            'data' => [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_email' => $user->email,
            ],
            'action_url' => route('admin.customers.show', $user->id),
            'icon' => 'user-plus',
            'color' => 'purple'
        ]);
    }
}
