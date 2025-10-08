<?php

if (!function_exists('get_currency')) {
    /**
     * Get the application currency from settings
     */
    function get_currency()
    {
        return \App\Models\Setting::get('currency') ?: 'XOF';
    }
}

if (!function_exists('get_currency_symbol')) {
    /**
     * Get the application currency symbol from settings
     */
    function get_currency_symbol()
    {
        return \App\Models\Setting::get('currency_symbol') ?: 'XOF';
    }
}

if (!function_exists('format_currency')) {
    /**
     * Format an amount with the configured currency
     */
    function format_currency($amount)
    {
        $currency = get_currency_symbol();
        $position = \App\Models\Setting::get('currency_position') ?: 'after';
        
        $formatted = number_format((float)$amount, 0, ',', ' ');
        
        return $position === 'before' 
            ? $currency . ' ' . $formatted
            : $formatted . ' ' . $currency;
    }
}