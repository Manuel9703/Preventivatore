<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class QuotazioneTest extends TestCase
{
    public function test_mostra_la_home_come_pagina_blade_con_titolo_e_link_al_preventivatore()
    {
        $response = $this->get('/');

        $response->assertOk()
            ->assertSee('Preventivatore CNC')
            ->assertSee(route('quotazione.index'), false);
    }

    public function test_mostra_la_pagina_del_preventivatore_con_i_materiali_raggruppati()
    {
        $response = $this->get('/preventivo');

        $response->assertOk()
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('quotazione/index')
                    ->has('materiali')
                    ->has('gruppi')
                    ->where('risultato', null)
            );
    }

    public function test_calcola_la_quotazione_e_la_restituisce_come_prop_inertia()
    {
        $response = $this->post('/preventivo', [
            'materiale_id' => 'al7075',
            'forma_grezzo' => 'parallelepipedo',
            'lunghezza_mm' => 150,
            'larghezza_mm' => 80,
            'altezza_mm' => 40,
            'massa_finito_g' => 850,
            'condizioni_taglio' => 10,
            'vc_metri_per_minuto' => 300,
            'livello_finitura' => 'medio',
        ]);

        $response->assertOk()
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('quotazione/index')
                    ->where('risultato.massa_grezzo_g', 1348.8)
            );
    }

    public function test_rifiuta_una_massa_finito_maggiore_o_uguale_alla_massa_del_grezzo_calcolata()
    {
        $response = $this->post('/preventivo', [
            'materiale_id' => 'al7075',
            'forma_grezzo' => 'parallelepipedo',
            'lunghezza_mm' => 150,
            'larghezza_mm' => 80,
            'altezza_mm' => 40,
            'massa_finito_g' => 2000,
            'condizioni_taglio' => 10,
            'vc_metri_per_minuto' => 300,
            'livello_finitura' => 'medio',
        ]);

        $response->assertSessionHasErrors('massa_finito_g');
    }

    public function test_restituisce_la_massa_grezzo_live_per_anteprima()
    {
        $response = $this->get('/preventivo/massa-grezzo?'.http_build_query([
            'materiale_id' => 'al7075',
            'forma_grezzo' => 'cilindro',
            'diametro_mm' => 60,
            'lunghezza_mm' => 120,
        ]));

        $response->assertOk();
        $massa = $response->json('massa_grezzo_g');
        $this->assertEqualsWithDelta(953.4, $massa, 0.1);
    }
}
