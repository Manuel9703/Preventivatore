// Logica di calcolo della quotazione di massima per una lavorazione CNC.
//
// Fase 1 (MVP): stima molto semplificata basata solo su volume di materiale
// asportato e MRR (Material Removal Rate) medio per materiale. Non tiene
// conto di setup, cambi utensile, piazzamenti, tempi morti: vedi disclaimer
// mostrato in UI.

import { fattoriFinitura, type LivelloFinitura, type Materiale } from '../data/materiali'

/** Grezzo a forma di parallelepipedo (lastra/blocco), misure in mm */
export interface DimensioniParallelepipedo {
  forma: 'parallelepipedo'
  lunghezzaMm: number
  larghezzaMm: number
  altezzaMm: number
}

/** Grezzo a forma di cilindro (barra tonda), misure in mm */
export interface DimensioniCilindro {
  forma: 'cilindro'
  diametroMm: number
  lunghezzaMm: number
}

export type DimensioniGrezzo = DimensioniParallelepipedo | DimensioniCilindro

/** Volume del grezzo calcolato dalle sue dimensioni, in cm³ */
export function calcolaVolumeGrezzoCm3(dimensioni: DimensioniGrezzo): number {
  // Le dimensioni sono in mm, quindi il volume in mm³ va diviso per 1000
  // per ottenere i cm³ (1 cm³ = 1000 mm³).
  if (dimensioni.forma === 'parallelepipedo') {
    const { lunghezzaMm, larghezzaMm, altezzaMm } = dimensioni
    return (lunghezzaMm * larghezzaMm * altezzaMm) / 1000
  }
  const raggioMm = dimensioni.diametroMm / 2
  return (Math.PI * raggioMm ** 2 * dimensioni.lunghezzaMm) / 1000
}

/** Massa del grezzo calcolata dalle sue dimensioni e dalla densità del materiale, in grammi */
export function calcolaMassaGrezzoG(dimensioni: DimensioniGrezzo, densita: number): number {
  return calcolaVolumeGrezzoCm3(dimensioni) * densita
}

/**
 * Condizioni di taglio impostate dall'utente per la lavorazione, su una
 * scala da 1 (condizioni difficili: attrezzaggio poco rigido, niente
 * refrigerante, macchina datata, ecc.) a 10 (condizioni ottimali).
 *
 * Il valore agisce come fattore moltiplicativo (valore/10) sia sull'MRR di
 * sgrossatura sia sulla Vc consigliata: condizioni peggiori riducono la
 * velocità di asportazione effettiva e allungano i tempi stimati.
 */
export type CondizioniTaglio = number

/** Fattore moltiplicativo (0.1 - 1.0) derivato dalle condizioni di taglio */
export function fattoreCondizioniTaglio(condizioniTaglio: CondizioniTaglio): number {
  return condizioniTaglio / 10
}

/** Vc suggerita per il materiale, corretta in base alle condizioni di taglio */
export function calcolaVcSuggerita(materiale: Materiale, condizioniTaglio: CondizioniTaglio): number {
  return materiale.vcConsigliata * fattoreCondizioniTaglio(condizioniTaglio)
}

export interface InputQuotazione {
  materiale: Materiale
  /** Dimensioni del grezzo di partenza, da cui si ricava la massa */
  dimensioniGrezzo: DimensioniGrezzo
  /** Massa del pezzo finito, in grammi */
  massaFinitoG: number
  /**
   * Velocità di taglio (Vc) in m/min impostata dall'utente.
   *
   * Nota: in questa Fase 1 il campo viene raccolto e mostrato ma NON entra
   * nel calcolo del tempo di sgrossatura, perché l'MRR è preso direttamente
   * dalla tabella materiali (vedi src/data/materiali.ts) e non derivato da
   * Vc/avanzamento/profondità di passata. Sarà integrato in una fase
   * successiva con un modello di calcolo più realistico.
   */
  vcMetriPerMinuto: number
  /** Condizioni di taglio, da 1 (difficili) a 10 (ottimali) */
  condizioniTaglio: CondizioniTaglio
  /** Livello di finitura richiesto */
  livelloFinitura: LivelloFinitura
}

export interface RisultatoQuotazione {
  /** Volume di materiale asportato, in cm³ */
  volumeAsportatoCm3: number
  /** Tempo di sgrossatura stimato, in minuti */
  tempoSgrossaturaMin: number
  /** Tempo di finitura stimato, in minuti */
  tempoFinituraMin: number
  /** Tempo totale stimato (sgrossatura + finitura), in minuti */
  tempoTotaleMin: number
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
 */
export function calcolaQuotazione(input: InputQuotazione): RisultatoQuotazione {
  const { materiale, dimensioniGrezzo, massaFinitoG, livelloFinitura, condizioniTaglio } = input

  const massaGrezzoG = calcolaMassaGrezzoG(dimensioniGrezzo, materiale.densita)
  const massaAsportataG = massaGrezzoG - massaFinitoG
  const volumeAsportatoCm3 = massaAsportataG / materiale.densita

  const mrrEffettivo = materiale.mrrSgrossatura * fattoreCondizioniTaglio(condizioniTaglio)
  const tempoSgrossaturaMin = volumeAsportatoCm3 / mrrEffettivo

  const fattoreFinitura = fattoriFinitura[livelloFinitura]
  const tempoFinituraMin = tempoSgrossaturaMin * fattoreFinitura

  const tempoTotaleMin = tempoSgrossaturaMin + tempoFinituraMin

  return {
    volumeAsportatoCm3,
    tempoSgrossaturaMin,
    tempoFinituraMin,
    tempoTotaleMin,
  }
}

/**
 * Valida i dati inseriti dall'utente prima del calcolo.
 * Ritorna un messaggio di errore, oppure null se i dati sono validi.
 */
export function validaInput(input: {
  materiale: Materiale
  dimensioniGrezzo: DimensioniGrezzo
  massaFinitoG: number
  vcMetriPerMinuto: number
  condizioniTaglio: CondizioniTaglio
}): string | null {
  const { materiale, dimensioniGrezzo, massaFinitoG, vcMetriPerMinuto, condizioniTaglio } = input

  const misure =
    dimensioniGrezzo.forma === 'parallelepipedo'
      ? [dimensioniGrezzo.lunghezzaMm, dimensioniGrezzo.larghezzaMm, dimensioniGrezzo.altezzaMm]
      : [dimensioniGrezzo.diametroMm, dimensioniGrezzo.lunghezzaMm]

  if (misure.some((m) => !Number.isFinite(m) || m <= 0)) {
    return 'Inserisci le misure del grezzo (tutte maggiori di zero).'
  }
  if (!Number.isFinite(massaFinitoG) || massaFinitoG <= 0) {
    return 'Inserisci una massa del pezzo finito valida (maggiore di zero).'
  }

  const massaGrezzoG = calcolaMassaGrezzoG(dimensioniGrezzo, materiale.densita)
  if (massaFinitoG >= massaGrezzoG) {
    return 'La massa del pezzo finito deve essere inferiore alla massa del grezzo calcolata dalle misure.'
  }
  if (!Number.isFinite(vcMetriPerMinuto) || vcMetriPerMinuto <= 0) {
    return 'Inserisci una velocità di taglio (Vc) valida (maggiore di zero).'
  }
  if (!Number.isInteger(condizioniTaglio) || condizioniTaglio < 1 || condizioniTaglio > 10) {
    return 'Le condizioni di taglio devono essere un valore intero tra 1 e 10.'
  }
  return null
}

/**
 * Formatta un tempo espresso in minuti come stringa leggibile "Xh Ym"
 * (oppure solo minuti se sotto l'ora).
 */
export function formattaMinuti(minuti: number): string {
  if (!Number.isFinite(minuti) || minuti < 0) return '—'

  const minutiInteri = Math.round(minuti)
  const ore = Math.floor(minutiInteri / 60)
  const minutiResto = minutiInteri % 60

  if (ore === 0) return `${minutiInteri} min`
  return `${ore} h ${minutiResto} min`
}
