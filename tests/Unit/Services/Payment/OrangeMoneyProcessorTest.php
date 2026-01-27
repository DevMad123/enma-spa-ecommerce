<?php

namespace Tests\Unit\Services\Payment;

use App\Services\Payment\OrangeMoneyProcessor;
use App\Models\Sell;
use App\Models\Ecommerce_customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class OrangeMoneyProcessorTest extends TestCase
{
    use RefreshDatabase;

    private OrangeMoneyProcessor $processor;
    private Sell $sell;

    protected function setUp(): void
    {
        parent::setUp();
        
        Config::set('services.orange_money', [
            'mode' => 'sandbox',
            'sandbox' => [
                'merchant_key' => 'test_merchant_key',
                'base_url' => 'https://api.orange-money.test',
            ],
            'currency' => 'XOF',
        ]);

        $this->processor = new OrangeMoneyProcessor();
        
        // Créer un customer d'abord
        $customer = Ecommerce_customer::create([
            'first_name' => 'Test',
            'last_name' => 'Customer',
            'email' => 'test' . uniqid() . '@example.com',
            'password' => 'password123',
            'status' => 1,
        ]);
        
        $this->sell = Sell::create([
            'total' => 1000.00,
            'customer_id' => $customer->id,
            'payment_status' => 0, // 0=unpaid, 1=paid, 2=partial, 3=refunded
            'sell_type' => 2, // 2=ecommerce_sell
            'total_payable_amount' => 1000.00,
            'total_paid' => 0.00,
            'total_due' => 1000.00,
            'date' => now(),
        ]);
    }

    public function test_processor_has_correct_name()
    {
        $this->assertEquals('orange_money', $this->processor->getName());
    }

    public function test_processor_is_configured_correctly()
    {
        $this->assertTrue($this->processor->isConfigured());
    }

    public function test_processor_is_not_configured_without_credentials()
    {
        Config::set('services.orange_money.sandbox.merchant_key', '');
        $processor = new OrangeMoneyProcessor();

        $this->assertFalse($processor->isConfigured());
    }

    public function test_create_payment_success()
    {
        Http::fake([
            'https://api.orange-money.test/webpayment/v1/paymentRequest' => Http::response([
                'pay_token' => 'test_pay_token_123',
                'payment_url' => 'https://payment.orange-money.test/pay?token=test_pay_token_123',
                'status' => 'pending',
            ], 200),
        ]);

        $result = $this->processor->createPayment($this->sell);

        $this->assertTrue($result['success']);
        $this->assertEquals('test_pay_token_123', $result['payment_id']);
        $this->assertStringContainsString('payment.orange-money.test', $result['redirect_url']);

        // Vérifier qu'une requête HTTP a été envoyée
        Http::assertSentCount(1);
        
        // TODO: Vérifier les paramètres de la requête
        // Http::assertSent(function ($request) {
        //     return $request->url() === 'https://api.orange-money.test/webpayment/v1/paymentRequest' &&
        //            $request['order_id'] == $this->sell->id &&
        //            $request['amount'] == 1000.00 &&
        //            $request['merchant_key'] === 'test_merchant_key';
        // });
    }

    public function test_create_payment_failure()
    {
        Http::fake([
            'https://api.orange-money.test/webpayment/v1/paymentRequest' => Http::response([
                'error' => 'Invalid merchant key',
            ], 400),
        ]);

        $result = $this->processor->createPayment($this->sell);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Orange Money', $result['error']);
    }

    public function test_check_payment_status_success()
    {
        Http::fake([
            'https://api.orange-money.test/webpayment/v1/transactionStatus' => Http::response([
                'status' => 'SUCCESS',
                'txnid' => 'TXN123456789',
                'amount' => 1000.00,
            ], 200),
        ]);

        $result = $this->processor->checkPaymentStatus('test_pay_token_123', $this->sell);

        $this->assertTrue($result['success']);
        $this->assertEquals('completed', $result['status']);
        $this->assertEquals('TXN123456789', $result['transaction_id']);
    }

    public function test_check_payment_status_pending()
    {
        Http::fake([
            'https://api.orange-money.test/webpayment/v1/transactionStatus' => Http::response([
                'status' => 'PENDING',
                'txnid' => null,
            ], 200),
        ]);

        $result = $this->processor->checkPaymentStatus('test_pay_token_123', $this->sell);

        $this->assertTrue($result['success']);
        $this->assertEquals('pending', $result['status']);
    }

    public function test_handle_callback_success()
    {
        $callbackData = [
            'status' => 'SUCCESS',
            'txnid' => 'TXN123456789',
            'order_id' => $this->sell->id,
            'amount' => 1000.00,
        ];

        $result = $this->processor->handleCallback($callbackData);

        $this->assertTrue($result['success']);
        $this->assertEquals('completed', $result['status']);
        $this->assertEquals('TXN123456789', $result['transaction_id']);
        $this->assertEquals($this->sell->id, $result['order_id']);
    }

    public function test_handle_callback_failed()
    {
        $callbackData = [
            'status' => 'FAILED',
            'order_id' => $this->sell->id,
            'amount' => 1000.00,
        ];

        $result = $this->processor->handleCallback($callbackData);

        $this->assertTrue($result['success']);
        $this->assertEquals('failed', $result['status']);
    }

    public function test_refund_payment_not_supported()
    {
        $result = $this->processor->refundPayment('test_pay_token_123', 500.00);

        $this->assertFalse($result['success']);
        $this->assertTrue($result['manual_process_required']);
        $this->assertStringContainsString('automatiques ne sont pas supportés', $result['error']);
    }

    public function test_status_mapping()
    {
        $testCases = [
            ['SUCCESS', 'completed'],
            ['SUCCESSFUL', 'completed'],
            ['FAILED', 'failed'],
            ['FAILURE', 'failed'],
            ['EXPIRED', 'expired'],
            ['CANCELLED', 'cancelled'],
            ['UNKNOWN', 'pending'],
        ];

        foreach ($testCases as [$orangeStatus, $expectedStatus]) {
            $callbackData = ['status' => $orangeStatus, 'order_id' => $this->sell->id];
            $result = $this->processor->handleCallback($callbackData);
            
            $this->assertEquals($expectedStatus, $result['status'], 
                "Status mapping failed for Orange Money status: $orangeStatus");
        }
    }
}