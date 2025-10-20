<?php

// Simple helper to create the MySQL database if it doesn't exist.
// Uses *_MYSQL envs from config/database.php to be consistent.

$host = getenv('DB_HOST_MYSQL') ?: '127.0.0.1';
$port = getenv('DB_PORT_MYSQL') ?: '3306';
$user = getenv('DB_USERNAME_MYSQL') ?: 'root';
$pass = getenv('DB_PASSWORD_MYSQL') ?: '';
$db   = getenv('DB_DATABASE_MYSQL') ?: null;

if (!$db) {
    fwrite(STDERR, "DB_DATABASE_MYSQL not set.\n");
    exit(1);
}

$dsn = sprintf('mysql:host=%s;port=%s', $host, $port);
try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    $sql = sprintf('CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;', str_replace('`', '``', $db));
    $pdo->exec($sql);
    echo "Database ensured: {$db}\n";
} catch (Throwable $e) {
    fwrite(STDERR, 'Error: ' . $e->getMessage() . "\n");
    exit(1);
}

