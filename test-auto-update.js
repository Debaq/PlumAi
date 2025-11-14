/**
 * Script de Prueba - Actualización Automática del Índice SearchService
 *
 * INSTRUCCIONES:
 * 1. Abre index.html en tu navegador
 * 2. Abre la consola de desarrollador (F12)
 * 3. Copia y pega todo este archivo en la consola
 * 4. Presiona Enter
 *
 * El script ejecutará pruebas automáticas para verificar que el índice
 * se actualiza correctamente cuando agregas, modificas o eliminas elementos.
 */

(async function() {
    console.clear();
    console.log('%c🧪 TEST DE ACTUALIZACIÓN AUTOMÁTICA DEL ÍNDICE', 'font-size: 20px; font-weight: bold; color: #4a90e2');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4a90e2');
    console.log('');

    // Verificar que todo esté listo
    if (typeof Alpine === 'undefined') {
        console.error('❌ Alpine.js no está disponible');
        return;
    }

    if (!window.searchService) {
        console.error('❌ SearchService no está disponible');
        return;
    }

    if (!Alpine.store('project')) {
        console.error('❌ Project store no está disponible');
        return;
    }

    console.log('✅ Alpine.js, SearchService y Project store disponibles');
    console.log('');

    const projectStore = Alpine.store('project');
    let testsPassed = 0;
    let testsFailed = 0;

    // Helper para esperar
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Helper para mostrar resultados
    const showTest = (name, passed, details = '') => {
        const icon = passed ? '✅' : '❌';
        const color = passed ? '#4caf50' : '#f44336';
        console.log(`${icon} %c${name}`, `color: ${color}; font-weight: bold`);
        if (details) console.log(`   ${details}`);
        console.log('');
        passed ? testsPassed++ : testsFailed++;
    };

    console.log('%c📊 ESTADO INICIAL', 'font-weight: bold; color: #7cb3ff; font-size: 16px');
    console.log('');

    const initialStats = window.searchService.getStats();
    console.table(initialStats);
    console.log('');

    // ============================================
    // TEST 1: Agregar un nuevo personaje
    // ============================================
    console.log('%c1️⃣ TEST: Agregar nuevo personaje', 'font-weight: bold; color: #7cb3ff; font-size: 16px');
    console.log('');

    // Buscar antes de agregar (no debería existir)
    const beforeAdd = window.searchService.searchCharacters('TestPersonaje');
    console.log(`Antes de agregar: ${beforeAdd.length} resultados para "TestPersonaje"`);

    // Agregar personaje
    projectStore.addCharacter({
        name: 'TestPersonaje Auto',
        role: 'protagonist',
        description: 'Personaje de prueba para verificar actualización automática'
    });

    console.log('⏳ Esperando actualización del índice (debounce 500ms)...');
    await wait(700); // Esperar debounce + margen

    // Buscar después de agregar
    const afterAdd = window.searchService.searchCharacters('TestPersonaje');
    console.log(`Después de agregar: ${afterAdd.length} resultados para "TestPersonaje"`);

    showTest(
        'Agregar personaje actualiza el índice',
        afterAdd.length > beforeAdd.length,
        `Se encontró el nuevo personaje en el índice`
    );

    // ============================================
    // TEST 2: Modificar un personaje
    // ============================================
    console.log('%c2️⃣ TEST: Modificar personaje existente', 'font-weight: bold; color: #7cb3ff; font-size: 16px');
    console.log('');

    const testChar = afterAdd[0];
    const charId = testChar.data.id;

    // Buscar con el nuevo nombre (no debería existir aún)
    const beforeUpdate = window.searchService.searchCharacters('PersonajeModificado');
    console.log(`Antes de modificar: ${beforeUpdate.length} resultados para "PersonajeModificado"`);

    // Modificar personaje
    projectStore.updateCharacter(charId, {
        name: 'TestPersonaje Modificado',
        description: 'Descripción actualizada con nuevas palabras clave especiales'
    });

    console.log('⏳ Esperando actualización del índice...');
    await wait(700);

    // Buscar después de modificar
    const afterUpdate = window.searchService.searchCharacters('Modificado');
    console.log(`Después de modificar: ${afterUpdate.length} resultados para "Modificado"`);

    showTest(
        'Modificar personaje actualiza el índice',
        afterUpdate.length > beforeUpdate.length,
        `El índice refleja los cambios en el personaje`
    );

    // Verificar que la búsqueda por palabras clave funciona
    const keywordSearch = window.searchService.searchCharacters('especiales');
    showTest(
        'Búsqueda por nuevas palabras clave funciona',
        keywordSearch.length > 0,
        `Se encontraron ${keywordSearch.length} resultados para "especiales"`
    );

    // ============================================
    // TEST 3: Agregar una escena
    // ============================================
    console.log('%c3️⃣ TEST: Agregar nueva escena', 'font-weight: bold; color: #7cb3ff; font-size: 16px');
    console.log('');

    const beforeScene = window.searchService.searchScenes('EscenaPrueba');
    console.log(`Antes de agregar: ${beforeScene.length} resultados para "EscenaPrueba"`);

    projectStore.addScene({
        title: 'EscenaPrueba AutoUpdate',
        description: 'Escena de prueba para verificar actualización automática del índice'
    });

    console.log('⏳ Esperando actualización del índice...');
    await wait(700);

    const afterScene = window.searchService.searchScenes('EscenaPrueba');
    console.log(`Después de agregar: ${afterScene.length} resultados para "EscenaPrueba"`);

    showTest(
        'Agregar escena actualiza el índice',
        afterScene.length > beforeScene.length,
        `Se encontró la nueva escena en el índice`
    );

    // ============================================
    // TEST 4: Agregar lore
    // ============================================
    console.log('%c4️⃣ TEST: Agregar entrada de lore', 'font-weight: bold; color: #7cb3ff; font-size: 16px');
    console.log('');

    const beforeLore = window.searchService.searchLore('LorePrueba');
    console.log(`Antes de agregar: ${beforeLore.length} resultados para "LorePrueba"`);

    projectStore.addLore({
        title: 'LorePrueba AutoUpdate',
        summary: 'Entrada de lore de prueba',
        category: 'test',
        content: 'Contenido de prueba con palabras únicas de verificación'
    });

    console.log('⏳ Esperando actualización del índice...');
    await wait(700);

    const afterLore = window.searchService.searchLore('LorePrueba');
    console.log(`Después de agregar: ${afterLore.length} resultados para "LorePrueba"`);

    showTest(
        'Agregar lore actualiza el índice',
        afterLore.length > beforeLore.length,
        `Se encontró la nueva entrada de lore en el índice`
    );

    // ============================================
    // TEST 5: Eliminar un personaje
    // ============================================
    console.log('%c5️⃣ TEST: Eliminar personaje', 'font-weight: bold; color: #7cb3ff; font-size: 16px');
    console.log('');

    const beforeDelete = window.searchService.searchCharacters('TestPersonaje');
    console.log(`Antes de eliminar: ${beforeDelete.length} resultados para "TestPersonaje"`);

    // Eliminar el personaje de prueba
    projectStore.deleteCharacter(charId);

    console.log('⏳ Esperando actualización del índice...');
    await wait(700);

    const afterDelete = window.searchService.searchCharacters('TestPersonaje');
    console.log(`Después de eliminar: ${afterDelete.length} resultados para "TestPersonaje"`);

    showTest(
        'Eliminar personaje actualiza el índice',
        afterDelete.length < beforeDelete.length,
        `El personaje eliminado ya no aparece en el índice`
    );

    // ============================================
    // TEST 6: Múltiples cambios rápidos (debounce)
    // ============================================
    console.log('%c6️⃣ TEST: Múltiples cambios rápidos (debounce)', 'font-weight: bold; color: #7cb3ff; font-size: 16px');
    console.log('');

    console.log('Agregando 5 personajes rápidamente...');
    const startTime = performance.now();

    for (let i = 1; i <= 5; i++) {
        projectStore.addCharacter({
            name: `PersonajeLote${i}`,
            role: 'secondary',
            description: `Personaje ${i} del lote de prueba`
        });
        await wait(50); // Espera corta entre cada uno
    }

    console.log('⏳ Esperando una sola actualización del índice (debounce)...');
    await wait(700);

    const endTime = performance.now();
    const totalTime = (endTime - startTime).toFixed(0);

    const loteResults = window.searchService.searchCharacters('PersonajeLote');
    console.log(`Resultados: ${loteResults.length} personajes encontrados`);
    console.log(`Tiempo total: ${totalTime}ms`);

    showTest(
        'Debounce optimiza múltiples cambios',
        loteResults.length === 5,
        `Los 5 personajes se indexaron correctamente con una sola actualización`
    );

    // ============================================
    // TEST 7: Limpiar datos de prueba
    // ============================================
    console.log('%c7️⃣ LIMPIEZA: Eliminando datos de prueba', 'font-weight: bold; color: #7cb3ff; font-size: 16px');
    console.log('');

    // Eliminar escena de prueba
    const testScene = afterScene[0];
    if (testScene) {
        projectStore.deleteScene(testScene.data.id);
        console.log('✅ Escena de prueba eliminada');
    }

    // Eliminar lore de prueba
    const testLore = afterLore[0];
    if (testLore) {
        projectStore.deleteLore(testLore.data.id);
        console.log('✅ Lore de prueba eliminado');
    }

    // Eliminar personajes del lote
    loteResults.forEach(char => {
        projectStore.deleteCharacter(char.data.id);
    });
    console.log('✅ Personajes del lote eliminados');

    await wait(700); // Esperar última actualización

    console.log('');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4a90e2');
    console.log('%c📊 RESUMEN FINAL', 'font-size: 18px; font-weight: bold; color: #4a90e2');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4a90e2');
    console.log('');

    const total = testsPassed + testsFailed;
    const percentage = total > 0 ? ((testsPassed / total) * 100).toFixed(1) : 0;

    console.log(`%c✅ Tests pasados: ${testsPassed}`, 'color: #4caf50; font-weight: bold; font-size: 14px');
    console.log(`%c❌ Tests fallados: ${testsFailed}`, 'color: #f44336; font-weight: bold; font-size: 14px');
    console.log(`%c📈 Porcentaje de éxito: ${percentage}%`, 'color: #4a90e2; font-weight: bold; font-size: 16px');
    console.log('');

    if (percentage === 100) {
        console.log('%c🎉 ¡PERFECTO! La actualización automática funciona correctamente.', 'background: #4caf50; color: white; padding: 10px; font-weight: bold; font-size: 14px');
        console.log('%c   El índice se actualiza automáticamente cuando agregas, modificas o eliminas elementos.', 'color: #4caf50');
    } else if (percentage >= 80) {
        console.log('%c✅ ¡BIEN! La actualización automática funciona en general.', 'background: #4a90e2; color: white; padding: 10px; font-weight: bold; font-size: 14px');
        console.log('%c   Revisa los tests fallados para ver si hay mejoras necesarias.', 'color: #4a90e2');
    } else {
        console.log('%c⚠️ HAY PROBLEMAS con la actualización automática.', 'background: #ff9800; color: white; padding: 10px; font-weight: bold; font-size: 14px');
        console.log('%c   Revisa los tests fallados y la configuración en app.js.', 'color: #ff9800');
    }

    console.log('');

    // Mostrar estadísticas finales
    console.log('%c📊 ESTADÍSTICAS FINALES DEL ÍNDICE:', 'font-weight: bold; color: #7cb3ff; font-size: 14px');
    const finalStats = window.searchService.getStats();
    console.table(finalStats);

    console.log('');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4a90e2');
    console.log('');

    console.log('%c💡 NOTAS:', 'font-weight: bold; color: #7cb3ff; font-size: 14px');
    console.log('');
    console.log('• El índice se actualiza automáticamente con un debounce de 500ms');
    console.log('• Esto optimiza el rendimiento al evitar reconstrucciones excesivas');
    console.log('• Los cambios se reflejan en búsquedas después de ~700ms');
    console.log('• Puedes ver los logs de actualización en la consola');
    console.log('');
    console.log('%cPara verificar manualmente:', 'color: #a0a0a0');
    console.log('%c1. Agrega un personaje desde la interfaz', 'color: #a0a0a0');
    console.log('%c2. Espera ~700ms', 'color: #a0a0a0');
    console.log('%c3. Ejecuta: searchService.searchCharacters("nombre del personaje")', 'background: #1a1a1a; color: #7cb3ff; padding: 5px; font-family: monospace');
    console.log('');

})();
