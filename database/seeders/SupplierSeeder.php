<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Supplier;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $file = database_path('seeders/data/suppliers.json');
        $suppliers = json_decode(file_get_contents($file), true);

        foreach ($suppliers as $s) {
            Supplier::firstOrCreate(
                ['supplier_name' => $s['supplier_name']],
                [
                    'image' => $s['image'] ?? null,
                    'supplier_phone_one' => $s['supplier_phone_one'],
                    'supplier_phone_two' => $s['supplier_phone_two'] ?? null,
                    'company_name' => $s['company_name'] ?? null,
                    'company_address' => $s['company_address'] ?? null,
                    'supplier_address' => $s['supplier_address'] ?? null,
                    'company_email' => $s['company_email'] ?? null,
                    'company_phone' => $s['company_phone'] ?? null,
                    'supplier_email' => $s['supplier_email'] ?? null,
                    'previous_due' => $s['previous_due'] ?? 0,
                    'status' => $s['status'] ?? true,
                ]
            );
        }
    }
}
