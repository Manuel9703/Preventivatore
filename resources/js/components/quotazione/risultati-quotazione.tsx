export interface RisultatoQuotazione {
    massa_grezzo_g: number;
    volume_asportato_cm3: number;
    tempo_sgrossatura_min: number;
    tempo_finitura_min: number;
    tempo_totale_min: number;
}

interface RisultatiQuotazioneProps {
    risultato: RisultatoQuotazione | null;
}

function formattaMinuti(minuti: number): string {
    if (!Number.isFinite(minuti) || minuti < 0) return '—';

    const minutiInteri = Math.round(minuti);
    const ore = Math.floor(minutiInteri / 60);
    const minutiResto = minutiInteri % 60;

    if (ore === 0) return `${minutiInteri} min`;
    return `${ore} h ${minutiResto} min`;
}

export function RisultatiQuotazione({ risultato }: RisultatiQuotazioneProps) {
    return (
        <div className="risultati mt-8 text-left">
            <h2 className="mb-3 text-xl font-bold">Risultato stima</h2>

            {risultato ? (
                <dl className="mb-4 flex flex-col gap-2">
                    <Riga label="Volume asportato" valore={`${risultato.volume_asportato_cm3.toFixed(2)} cm³`} />
                    <Riga label="Tempo sgrossatura stimato" valore={formattaMinuti(risultato.tempo_sgrossatura_min)} />
                    <Riga label="Tempo finitura stimato" valore={formattaMinuti(risultato.tempo_finitura_min)} />
                    <Riga label="Tempo totale stimato" valore={formattaMinuti(risultato.tempo_totale_min)} forte />
                </dl>
            ) : (
                <p className="text-sm text-neutral-500">Compila il form e premi &quot;Calcola stima&quot; per vedere il risultato.</p>
            )}

            <p className="mt-2 border-t border-dashed border-neutral-300 pt-3 text-xs text-neutral-500 dark:border-neutral-700">
                Stima per eccesso della sola lavorazione. Non include setup, cambi utensile, piazzamenti, tempi morti.
            </p>
        </div>
    );
}

function Riga({ label, valore, forte }: { label: string; valore: string; forte?: boolean }) {
    return (
        <div className={`flex justify-between gap-3 border-b border-neutral-200 py-2 dark:border-neutral-800 ${forte ? 'text-lg' : ''}`}>
            <dt className="text-neutral-600 dark:text-neutral-400">{label}</dt>
            <dd className="font-semibold">{valore}</dd>
        </div>
    );
}
