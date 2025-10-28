<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Log;

class VerifyEmailNotification extends BaseVerifyEmail
{
    /**
     * Build the mail representation of the notification.
     */
    public function toMail($notifiable)
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        if (app()->environment(['local', 'development', 'testing'])) {
            Log::info('Sending verification email', [
                'user_id' => $notifiable->id ?? null,
                'email' => $notifiable->email ?? null,
                'from' => config('mail.from.address'),
            ]);
        }

        return (new MailMessage)
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->subject('Vérification requise - Enma Labs')
            ->line('Merci de vous être inscrit ! Veuillez vérifier votre adresse e-mail pour activer votre compte.')
            ->action('Vérifier mon e-mail', $verificationUrl)
            ->line("Si vous n'avez pas créé de compte, aucune action n'est requise.");
    }
}
