# Preventivatore CNC

Stima di massima dei tempi di lavorazione CNC (sgrossatura + finitura) a partire da materiale, misure del grezzo e condizioni di taglio.

Stack: Laravel 13 + Inertia.js + React, calcolo lato server.

## Setup locale

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
```

## Sviluppo

```bash
composer run dev
```

Avvia insieme `php artisan serve`, `npm run dev` (Vite) e la coda dei job.

## Test

```bash
php artisan test
```

## Struttura

- `app/Services/QuotazioneService.php` — logica di calcolo (volume, massa, tempi)
- `config/materiali.php` — tabella materiali (gruppi ISO 513) e fattori di finitura
- `app/Http/Controllers/QuotazioneController.php` — route del preventivatore
- `resources/js/pages/quotazione/index.tsx` — pagina React/Inertia del form
- `resources/views/home.blade.php` — landing page SEO (non Inertia)
