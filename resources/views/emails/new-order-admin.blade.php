<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle Commande #{{ $order->id }} - Admin</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
            color: #333;
        }
        .container {
            max-width: 700px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            padding: 30px 25px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: bold;
        }
        .alert-badge {
            background-color: #fff;
            color: #e74c3c;
            display: inline-block;
            padding: 8px 20px;
            border-radius: 25px;
            margin-top: 15px;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .content {
            padding: 30px 25px;
        }
        .urgent-notice {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
        }
        .order-overview {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 25px 0;
        }
        .overview-card {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #e74c3c;
        }
        .overview-title {
            font-size: 14px;
            font-weight: bold;
            color: #6c757d;
            text-transform: uppercase;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
        }
        .overview-value {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
        }
        .customer-section {
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
            color: white;
            padding: 25px;
            border-radius: 10px;
            margin: 25px 0;
        }
        .customer-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .customer-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .customer-item {
            background-color: rgba(255, 255, 255, 0.1);
            padding: 12px 15px;
            border-radius: 6px;
        }
        .customer-label {
            font-size: 12px;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        .customer-value {
            font-size: 16px;
            font-weight: bold;
        }
        .products-section {
            margin: 30px 0;
        }
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #e74c3c;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background-color: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .products-table th {
            background: linear-gradient(135deg, #2d3436 0%, #636e72 100%);
            color: white;
            padding: 15px 12px;
            text-align: left;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .products-table td {
            padding: 15px 12px;
            border-bottom: 1px solid #e9ecef;
            vertical-align: top;
        }
        .products-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .products-table tr:hover {
            background-color: #e3f2fd;
        }
        .product-name {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .product-price {
            font-weight: bold;
            color: #27ae60;
            font-size: 16px;
        }
        .financial-summary {
            background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
            color: white;
            padding: 25px;
            border-radius: 10px;
            margin: 25px 0;
        }
        .financial-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
        }
        .financial-details {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
        }
        .financial-item {
            background-color: rgba(255, 255, 255, 0.15);
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .financial-label {
            font-size: 12px;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        .financial-value {
            font-size: 18px;
            font-weight: bold;
        }
        .total-highlight {
            background-color: rgba(255, 255, 255, 0.3) !important;
            font-size: 22px !important;
        }
        .actions-section {
            background-color: #2d3436;
            color: white;
            padding: 25px;
            border-radius: 10px;
            margin: 25px 0;
        }
        .actions-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            text-align: center;
        }
        .action-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
        }
        .action-btn {
            display: inline-block;
            padding: 12px 25px;
            border-radius: 25px;
            text-decoration: none;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
        }
        .btn-confirm {
            background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
            color: white;
        }
        .btn-view {
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
            color: white;
        }
        .btn-cancel {
            background: linear-gradient(135deg, #e17055 0%, #d63031 100%);
            color: white;
        }
        .footer {
            background-color: #2c3e50;
            color: white;
            padding: 25px;
            text-align: center;
        }
        .footer-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .footer-subtitle {
            opacity: 0.8;
            font-size: 14px;
            margin-bottom: 15px;
        }
        .footer-links {
            font-size: 13px;
        }
        .footer-links a {
            color: #74b9ff;
            text-decoration: none;
            margin: 0 5px;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-new {
            background-color: #ff7675;
            color: white;
        }
        .timestamp {
            background-color: #fdcb6e;
            color: #2d3436;
            padding: 10px 15px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
        }
        @media (max-width: 700px) {
            .order-overview, .customer-details, .financial-details {
                grid-template-columns: 1fr;
            }
            .action-buttons {
                flex-direction: column;
                align-items: center;
            }
            .products-table {
                font-size: 14px;
            }
            .products-table th, .products-table td {
                padding: 10px 8px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🚨 NOUVELLE COMMANDE</h1>
            <div class="alert-badge">Commande #{{ $order->id }}</div>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Urgent Notice -->
            <div class="urgent-notice">
                ⚡ Une nouvelle commande vient d'être passée et nécessite votre attention !
            </div>

            <!-- Timestamp -->
            <div class="timestamp">
                📅 Reçue le {{ $order->created_at->format('d/m/Y à H:i:s') }}
                <span class="status-badge status-new">Nouvelle</span>
            </div>

            <!-- Order Overview -->
            <div class="order-overview">
                <div class="overview-card">
                    <div class="overview-title">Numéro de commande</div>
                    <div class="overview-value">#{{ $order->id }}</div>
                </div>
                <div class="overview-card">
                    <div class="overview-title">Montant total</div>
                    <div class="overview-value">{{ number_format($order->total_amount, 0, ',', ' ') }} FCFA</div>
                </div>
            </div>

            <!-- Customer Information -->
            <div class="customer-section">
                <div class="customer-title">
                    👤 Informations Client
                </div>
                <div class="customer-details">
                    <div class="customer-item">
                        <div class="customer-label">Nom complet</div>
                        <div class="customer-value">{{ $order->customer->prenom }} {{ $order->customer->nom }}</div>
                    </div>
                    <div class="customer-item">
                        <div class="customer-label">Email</div>
                        <div class="customer-value">{{ $order->customer->email }}</div>
                    </div>
                    <div class="customer-item">
                        <div class="customer-label">Téléphone</div>
                        <div class="customer-value">{{ $order->customer->telephone ?? 'Non renseigné' }}</div>
                    </div>
                    <div class="customer-item">
                        <div class="customer-label">Adresse</div>
                        <div class="customer-value">{{ $order->customer->adresse ?? 'Non renseignée' }}</div>
                    </div>
                </div>
            </div>

            <!-- Products Section -->
            <div class="products-section">
                <h2 class="section-title">📦 Articles Commandés</h2>
                
                <table class="products-table">
                    <thead>
                        <tr>
                            <th>Produit</th>
                            <th>Prix Unitaire</th>
                            <th>Quantité</th>
                            <th>Sous-total</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($order->sellDetails as $detail)
                        <tr>
                            <td>
                                <div class="product-name">{{ $detail->product->title }}</div>
                                @if($detail->product->description)
                                <div style="font-size: 12px; color: #6c757d; margin-top: 3px;">
                                    {{ Str::limit($detail->product->description, 50) }}
                                </div>
                                @endif
                            </td>
                            <td class="product-price">{{ number_format($detail->price, 0, ',', ' ') }} FCFA</td>
                            <td style="text-align: center; font-weight: bold;">{{ $detail->quantity }}</td>
                            <td class="product-price">{{ number_format($detail->quantity * $detail->price, 0, ',', ' ') }} FCFA</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <!-- Financial Summary -->
            <div class="financial-summary">
                <div class="financial-title">💰 Résumé Financier</div>
                <div class="financial-details">
                    <div class="financial-item">
                        <div class="financial-label">Sous-total</div>
                        <div class="financial-value">
                            {{ number_format($order->sellDetails->sum(function($detail) { return $detail->quantity * $detail->price; }), 0, ',', ' ') }} FCFA
                        </div>
                    </div>
                    @if($order->shipping_cost > 0)
                    <div class="financial-item">
                        <div class="financial-label">Livraison</div>
                        <div class="financial-value">{{ number_format($order->shipping_cost, 0, ',', ' ') }} FCFA</div>
                    </div>
                    @endif
                    <div class="financial-item total-highlight">
                        <div class="financial-label">Total Final</div>
                        <div class="financial-value">{{ number_format($order->total_amount, 0, ',', ' ') }} FCFA</div>
                    </div>
                </div>
            </div>

            <!-- Payment Information -->
            <div style="background-color: #f1c40f; color: #2c3e50; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; display: flex; align-items: center; gap: 10px;">
                    💳 Mode de Paiement
                </h3>
                <p style="margin: 5px 0; font-weight: bold; font-size: 16px;">
                    {{ $order->paymentMethod->name ?? 'Non spécifié' }}
                </p>
                @if($order->payment_reference)
                <p style="margin: 5px 0;">
                    <strong>Référence:</strong> {{ $order->payment_reference }}
                </p>
                @endif
            </div>

            <!-- Actions Section -->
            <div class="actions-section">
                <div class="actions-title">⚡ Actions Rapides</div>
                <div class="action-buttons">
                    <a href="#" class="action-btn btn-confirm">✓ Confirmer</a>
                    <a href="#" class="action-btn btn-view">👁 Voir Détails</a>
                    <a href="#" class="action-btn btn-cancel">✕ Annuler</a>
                </div>
                <div style="text-align: center; margin-top: 15px; font-size: 13px; opacity: 0.8;">
                    Connectez-vous à l'admin pour traiter cette commande
                </div>
            </div>

            <!-- Statistics -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50;">📊 Commande du Jour</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div>
                        <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">Nouvelle commande</div>
                        <div style="font-size: 12px; color: #6c757d;">Commande #{{ $order->id }}</div>
                    </div>
                    <div>
                        <div style="font-size: 24px; font-weight: bold; color: #27ae60;">
                            {{ number_format($order->total_amount, 0, ',', ' ') }} {{ $settings['currency_symbol'] }}
                        </div>
                        <div style="font-size: 12px; color: #6c757d;">Montant de la commande</div>
                    </div>
                    <div>
                        <div style="font-size: 24px; font-weight: bold; color: #f39c12;">{{ $order->paymentMethod->name ?? 'Non spécifié' }}</div>
                        <div style="font-size: 12px; color: #6c757d;">Mode de paiement</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-title">{{ $appName }} - Administration</div>
            <div class="footer-subtitle">Système de notification automatique</div>
            <div class="footer-links">
                <a href="mailto:{{ $adminEmail }}">{{ $adminEmail }}</a> |
                <a href="tel:{{ str_replace(' ', '', $settings['phone']) }}">{{ $settings['phone'] }}</a>
            </div>
            <p style="font-size: 11px; margin-top: 10px; opacity: 0.7;">
                © {{ date('Y') }} {{ $appName }} Admin Panel. Notification automatique générée le {{ now()->format('d/m/Y à H:i:s') }}
            </p>
        </div>
    </div>
</body>
</html>