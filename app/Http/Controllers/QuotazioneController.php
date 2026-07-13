<?php

namespace App\Http\Controllers;

use App\Http\Requests\QuotazioneRequest;
use App\Services\QuotazioneService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuotazioneController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('quotazione/index', [
            'materiali' => config('materiali.lista'),
            'gruppi' => config('materiali.gruppi'),
            'risultato' => null,
        ]);
    }

    /**
     * Calcolo completo della quotazione, eseguito al submit del form.
     *
     * Ri-renderizza la stessa pagina Inertia con il risultato come prop:
     * niente redirect, niente round-trip JSON separato, coerente con il
     * pattern standard di gestione dei form in Inertia.
     */
    public function calcola(QuotazioneRequest $request, QuotazioneService $service): Response
    {
        $materiale = $service->trovaMateriale($request->string('materiale_id')->value());

        $risultato = $service->calcola(
            materiale: $materiale,
            formaGrezzo: $request->string('forma_grezzo')->value(),
            dimensioni: $request->dimensioni(),
            massaFinitoG: $request->float('massa_finito_g'),
            condizioniTaglio: $request->integer('condizioni_taglio'),
            livelloFinitura: $request->string('livello_finitura')->value(),
        );

        return Inertia::render('quotazione/index', [
            'materiali' => config('materiali.lista'),
            'gruppi' => config('materiali.gruppi'),
            'risultato' => $risultato,
        ]);
    }

    /**
     * Endpoint leggero per l'anteprima "live" della massa del grezzo mentre
     * l'utente digita le misure, senza dover compilare tutto il form.
     */
    public function massaGrezzo(Request $request, QuotazioneService $service): JsonResponse
    {
        $validated = $request->validate([
            'materiale_id' => ['required', 'string'],
            'forma_grezzo' => ['required', 'string', 'in:parallelepipedo,cilindro'],
            'lunghezza_mm' => ['nullable', 'numeric'],
            'larghezza_mm' => ['nullable', 'numeric'],
            'altezza_mm' => ['nullable', 'numeric'],
            'diametro_mm' => ['nullable', 'numeric'],
        ]);

        $materiale = $service->trovaMateriale($validated['materiale_id']);

        if (! $materiale) {
            return response()->json(['massa_grezzo_g' => null]);
        }

        $dimensioni = [
            'lunghezza_mm' => (float) ($validated['lunghezza_mm'] ?? 0),
            'larghezza_mm' => (float) ($validated['larghezza_mm'] ?? 0),
            'altezza_mm' => (float) ($validated['altezza_mm'] ?? 0),
            'diametro_mm' => (float) ($validated['diametro_mm'] ?? 0),
        ];

        $massaGrezzoG = $service->massaGrezzoG($validated['forma_grezzo'], $dimensioni, $materiale['densita']);

        return response()->json([
            'massa_grezzo_g' => $massaGrezzoG > 0 ? $massaGrezzoG : null,
        ]);
    }
}
