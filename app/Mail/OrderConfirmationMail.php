<?php

namespace App\Mail;

use App\Models\Sell;
use App\Services\AppSettingsService;
use App\Services\LogService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $order;

    /**
     * Create a new message instance.
     */
    public function __construct(Sell $order)
    {
        $this->order = $order;
        
        // Logger l'envoi de l'email
        LogService::order()->emailSent($order);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: AppSettingsService::getMailFromAddress(),
            subject: 'Confirmation de votre commande #' . $this->order->id . ' - ' . AppSettingsService::getAppName(),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $settings = AppSettingsService::getNotificationSettings();
        
        return new Content(
            view: 'emails.order-confirmation',
            with: [
                'order' => $this->order,
                'customer' => $this->order->customer,
                'items' => $this->order->sellDetails,
                'settings' => $settings,
                'appName' => AppSettingsService::getAppName(),
                'contactEmail' => AppSettingsService::getContactEmail(),
                'phone' => AppSettingsService::getPhone(),
                'address' => AppSettingsService::getAddress(),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
