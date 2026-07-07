import { useState } from 'react'
import { QuotazioneForm } from './components/QuotazioneForm'
import { RisultatiQuotazione } from './components/RisultatiQuotazione'
import { calcolaQuotazione, validaInput, type InputQuotazione, type RisultatoQuotazione } from './lib/quotazione'
import './App.css'

function App() {
  const [risultato, setRisultato] = useState<RisultatoQuotazione | null>(null)
  const [errore, setErrore] = useState<string | null>(null)

  function handleSubmit(input: InputQuotazione) {
    const messaggioErrore = validaInput(input)
    if (messaggioErrore) {
      setErrore(messaggioErrore)
      setRisultato(null)
      return
    }
    setErrore(null)
    setRisultato(calcolaQuotazione(input))
  }

  return (
    <div className="app">
      <header>
        <h1>Preventivatore CNC</h1>
        <p className="sottotitolo">
          Stima di massima dei tempi di lavorazione (Fase 1 - MVP)
        </p>
      </header>

      <main>
        <QuotazioneForm onSubmit={handleSubmit} />
        {errore && <p className="errore">{errore}</p>}
        <RisultatiQuotazione risultato={risultato} />
      </main>
    </div>
  )
}

export default App
