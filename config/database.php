<?php

return [

    'default' => env('DB_CONNECTION', 'mysql'),

    'connections' => [
        'pgsql' => [
            'driver' => 'pgsql',
            'url' => env('DATABASE_URL'),
            'host' => env('PGSQL_HOST', env('DB_HOST', '127.0.0.1')),
            'port' => env('PGSQL_PORT', env('DB_PORT', '5432')),
            'database' => env('PGSQL_DATABASE', env('DB_DATABASE', 'forge')),
            'username' => env('PGSQL_USERNAME', env('DB_USERNAME', 'forge')),
            'password' => env('PGSQL_PASSWORD', env('DB_PASSWORD', '')),
            'charset' => 'utf8',
            'prefix' => '',
            'prefix_indexes' => true,
            'schema' => 'public',
            'sslmode' => 'prefer',
        ],

        // tu peux aussi laisser mysql ou sqlite si tu en as besoin
        'mysql' => [
            'driver' => 'mysql',
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'forge'),
            'username' => env('DB_USERNAME', 'forge'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
        ],

        'sqlite' => [
            'driver' => 'sqlite',
            'url' => env('DATABASE_URL'),
            'database' => env('DB_DATABASE', database_path('database.sqlite')),
            'prefix' => '',
            'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
        ],
    ],

    'migrations' => 'migrations',

];
