// Tabella materiali per il quotatore CNC.
// Struttura pensata per essere estesa facilmente: per aggiungere un materiale
// basta aggiungere un nuovo oggetto Materiale all'array `materiali`.
//
// I materiali sono raggruppati secondo la classificazione ISO 513 dei
// gruppi di lavorabilità (colore/lettera utensile):
//   P = acciai, M = acciai inossidabili, K = ghise,
//   N = metalli non ferrosi, S = superleghe/titanio, H = acciai temprati

export type LivelloFinitura = 'basso' | 'medio' | 'alto';

export type GruppoIso = 'P' | 'M' | 'K' | 'N' | 'S' | 'H';

export const gruppoIsoLabel: Record<GruppoIso, string> = {
  P: 'P — Acciai',
  M: 'M — Acciai inossidabili',
  K: 'K — Ghise',
  N: 'N — Metalli non ferrosi',
  S: 'S — Superleghe e titanio',
  H: 'H — Acciai temprati',
};

export interface Materiale {
  /** Identificativo univoco, usato come key/value nella select */
  id: string;
  /** Nome visualizzato in UI */
  nome: string;
  /** Gruppo di lavorabilità ISO 513 (P/M/K/N/S/H), usato per raggruppare la select */
  gruppoIso: GruppoIso;
  /** Densità del materiale in g/cm³ (valore fisico noto, non un placeholder) */
  densita: number;
  /**
   * Velocità di taglio (Vc) consigliata in m/min, usata per precompilare
   * il campo in UI. È un valore indicativo di partenza: l'utente può
   * modificarlo liberamente in base a utensile/strategia usati.
   */
  vcConsigliata: number;
  /**
   * MRR (Material Removal Rate) di sgrossatura in cm³/min, in condizioni di
   * taglio ottimali (vedi condizioniTaglio in quotazione.ts).
   *
   * *** PLACEHOLDER - DA VALIDARE CON DATI REALI ***
   * Questi valori NON derivano da prove di taglio reali: sono stime di
   * massima usate solo per far funzionare l'MVP. Vanno sostituiti con dati
   * empirici (prove al banco, dati macchina/utensile) prima di qualunque
   * uso in produzione o per quotazioni reali verso clienti.
   */
  mrrSgrossatura: number;
}

export const materiali: Materiale[] = [
  // --- P: Acciai ---
  {
    id: 'acciaio-c40',
    nome: 'Acciaio C40',
    gruppoIso: 'P',
    densita: 7.85,
    vcConsigliata: 120,
    mrrSgrossatura: 15, // PLACEHOLDER - DA VALIDARE CON DATI REALI
  },
  {
    id: 'acciaio-c45',
    nome: 'Acciaio C45',
    gruppoIso: 'P',
    densita: 7.85,
    vcConsigliata: 110,
    mrrSgrossatura: 14, // PLACEHOLDER - DA VALIDARE CON DATI REALI
  },
  {
    id: 'acciaio-16mncr5',
    nome: 'Acciaio 16MnCr5',
    gruppoIso: 'P',
    densita: 7.85,
    vcConsigliata: 130,
    mrrSgrossatura: 16, // PLACEHOLDER - DA VALIDARE CON DATI REALI
  },
  {
    id: 'acciaio-42crmo4',
    nome: 'Acciaio 42CrMo4 bonificato',
    gruppoIso: 'P',
    densita: 7.85,
    vcConsigliata: 90,
    mrrSgrossatura: 10, // PLACEHOLDER - DA VALIDARE CON DATI REALI
  },

  // --- M: Acciai inossidabili ---
  {
    id: 'inox-15-5ph',
    nome: 'Inox 15-5PH',
    gruppoIso: 'M',
    densita: 7.8,
    vcConsigliata: 80,
    mrrSgrossatura: 8, // PLACEHOLDER - DA VALIDARE CON DATI REALI
  },
  {
    id: 'inox-aisi304',
    nome: 'Inox AISI 304',
    gruppoIso: 'M',
    densita: 8.0,
    vcConsigliata: 100,
    mrrSgrossatura: 10, // PLACEHOLDER - DA VALIDARE CON DATI REALI
  },
  {
    id: 'inox-aisi316l',
    nome: 'Inox AISI 316L',
    gruppoIso: 'M',
    densita: 8.0,
    vcConsigliata: 90,
    mrrSgrossatura: 9, // PLACEHOLDER - DA VALIDARE CON DATI REALI
  },

  // --- K: Ghise ---
  {
    id: 'ghisa-gg25',
    nome: 'Ghisa grigia GG25 (EN-GJL-250)',
    gruppoIso: 'K',
    densita: 7.15,
    vcConsigliata: 150,
    mrrSgrossatura: 35, // PLACEHOLDER - DA VALIDARE CON DATI REALI
  },
  {
    id: 'ghisa-gs400',
    nome: 'Ghisa sferoidale GS400 (EN-GJS-400)',
    gruppoIso: 'K',
    densita: 7.1,
    vcConsigliata: 120,
    mrrSgrossatura: 25, // PLACEHOLDER - DA VALIDARE CON DATI REALI
  },

  // --- N: Metalli non ferrosi ---
  {
    id: 'al7075',
    nome: 'Alluminio 7075',
    gruppoIso: 'N',
    densita: 2.81,
    vcConsigliata: 300,
    mrrSgrossatura: 40, // PLACEHOLDER - DA VALIDARE CON DATI REALI
  },
  {
    id: 'al6082',
    nome: 'Alluminio 6082',
    gruppoIso: 'N',
    densita: 2.7,
    vcConsigliata: 350,
    mrrSgrossatura: 55, // PLACEHOLDER - DA VALIDARE CON DATI REALI
  },
  {
    id: 'al2024',
    nome: 'Alluminio 2024',
    gruppoIso: 'N',
    densita: 2.78,
    vcConsigliata: 320,
    mrrSgrossatura: 48, // PLACEHOLDER - DA VALIDARE CON DATI REALI
  },
  {
    id: 'ottone-cuzn39pb3',
    nome: 'Ottone CuZn39Pb3',
    gruppoIso: 'N',
    densita: 8.47,
    vcConsigliata: 250,
    mrrSgrossatura: 60, // PLACEHOLDER - DA VALIDARE CON DATI REALI
  },

  // --- S: Superleghe e titanio ---
  {
    id: 'titanio-6al4v',
    nome: 'Titanio 6Al4V',
    gruppoIso: 'S',
    densita: 4.43,
    vcConsigliata: 50,
    mrrSgrossatura: 5, // PLACEHOLDER - DA VALIDARE CON DATI REALI
  },
  {
    id: 'inconel718',
    nome: 'Inconel 718',
    gruppoIso: 'S',
    densita: 8.19,
    vcConsigliata: 25,
    mrrSgrossatura: 2, // PLACEHOLDER - DA VALIDARE CON DATI REALI
  },

  // --- H: Acciai temprati ---
  {
    id: 'acciaio-42crmo4-temprato',
    nome: 'Acciaio 42CrMo4 temprato (~50 HRC)',
    gruppoIso: 'H',
    densita: 7.85,
    vcConsigliata: 40,
    mrrSgrossatura: 3, // PLACEHOLDER - DA VALIDARE CON DATI REALI
  },
];

/**
 * Fattori moltiplicativi per stimare il tempo di finitura a partire dal
 * tempo di sgrossatura, in base al livello di finitura richiesto.
 *
 * *** PLACEHOLDER - DA VALIDARE CON DATI REALI ***
 * Valori di massima, da tarare con dati storici di lavorazioni reali.
 */
export const fattoriFinitura: Record<LivelloFinitura, number> = {
  basso: 0.3,
  medio: 0.6,
  alto: 1.2,
};
