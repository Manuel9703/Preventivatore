<?php

namespace App\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

class AnalizzaModelloRequest extends FormRequest
{
    private const ESTENSIONI_VALIDE = ['step', 'stp', 'iges', 'igs'];

    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'materiale_id' => ['required', 'string'],
            // STEP/IGES non hanno un MIME type standard riconoscibile dal
            // sniffing del contenuto: validiamo direttamente l'estensione
            // invece di usare la regola "mimes".
            'modello' => ['required', 'file', 'max:20480', $this->regolaEstensione()], // max 20MB
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'modello.max' => 'Il file non può superare i 20MB.',
            'modello.required' => 'Carica un file STEP o IGES del pezzo finito.',
        ];
    }

    private function regolaEstensione(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) {
            if (! $value instanceof UploadedFile) {
                return;
            }

            $estensione = strtolower($value->getClientOriginalExtension());

            if (! in_array($estensione, self::ESTENSIONI_VALIDE, true)) {
                $fail('Il file deve essere in formato STEP (.step, .stp) o IGES (.iges, .igs).');
            }
        };
    }

    /** Formato del file caricato, dedotto dall'estensione: "step" oppure "iges". */
    public function formato(): string
    {
        $estensione = strtolower($this->file('modello')->getClientOriginalExtension());

        return in_array($estensione, ['iges', 'igs'], true) ? 'iges' : 'step';
    }
}
