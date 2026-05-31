<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\House;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['house', 'resident']);

        if ($request->has('house_id')) {
            $query->where('house_id', $request->house_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return $query->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'house_id' => 'required|exists:houses,id',
            'jenis' => 'required|in:satpam,kebersihan',
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer',
            'status' => 'required|in:lunas,belum_lunas',
        ]);

        $house = House::with('activeResident')->findOrFail($validated['house_id']);
        if (!$house->activeResident) {
            return response()->json(['message' => 'House is empty, cannot create payment'], 422);
        }

        $validated['resident_id'] = $house->activeResident->resident_id;
        $validated['jumlah'] = $validated['jenis'] === 'satpam' ? 100000 : 15000;
        // Status provided by user

        // Check if exists
        $exists = Payment::where('house_id', $validated['house_id'])
            ->where('jenis', $validated['jenis'])
            ->where('bulan', $validated['bulan'])
            ->where('tahun', $validated['tahun'])
            ->first();

        if ($exists) {
            return response()->json(['message' => 'Payment already exists'], 422);
        }

        if ($validated['status'] === 'lunas') {
            $validated['tanggal_bayar'] = Carbon::now()->format('Y-m-d');
        }
        $payment = Payment::create($validated);
        return response()->json($payment, 201);
    }

    public function bulkYearly(Request $request)
    {
        $validated = $request->validate([
            'house_id' => 'required|exists:houses,id',
            'tahun' => 'required|integer',
            'status' => 'required|in:lunas,belum_lunas',
        ]);

        $house = House::with('activeResident')->findOrFail($validated['house_id']);
        if (!$house->activeResident) {
            return response()->json(['message' => 'House is empty'], 422);
        }

        $resident_id = $house->activeResident->resident_id;
        $created = [];

        for ($bulan = 1; $bulan <= 12; $bulan++) {
            $exists = Payment::where('house_id', $house->id)
                ->where('jenis', 'kebersihan')
                ->where('bulan', $bulan)
                ->where('tahun', $validated['tahun'])
                ->first();

            if (!$exists) {
                $created[] = Payment::create([
                    'house_id' => $house->id,
                    'resident_id' => $resident_id,
                    'jenis' => 'kebersihan',
                    'bulan' => $bulan,
                    'tahun' => $validated['tahun'],
                    'jumlah' => 15000,
                    'status' => $validated['status'],
                    'tanggal_bayar' => $validated['status'] === 'lunas' ? Carbon::now()->format('Y-m-d') : null,
                ]);
            }
        }

        return response()->json([
            'message' => count($created) . ' tagihan berhasil digenerate (' . (12 - count($created)) . ' dilewati karena sudah ada)',
            'data' => $created
        ], 201);
    }

    public function markPaid(Payment $payment)
    {
        $payment->update([
            'status' => 'lunas',
            'tanggal_bayar' => Carbon::now()->format('Y-m-d')
        ]);
        return response()->json($payment);
    }

    public function destroy(Payment $payment)
    {
        $payment->delete();
        return response()->json(null, 204);
    }
}