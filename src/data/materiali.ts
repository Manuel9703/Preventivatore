// Tabella materiali per il quotatore CNC.
// Struttura pensata per essere estesa facilmente: per aggiungere un materiale
// basta aggiungere un nuovo oggetto Materiale all'array `materiali`.

export type LivelloFinitura = 'basso' | 'medio' | 'alto';

export interface Materiale {
  /** Identificativo univoco, usato come key/value nella select */
  id: string;
  /** Nome visualizzato in UI */
  nome: string;
  /** Densità del materiale in g/cm³ (valore fisico noto, non un placeholder) */
  densita: number;
  /**
   * Velocità di taglio (Vc) consigliata in m/min, usata per precompilare
   * il campo in UI. È un valore indicativo di partenza: l'utente può
   * modificarlo liberamente in base a utensile/strategia usati.
   */
  vcConsigliata: number;
  /**
   * MRR (Material Removal Rate) di sgrossatura in cm³/min.
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
  {
    id: 'al7075',
    nome: 'Alluminio 7075',
    densita: 2.81,
    vcConsigliata: 300,
    mrrSgrossatura: 40, // PLACEHOLDER - DA VALIDARE CON DATI REALI
  },
  {
    id: 'acciaio-c40',
    nome: 'Acciaio C40',
    densita: 7.85,
    vcConsigliata: 120,
    mrrSgrossatura: 15, // PLACEHOLDER - DA VALIDARE CON DATI REALI
  },
  {
    id: 'inox-15-5ph',
    nome: 'Inox 15-5PH',
    densita: 7.8,
    vcConsigliata: 80,
    mrrSgrossatura: 8, // PLACEHOLDER - DA VALIDARE CON DATI REALI
  },
  {
    id: 'titanio-6al4v',
    nome: 'Titanio 6Al4V',
    densita: 4.43,
    vcConsigliata: 50,
    mrrSgrossatura: 5, // PLACEHOLDER - DA VALIDARE CON DATI REALI
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
