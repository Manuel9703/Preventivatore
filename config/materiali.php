<?php

// Tabella materiali per il quotatore CNC.
// I materiali sono raggruppati secondo la classificazione ISO 513 dei
// gruppi di lavorabilità (colore/lettera utensile):
//   P = acciai, M = acciai inossidabili, K = ghise,
//   N = metalli non ferrosi, S = superleghe/titanio, H = acciai temprati
//
// Per aggiungere un materiale basta aggiungere una voce all'array 'lista'.

return [

    'gruppi' => [
        'P' => 'P — Acciai',
        'M' => 'M — Acciai inossidabili',
        'K' => 'K — Ghise',
        'N' => 'N — Metalli non ferrosi',
        'S' => 'S — Superleghe e titanio',
        'H' => 'H — Acciai temprati',
    ],

    /*
     * Fattori moltiplicativi per stimare il tempo di finitura a partire dal
     * tempo di sgrossatura, in base al livello di finitura richiesto.
     *
     * *** PLACEHOLDER - DA VALIDARE CON DATI REALI ***
     * Valori di massima, da tarare con dati storici di lavorazioni reali.
     */
    'fattori_finitura' => [
        'basso' => 0.3,
        'medio' => 0.6,
        'alto' => 1.2,
    ],

    /*
     * Ogni voce:
     * - densita: g/cm³ (valore fisico noto, non un placeholder)
     * - vc_consigliata: velocità di taglio (m/min) usata per precompilare
     *   il campo in UI, valore indicativo di partenza, editabile
     * - mrr_sgrossatura: MRR (Material Removal Rate) di sgrossatura in
     *   cm³/min, in condizioni di taglio ottimali (10/10).
     *
     *   *** PLACEHOLDER - DA VALIDARE CON DATI REALI ***
     *   Questi valori NON derivano da prove di taglio reali: sono stime di
     *   massima usate solo per far funzionare l'MVP. Vanno sostituiti con
     *   dati empirici prima di qualunque uso in produzione.
     */
    'lista' => [
        // --- P: Acciai ---
        ['id' => 'acciaio-c40', 'nome' => 'Acciaio C40', 'gruppo_iso' => 'P', 'densita' => 7.85, 'vc_consigliata' => 120, 'mrr_sgrossatura' => 15],
        ['id' => 'acciaio-c45', 'nome' => 'Acciaio C45', 'gruppo_iso' => 'P', 'densita' => 7.85, 'vc_consigliata' => 110, 'mrr_sgrossatura' => 14],
        ['id' => 'acciaio-16mncr5', 'nome' => 'Acciaio 16MnCr5', 'gruppo_iso' => 'P', 'densita' => 7.85, 'vc_consigliata' => 130, 'mrr_sgrossatura' => 16],
        ['id' => 'acciaio-42crmo4', 'nome' => 'Acciaio 42CrMo4 bonificato', 'gruppo_iso' => 'P', 'densita' => 7.85, 'vc_consigliata' => 90, 'mrr_sgrossatura' => 10],

        // --- M: Acciai inossidabili ---
        ['id' => 'inox-15-5ph', 'nome' => 'Inox 15-5PH', 'gruppo_iso' => 'M', 'densita' => 7.8, 'vc_consigliata' => 80, 'mrr_sgrossatura' => 8],
        ['id' => 'inox-aisi304', 'nome' => 'Inox AISI 304', 'gruppo_iso' => 'M', 'densita' => 8.0, 'vc_consigliata' => 100, 'mrr_sgrossatura' => 10],
        ['id' => 'inox-aisi316l', 'nome' => 'Inox AISI 316L', 'gruppo_iso' => 'M', 'densita' => 8.0, 'vc_consigliata' => 90, 'mrr_sgrossatura' => 9],

        // --- K: Ghise ---
        ['id' => 'ghisa-gg25', 'nome' => 'Ghisa grigia GG25 (EN-GJL-250)', 'gruppo_iso' => 'K', 'densita' => 7.15, 'vc_consigliata' => 150, 'mrr_sgrossatura' => 35],
        ['id' => 'ghisa-gs400', 'nome' => 'Ghisa sferoidale GS400 (EN-GJS-400)', 'gruppo_iso' => 'K', 'densita' => 7.1, 'vc_consigliata' => 120, 'mrr_sgrossatura' => 25],

        // --- N: Metalli non ferrosi ---
        ['id' => 'al7075', 'nome' => 'Alluminio 7075', 'gruppo_iso' => 'N', 'densita' => 2.81, 'vc_consigliata' => 300, 'mrr_sgrossatura' => 40],
        ['id' => 'al6082', 'nome' => 'Alluminio 6082', 'gruppo_iso' => 'N', 'densita' => 2.7, 'vc_consigliata' => 350, 'mrr_sgrossatura' => 55],
        ['id' => 'al2024', 'nome' => 'Alluminio 2024', 'gruppo_iso' => 'N', 'densita' => 2.78, 'vc_consigliata' => 320, 'mrr_sgrossatura' => 48],
        ['id' => 'ottone-cuzn39pb3', 'nome' => 'Ottone CuZn39Pb3', 'gruppo_iso' => 'N', 'densita' => 8.47, 'vc_consigliata' => 250, 'mrr_sgrossatura' => 60],

        // --- S: Superleghe e titanio ---
        ['id' => 'titanio-6al4v', 'nome' => 'Titanio 6Al4V', 'gruppo_iso' => 'S', 'densita' => 4.43, 'vc_consigliata' => 50, 'mrr_sgrossatura' => 5],
        ['id' => 'inconel718', 'nome' => 'Inconel 718', 'gruppo_iso' => 'S', 'densita' => 8.19, 'vc_consigliata' => 25, 'mrr_sgrossatura' => 2],

        // --- H: Acciai temprati ---
        ['id' => 'acciaio-42crmo4-temprato', 'nome' => 'Acciaio 42CrMo4 temprato (~50 HRC)', 'gruppo_iso' => 'H', 'densita' => 7.85, 'vc_consigliata' => 40, 'mrr_sgrossatura' => 3],
    ],

];
