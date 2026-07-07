import { useState, type FormEvent } from 'react'
import { materiali, type LivelloFinitura } from '../data/materiali'
import type { InputQuotazione } from '../lib/quotazione'

interface QuotazioneFormProps {
  onSubmit: (input: InputQuotazione) => void
}

export function QuotazioneForm({ onSubmit }: QuotazioneFormProps) {
  const [materialeId, setMaterialeId] = useState(materiali[0].id)
  const materiale = materiali.find((m) => m.id === materialeId) ?? materiali[0]

  const [massaGrezzo, setMassaGrezzo] = useState('')
  const [massaFinito, setMassaFinito] = useState('')
  const [vc, setVc] = useState(String(materiale.vcConsigliata))
  const [livelloFinitura, setLivelloFinitura] = useState<LivelloFinitura>('medio')

  function handleMaterialeChange(id: string) {
    setMaterialeId(id)
    const nuovoMateriale = materiali.find((m) => m.id === id) ?? materiali[0]
    // Precompila Vc con il default suggerito per il nuovo materiale.
    setVc(String(nuovoMateriale.vcConsigliata))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({
      materiale,
      massaGrezzoG: Number(massaGrezzo),
      massaFinitoG: Number(massaFinito),
      vcMetriPerMinuto: Number(vc),
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
          {materiali.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="campo">
        <label htmlFor="massa-grezzo">Massa grezzo (g)</label>
        <input
          id="massa-grezzo"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          placeholder="es. 1200"
          value={massaGrezzo}
          onChange={(e) => setMassaGrezzo(e.target.value)}
          required
        />
      </div>

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
          Valore precompilato in base al materiale, modificabile liberamente.
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
