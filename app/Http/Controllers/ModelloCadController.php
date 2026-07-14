<?php

namespace App\Http\Controllers;

use App\Http\Requests\AnalizzaModelloRequest;
use App\Services\ModelloCadService;
use App\Services\QuotazioneService;
use Illuminate\Http\JsonResponse;
use RuntimeException;
use Symfony\Component\Process\Exception\ProcessFailedException;

class ModelloCadController extends Controller
{
    /**
     * Riceve il file STEP/IGES del pezzo finito, ne calcola il volume e
     * restituisce la massa corrispondente per il materiale selezionato,
     * da usare per precompilare "Massa pezzo finito" nel form.
     */
    public function analizza(
        AnalizzaModelloRequest $request,
        ModelloCadService $modelloCadService,
        QuotazioneService $quotazioneService,
    ): JsonResponse {
        $materiale = $quotazioneService->trovaMateriale($request->string('materiale_id')->value());

        if (! $materiale) {
            return response()->json(['success' => false, 'errore' => 'Materiale non valido.'], 422);
        }

        $file = $request->file('modello');
        $percorsoTemporaneo = $file->getRealPath();

        try {
            $analisi = $modelloCadService->analizza($percorsoTemporaneo, $request->formato());
        } catch (ProcessFailedException) {
            return response()->json([
                'success' => false,
                'errore' => 'Timeout o errore durante l\'analisi del file. Prova con un file più semplice o inserisci la massa manualmente.',
            ], 422);
        } catch (RuntimeException $e) {
            return response()->json(['success' => false, 'errore' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'volume_cm3' => $analisi['volume_cm3'],
            'bounding_box_mm' => $analisi['bounding_box_mm'],
            'massa_finito_g' => $modelloCadService->massaFinitoG($analisi, $materiale['densita']),
        ]);
    }
}
