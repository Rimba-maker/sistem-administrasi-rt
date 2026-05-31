<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Expense;
use App\Models\House;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function summary(Request $request)
    {
        $year = $request->query('year', Carbon::now()->year);

        // Fetch income (lunas payments) grouped by month
        $income = Payment::where('status', 'lunas')
            ->where('tahun', $year)
            ->select(DB::raw('bulan, SUM(jumlah) as total'))
            ->groupBy('bulan')
            ->pluck('total', 'bulan')
            ->toArray();

        // Fetch expenses grouped by month (Database agnostic)
        $expenses = Expense::whereYear('tanggal', $year)
            ->get()
            ->groupBy(function($expense) {
                return Carbon::parse($expense->tanggal)->month;
            })
            ->map(function($group) {
                return $group->sum('jumlah');
            })
            ->toArray();

        $chartData = [];
        $totalIncome = 0;
        $totalExpense = 0;

        for ($i = 1; $i <= 12; $i++) {
            $inc = $income[$i] ?? 0;
            $inc = (int) ($income[$i] ?? 0);
            $exp = (int) ($expenses[$i] ?? 0);
            $chartData[] = [
                'bulan' => Carbon::create()->month($i)->format('F'),
                'month_num' => $i,
                'pemasukan' => $inc,
                'pengeluaran' => $exp,
                'saldo' => $inc - $exp
            ];
            $totalIncome += $inc;
            $totalExpense += $exp;
        }

        // Summary cards data
        $totalHouses = House::count();
        $pendingPaymentsCount = Payment::where('status', 'belum_lunas')->count();

        // Current saldo: all time income - all time expense
        $allTimeIncome = Payment::where('status', 'lunas')->sum('jumlah');
        $allTimeExpense = Expense::sum('jumlah');
        $currentSaldo = $allTimeIncome - $allTimeExpense;

        return response()->json([
            'chart_data' => $chartData,
            'summary' => [
                'total_houses' => (int) $totalHouses,
                'pending_payments' => (int) $pendingPaymentsCount,
                'total_saldo_rt' => (int) $currentSaldo,
                'year_income' => (int) $totalIncome,
                'year_expense' => (int) $totalExpense
            ]
        ]);
    }

    public function monthlyDetail(Request $request)
    {
        $year = $request->query('year', Carbon::now()->year);
        $month = $request->query('month', Carbon::now()->month);

        $payments = Payment::with(['house', 'resident'])
            ->where('tahun', $year)
            ->where('bulan', $month)
            ->get();

        $expenses = Expense::whereYear('tanggal', $year)
            ->whereMonth('tanggal', $month)
            ->get();

        return response()->json([
            'payments' => $payments,
            'expenses' => $expenses,
            'total_pemasukan_lunas' => (int) $payments->where('status', 'lunas')->sum('jumlah'),
            'total_pemasukan_pending' => (int) $payments->where('status', 'belum_lunas')->sum('jumlah'),
            'total_pengeluaran' => (int) $expenses->sum('jumlah')
        ]);
    }
}