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

    public function test_lancia_un_errore_chiarito_quando_il_parser_node_va_in_timeout()
    {
        $scriptPath = tempnam(sys_get_temp_dir(), 'cad-script');
        $scriptPath = $scriptPath . '.mjs';
        file_put_contents($scriptPath, "await new Promise((resolve) => setTimeout(resolve, 2000));\nconsole.log(JSON.stringify({ success: true }));\n");
        putenv("CAD_ANALYSIS_SCRIPT_PATH={$scriptPath}");
        putenv('CAD_ANALYSIS_TIMEOUT_SECONDS=1');

        $percorsoFile = tempnam(sys_get_temp_dir(), 'modello-cad') . '.stp';
        file_put_contents($percorsoFile, 'contenuto non valido');

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Timeout durante l\'analisi del file');

        $this->service->analizza($percorsoFile, 'step');

        @unlink($scriptPath);
        @unlink($percorsoFile);
    }

    public function test_lancia_eccezione_per_un_file_inesistente()
    {
        $this->expectException(\RuntimeException::class);

        $this->service->analizza('/percorso/non/esistente.stp', 'step');
    }
}
