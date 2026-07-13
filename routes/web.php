<?php

use App\Http\Controllers\QuotazioneController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Home: vista Blade "pura" (non Inertia) per avere una pagina di atterraggio
// leggera e ben indicizzabile dai motori di ricerca.
Route::get('/', function () {
    return view('home');
})->name('home');

Route::get('/preventivo', [QuotazioneController::class, 'index'])->name('quotazione.index');
Route::post('/preventivo', [QuotazioneController::class, 'calcola'])->name('quotazione.calcola');
Route::get('/preventivo/massa-grezzo', [QuotazioneController::class, 'massaGrezzo'])->name('quotazione.massa-grezzo');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
