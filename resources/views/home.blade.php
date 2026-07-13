<!doctype html>
<html lang="it">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Preventivatore CNC — Stima tempi di lavorazione online</title>
    <meta name="description" content="Calcola gratis una stima di massima dei tempi di sgrossatura e finitura per lavorazioni CNC: scegli il materiale (acciai, inox, ghise, alluminio, superleghe), inserisci le misure del grezzo e ottieni subito i tempi stimati.">
    <link rel="canonical" href="{{ url('/') }}">

    <meta property="og:type" content="website">
    <meta property="og:title" content="Preventivatore CNC — Stima tempi di lavorazione online">
    <meta property="og:description" content="Stima di massima dei tempi di sgrossatura e finitura per lavorazioni CNC, a partire da materiale, misure del grezzo e condizioni di taglio.">
    <meta property="og:url" content="{{ url('/') }}">

    <script type="application/ld+json">
    {!! json_encode([
        '@context' => 'https://schema.org',
        '@type' => 'WebApplication',
        'name' => 'Preventivatore CNC',
        'applicationCategory' => 'BusinessApplication',
        'operatingSystem' => 'Web',
        'description' => 'Stima di massima dei tempi di sgrossatura e finitura per lavorazioni CNC a partire da materiale, misure del grezzo e condizioni di taglio.',
        'offers' => ['@type' => 'Offer', 'price' => '0', 'priceCurrency' => 'EUR'],
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}
    </script>

    @vite(['resources/css/app.css'])
</head>
<body class="bg-white text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
    <div class="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <header>
            <p class="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">Fase 1 — MVP</p>
            <h1 class="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Preventivatore CNC</h1>
            <p class="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
                Stima in pochi secondi il tempo di sgrossatura e finitura di una lavorazione CNC:
                scegli il materiale, inserisci le misure del grezzo (parallelepipedo o cilindro),
                la massa del pezzo finito e le condizioni di taglio.
            </p>
        </header>

        <section class="mt-10 grid gap-4 sm:grid-cols-3">
            <div class="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
                <h2 class="font-semibold">16 materiali, gruppi ISO 513</h2>
                <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Acciai, inox, ghise, alluminio, ottone, superleghe e titanio, acciai temprati.</p>
            </div>
            <div class="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
                <h2 class="font-semibold">Massa calcolata dalle misure</h2>
                <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Basta indicare le dimensioni del grezzo: la massa si ricava da volume e densità.</p>
            </div>
            <div class="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
                <h2 class="font-semibold">Condizioni di taglio regolabili</h2>
                <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Un parametro da 1 a 10 corregge MRR e velocità di taglio in base al contesto reale.</p>
            </div>
        </section>

        <a
            href="{{ route('quotazione.index') }}"
            class="mt-10 inline-flex w-fit items-center justify-center rounded-md bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700"
        >
            Apri il preventivatore
        </a>

        <p class="mt-6 text-xs text-neutral-500 dark:text-neutral-500">
            Stima per eccesso della sola lavorazione. Non include setup, cambi utensile, piazzamenti, tempi morti.
        </p>
    </div>
</body>
</html>
