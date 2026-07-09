import { useState, type FormEvent } from 'react'
import { gruppoIsoLabel, materiali, type GruppoIso, type LivelloFinitura } from '../data/materiali'
import {
  calcolaMassaGrezzoG,
  calcolaVcSuggerita,
  type CondizioniTaglio,
  type DimensioniGrezzo,
  type InputQuotazione,
} from '../lib/quotazione'

interface QuotazioneFormProps {
  onSubmit: (input: InputQuotazione) => void
}

type FormaGrezzo = DimensioniGrezzo['forma']

// Materiali raggruppati per gruppo ISO 513, nell'ordine P/M/K/N/S/H, per la select.
const gruppiIso = Object.keys(gruppoIsoLabel) as GruppoIso[]
const materialiPerGruppo = gruppiIso.map((gruppo) => ({
  gruppo,
  materiali: materiali.filter((m) => m.gruppoIso === gruppo),
}))

export function QuotazioneForm({ onSubmit }: QuotazioneFormProps) {
  const [materialeId, setMaterialeId] = useState(materiali[0].id)
  const materiale = materiali.find((m) => m.id === materialeId) ?? materiali[0]

  const [formaGrezzo, setFormaGrezzo] = useState<FormaGrezzo>('parallelepipedo')
  const [lunghezza, setLunghezza] = useState('')
  const [larghezza, setLarghezza] = useState('')
  const [altezza, setAltezza] = useState('')
  const [diametro, setDiametro] = useState('')

  const [massaFinito, setMassaFinito] = useState('')
  const [condizioniTaglio, setCondizioniTaglio] = useState<CondizioniTaglio>(10)
  const [vc, setVc] = useState(String(calcolaVcSuggerita(materiale, 10)))
  const [livelloFinitura, setLivelloFinitura] = useState<LivelloFinitura>('medio')

  function handleMaterialeChange(id: string) {
    setMaterialeId(id)
    const nuovoMateriale = materiali.find((m) => m.id === id) ?? materiali[0]
    // Precompila Vc con il default suggerito per il nuovo materiale, corretto
    // in base alle condizioni di taglio correnti.
    setVc(String(calcolaVcSuggerita(nuovoMateriale, condizioniTaglio)))
  }

  function handleCondizioniTaglioChange(valore: CondizioniTaglio) {
    setCondizioniTaglio(valore)
    // Riallinea anche la Vc suggerita alle nuove condizioni di taglio.
    setVc(String(calcolaVcSuggerita(materiale, valore)))
  }

  const dimensioniGrezzo: DimensioniGrezzo =
    formaGrezzo === 'parallelepipedo'
      ? {
          forma: 'parallelepipedo',
          lunghezzaMm: Number(lunghezza),
          larghezzaMm: Number(larghezza),
          altezzaMm: Number(altezza),
        }
      : {
          forma: 'cilindro',
          diametroMm: Number(diametro),
          lunghezzaMm: Number(lunghezza),
        }

  // Massa del grezzo calcolata in tempo reale dalle misure, per mostrarla
  // all'utente prima ancora di premere "Calcola stima".
  const massaGrezzoCalcolataG = calcolaMassaGrezzoG(dimensioniGrezzo, materiale.densita)
  const massaGrezzoValida = Number.isFinite(massaGrezzoCalcolataG) && massaGrezzoCalcolataG > 0

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({
      materiale,
      dimensioniGrezzo,
      massaFinitoG: Number(massaFinito),
      vcMetriPerMinuto: Number(vc),
      condizioniTaglio,
      livelloFinitura,
    })
  }

  return (
    <form className="quotazione-form" onSubmit={handleSubmit}>
      <div className="campo">
        <label htmlFor="materiale">Materiale</label>
        <select
          id="materiale"
          value={materialeId}
          onChange={(e) => handleMaterialeChange(e.target.value)}
        >
          {materialiPerGruppo.map(
            ({ gruppo, materiali: materialiGruppo }) =>
              materialiGruppo.length > 0 && (
                <optgroup key={gruppo} label={gruppoIsoLabel[gruppo]}>
                  {materialiGruppo.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </optgroup>
              ),
          )}
        </select>
      </div>

      <div className="campo">
        <label htmlFor="forma-grezzo">Forma grezzo</label>
        <select
          id="forma-grezzo"
          value={formaGrezzo}
          onChange={(e) => setFormaGrezzo(e.target.value as FormaGrezzo)}
        >
          <option value="parallelepipedo">Parallelepipedo (lastra/blocco)</option>
          <option value="cilindro">Cilindro (tondo)</option>
        </select>
      </div>

      {formaGrezzo === 'parallelepipedo' ? (
        <>
          <div className="campo">
            <label htmlFor="lunghezza">Lunghezza (mm)</label>
            <input
              id="lunghezza"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="es. 150"
              value={lunghezza}
              onChange={(e) => setLunghezza(e.target.value)}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="larghezza">Larghezza (mm)</label>
            <input
              id="larghezza"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="es. 80"
              value={larghezza}
              onChange={(e) => setLarghezza(e.target.value)}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="altezza">Altezza (mm)</label>
            <input
              id="altezza"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="es. 40"
              value={altezza}
              onChange={(e) => setAltezza(e.target.value)}
              required
            />
          </div>
        </>
      ) : (
        <>
          <div className="campo">
            <label htmlFor="diametro">Diametro (mm)</label>
            <input
              id="diametro"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="es. 60"
              value={diametro}
              onChange={(e) => setDiametro(e.target.value)}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="lunghezza-cilindro">Lunghezza (mm)</label>
            <input
              id="lunghezza-cilindro"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="es. 120"
              value={lunghezza}
              onChange={(e) => setLunghezza(e.target.value)}
              required
            />
          </div>
        </>
      )}

      <p className="hint massa-calcolata">
        Massa grezzo calcolata: {massaGrezzoValida ? `${massaGrezzoCalcolataG.toFixed(1)} g` : '—'}
      </p>

      <div className="campo">
        <label htmlFor="massa-finito">Massa pezzo finito (g)</label>
        <input
          id="massa-finito"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          placeholder="es. 850"
          value={massaFinito}
          onChange={(e) => setMassaFinito(e.target.value)}
          required
        />
      </div>

      <div className="campo">
        <label htmlFor="condizioni-taglio">
          Condizioni di taglio: {condizioniTaglio}/10
        </label>
        <input
          id="condizioni-taglio"
          type="range"
          min="1"
          max="10"
          step="1"
          value={condizioniTaglio}
          onChange={(e) => handleCondizioniTaglioChange(Number(e.target.value) as CondizioniTaglio)}
        />
        <span className="hint">
          1 = condizioni difficili (attrezzaggio poco rigido, niente refrigerante...), 10 = condizioni ottimali. Riduce MRR e Vc suggerita in proporzione.
        </span>
      </div>

      <div className="campo">
        <label htmlFor="vc">Vc - velocità di taglio (m/min)</label>
        <input
          id="vc"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={vc}
          onChange={(e) => setVc(e.target.value)}
          required
        />
        <span className="hint">
          Valore precompilato in base a materiale e condizioni di taglio, modificabile liberamente.
        </span>
      </div>

      <div className="campo">
        <label htmlFor="finitura">Livello di finitura richiesta</label>
        <select
          id="finitura"
          value={livelloFinitura}
          onChange={(e) => setLivelloFinitura(e.target.value as LivelloFinitura)}
        >
          <option value="basso">Basso</option>
          <option value="medio">Medio</option>
          <option value="alto">Alto</option>
        </select>
      </div>

      <button type="submit" className="btn-calcola">
        Calcola stima
      </button>
    </form>
  )
}
