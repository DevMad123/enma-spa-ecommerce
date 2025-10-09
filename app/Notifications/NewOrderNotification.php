<?php

namespace App\Notifications;

use App\Models\Sell;
use App\Services\AppSettingsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewOrderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $order;

    /**
     * Create a new notification instance.
     */
    public function __construct(Sell $order)
    {
        $this->order = $order;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $settings = AppSettingsService::getNotificationSettings();
        
        return (new MailMessage)
                    ->subject('Nouvelle commande reçue - #' . $this->order->id)
                    ->from(AppSettingsService::getMailFromAddress(), AppSettingsService::getMailFromName())
                    ->greeting('Bonjour!')
                    ->line('Une nouvelle commande a été passée sur ' . $settings['app_name'] . '.')
                    ->line('**Commande #' . $this->order->id . '**')
                    ->line('**Client:** ' . ($this->order->customer->prenom ?? '') . ' ' . ($this->order->customer->nom ?? ''))
                    ->line('**Email:** ' . $this->order->customer->email)
                    ->line('**Montant:** ' . number_format((float)$this->order->total_amount, 0, ',', ' ') . ' ' . $settings['currency_symbol'])
                    ->action('Voir la commande', url('/admin/sells/' . $this->order->id))
                    ->line('Connectez-vous à votre administration pour traiter cette commande.')
                    ->line('Pour toute question, contactez-nous : ' . $settings['contact_email']);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'customer_name' => ($this->order->customer->prenom ?? '') . ' ' . ($this->order->customer->nom ?? ''),
            'customer_email' => $this->order->customer->email,
            'total_amount' => $this->order->total_amount,
            'payment_method' => $this->order->paymentMethod->name ?? 'Non spécifié',
            'created_at' => $this->order->created_at,
            'message' => 'Nouvelle commande #' . $this->order->id . ' de ' . ($this->order->customer->prenom ?? '') . ' ' . ($this->order->customer->nom ?? ''),
            'action_url' => url('/admin/sells/' . $this->order->id),
            'items' => $this->order->sellDetails->map(function($detail) {
                return [
                    'product_name' => $detail->product->title,
                    'quantity' => $detail->quantity,
                    'unit_price' => $detail->price,
                    'total_price' => $detail->quantity * $detail->price
                ];
            })->toArray()
        ];
    }
}
