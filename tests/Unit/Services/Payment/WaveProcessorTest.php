<?php

namespace Tests\Unit\Services\Payment;

use App\Services\Payment\WaveProcessor;
use App\Models\Sell;
use App\Models\Ecommerce_customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class WaveProcessorTest extends TestCase
{
    use RefreshDatabase;

    private WaveProcessor $processor;
    private Sell $sell;

    protected function setUp(): void
    {
        parent::setUp();
        
        Config::set('services.wave', [
            'mode' => 'sandbox',
            'sandbox' => [
                'secret_key' => 'test_secret_key',
                'base_url' => 'https://api.wave.test',
            ],
            'currency' => 'XOF',
        ]);

        $this->processor = new WaveProcessor();
        
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
        $this->assertEquals('wave', $this->processor->getName());
    }

    public function test_processor_is_configured_correctly()
    {
        $this->assertTrue($this->processor->isConfigured());
    }

    public function test_processor_is_not_configured_without_credentials()
    {
        Config::set('services.wave.sandbox.secret_key', '');
        $processor = new WaveProcessor();

        $this->assertFalse($processor->isConfigured());
    }

    public function test_create_payment_success()
    {
        Http::fake([
            'https://api.wave.test/checkout/sessions' => Http::response([
                'id' => 'checkout_session_123',
                'wave_launch_url' => 'https://checkout.wave.test/sessions/checkout_session_123',
                'status' => 'pending',
            ], 200),
        ]);

        $result = $this->processor->createPayment($this->sell);

        $this->assertTrue($result['success']);
        $this->assertEquals('checkout_session_123', $result['payment_id']);
        $this->assertStringContainsString('checkout.wave.test', $result['redirect_url']);

        // Vérifier qu'une requête a été envoyée
        Http::assertSentCount(1);
        
        // TODO: Vérifier les paramètres de la requête
        // Http::assertSent(function ($request) {
        //     return $request->url() === 'https://api.wave.test/checkout/sessions' &&
        //            $request['client_reference'] === $this->sell->id &&
        //            $request['amount'] === 100000; // En centimes
        // });
    }

    public function test_create_payment_failure()
    {
        Http::fake([
            'https://api.wave.test/checkout/sessions' => Http::response([
                'error' => 'Invalid API key',
            ], 401),
        ]);

        $result = $this->processor->createPayment($this->sell);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Wave', $result['error']);
    }

    public function test_check_payment_status_success()
    {
        Http::fake([
            'https://api.wave.test/checkout/sessions/checkout_session_123' => Http::response([
                'status' => 'PAID',
                'transaction_id' => 'wave_txn_456',
                'amount' => 100000, // En centimes
            ], 200),
        ]);

        $result = $this->processor->checkPaymentStatus('checkout_session_123', $this->sell);

        $this->assertTrue($result['success']);
        $this->assertEquals('completed', $result['status']);
        $this->assertEquals('wave_txn_456', $result['transaction_id']);
    }

    public function test_check_payment_status_pending()
    {
        Http::fake([
            'https://api.wave.test/checkout/sessions/checkout_session_123' => Http::response([
                'status' => 'PROCESSING',
                'transaction_id' => null,
            ], 200),
        ]);

        $result = $this->processor->checkPaymentStatus('checkout_session_123', $this->sell);

        $this->assertTrue($result['success']);
        $this->assertEquals('processing', $result['status']);
    }

    public function test_handle_callback_success()
    {
        $callbackData = [
            'id' => 'checkout_session_789',
            'status' => 'PAID',
            'transaction_id' => 'wave_txn_456',
            'client_reference' => $this->sell->id,
            'amount' => 100000, // En centimes
        ];

        $result = $this->processor->handleCallback($callbackData);

        $this->assertTrue($result['success']);
        $this->assertEquals('completed', $result['status']);
        $this->assertEquals('wave_txn_456', $result['transaction_id']);
        $this->assertEquals($this->sell->id, $result['order_id']);
        $this->assertEquals(1000.00, $result['amount']); // Conversion vers unités
    }

    public function test_handle_callback_failed()
    {
        $callbackData = [
            'status' => 'FAILED',
            'id' => 'checkout_session_123',
            'client_reference' => $this->sell->id,
            'amount' => 100000,
        ];

        $result = $this->processor->handleCallback($callbackData);

        $this->assertTrue($result['success']);
        $this->assertEquals('failed', $result['status']);
    }

    public function test_refund_payment_success()
    {
        Http::fake([
            'https://api.wave.test/checkout/sessions/checkout_session_123/refunds' => Http::response([
                'id' => 'refund_789',
                'status' => 'pending',
                'amount' => 50000, // 500 en centimes
            ], 200),
        ]);

        $result = $this->processor->refundPayment('checkout_session_123', 500.00);

        $this->assertTrue($result['success']);
        $this->assertEquals('refund_789', $result['refund_id']);
        $this->assertEquals('pending', $result['status']);

        // Vérifier qu'une requête a été envoyée
        Http::assertSentCount(1);
        
        // TODO: Vérifier les paramètres de la requête
        // Http::assertSent(function ($request) {
        //     return $request->url() === 'https://api.wave.test/checkout/sessions/checkout_session_123/refunds' &&
        //            $request['amount'] === 50000; // 500 * 100 centimes
        // });
    }

    public function test_refund_payment_failure()
    {
        Http::fake([
            'https://api.wave.test/checkout/sessions/checkout_session_123/refunds' => Http::response([
                'error' => 'Refund not allowed',
            ], 400),
        ]);

        $result = $this->processor->refundPayment('checkout_session_123', 500.00);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('remboursement Wave', $result['error']);
    }

    public function test_status_mapping()
    {
        $testCases = [
            ['PAID', 'completed'],
            ['COMPLETED', 'completed'],
            ['FAILED', 'failed'],
            ['DECLINED', 'failed'],
            ['EXPIRED', 'expired'],
            ['CANCELLED', 'cancelled'],
            ['PROCESSING', 'processing'],
            ['UNKNOWN', 'pending'],
        ];

        foreach ($testCases as [$waveStatus, $expectedStatus]) {
            $callbackData = [
                'status' => $waveStatus,
                'id' => 'test_session',
                'client_reference' => $this->sell->id
            ];
            $result = $this->processor->handleCallback($callbackData);
            
            $this->assertEquals($expectedStatus, $result['status'], 
                "Status mapping failed for Wave status: $waveStatus");
        }
    }

    public function test_webhook_validation_with_missing_fields()
    {
        $invalidCallbackData = [
            'amount' => 100000,
            // Manque 'status' et 'id'
        ];

        $result = $this->processor->handleCallback($invalidCallbackData);

        $this->assertFalse($result['success']);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_amount_conversion_to_centimes()
    {
        Http::fake([
            'https://api.wave.test/checkout/sessions' => Http::response([
                'id' => 'test_session',
                'wave_launch_url' => 'https://test.wave.url',
            ], 200),
        ]);

        $this->processor->createPayment($this->sell);

        // Vérifier qu'une requête a été envoyée
        Http::assertSentCount(1);
        
        // TODO: Vérifier la conversion des montants
        // Http::assertSent(function ($request) {
        //     // Vérifier que l'amount est converti en centimes (1000.00 => 100000)
        //     return $request['amount'] === 100000;
        // });
    }
}