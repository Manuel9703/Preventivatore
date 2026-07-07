import { formattaMinuti, type RisultatoQuotazione } from '../lib/quotazione'

interface RisultatiQuotazioneProps {
  risultato: RisultatoQuotazione | null
}

export function RisultatiQuotazione({ risultato }: RisultatiQuotazioneProps) {
  return (
    <div className="risultati">
      <h2>Risultato stima</h2>

      {risultato ? (
        <dl className="risultati-lista">
          <div className="riga">
            <dt>Volume asportato</dt>
            <dd>{risultato.volumeAsportatoCm3.toFixed(2)} cm³</dd>
          </div>
          <div className="riga">
            <dt>Tempo sgrossatura stimato</dt>
            <dd>{formattaMinuti(risultato.tempoSgrossaturaMin)}</dd>
          </div>
          <div className="riga">
            <dt>Tempo finitura stimato</dt>
            <dd>{formattaMinuti(risultato.tempoFinituraMin)}</dd>
          </div>
          <div className="riga riga-totale">
            <dt>Tempo totale stimato</dt>
            <dd>{formattaMinuti(risultato.tempoTotaleMin)}</dd>
          </div>
        </dl>
      ) : (
        <p className="placeholder">
          Compila il form e premi "Calcola stima" per vedere il risultato.
        </p>
      )}

      <p className="disclaimer">
        Stima per eccesso della sola lavorazione. Non include setup, cambi
        utensile, piazzamenti, tempi morti.
      </p>
    </div>
  )
}
