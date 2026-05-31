<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resident extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function houses()
    {
        return $this->belongsToMany(House::class, 'house_residents')
            ->withPivot(['tanggal_mulai', 'tanggal_selesai', 'is_active'])
            ->withTimestamps();
    }
}