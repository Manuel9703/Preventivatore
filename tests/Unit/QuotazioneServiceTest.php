<?php

namespace Tests\Unit;

use App\Services\QuotazioneService;
use Tests\TestCase;

class QuotazioneServiceTest extends TestCase
{
    private QuotazioneService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new QuotazioneService;
    }

    public function test_calcola_il_volume_di_un_parallelepipedo_in_cm3()
    {
        $volume = $this->service->volumeGrezzoCm3('parallelepipedo', [
            'lunghezza_mm' => 150,
            'larghezza_mm' => 80,
            'altezza_mm' => 40,
        ]);

        $this->assertSame(480.0, $volume);
    }

    public function test_calcola_il_volume_di_un_cilindro_in_cm3()
    {
        $volume = $this->service->volumeGrezzoCm3('cilindro', [
            'diametro_mm' => 60,
            'lunghezza_mm' => 120,
        ]);

        $this->assertEqualsWithDelta(339.29, $volume, 0.01);
    }

    public function test_calcola_la_massa_del_grezzo_dal_volume_e_dalla_densita()
    {
        $massa = $this->service->massaGrezzoG('parallelepipedo', [
            'lunghezza_mm' => 150,
            'larghezza_mm' => 80,
            'altezza_mm' => 40,
        ], densita: 2.81);

        $this->assertSame(1348.8, $massa);
    }

    public function test_scala_mrr_e_vc_in_base_alle_condizioni_di_taglio()
    {
        $materiale = ['vc_consigliata' => 25, 'mrr_sgrossatura' => 2];

        $this->assertSame(1.0, $this->service->fattoreCondizioniTaglio(10));
        $this->assertSame(0.5, $this->service->fattoreCondizioniTaglio(5));
        $this->assertSame(25.0, $this->service->vcSuggerita($materiale, 10));
        $this->assertSame(12.5, $this->service->vcSuggerita($materiale, 5));
    }

    public function test_calcola_la_quotazione_completa_coerentemente_con_le_formule_dell_mvp()
    {
        // Stesso scenario verificato manualmente sulla versione React:
        // Inconel 718, blocco 100x50x20mm, massa finito 50g, condizioni 5/10, finitura media.
        $materiale = [
            'densita' => 8.19,
            'mrr_sgrossatura' => 2,
            'vc_consigliata' => 25,
        ];

        config(['materiali.fattori_finitura' => ['medio' => 0.6]]);

        $risultato = $this->service->calcola(
            materiale: $materiale,
            formaGrezzo: 'parallelepipedo',
            dimensioni: ['lunghezza_mm' => 100, 'larghezza_mm' => 50, 'altezza_mm' => 20],
            massaFinitoG: 50,
            condizioniTaglio: 5,
            livelloFinitura: 'medio',
        );

        $this->assertSame(819.0, $risultato['massa_grezzo_g']);
        $this->assertEqualsWithDelta(93.895, $risultato['volume_asportato_cm3'], 0.001);
        $this->assertEqualsWithDelta(93.895, $risultato['tempo_sgrossatura_min'], 0.001);
        $this->assertEqualsWithDelta(56.337, $risultato['tempo_finitura_min'], 0.001);
        $this->assertEqualsWithDelta(150.232, $risultato['tempo_totale_min'], 0.001);
    }

    public function test_trova_un_materiale_esistente_per_id_e_restituisce_null_per_id_sconosciuto()
    {
        $materiale = $this->service->trovaMateriale('al7075');
        $this->assertNotNull($materiale);
        $this->assertSame('Alluminio 7075', $materiale['nome']);

        $this->assertNull($this->service->trovaMateriale('non-esiste'));
    }
}
