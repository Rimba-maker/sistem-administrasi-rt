<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class House extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function activeResident()
    {
        return $this->hasOne(HouseResident::class)->where('is_active', true)->latest();
    }

    public function history()
    {
        return $this->hasMany(HouseResident::class)->orderBy('tanggal_mulai', 'desc');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}