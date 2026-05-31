<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('house_id')->constrained()->cascadeOnDelete();
            $table->foreignId('resident_id')->nullable()->constrained()->nullOnDelete(); // snapshot saat bayar
            $table->enum('jenis', ['satpam', 'kebersihan']);
            $table->integer('bulan');
            $table->integer('tahun');
            $table->integer('jumlah');
            $table->enum('status', ['lunas', 'belum_lunas'])->default('belum_lunas');
            $table->date('tanggal_bayar')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};