import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState, type FormEvent } from 'react';
import { QuotazioneForm, type Materiale, type QuotazioneFormData, type StatoAnalisiCad } from '@/components/quotazione/quotazione-form';
import { RisultatiQuotazione, type RisultatoQuotazione } from '@/components/quotazione/risultati-quotazione';

/** Legge il valore di un cookie dal browser (usato per il token CSRF). */
function leggiCookie(nome: string): string | null {
    const match = document.cookie.match(new RegExp(`(?:^|; )${nome}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}

/** Arrotonda un numero calcolato prima di scriverlo in un campo, per evitare artefatti di precisione float (es. 2.8099999999999996). */
function arrotonda(valore: number, decimali = 2): string {
    return valore.toFixed(decimali);
}

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
    const [analisiCad, setAnalisiCad] = useState<StatoAnalisiCad>({ stato: 'idle' });

    // Se è già stato analizzato un modello 3D e l'utente cambia materiale,
    // ricalcola la massa del pezzo finito con la nuova densità, senza dover
    // ricaricare il file.
    useEffect(() => {
        if (analisiCad.stato !== 'ok' || analisiCad.volumeCm3 === undefined) return;

        const materiale = materiali.find((m) => m.id === form.data.materiale_id);
        if (!materiale) return;

        form.setData('massa_finito_g', arrotonda(analisiCad.volumeCm3 * materiale.densita));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data.materiale_id]);

    async function handleModelloChange(file: File | null) {
        if (!file) {
            setAnalisiCad({ stato: 'idle' });
            return;
        }

        setAnalisiCad({ stato: 'caricamento', nomeFile: file.name });

        const formData = new FormData();
        formData.append('materiale_id', form.data.materiale_id);
        formData.append('modello', file);

        try {
            const xsrfToken = leggiCookie('XSRF-TOKEN');
            const response = await fetch('/preventivo/analizza-modello', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
                },
                body: formData,
            });
            const json = await response.json();

            if (!response.ok || !json.success) {
                // I 422 di validazione di Laravel (es. estensione non ammessa) hanno una
                // forma diversa da quella restituita dal controller ({errors: {campo: [...]}}).
                const erroreValidazione = json.errors ? Object.values(json.errors).flat()[0] : undefined;
                setAnalisiCad({
                    stato: 'errore',
                    nomeFile: file.name,
                    errore: json.errore ?? (erroreValidazione as string | undefined) ?? "Errore durante l'analisi del file.",
                });
                return;
            }

            setAnalisiCad({
                stato: 'ok',
                nomeFile: file.name,
                volumeCm3: json.volume_cm3,
                boundingBoxMm: json.bounding_box_mm,
            });
            form.setData('massa_finito_g', arrotonda(json.massa_finito_g));
        } catch {
            setAnalisiCad({ stato: 'errore', nomeFile: file.name, errore: 'Errore di rete durante il caricamento del file.' });
        }
    }

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
                    analisiCad={analisiCad}
                    onModelloChange={handleModelloChange}
                    onSubmit={handleSubmit}
                />

                <RisultatiQuotazione risultato={risultato ?? null} />
            </div>
        </>
    );
}
