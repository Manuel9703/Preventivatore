<?php

namespace App\Services;

use RuntimeException;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

/**
 * Analizza un file CAD (STEP o IGES) del pezzo finito per ricavarne
 * automaticamente volume e ingombro, così da evitare l'inserimento manuale
 * della massa quando il cliente fornisce già un modello 3D.
 *
 * Il parsing vero e proprio avviene in un sottoprocesso Node.js (vedi
 * scripts/analizza-modello-cad.mjs) che usa occt-import-js, il binding
 * WebAssembly di OpenCascade: non serve installare nessun toolchain CAD
 * nativo (FreeCAD/OpenCascade) sul server, basta Node.js.
 */
class ModelloCadService
{
    private const TIMEOUT_SECONDI = 30;

    /**
     * @return array{volume_cm3: float, bounding_box_mm: array{0: float, 1: float, 2: float}, numero_mesh: int}
     *
     * @throws RuntimeException se il file non è leggibile come solido CAD
     */
    public function analizza(string $percorsoFile, string $formato): array
    {
        $scriptPath = base_path('scripts/analizza-modello-cad.mjs');

        $process = new Process(['node', $scriptPath, $percorsoFile, $formato]);
        $process->setTimeout(self::TIMEOUT_SECONDI);
        $process->run();

        if (! $process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        // occt-import-js a volte scrive righe di log informative su stdout
        // prima del risultato: prendiamo solo l'ultima riga non vuota, che
        // è sempre il JSON stampato dallo script.
        $righe = array_filter(explode("\n", trim($process->getOutput())));
        $ultimaRiga = end($righe);

        $risultato = json_decode((string) $ultimaRiga, true);

        if (! is_array($risultato) || ! ($risultato['success'] ?? false)) {
            $errore = $risultato['errore'] ?? 'Impossibile leggere il file CAD.';
            throw new RuntimeException($errore);
        }

        return [
            'volume_cm3' => $risultato['volumeMm3'] / 1000,
            'bounding_box_mm' => $risultato['boundingBoxMm'],
            'numero_mesh' => $risultato['numeroMesh'],
        ];
    }

    /** Massa del pezzo finito calcolata dal volume del modello e dalla densità del materiale, in grammi. */
    public function massaFinitoG(array $analisi, float $densita): float
    {
        return $analisi['volume_cm3'] * $densita;
    }
}
