<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ResidentController;
use App\Http\Controllers\HouseController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ReportController;

Route::post('/login', [AuthController::class, 'login'])->name('login');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Residents
    Route::apiResource('residents', ResidentController::class);

    // Houses
    Route::apiResource('houses', HouseController::class);
    Route::post('houses/{house}/assign-resident', [HouseController::class, 'assignResident']);
    Route::get('houses/{house}/history', [HouseController::class, 'history']);
    Route::get('houses/{house}/payments', [HouseController::class, 'payments']);

    // Payments
    Route::apiResource('payments', PaymentController::class)->except(['update']);
    Route::post('payments/bulk-yearly', [PaymentController::class, 'bulkYearly']);
    Route::patch('payments/{payment}/mark-paid', [PaymentController::class, 'markPaid']);

    // Expenses
    Route::apiResource('expenses', ExpenseController::class);

    // Reports
    Route::get('reports/summary', [ReportController::class, 'summary']);
    Route::get('reports/monthly-detail', [ReportController::class, 'monthlyDetail']);
});