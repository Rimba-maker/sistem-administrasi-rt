<?php

namespace App\Http\Controllers;

use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ResidentController extends Controller
{
    public function index(Request $request)
    {
        $query = Resident::query();
        
        if ($request->has('status_penghuni')) {
            $query->where('status_penghuni', $request->status_penghuni);
        }

        return $query->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'status_penghuni' => 'required|in:tetap,kontrak',
            'nomor_telepon' => 'nullable|string|max:20',
            'status_menikah' => 'required|boolean',
            'foto_ktp' => 'nullable|string'
        ]);

        if ($request->has('foto_ktp') && !empty($request->foto_ktp)) {
            $base64Data = $request->foto_ktp;
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $type)) {
                $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
                $type = strtolower($type[1]); // jpg, png, etc.
                $fileName = 'ktp/' . uniqid() . '.' . $type;
                Storage::disk('public')->put($fileName, base64_decode($base64Data));
                $validated['foto_ktp'] = $fileName;
            }
        }

        $resident = Resident::create($validated);

        return response()->json($resident, 201);
    }

    public function show(Resident $resident)
    {
        return $resident;
    }

    public function update(Request $request, Resident $resident)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'sometimes|string|max:255',
            'status_penghuni' => 'sometimes|in:tetap,kontrak',
            'nomor_telepon' => 'nullable|string|max:20',
            'status_menikah' => 'sometimes|boolean',
            'foto_ktp' => 'nullable|string'
        ]);

        if ($request->has('foto_ktp') && !empty($request->foto_ktp)) {
            if ($resident->foto_ktp) {
                Storage::disk('public')->delete($resident->foto_ktp);
            }
            $base64Data = $request->foto_ktp;
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $type)) {
                $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
                $type = strtolower($type[1]);
                $fileName = 'ktp/' . uniqid() . '.' . $type;
                Storage::disk('public')->put($fileName, base64_decode($base64Data));
                $validated['foto_ktp'] = $fileName;
            }
        }

        $resident->update($validated);

        return response()->json($resident);
    }

    public function destroy(Resident $resident)
    {
        if ($resident->foto_ktp) {
            Storage::disk('public')->delete($resident->foto_ktp);
        }
        $resident->delete();

        return response()->json(null, 204);
    }
}