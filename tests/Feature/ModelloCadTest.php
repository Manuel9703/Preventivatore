<?php

namespace Tests\Feature;

use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ModelloCadTest extends TestCase
{
    public function test_analizza_un_modello_step_caricato_e_restituisce_la_massa_del_pezzo_finito()
    {
        $file = new UploadedFile(
            base_path('tests/Fixtures/cubo-10x10x10.stp'),
            'cubo.stp',
            'application/octet-stream',
            null,
            true,
        );

        $response = $this->post('/preventivo/analizza-modello', [
            'materiale_id' => 'acciaio-c40',
            'modello' => $file,
        ]);

        $response->assertOk()->assertJson([
            'success' => true,
        ]);

        $this->assertEqualsWithDelta(1.0, $response->json('volume_cm3'), 0.001);
        $this->assertEqualsWithDelta(7.85, $response->json('massa_finito_g'), 0.01);
    }

    public function test_rifiuta_un_file_con_estensione_non_supportata()
    {
        $file = UploadedFile::fake()->create('modello.pdf', 100);

        $response = $this->post('/preventivo/analizza-modello', [
            'materiale_id' => 'acciaio-c40',
            'modello' => $file,
        ]);

        $response->assertSessionHasErrors('modello');
    }
}
