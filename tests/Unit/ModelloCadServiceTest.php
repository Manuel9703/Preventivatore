<?php

namespace Tests\Unit;

use App\Services\ModelloCadService;
use Tests\TestCase;

class ModelloCadServiceTest extends TestCase
{
    private ModelloCadService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ModelloCadService;
    }

    public function test_analizza_un_file_step_e_calcola_volume_e_ingombro()
    {
        $analisi = $this->service->analizza(base_path('tests/Fixtures/cubo-10x10x10.stp'), 'step');

        $this->assertEqualsWithDelta(1.0, $analisi['volume_cm3'], 0.001);
        $this->assertEqualsWithDelta(10.0, $analisi['bounding_box_mm'][0], 0.01);
        $this->assertEqualsWithDelta(10.0, $analisi['bounding_box_mm'][1], 0.01);
        $this->assertEqualsWithDelta(10.0, $analisi['bounding_box_mm'][2], 0.01);
    }

    public function test_analizza_un_file_iges_e_calcola_volume_e_ingombro()
    {
        $analisi = $this->service->analizza(base_path('tests/Fixtures/cubo-10x10x10.igs'), 'iges');

        $this->assertEqualsWithDelta(1.0, $analisi['volume_cm3'], 0.001);
    }

    public function test_calcola_la_massa_del_pezzo_finito_dal_volume_analizzato()
    {
        $analisi = $this->service->analizza(base_path('tests/Fixtures/cubo-10x10x10.stp'), 'step');

        $massa = $this->service->massaFinitoG($analisi, densita: 7.85);

        $this->assertEqualsWithDelta(7.85, $massa, 0.01);
    }

    public function test_lancia_eccezione_per_un_file_inesistente()
    {
        $this->expectException(\RuntimeException::class);

        $this->service->analizza('/percorso/non/esistente.stp', 'step');
    }
}
