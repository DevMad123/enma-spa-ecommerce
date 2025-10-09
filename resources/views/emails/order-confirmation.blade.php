<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation de commande #{{ $order->id }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        .order-id {
            background-color: rgba(255, 255, 255, 0.2);
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            margin-top: 10px;
            font-size: 14px;
            font-weight: bold;
        }
        .content {
            padding: 30px 20px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2c3e50;
        }
        .order-summary {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        .order-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
        }
        .detail-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .detail-label {
            font-weight: 600;
            color: #495057;
        }
        .detail-value {
            color: #6c757d;
        }
        .products-section {
            margin: 25px 0;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #667eea;
        }
        .product-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .product-item:last-child {
            border-bottom: none;
        }
        .product-info {
            flex: 1;
        }
        .product-name {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 4px;
        }
        .product-meta {
            font-size: 14px;
            color: #6c757d;
        }
        .product-price {
            font-weight: bold;
            color: #28a745;
            font-size: 16px;
        }
        .total-section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: right;
        }
        .total-item {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
        }
        .total-final {
            font-size: 20px;
            font-weight: bold;
            color: #28a745;
            border-top: 2px solid #dee2e6;
            padding-top: 10px;
            margin-top: 10px;
        }
        .payment-info {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #2196f3;
        }
        .footer {
            background-color: #2c3e50;
            color: white;
            padding: 25px 20px;
            text-align: center;
        }
        .footer p {
            margin: 5px 0;
            font-size: 14px;
        }
        .footer a {
            color: #74b9ff;
            text-decoration: none;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-pending {
            background-color: #fff3cd;
            color: #856404;
        }
        .status-confirmed {
            background-color: #d4edda;
            color: #155724;
        }
        .support-section {
            background-color: #fff3cd;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }
        @media (max-width: 600px) {
            .order-details {
                grid-template-columns: 1fr;
            }
            .product-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
            }
            .total-item {
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>✓ Commande Confirmée</h1>
            <div class="order-id">Commande #{{ $order->id }}</div>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Bonjour <strong>{{ $order->customer->prenom }} {{ $order->customer->nom }}</strong>,
            </div>

            <p>Nous avons bien reçu votre commande et celle-ci est en cours de traitement. Vous recevrez une notification dès que votre commande sera expédiée.</p>

            <!-- Order Summary -->
            <div class="order-summary">
                <div class="order-details">
                    <div class="detail-item">
                        <span class="detail-label">Numéro de commande:</span>
                        <span class="detail-value">#{{ $order->id }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Date de commande:</span>
                        <span class="detail-value">{{ $order->created_at->format('d/m/Y à H:i') }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Statut:</span>
                        <span class="detail-value">
                            <span class="status-badge status-{{ $order->status === 'confirmed' ? 'confirmed' : 'pending' }}">
                                {{ $order->status === 'confirmed' ? 'Confirmée' : 'En attente' }}
                            </span>
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Mode de paiement:</span>
                        <span class="detail-value">{{ $order->paymentMethod->name ?? 'Non spécifié' }}</span>
                    </div>
                </div>
            </div>

            <!-- Products Section -->
            <div class="products-section">
                <h2 class="section-title">📦 Articles commandés</h2>
                @foreach($order->sellDetails as $detail)
                <div class="product-item">
                    <div class="product-info">
                        <div class="product-name">{{ $detail->product->title }}</div>
                        <div class="product-meta">
                            Quantité: {{ $detail->quantity }} × {{ number_format($detail->price, 0, ',', ' ') }} FCFA
                        </div>
                    </div>
                    <div class="product-price">
                        {{ number_format($detail->quantity * $detail->price, 0, ',', ' ') }} FCFA
                    </div>
                </div>
                @endforeach
            </div>

            <!-- Total Section -->
            <div class="total-section">
                <div class="total-item">
                    <span>Sous-total:</span>
                    <span>{{ number_format($order->sellDetails->sum(function($detail) { return $detail->quantity * $detail->price; }), 0, ',', ' ') }} FCFA</span>
                </div>
                @if($order->shipping_cost > 0)
                <div class="total-item">
                    <span>Frais de livraison:</span>
                    <span>{{ number_format($order->shipping_cost, 0, ',', ' ') }} FCFA</span>
                </div>
                @endif
                <div class="total-item total-final">
                    <span>Total:</span>
                    <span>{{ number_format($order->total_amount, 0, ',', ' ') }} FCFA</span>
                </div>
            </div>

            <!-- Payment Info -->
            <div class="payment-info">
                <h3 style="margin: 0 0 10px 0; color: #1976d2;">💳 Informations de paiement</h3>
                <p style="margin: 5px 0;">Mode de paiement: <strong>{{ $order->paymentMethod->name ?? 'Non spécifié' }}</strong></p>
                @if($order->payment_reference)
                <p style="margin: 5px 0;">Référence: <strong>{{ $order->payment_reference }}</strong></p>
                @endif
            </div>

            <!-- Support Section -->
            <div class="support-section">
                <h3 style="margin: 0 0 10px 0; color: #8a6914;">🎧 Besoin d'aide ?</h3>
                <p style="margin: 5px 0;">Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter :</p>
                <p style="margin: 5px 0;">
                    📧 Email: <a href="mailto:{{ $contactEmail }}" style="color: #8a6914;">{{ $contactEmail }}</a><br>
                    📞 Téléphone: {{ $phone }}
                </p>
            </div>

            <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
                Merci de votre confiance et à bientôt sur notre boutique !
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>{{ $appName }}</strong></p>
            <p>Votre boutique en ligne de confiance</p>
            <p>
                <a href="mailto:{{ $contactEmail }}">{{ $contactEmail }}</a> | 
                <a href="tel:{{ str_replace(' ', '', $phone) }}">{{ $phone }}</a>
            </p>
            <p style="font-size: 12px; margin-top: 15px; opacity: 0.8;">
                © {{ date('Y') }} {{ $appName }}. Tous droits réservés.
            </p>
        </div>
    </div>
</body>
</html>