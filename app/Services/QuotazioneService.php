<?php

namespace App\Services;

use InvalidArgumentException;

/**
 * Logica di calcolo della quotazione di massima per una lavorazione CNC.
 *
 * Fase 1 (MVP): stima molto semplificata basata solo su volume di materiale
 * asportato e MRR (Material Removal Rate) medio per materiale. Non tiene
 * conto di setup, cambi utensile, piazzamenti, tempi morti: vedi disclaimer
 * mostrato in UI.
 */
class QuotazioneService
{
    /** Restituisce il materiale con il dato id, o null se non esiste. */
    public function trovaMateriale(string $materialeId): ?array
    {
        foreach (config('materiali.lista') as $materiale) {
            if ($materiale['id'] === $materialeId) {
                return $materiale;
            }
        }

        return null;
    }

    /**
     * Volume del grezzo calcolato dalle sue dimensioni, in cm³.
     *
     * Le dimensioni sono in mm, quindi il volume in mm³ va diviso per 1000
     * per ottenere i cm³ (1 cm³ = 1000 mm³).
     */
    public function volumeGrezzoCm3(string $formaGrezzo, array $dimensioni): float
    {
        if ($formaGrezzo === 'parallelepipedo') {
            return ($dimensioni['lunghezza_mm'] * $dimensioni['larghezza_mm'] * $dimensioni['altezza_mm']) / 1000;
        }

        if ($formaGrezzo === 'cilindro') {
            $raggioMm = $dimensioni['diametro_mm'] / 2;

            return (M_PI * $raggioMm ** 2 * $dimensioni['lunghezza_mm']) / 1000;
        }

        throw new InvalidArgumentException("Forma grezzo sconosciuta: {$formaGrezzo}");
    }

    /** Massa del grezzo calcolata dalle sue dimensioni e dalla densità del materiale, in grammi. */
    public function massaGrezzoG(string $formaGrezzo, array $dimensioni, float $densita): float
    {
        return $this->volumeGrezzoCm3($formaGrezzo, $dimensioni) * $densita;
    }

    /**
     * Fattore moltiplicativo (0.1 - 1.0) derivato dalle condizioni di taglio
     * (1 = condizioni difficili, 10 = condizioni ottimali).
     */
    public function fattoreCondizioniTaglio(int $condizioniTaglio): float
    {
        return $condizioniTaglio / 10;
    }

    /** Vc suggerita per il materiale, corretta in base alle condizioni di taglio. */
    public function vcSuggerita(array $materiale, int $condizioniTaglio): float
    {
        return $materiale['vc_consigliata'] * $this->fattoreCondizioniTaglio($condizioniTaglio);
    }

    /**
     * Calcola la quotazione di massima a partire dai dati inseriti dall'utente.
     *
     * Formule:
     * - Volume asportato = (massa_grezzo - massa_finito) / densità_materiale
     * - MRR effettivo = MRR sgrossatura (per materiale) * (condizioni_taglio / 10)
     * - Tempo sgrossatura = Volume asportato / MRR effettivo
     * - Tempo finitura = Tempo sgrossatura * fattore_livello_finitura
     * - Tempo totale = Tempo sgrossatura + Tempo finitura
     *
     * @param  array  $materiale  voce della tabella config('materiali.lista')
     * @param  array  $dimensioni  lunghezza_mm/larghezza_mm/altezza_mm oppure diametro_mm/lunghezza_mm
     */
    public function calcola(
        array $materiale,
        string $formaGrezzo,
        array $dimensioni,
        float $massaFinitoG,
        int $condizioniTaglio,
        string $livelloFinitura,
    ): array {
        $massaGrezzoG = $this->massaGrezzoG($formaGrezzo, $dimensioni, $materiale['densita']);
        $massaAsportataG = $massaGrezzoG - $massaFinitoG;
        $volumeAsportatoCm3 = $massaAsportataG / $materiale['densita'];

        $mrrEffettivo = $materiale['mrr_sgrossatura'] * $this->fattoreCondizioniTaglio($condizioniTaglio);
        $tempoSgrossaturaMin = $volumeAsportatoCm3 / $mrrEffettivo;

        $fattoreFinitura = config("materiali.fattori_finitura.{$livelloFinitura}");
        $tempoFinituraMin = $tempoSgrossaturaMin * $fattoreFinitura;

        $tempoTotaleMin = $tempoSgrossaturaMin + $tempoFinituraMin;

        return [
            'massa_grezzo_g' => $massaGrezzoG,
            'volume_asportato_cm3' => $volumeAsportatoCm3,
            'tempo_sgrossatura_min' => $tempoSgrossaturaMin,
            'tempo_finitura_min' => $tempoFinituraMin,
            'tempo_totale_min' => $tempoTotaleMin,
        ];
    }
}
