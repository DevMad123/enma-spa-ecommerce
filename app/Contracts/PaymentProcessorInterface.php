<?php

namespace App\Contracts;

use App\Models\Sell;

interface PaymentProcessorInterface
{
    /**
     * Initialise le service de paiement avec la configuration
     *
     * @param array $config Configuration du provider de paiement
     * @return void
     * @throws \Exception Si la configuration est invalide
     */
    public function initialize(array $config = []): void;

    /**
     * Vérifie si le service de paiement est configuré et disponible
     *
     * @return bool
     */
    public function isAvailable(): bool;

    /**
     * Crée un paiement pour une commande
     *
     * @param Sell $order Commande à payer
     * @param array $additionalData Données additionnelles (callback URLs, etc.)
     * @return array Résultat avec détails du paiement (ID, URL de redirection, etc.)
     * @throws \Exception Si la création du paiement échoue
     */
    public function createPayment(Sell $order, array $additionalData = []): array;

    /**
     * Vérifie le statut d'un paiement
     *
     * @param string $paymentId ID du paiement
     * @param Sell $order Commande associée
     * @return array Statut du paiement (status, transaction_id, etc.)
     * @throws \Exception Si la vérification échoue
     */
    public function checkPaymentStatus(string $paymentId, Sell $order): array;

    /**
     * Traite le callback de succès du paiement
     *
     * @param array $callbackData Données du callback
     * @param Sell $order Commande associée
     * @return array Résultat du traitement
     */
    public function handleSuccessCallback(array $callbackData, Sell $order): array;

    /**
     * Traite le callback d'annulation du paiement
     *
     * @param array $callbackData Données du callback
     * @param Sell $order Commande associée
     * @return array Résultat du traitement
     */
    public function handleCancelCallback(array $callbackData, Sell $order): array;

    /**
     * Traite les webhooks du provider de paiement
     *
     * @param array $webhookData Données du webhook
     * @return array Résultat du traitement
     */
    public function handleWebhook(array $webhookData): array;

    /**
     * Rembourse un paiement
     *
     * @param string $paymentId ID du paiement à rembourser
     * @param float $amount Montant à rembourser (null pour remboursement total)
     * @param string $reason Raison du remboursement
     * @return array Résultat du remboursement
     * @throws \Exception Si le remboursement échoue
     */
    public function refundPayment(string $paymentId, ?float $amount = null, string $reason = ''): array;

    /**
     * Obtient les détails d'un paiement
     *
     * @param string $paymentId ID du paiement
     * @return array Détails du paiement
     * @throws \Exception Si la récupération des détails échoue
     */
    public function getPaymentDetails(string $paymentId): array;

    /**
     * Valide les données de configuration du provider
     *
     * @param array $config Configuration à valider
     * @return bool True si valide, False sinon
     */
    public function validateConfig(array $config): bool;

    /**
     * Obtient le nom du provider de paiement
     *
     * @return string
     */
    public function getProviderName(): string;

    /**
     * Obtient les devises supportées par le provider
     *
     * @return array Liste des codes ISO des devises
     */
    public function getSupportedCurrencies(): array;

    /**
     * Obtient les frais de transaction pour un montant donné
     *
     * @param float $amount Montant de la transaction
     * @param string $currency Code de la devise
     * @return array Détails des frais (fixed_fee, percentage_fee, total_fee)
     */
    public function getTransactionFees(float $amount, string $currency = 'EUR'): array;

    /**
     * Formate un montant selon les exigences du provider
     *
     * @param float $amount Montant à formater
     * @param string $currency Code de la devise
     * @return mixed Montant formaté
     */
    public function formatAmount(float $amount, string $currency = 'EUR');
}