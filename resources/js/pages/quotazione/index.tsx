import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState, type FormEvent } from 'react';
import { QuotazioneForm, type Materiale, type QuotazioneFormData } from '@/components/quotazione/quotazione-form';
import { RisultatiQuotazione, type RisultatoQuotazione } from '@/components/quotazione/risultati-quotazione';

interface QuotazioneIndexProps {
    materiali: Materiale[];
    gruppi: Record<string, string>;
    risultato?: RisultatoQuotazione | null;
}

export default function QuotazioneIndex({ materiali, gruppi, risultato }: QuotazioneIndexProps) {
    const materialeIniziale = materiali[0];

    const form = useForm<QuotazioneFormData>({
        materiale_id: materialeIniziale.id,
        forma_grezzo: 'parallelepipedo',
        lunghezza_mm: '',
        larghezza_mm: '',
        altezza_mm: '',
        diametro_mm: '',
        massa_finito_g: '',
        condizioni_taglio: 10,
        vc_metri_per_minuto: String(materialeIniziale.vc_consigliata),
        livello_finitura: 'medio',
    });

    const [massaGrezzoG, setMassaGrezzoG] = useState<number | null>(null);

    // Anteprima "live" della massa del grezzo: chiede al server il valore
    // calcolato ogni volta che cambiano materiale/forma/misure, con un
    // piccolo debounce per non saturare il backend a ogni tasto premuto.
    useEffect(() => {
        const params = new URLSearchParams({
            materiale_id: form.data.materiale_id,
            forma_grezzo: form.data.forma_grezzo,
            lunghezza_mm: form.data.lunghezza_mm,
            larghezza_mm: form.data.larghezza_mm,
            altezza_mm: form.data.altezza_mm,
            diametro_mm: form.data.diametro_mm,
        });

        const timeout = setTimeout(() => {
            fetch(`/preventivo/massa-grezzo?${params.toString()}`)
                .then((res) => res.json())
                .then((json) => setMassaGrezzoG(json.massa_grezzo_g))
                .catch(() => setMassaGrezzoG(null));
        }, 250);

        return () => clearTimeout(timeout);
    }, [
        form.data.materiale_id,
        form.data.forma_grezzo,
        form.data.lunghezza_mm,
        form.data.larghezza_mm,
        form.data.altezza_mm,
        form.data.diametro_mm,
    ]);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        form.post('/preventivo', { preserveScroll: true });
    }

    return (
        <>
            <Head title="Preventivatore CNC" />
            <div className="mx-auto max-w-md px-4 py-8">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold">Preventivatore CNC</h1>
                    <p className="text-sm text-neutral-500">Stima di massima dei tempi di lavorazione (Fase 1 - MVP)</p>
                </header>

                <QuotazioneForm
                    materiali={materiali}
                    gruppi={gruppi}
                    data={form.data}
                    setData={form.setData}
                    errors={form.errors}
                    processing={form.processing}
                    massaGrezzoG={massaGrezzoG}
                    onSubmit={handleSubmit}
                />

                <RisultatiQuotazione risultato={risultato ?? null} />
            </div>
        </>
    );
}
