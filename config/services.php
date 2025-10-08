<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'paypal' => [
        'mode' => env('PAYPAL_MODE', 'sandbox'), // sandbox ou live
        'sandbox' => [
            'client_id' => env('PAYPAL_SANDBOX_CLIENT_ID'),
            'client_secret' => env('PAYPAL_SANDBOX_CLIENT_SECRET'),
            'app_id' => env('PAYPAL_SANDBOX_APP_ID'),
        ],
        'live' => [
            'client_id' => env('PAYPAL_LIVE_CLIENT_ID'),
            'client_secret' => env('PAYPAL_LIVE_CLIENT_SECRET'),
            'app_id' => env('PAYPAL_LIVE_APP_ID'),
        ],
        'payment_action' => env('PAYPAL_PAYMENT_ACTION', 'Sale'), // Sale, Authorization, Order
        'currency' => env('PAYPAL_CURRENCY', 'XOF'),
        'notify_url' => env('PAYPAL_NOTIFY_URL', ''),
        'locale' => env('PAYPAL_LOCALE', 'fr_FR'),
        'validate_ssl' => env('PAYPAL_VALIDATE_SSL', true),
    ],

    'orange_money' => [
        'mode' => env('ORANGE_MONEY_MODE', 'sandbox'), // sandbox ou production
        'sandbox' => [
            'client_id' => env('ORANGE_MONEY_SANDBOX_CLIENT_ID'),
            'client_secret' => env('ORANGE_MONEY_SANDBOX_CLIENT_SECRET'),
            'merchant_key' => env('ORANGE_MONEY_SANDBOX_MERCHANT_KEY'),
            'base_url' => 'https://api.orange.com/orange-money-webpay/dev/v1',
        ],
        'production' => [
            'client_id' => env('ORANGE_MONEY_LIVE_CLIENT_ID'),
            'client_secret' => env('ORANGE_MONEY_LIVE_CLIENT_SECRET'),
            'merchant_key' => env('ORANGE_MONEY_LIVE_MERCHANT_KEY'),
            'base_url' => 'https://api.orange.com/orange-money-webpay/v1',
        ],
        'currency' => env('ORANGE_MONEY_CURRENCY', 'XOF'),
        'locale' => env('ORANGE_MONEY_LOCALE', 'fr_FR'),
        'webhook_secret' => env('ORANGE_MONEY_WEBHOOK_SECRET'),
    ],

    'wave' => [
        'mode' => env('WAVE_MODE', 'sandbox'), // sandbox ou production
        'sandbox' => [
            'api_key' => env('WAVE_SANDBOX_API_KEY'),
            'secret_key' => env('WAVE_SANDBOX_SECRET_KEY'),
            'base_url' => 'https://api.wave.com/v1/sandbox',
        ],
        'production' => [
            'api_key' => env('WAVE_LIVE_API_KEY'),
            'secret_key' => env('WAVE_LIVE_SECRET_KEY'),
            'base_url' => 'https://api.wave.com/v1',
        ],
        'currency' => env('WAVE_CURRENCY', 'XOF'),
        'webhook_secret' => env('WAVE_WEBHOOK_SECRET'),
    ],

];