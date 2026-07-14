import { type FormDataConvertible } from '@inertiajs/core';
import { useEffect, useRef, type FormEvent, type RefObject } from 'react';

export interface Materiale {
    id: string;
    nome: string;
    gruppo_iso: string;
    densita: number;
    vc_consigliata: number;
    mrr_sgrossatura: number;
}

export type FormaGrezzo = 'parallelepipedo' | 'cilindro';

export interface QuotazioneFormData {
    materiale_id: string;
    forma_grezzo: FormaGrezzo;
    lunghezza_mm: string;
    larghezza_mm: string;
    altezza_mm: string;
    diametro_mm: string;
    massa_finito_g: string;
    condizioni_taglio: number;
    vc_metri_per_minuto: string;
    livello_finitura: 'basso' | 'medio' | 'alto';
    [key: string]: FormDataConvertible;
}

export interface StatoAnalisiCad {
    stato: 'idle' | 'caricamento' | 'ok' | 'errore';
    nomeFile?: string;
    volumeCm3?: number;
    boundingBoxMm?: [number, number, number];
    errore?: string;
}

interface QuotazioneFormProps {
    materiali: Materiale[];
    gruppi: Record<string, string>;
    data: QuotazioneFormData;
    setData: <K extends keyof QuotazioneFormData>(key: K, value: QuotazioneFormData[K]) => void;
    errors: Partial<Record<keyof QuotazioneFormData, string>>;
    processing: boolean;
    massaGrezzoG: number | null;
    analisiCad: StatoAnalisiCad;
    onModelloChange: (file: File | null) => void;
    onManualMassEntry?: () => void;
    onSubmit: (e: FormEvent) => void;
}

export function QuotazioneForm({
    materiali,
    gruppi,
    data,
    setData,
    errors,
    processing,
    massaGrezzoG,
    analisiCad,
    onModelloChange,
    onManualMassEntry,
    onSubmit,
}: QuotazioneFormProps) {
    const materiale = materiali.find((m) => m.id === data.materiale_id) ?? materiali[0];
    const massaFinitoInputRef = useRef<HTMLInputElement>(null);

    const gruppiOrdinati = Object.keys(gruppi).filter((gruppo) => materiali.some((m) => m.gruppo_iso === gruppo));

    function handleMaterialeChange(id: string) {
        const nuovoMateriale = materiali.find((m) => m.id === id) ?? materiali[0];
        setData('materiale_id', id);
        // Precompila Vc con il default suggerito per il nuovo materiale, corretto
        // in base alle condizioni di taglio correnti.
        setData('vc_metri_per_minuto', String(nuovoMateriale.vc_consigliata * (data.condizioni_taglio / 10)));
    }

    function handleCondizioniTaglioChange(valore: number) {
        setData('condizioni_taglio', valore);
        setData('vc_metri_per_minuto', String(materiale.vc_consigliata * (valore / 10)));
    }

    useEffect(() => {
        if (analisiCad.stato === 'errore') {
            massaFinitoInputRef.current?.focus();
            massaFinitoInputRef.current?.select();
        }
    }, [analisiCad.stato]);

    return (
        <form className="quotazione-form flex flex-col gap-4" onSubmit={onSubmit}>
            <div className="campo flex flex-col gap-1 text-left">
                <label htmlFor="materiale" className="text-sm font-semibold">
                    Materiale
                </label>
                <select
                    id="materiale"
                    className="rounded-md border border-neutral-300 px-3 py-2 text-base dark:border-neutral-700 dark:bg-neutral-900"
                    value={data.materiale_id}
                    onChange={(e) => handleMaterialeChange(e.target.value)}
                >
                    {gruppiOrdinati.map((gruppo) => (
                        <optgroup key={gruppo} label={gruppi[gruppo]}>
                            {materiali
                                .filter((m) => m.gruppo_iso === gruppo)
                                .map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.nome}
                                    </option>
                                ))}
                        </optgroup>
                    ))}
                </select>
            </div>

            <div className="campo flex flex-col gap-1 text-left">
                <label htmlFor="forma-grezzo" className="text-sm font-semibold">
                    Forma grezzo
                </label>
                <select
                    id="forma-grezzo"
                    className="rounded-md border border-neutral-300 px-3 py-2 text-base dark:border-neutral-700 dark:bg-neutral-900"
                    value={data.forma_grezzo}
                    onChange={(e) => setData('forma_grezzo', e.target.value as FormaGrezzo)}
                >
                    <option value="parallelepipedo">Parallelepipedo (lastra/blocco)</option>
                    <option value="cilindro">Cilindro (tondo)</option>
                </select>
            </div>

            {data.forma_grezzo === 'parallelepipedo' ? (
                <>
                    <Campo
                        id="lunghezza"
                        label="Lunghezza (mm)"
                        placeholder="es. 150"
                        value={data.lunghezza_mm}
                        onChange={(v) => setData('lunghezza_mm', v)}
                        error={errors.lunghezza_mm}
                    />
                    <Campo
                        id="larghezza"
                        label="Larghezza (mm)"
                        placeholder="es. 80"
                        value={data.larghezza_mm}
                        onChange={(v) => setData('larghezza_mm', v)}
                        error={errors.larghezza_mm}
                    />
                    <Campo
                        id="altezza"
                        label="Altezza (mm)"
                        placeholder="es. 40"
                        value={data.altezza_mm}
                        onChange={(v) => setData('altezza_mm', v)}
                        error={errors.altezza_mm}
                    />
                </>
            ) : (
                <>
                    <Campo
                        id="diametro"
                        label="Diametro (mm)"
                        placeholder="es. 60"
                        value={data.diametro_mm}
                        onChange={(v) => setData('diametro_mm', v)}
                        error={errors.diametro_mm}
                    />
                    <Campo
                        id="lunghezza-cilindro"
                        label="Lunghezza (mm)"
                        placeholder="es. 120"
                        value={data.lunghezza_mm}
                        onChange={(v) => setData('lunghezza_mm', v)}
                        error={errors.lunghezza_mm}
                    />
                </>
            )}

            <p className="massa-calcolata rounded-md bg-purple-50 px-3 py-2 text-sm font-semibold dark:bg-purple-950/40">
                Massa grezzo calcolata: {massaGrezzoG !== null ? `${massaGrezzoG.toFixed(1)} g` : '—'}
            </p>

            <div className="campo flex flex-col gap-1 text-left">
                <label htmlFor="modello-cad" className="text-sm font-semibold">
                    Modello 3D pezzo finito (.step, .iges) — opzionale
                </label>
                <input
                    id="modello-cad"
                    type="file"
                    accept=".step,.stp,.iges,.igs"
                    onChange={(e) => onModelloChange(e.target.files?.[0] ?? null)}
                    className="rounded-md border border-neutral-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-purple-600 file:px-3 file:py-1.5 file:text-white dark:border-neutral-700 dark:bg-neutral-900"
                />
                <span className="text-xs text-neutral-500">
                    Se carichi il modello del pezzo finito, la massa sotto viene calcolata automaticamente dal volume e dal materiale
                    selezionato, al posto dell&apos;inserimento manuale.
                </span>
                {analisiCad.stato === 'caricamento' && (
                    <span className="text-xs text-purple-600">Analisi di {analisiCad.nomeFile} in corso…</span>
                )}
                {analisiCad.stato === 'ok' && analisiCad.boundingBoxMm && (
                    <span className="rounded-md bg-purple-50 px-3 py-2 text-xs font-semibold dark:bg-purple-950/40">
                        Volume rilevato: {analisiCad.volumeCm3?.toFixed(2)} cm³ (ingombro:{' '}
                        {analisiCad.boundingBoxMm.map((v) => v.toFixed(1)).join(' × ')} mm)
                    </span>
                )}
                {analisiCad.stato === 'errore' && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30">
                        <p>{analisiCad.errore}</p>
                        <p className="mt-1 font-medium">Puoi comunque inserire manualmente la massa del pezzo finito qui sotto.</p>
                        {onManualMassEntry && (
                            <button
                                type="button"
                                onClick={onManualMassEntry}
                                className="mt-2 font-semibold underline underline-offset-2"
                            >
                                Inserisci manualmente la massa
                            </button>
                        )}
                    </div>
                )}
            </div>

            <Campo
                id="massa-finito"
                label="Massa pezzo finito (g)"
                value={data.massa_finito_g}
                onChange={(v) => setData('massa_finito_g', v)}
                error={errors.massa_finito_g}
                inputRef={massaFinitoInputRef}
                placeholder={analisiCad.stato === 'errore' ? 'Inserisci manualmente la massa (g)' : 'es. 850'}
                hint={analisiCad.stato === 'ok' ? 'Calcolata dal modello 3D caricato, modificabile.' : analisiCad.stato === 'errore' ? 'Inserimento manuale attivo.' : undefined}
            />

            <div className="campo flex flex-col gap-1 text-left">
                <label htmlFor="condizioni-taglio" className="text-sm font-semibold">
                    Condizioni di taglio: {data.condizioni_taglio}/10
                </label>
                <input
                    id="condizioni-taglio"
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={data.condizioni_taglio}
                    onChange={(e) => handleCondizioniTaglioChange(Number(e.target.value))}
                    className="accent-purple-600"
                />
                <span className="text-xs text-neutral-500">
                    1 = condizioni difficili (attrezzaggio poco rigido, niente refrigerante...), 10 = condizioni ottimali. Riduce MRR e Vc
                    suggerita in proporzione.
                </span>
            </div>

            <Campo
                id="vc"
                label="Vc - velocità di taglio (m/min)"
                value={data.vc_metri_per_minuto}
                onChange={(v) => setData('vc_metri_per_minuto', v)}
                error={errors.vc_metri_per_minuto}
                hint="Valore precompilato in base a materiale e condizioni di taglio, modificabile liberamente."
            />

            <div className="campo flex flex-col gap-1 text-left">
                <label htmlFor="finitura" className="text-sm font-semibold">
                    Livello di finitura richiesta
                </label>
                <select
                    id="finitura"
                    className="rounded-md border border-neutral-300 px-3 py-2 text-base dark:border-neutral-700 dark:bg-neutral-900"
                    value={data.livello_finitura}
                    onChange={(e) => setData('livello_finitura', e.target.value as QuotazioneFormData['livello_finitura'])}
                >
                    <option value="basso">Basso</option>
                    <option value="medio">Medio</option>
                    <option value="alto">Alto</option>
                </select>
            </div>

            <button
                type="submit"
                disabled={processing}
                className="mt-2 rounded-md bg-purple-600 px-4 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60"
            >
                {processing ? 'Calcolo…' : 'Calcola stima'}
            </button>
        </form>
    );
}

interface CampoProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    hint?: string;
    inputRef?: RefObject<HTMLInputElement | null>;
}

function Campo({ id, label, value, onChange, placeholder, error, hint, inputRef }: CampoProps) {
    return (
        <div className="campo flex flex-col gap-1 text-left">
            <label htmlFor={id} className="text-sm font-semibold">
                {label}
            </label>
            <input
                id={id}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                ref={inputRef}
                className="rounded-md border border-neutral-300 px-3 py-2 text-base dark:border-neutral-700 dark:bg-neutral-900"
                required
            />
            {hint && <span className="text-xs text-neutral-500">{hint}</span>}
            {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
    );
}
