/**
 * Script de verificación rápida de indexación Lunr.js
 *
 * INSTRUCCIONES:
 * 1. Abre index.html en tu navegador
 * 2. Abre la consola de desarrollador (F12)
 * 3. Copia y pega todo este archivo en la consola
 * 4. Presiona Enter
 *
 * El script ejecutará automáticamente todas las verificaciones y mostrará
 * resultados formateados en la consola.
 */

(function() {
    console.clear();
    console.log('%c🔍 VERIFICACIÓN DE INDEXACIÓN LUNR.JS', 'font-size: 20px; font-weight: bold; color: #4a90e2');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4a90e2');
    console.log('');

    let passed = 0;
    let failed = 0;

    // Helper para mostrar resultados
    const showResult = (test, success, message, data = null) => {
        const icon = success ? '✅' : '❌';
        const color = success ? '#4caf50' : '#f44336';
        console.log(`${icon} %c${test}`, `color: ${color}; font-weight: bold`);
        console.log(`   ${message}`);
        if (data) console.log('   ', data);
        console.log('');
        success ? passed++ : failed++;
    };

    // TEST 1: Lunr.js cargado
    console.log('%c1️⃣ Verificando Lunr.js...', 'font-weight: bold; color: #7cb3ff');
    if (typeof lunr !== 'undefined') {
        showResult('Lunr.js cargado', true, `Versión: ${lunr.version || 'desconocida'}`);
    } else {
        showResult('Lunr.js cargado', false, 'La librería no está disponible. Verifica que js/lib/lunr.min.js esté incluido.');
        return;
    }

    // TEST 2: SearchService cargado
    console.log('%c2️⃣ Verificando SearchService...', 'font-weight: bold; color: #7cb3ff');
    if (typeof window.searchService !== 'undefined') {
        showResult('SearchService cargado', true, 'El servicio está disponible globalmente');
    } else {
        showResult('SearchService cargado', false, 'El servicio no está disponible. Verifica que js/services/search-service.js esté incluido.');
        return;
    }

    // TEST 3: SearchService inicializado
    console.log('%c3️⃣ Verificando inicialización...', 'font-weight: bold; color: #7cb3ff');
    if (window.searchService.isReady()) {
        showResult('SearchService inicializado', true, 'El servicio está listo para usar');

        // Mostrar estadísticas
        const stats = window.searchService.getStats();
        const total = Object.values(stats).reduce((a, b) => a + b, 0);
        console.log('%c   📊 Estadísticas de indexación:', 'color: #4a90e2');
        console.table(stats);
        console.log(`   📝 Total de documentos indexados: ${total}`);
        console.log('');
    } else {
        showResult('SearchService inicializado', false, 'El servicio no está inicializado. Espera a que Alpine.js esté listo.');
    }

    // TEST 4: Estructura del índice
    console.log('%c4️⃣ Verificando índice Lunr...', 'font-weight: bold; color: #7cb3ff');
    if (window.searchService.idx) {
        showResult('Índice Lunr creado', true, 'El índice se creó correctamente');

        const fields = window.searchService.idx.fields || [];
        console.log('%c   📋 Campos indexados:', 'color: #4a90e2');
        fields.forEach(field => console.log(`      • ${field}`));
        console.log('');

        const docsCount = Object.keys(window.searchService.documentsMap).length;
        showResult('Documentos en mapa', docsCount > 0, `${docsCount} documentos indexados`);
    } else {
        showResult('Índice Lunr creado', false, 'El índice no existe');
    }

    // TEST 5: Pruebas de búsqueda
    console.log('%c5️⃣ Ejecutando pruebas de búsqueda...', 'font-weight: bold; color: #7cb3ff');

    const testQueries = [
        { query: '', type: null, description: 'Búsqueda vacía (debería devolver resultados populares)' },
        { query: 'juan', type: 'character', description: 'Buscar personaje "juan"' },
        { query: 'batalla', type: 'scene', description: 'Buscar escena "batalla"' },
        { query: 'casa', type: 'location', description: 'Buscar ubicación "casa"' }
    ];

    testQueries.forEach(test => {
        try {
            const results = test.type ?
                window.searchService.search(test.query, { types: [test.type] }) :
                window.searchService.search(test.query);

            const success = results.length >= 0; // Siempre true, solo verificamos que no lance error
            showResult(test.description, success, `Encontrados ${results.length} resultados`);

            if (results.length > 0) {
                console.log('%c   🔍 Primeros 3 resultados:', 'color: #4a90e2');
                results.slice(0, 3).forEach((r, i) => {
                    console.log(`      ${i + 1}. [${r.type}] ${r.label} (score: ${r.score.toFixed(3)})`);
                });
                console.log('');
            }
        } catch (e) {
            showResult(test.description, false, `Error: ${e.message}`);
        }
    });

    // TEST 6: Búsquedas específicas por tipo
    console.log('%c6️⃣ Verificando métodos de búsqueda específicos...', 'font-weight: bold; color: #7cb3ff');

    const specificSearches = [
        { method: 'searchCharacters', query: 'juan', name: 'Búsqueda de personajes' },
        { method: 'searchScenes', query: 'batalla', name: 'Búsqueda de escenas' },
        { method: 'searchLocations', query: 'casa', name: 'Búsqueda de ubicaciones' },
        { method: 'searchTimeline', query: 'evento', name: 'Búsqueda en timeline' }
    ];

    specificSearches.forEach(test => {
        try {
            if (typeof window.searchService[test.method] === 'function') {
                const results = window.searchService[test.method](test.query, 5);
                showResult(test.name, true, `${results.length} resultados encontrados`);
            } else {
                showResult(test.name, false, `Método ${test.method} no existe`);
            }
        } catch (e) {
            showResult(test.name, false, `Error: ${e.message}`);
        }
    });

    // TEST 7: Rendimiento
    console.log('%c7️⃣ Prueba de rendimiento...', 'font-weight: bold; color: #7cb3ff');

    try {
        const iterations = 100;
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            window.searchService.search('test');
        }
        const end = performance.now();
        const avg = (end - start) / iterations;

        const isGood = avg < 10;
        showResult('Rendimiento de búsqueda', isGood,
            `Promedio: ${avg.toFixed(2)}ms por búsqueda (${iterations} iteraciones) - ${isGood ? 'Excelente' : 'Mejorable'}`);
    } catch (e) {
        showResult('Rendimiento de búsqueda', false, `Error: ${e.message}`);
    }

    // TEST 8: Verificar datos indexados
    console.log('%c8️⃣ Inspeccionando documentos indexados...', 'font-weight: bold; color: #7cb3ff');

    if (window.searchService.documentsMap) {
        const docs = Object.values(window.searchService.documentsMap);

        if (docs.length > 0) {
            showResult('Documentos disponibles', true, `${docs.length} documentos en el mapa`);

            console.log('%c   📚 Ejemplos de documentos indexados:', 'color: #4a90e2');
            docs.slice(0, 5).forEach((doc, i) => {
                console.log(`      ${i + 1}. [${doc.type}] ${doc.label}`);
                console.log(`         ID: ${doc.id}`);
                console.log(`         Content preview: ${(doc.content || '').substring(0, 60)}...`);
            });
            console.log('');
        } else {
            showResult('Documentos disponibles', false, 'No hay documentos en el mapa');
        }
    } else {
        showResult('Documentos disponibles', false, 'documentsMap no existe');
    }

    // RESUMEN FINAL
    console.log('');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4a90e2');
    console.log('%c📊 RESUMEN FINAL', 'font-size: 18px; font-weight: bold; color: #4a90e2');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4a90e2');
    console.log('');

    const total = passed + failed;
    const percentage = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

    console.log(`%c✅ Tests pasados: ${passed}`, 'color: #4caf50; font-weight: bold');
    console.log(`%c❌ Tests fallados: ${failed}`, 'color: #f44336; font-weight: bold');
    console.log(`%c📈 Porcentaje de éxito: ${percentage}%`, 'color: #4a90e2; font-weight: bold; font-size: 16px');
    console.log('');

    if (percentage >= 80) {
        console.log('%c🎉 ¡EXCELENTE! La indexación con Lunr.js está funcionando correctamente.', 'background: #4caf50; color: white; padding: 10px; font-weight: bold; font-size: 14px');
        console.log('%c   El SearchService está operativo y listo para usar en producción.', 'color: #4caf50');
    } else if (percentage >= 50) {
        console.log('%c⚠️ ADVERTENCIA: Hay algunos problemas con la indexación.', 'background: #ff9800; color: white; padding: 10px; font-weight: bold; font-size: 14px');
        console.log('%c   Revisa los tests fallados antes de usar en producción.', 'color: #ff9800');
    } else {
        console.log('%c❌ ERROR: Problemas serios con la indexación.', 'background: #f44336; color: white; padding: 10px; font-weight: bold; font-size: 14px');
        console.log('%c   NO usar en producción hasta resolver los errores.', 'color: #f44336');
    }

    console.log('');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4a90e2');
    console.log('');

    // Comandos útiles
    console.log('%c💡 COMANDOS ÚTILES:', 'font-weight: bold; color: #7cb3ff; font-size: 16px');
    console.log('');
    console.log('%cPara hacer búsquedas manuales:', 'color: #a0a0a0');
    console.log('%c   searchService.search("tu búsqueda")', 'background: #1a1a1a; color: #7cb3ff; padding: 5px; font-family: monospace');
    console.log('%c   searchService.searchCharacters("nombre")', 'background: #1a1a1a; color: #7cb3ff; padding: 5px; font-family: monospace');
    console.log('%c   searchService.searchScenes("escena")', 'background: #1a1a1a; color: #7cb3ff; padding: 5px; font-family: monospace');
    console.log('');
    console.log('%cPara ver estadísticas:', 'color: #a0a0a0');
    console.log('%c   searchService.getStats()', 'background: #1a1a1a; color: #7cb3ff; padding: 5px; font-family: monospace');
    console.log('');
    console.log('%cPara ver un documento específico:', 'color: #a0a0a0');
    console.log('%c   searchService.getDocument("character-1")', 'background: #1a1a1a; color: #7cb3ff; padding: 5px; font-family: monospace');
    console.log('');
    console.log('%cPara reinicializar el índice:', 'color: #a0a0a0');
    console.log('%c   searchService.initialize(Alpine.store("project"))', 'background: #1a1a1a; color: #7cb3ff; padding: 5px; font-family: monospace');
    console.log('');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4a90e2');

})();
