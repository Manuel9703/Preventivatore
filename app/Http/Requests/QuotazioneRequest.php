<?php

namespace App\Http\Requests;

use App\Services\QuotazioneService;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuotazioneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $idMateriali = array_column(config('materiali.lista'), 'id');

        return [
            'materiale_id' => ['required', 'string', Rule::in($idMateriali)],
            'forma_grezzo' => ['required', 'string', 'in:parallelepipedo,cilindro'],
            'lunghezza_mm' => ['required', 'numeric', 'gt:0'],
            'larghezza_mm' => ['nullable', 'required_if:forma_grezzo,parallelepipedo', 'numeric', 'gt:0'],
            'altezza_mm' => ['nullable', 'required_if:forma_grezzo,parallelepipedo', 'numeric', 'gt:0'],
            'diametro_mm' => ['nullable', 'required_if:forma_grezzo,cilindro', 'numeric', 'gt:0'],
            'massa_finito_g' => ['required', 'numeric', 'gt:0'],
            'vc_metri_per_minuto' => ['required', 'numeric', 'gt:0'],
            'condizioni_taglio' => ['required', 'integer', 'between:1,10'],
            'livello_finitura' => ['required', 'string', 'in:basso,medio,alto'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            '*.required' => 'Questo campo è obbligatorio.',
            '*.gt' => 'Il valore deve essere maggiore di zero.',
        ];
    }

    public function withValidator(ValidatorContract $validator): void
    {
        $validator->after(function (ValidatorContract $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $service = app(QuotazioneService::class);
            $materiale = $service->trovaMateriale($this->string('materiale_id')->value());

            if (! $materiale) {
                return;
            }

            $massaGrezzoG = $service->massaGrezzoG(
                $this->string('forma_grezzo')->value(),
                $this->dimensioni(),
                $materiale['densita'],
            );

            if ($this->float('massa_finito_g') >= $massaGrezzoG) {
                $validator->errors()->add(
                    'massa_finito_g',
                    'La massa del pezzo finito deve essere inferiore alla massa del grezzo calcolata dalle misure.',
                );
            }
        });
    }

    /** Dimensioni del grezzo estratte dalla request, nel formato atteso da QuotazioneService. */
    public function dimensioni(): array
    {
        return [
            'lunghezza_mm' => (float) $this->input('lunghezza_mm'),
            'larghezza_mm' => (float) $this->input('larghezza_mm'),
            'altezza_mm' => (float) $this->input('altezza_mm'),
            'diametro_mm' => (float) $this->input('diametro_mm'),
        ];
    }
}
