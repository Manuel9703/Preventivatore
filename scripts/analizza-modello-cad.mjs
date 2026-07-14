#!/usr/bin/env node
// Analizza un file STEP o IGES e ne calcola l'ingombro (bounding box) e il
// volume del solido, in millimetri/millimetri cubi. Pensato per essere
// invocato come sottoprocesso da Laravel (vedi app/Services/ModelloCadService.php).
//
// Uso: node analizza-modello-cad.mjs <percorso-file> <step|iges>
//
// Stampa su stdout un JSON:
//   { "success": true, "volumeMm3": ..., "boundingBoxMm": [x, y, z], "numeroMesh": n }
// oppure { "success": false, "errore": "..." }
//
// Il volume è calcolato dalla mesh triangolata restituita da OpenCascade
// (via occt-import-js) con il teorema della divergenza (somma dei volumi
// con segno dei tetraedri formati da ogni triangolo e dall'origine). È
// un'approssimazione legata alla finezza della triangolazione, non il
// valore analitico esatto, ma sufficientemente precisa per una stima.

import fs from 'node:fs';
import occtimportjs from 'occt-import-js';

function calcolaBoundingBoxEVolume(meshes) {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    let volume = 0;

    for (const mesh of meshes) {
        const pos = mesh.attributes.position.array;
        const idx = mesh.index.array;

        for (let i = 0; i < pos.length; i += 3) {
            for (let k = 0; k < 3; k++) {
                min[k] = Math.min(min[k], pos[i + k]);
                max[k] = Math.max(max[k], pos[i + k]);
            }
        }

        for (let i = 0; i < idx.length; i += 3) {
            const ia = idx[i] * 3;
            const ib = idx[i + 1] * 3;
            const ic = idx[i + 2] * 3;
            const v0 = [pos[ia], pos[ia + 1], pos[ia + 2]];
            const v1 = [pos[ib], pos[ib + 1], pos[ib + 2]];
            const v2 = [pos[ic], pos[ic + 1], pos[ic + 2]];
            const cross = [
                v1[1] * v2[2] - v1[2] * v2[1],
                v1[2] * v2[0] - v1[0] * v2[2],
                v1[0] * v2[1] - v1[1] * v2[0],
            ];
            volume += (v0[0] * cross[0] + v0[1] * cross[1] + v0[2] * cross[2]) / 6;
        }
    }

    return {
        boundingBoxMm: [max[0] - min[0], max[1] - min[1], max[2] - min[2]],
        volumeMm3: Math.abs(volume),
    };
}

async function main() {
    const [, , filePath, formato] = process.argv;

    if (!filePath || !formato) {
        console.log(JSON.stringify({ success: false, errore: 'Parametri mancanti: percorso file e formato (step|iges).' }));
        process.exit(1);
    }

    try {
        const content = fs.readFileSync(filePath);
        const occt = await occtimportjs();

        const reader = formato === 'iges' ? occt.ReadIgesFile : occt.ReadStepFile;
        const result = reader(new Uint8Array(content), { linearUnit: 'millimeter' });

        if (!result.success || result.meshes.length === 0) {
            console.log(JSON.stringify({ success: false, errore: 'Il file non contiene geometria leggibile (nessuna mesh generata).' }));
            return;
        }

        const { boundingBoxMm, volumeMm3 } = calcolaBoundingBoxEVolume(result.meshes);

        console.log(JSON.stringify({
            success: true,
            volumeMm3,
            boundingBoxMm,
            numeroMesh: result.meshes.length,
        }));
    } catch (error) {
        console.log(JSON.stringify({ success: false, errore: `Errore durante la lettura del file: ${error.message}` }));
        process.exit(1);
    }
}

main();
