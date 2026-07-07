// Logica di calcolo della quotazione di massima per una lavorazione CNC.
//
// Fase 1 (MVP): stima molto semplificata basata solo su volume di materiale
// asportato e MRR (Material Removal Rate) medio per materiale. Non tiene
// conto di setup, cambi utensile, piazzamenti, tempi morti: vedi disclaimer
// mostrato in UI.

import { fattoriFinitura, type LivelloFinitura, type Materiale } from '../data/materiali'

export interface InputQuotazione {
  materiale: Materiale
  /** Massa del grezzo di partenza, in grammi */
  massaGrezzoG: number
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
 * - Tempo sgrossatura = Volume asportato / MRR sgrossatura (per materiale)
 * - Tempo finitura = Tempo sgrossatura * fattore_livello_finitura
 * - Tempo totale = Tempo sgrossatura + Tempo finitura
 */
export function calcolaQuotazione(input: InputQuotazione): RisultatoQuotazione {
  const { materiale, massaGrezzoG, massaFinitoG, livelloFinitura } = input

  const massaAsportataG = massaGrezzoG - massaFinitoG
  const volumeAsportatoCm3 = massaAsportataG / materiale.densita

  const tempoSgrossaturaMin = volumeAsportatoCm3 / materiale.mrrSgrossatura

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
  massaGrezzoG: number
  massaFinitoG: number
  vcMetriPerMinuto: number
}): string | null {
  const { massaGrezzoG, massaFinitoG, vcMetriPerMinuto } = input

  if (!Number.isFinite(massaGrezzoG) || massaGrezzoG <= 0) {
    return 'Inserisci una massa del grezzo valida (maggiore di zero).'
  }
  if (!Number.isFinite(massaFinitoG) || massaFinitoG <= 0) {
    return 'Inserisci una massa del pezzo finito valida (maggiore di zero).'
  }
  if (massaFinitoG >= massaGrezzoG) {
    return 'La massa del pezzo finito deve essere inferiore alla massa del grezzo.'
  }
  if (!Number.isFinite(vcMetriPerMinuto) || vcMetriPerMinuto <= 0) {
    return 'Inserisci una velocità di taglio (Vc) valida (maggiore di zero).'
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
