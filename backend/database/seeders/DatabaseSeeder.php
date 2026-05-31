<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\House;
use App\Models\Resident;
use App\Models\HouseResident;
use App\Models\Payment;
use App\Models\Expense;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin
        User::factory()->create([
            'name' => 'Admin RT',
            'email' => 'admin@rt.com',
            'password' => Hash::make('password'),
        ]);

        // Create 20 Houses
        for ($i = 1; $i <= 20; $i++) {
            $status = 'dihuni';
            if ($i > 18) $status = 'tidak_dihuni'; // 2 empty houses

            $house = House::create([
                'nomor_rumah' => 'A' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'blok' => 'A',
                'status' => $status
            ]);

            if ($status === 'dihuni') {
                $statusPenghuni = $i <= 15 ? 'tetap' : 'kontrak';
                
                $resident = Resident::create([
                    'nama_lengkap' => 'Warga ' . $i,
                    'status_penghuni' => $statusPenghuni,
                    'nomor_telepon' => '0812345678' . str_pad($i, 2, '0', STR_PAD_LEFT),
                    'status_menikah' => $i % 2 == 0,
                ]);

                HouseResident::create([
                    'house_id' => $house->id,
                    'resident_id' => $resident->id,
                    'tanggal_mulai' => Carbon::now()->subMonths(rand(1, 24))->format('Y-m-d'),
                    'is_active' => true,
                ]);

                // Create some payment history for the past 2 months
                for ($m = 1; $m >= 0; $m--) {
                    $monthDate = Carbon::now()->subMonthsNoOverflow($m);
                    
                    Payment::create([
                        'house_id' => $house->id,
                        'resident_id' => $resident->id,
                        'jenis' => 'satpam',
                        'bulan' => $monthDate->month,
                        'tahun' => $monthDate->year,
                        'jumlah' => 100000,
                        'status' => 'lunas',
                        'tanggal_bayar' => $monthDate->format('Y-m-d'),
                    ]);

                    Payment::create([
                        'house_id' => $house->id,
                        'resident_id' => $resident->id,
                        'jenis' => 'kebersihan',
                        'bulan' => $monthDate->month,
                        'tahun' => $monthDate->year,
                        'jumlah' => 15000,
                        'status' => 'lunas',
                        'tanggal_bayar' => $monthDate->format('Y-m-d'),
                    ]);
                }
            }
        }

        // Add some expenses
        Expense::create([
            'nama' => 'Gaji Satpam Bulan Lalu',
            'jumlah' => 3000000,
            'tanggal' => Carbon::now()->subMonths(1)->endOfMonth()->format('Y-m-d'),
            'kategori' => 'Gaji Satpam',
            'keterangan' => 'Gaji untuk Pak Satpam',
        ]);
    }
}