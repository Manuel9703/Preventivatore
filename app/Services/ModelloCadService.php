<?php

namespace App\Services;

use RuntimeException;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
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
    private const TIMEOUT_SECONDI_DEFAULT = 180;

    /**
     * @return array{volume_cm3: float, bounding_box_mm: array{0: float, 1: float, 2: float}, numero_mesh: int}
     *
     * @throws RuntimeException se il file non è leggibile come solido CAD
     */
    public function analizza(string $percorsoFile, string $formato): array
    {
        $scriptPath = env('CAD_ANALYSIS_SCRIPT_PATH', base_path('scripts/analizza-modello-cad.mjs'));
        $timeoutSecondi = (int) env('CAD_ANALYSIS_TIMEOUT_SECONDS', self::TIMEOUT_SECONDI_DEFAULT);

        $process = new Process(['node', $scriptPath, $percorsoFile, $formato]);
        $process->setTimeout($timeoutSecondi);

        try {
            $process->run();
        } catch (ProcessTimedOutException $e) {
            throw new RuntimeException('Timeout durante l\'analisi del file. Prova con un file più semplice o inserisci la massa manualmente.');
        }

        if (! $process->isSuccessful()) {
            $errore = $this->estraiErroreDalProcesso($process);

            if ($errore !== null) {
                throw new RuntimeException($errore);
            }

            if ($process->getTimedOut() || $process->getExitCode() === 124 || str_contains($process->getErrorOutput(), 'exceeded the timeout')) {
                throw new RuntimeException('Timeout durante l\'analisi del file. Prova con un file più semplice o inserisci la massa manualmente.');
            }

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

    private function estraiErroreDalProcesso(Process $process): ?string
    {
        $output = trim($process->getOutput());
        $errorOutput = trim($process->getErrorOutput());

        foreach ([$output, $errorOutput] as $testo) {
            if ($testo === '') {
                continue;
            }

            $righe = array_filter(explode("\n", $testo));
            foreach (array_reverse($righe) as $riga) {
                $riga = trim((string) $riga);

                if ($riga === '') {
                    continue;
                }

                $risultato = json_decode($riga, true);

                if (is_array($risultato) && ($risultato['success'] ?? null) === false && isset($risultato['errore'])) {
                    return (string) $risultato['errore'];
                }

                if (str_contains($riga, 'Error') || str_contains($riga, 'Errore') || str_contains($riga, 'Exception')) {
                    return $riga;
                }
            }
        }

        return null;
    }

    /** Massa del pezzo finito calcolata dal volume del modello e dalla densità del materiale, in grammi. */
    public function massaFinitoG(array $analisi, float $densita): float
    {
        return $analisi['volume_cm3'] * $densita;
    }
}
