<?php

namespace App\Http\Controllers;

use App\Models\House;
use App\Models\HouseResident;
use Illuminate\Http\Request;
use Carbon\Carbon;

class HouseController extends Controller
{
    public function index()
    {
        return House::with('activeResident.resident')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomor_rumah' => 'required|string|unique:houses',
            'blok' => 'nullable|string',
            'status' => 'required|in:dihuni,tidak_dihuni',
        ]);

        $house = House::create($validated);
        return response()->json($house, 201);
    }

    public function show(House $house)
    {
        return $house->load(['activeResident.resident']);
    }

    public function update(Request $request, House $house)
    {
        $validated = $request->validate([
            'nomor_rumah' => 'sometimes|string|unique:houses,nomor_rumah,' . $house->id,
            'blok' => 'nullable|string',
            'status' => 'sometimes|in:dihuni,tidak_dihuni',
        ]);

        $house->update($validated);
        return response()->json($house);
    }

    public function destroy(House $house)
    {
        $house->delete();
        return response()->json(null, 204);
    }

    public function assignResident(Request $request, House $house)
    {
        $validated = $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'tanggal_mulai' => 'required|date',
        ]);

        // Terminate existing active resident if any
        $house->activeResident()->update([
            'is_active' => false,
            'tanggal_selesai' => Carbon::now()->format('Y-m-d')
        ]);

        HouseResident::create([
            'house_id' => $house->id,
            'resident_id' => $validated['resident_id'],
            'tanggal_mulai' => $validated['tanggal_mulai'],
            'is_active' => true,
        ]);

        $house->update(['status' => 'dihuni']);

        return response()->json(['message' => 'Resident assigned successfully']);
    }

    public function history(House $house)
    {
        return $house->history()->with('resident')->get();
    }

    public function payments(House $house)
    {
        return $house->payments()->with('resident')->orderBy('tahun', 'desc')->orderBy('bulan', 'desc')->get();
    }
}