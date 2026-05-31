<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index()
    {
        return Expense::orderBy('tanggal', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jumlah' => 'required|integer|min:0',
            'tanggal' => 'required|date',
            'kategori' => 'required|string|max:255',
            'keterangan' => 'nullable|string',
        ]);

        $expense = Expense::create($validated);
        return response()->json($expense, 201);
    }

    public function show(Expense $expense)
    {
        return $expense;
    }

    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'nama' => 'sometimes|string|max:255',
            'jumlah' => 'sometimes|integer|min:0',
            'tanggal' => 'sometimes|date',
            'kategori' => 'sometimes|string|max:255',
            'keterangan' => 'nullable|string',
        ]);

        $expense->update($validated);
        return response()->json($expense);
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();
        return response()->json(null, 204);
    }
}