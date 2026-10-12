/**
 * LUXBAU STUDIO - INTERIOR CONFIGURATOR
 * Inspirado en la experiencia de Porsche Configurator
 * Gestión fluida de transiciones, pantalla de espera y navegación visual
 */

document.addEventListener('DOMContentLoaded', () => {
    // Definición de las 3 variaciones basadas en las imágenes provistas
    const VARIATIONS = [
        {
            index: 0,
            number: '01',
            name: 'Lino Nórdico Cálido',
            tag: 'ACABADO ACTIVO • 01',
            img: './media/variation01.png',
            tone: 'Beige Arena Natural',
            art: 'Cuadro de paisaje neutro en tonos tierra suaves',
            light: 'Cálida envolvente (2700K - 3500K)',
            surface: 'Mineral mate de poro abierto',
            desc: 'Aporta máxima calidez y aprovecha la iluminación directa de la ventana con un acabado mineral aterciopelado mate.'
        },
        {
            index: 1,
            number: '02',
            name: 'Terracota Suave',
            tag: 'ACABADO ACTIVO • 02',
            img: './media/variation02.png',
            tone: 'Almendra & Arcilla Orgánica',
            art: 'Lámina botánica de helechos silvestres con paspartú',
            light: 'Cálida de atardecer / Golden hour',
            surface: 'Cal mineral pigmentada transpirable',
            desc: 'Tono envolvente de inspiración mediterránea y orgánica que contrasta con el marco de roble y genera sombras profundas.'
        },
        {
            index: 2,
            number: '03',
            name: 'Gris Alabastro Minimal',
            tag: 'ACABADO ACTIVO • 03',
            img: './media/variation03.png',
            tone: 'Nordic Slate & Ceniza Frío',
            art: 'Composición abstracta contemporánea enmarcada',
            light: 'Luz natural diurna neutra (5000K)',
            surface: 'Estuco fino arquitectónico mate',
            desc: 'Estética moderna contemporánea inspirada en el concreto claro pulido y la luz difusa escandinava.'
        }
    ];

    // Estado de la aplicación
    let currentIndex = 0;
    let transitionMode = 'instant'; // 'instant' | 'wait'
    let isTransitioning = false;
    let isZoomed = false;

    // Referencias a elementos del DOM
    const imgLayerCurrent = document.getElementById('img-layer-current');
    const imgLayerNext = document.getElementById('img-layer-next');
    const stageViewport = document.getElementById('stage-viewport');
    
    // HUD y Pantalla de Espera
    const renderBar = document.getElementById('render-bar');
    const renderLoadingScreen = document.getElementById('render-loading-screen');
    const hudStatusText = document.getElementById('hud-status-text');
    const hudProgressFill = document.getElementById('hud-progress-fill');
    const hudToast = document.getElementById('hud-toast');
    const toastText = document.getElementById('toast-text');

    // Headers y Ficha de Detalle
    const headerVariant = document.getElementById('header-active-variant');
    const detailTag = document.getElementById('detail-tag');
    const detailName = document.getElementById('detail-name');
    const detailDesc = document.getElementById('detail-desc');
    const detailTone = document.getElementById('detail-tone');
    const detailArt = document.getElementById('detail-art');
    const detailLight = document.getElementById('detail-light');

    // Botones de control y modo
    const btnModeInstant = document.getElementById('btn-mode-instant');
    const btnModeWait = document.getElementById('btn-mode-wait');
    const btnZoomToggle = document.getElementById('btn-zoom-toggle');
    const btnQuickPrev = document.getElementById('btn-quick-prev');
    const btnQuickNext = document.getElementById('btn-quick-next');
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const btnShareStyle = document.getElementById('btn-share-style');
    const btnBack = document.getElementById('btn-back');

    // Colecciones de selectores
    const swatches = document.querySelectorAll('.swatch-item');
    const thumbCards = document.querySelectorAll('.thumb-card');

    // =========================================================================
    // 1. PRECARGA DE IMÁGENES (Garantiza transiciones 100% instantáneas)
    // =========================================================================
    const preloadedImages = [];
    VARIATIONS.forEach((item) => {
        const img = new Image();
        img.src = item.img;
        preloadedImages.push(img);
    });

    // =========================================================================
    // 2. FUNCIÓN DE CAMBIO DE ESTILO
    // =========================================================================
    function applyVariation(targetIndex, force = false) {
        if (!force && (targetIndex === currentIndex || isTransitioning)) return;
        if (targetIndex < 0 || targetIndex >= VARIATIONS.length) return;

        isTransitioning = true;
        const targetData = VARIATIONS[targetIndex];

        // Actualizar estados visuales de la interfaz lateral de inmediato
        updateUIControls(targetIndex);

        if (transitionMode === 'wait') {
            // MODO PANTALLA DE ESPERA / RENDERIZADO PORSCHE
            executeWaitScreenTransition(targetData, targetIndex);
        } else {
            // MODO TRANSICIÓN SUAVE INMEDIATA (CROSSFADE GPU)
            executeSmoothTransition(targetData, targetIndex);
        }
    }

    // Transición Suave Instantánea
    function executeSmoothTransition(targetData, targetIndex) {
        // Preparar la capa oculta con la nueva imagen
        imgLayerNext.src = targetData.img;
        
        // Disparar barra de progreso superior discreta
        triggerTopBarAnimation(250);

        // Intercambiar capas con crossfade CSS
        requestAnimationFrame(() => {
            imgLayerNext.classList.add('active');
            imgLayerCurrent.classList.remove('active');

            setTimeout(() => {
                // Al completar el fade, sincronizar capa base
                imgLayerCurrent.src = targetData.img;
                imgLayerCurrent.classList.add('active');
                imgLayerNext.classList.remove('active');

                currentIndex = targetIndex;
                isTransitioning = false;
                showToast(`Estilo aplicado: ${targetData.name}`);
            }, 450);
        });
    }

    // Pantalla de Espera / Render Simulado
    function executeWaitScreenTransition(targetData, targetIndex) {
        hudStatusText.textContent = `Generando acabado: ${targetData.name}...`;
        hudProgressFill.style.width = '0%';
        renderLoadingScreen.classList.add('visible');

        triggerTopBarAnimation(550);

        // Simulación de barra de progreso técnica
        setTimeout(() => {
            hudProgressFill.style.width = '65%';
        }, 120);

        setTimeout(() => {
            hudProgressFill.style.width = '100%';
        }, 320);

        setTimeout(() => {
            // Aplicar imagen final
            imgLayerCurrent.src = targetData.img;
            imgLayerCurrent.classList.add('active');
            imgLayerNext.classList.remove('active');

            // Retirar pantalla de espera
            renderLoadingScreen.classList.remove('visible');
            currentIndex = targetIndex;
            isTransitioning = false;
            showToast(`Render completado: ${targetData.name}`);
        }, 520);
    }

    // =========================================================================
    // 3. ACTUALIZACIÓN DE ELEMENTOS DE LA IU
    // =========================================================================
    function updateUIControls(index) {
        const item = VARIATIONS[index];

        // Actualizar Swatches
        swatches.forEach(swatch => {
            const swatchIdx = parseInt(swatch.dataset.index, 10);
            swatch.classList.toggle('active', swatchIdx === index);
        });

        // Actualizar Miniaturas
        thumbCards.forEach(thumb => {
            const thumbIdx = parseInt(thumb.dataset.index, 10);
            thumb.classList.toggle('active', thumbIdx === index);
        });

        // Header
        headerVariant.textContent = `${item.number} • ${item.name}`;

        // Ficha Técnica Lateral
        detailTag.textContent = item.tag;
        detailName.textContent = item.name;
        detailDesc.textContent = item.desc;
        detailTone.textContent = item.tone;
        detailArt.textContent = item.art;
        detailLight.textContent = item.light;
    }

    // Toast flotante tipo HUD
    let toastTimeout = null;
    function showToast(message) {
        toastText.textContent = message;
        hudToast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            hudToast.classList.remove('show');
        }, 2200);
    }

    // Barra de progreso superior
    function triggerTopBarAnimation(durationMs) {
        renderBar.style.width = '0%';
        renderBar.classList.add('active');
        
        requestAnimationFrame(() => {
            renderBar.style.width = '80%';
            setTimeout(() => {
                renderBar.style.width = '100%';
                setTimeout(() => {
                    renderBar.classList.remove('active');
                    renderBar.style.width = '0%';
                }, 200);
            }, durationMs - 100);
        });
    }

    // =========================================================================
    // 4. LISTENERS DE INTERACCIÓN
    // =========================================================================

    // Clic en Swatches circulares
    swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            const idx = parseInt(swatch.dataset.index, 10);
            applyVariation(idx);
        });
    });

    // Clic en Miniaturas
    thumbCards.forEach(thumb => {
        thumb.addEventListener('click', () => {
            const idx = parseInt(thumb.dataset.index, 10);
            applyVariation(idx);
        });
    });

    // Conmutador de Efecto: Transición vs Espera
    btnModeInstant.addEventListener('click', () => {
        transitionMode = 'instant';
        btnModeInstant.classList.add('active');
        btnModeWait.classList.remove('active');
        showToast('Modo: Transición inmediata fluida');
    });

    btnModeWait.addEventListener('click', () => {
        transitionMode = 'wait';
        btnModeWait.classList.add('active');
        btnModeInstant.classList.remove('active');
        showToast('Modo: Pantalla de espera / Render activo');
    });

    // Navegación Anterior / Siguiente
    btnQuickPrev.addEventListener('click', () => {
        const nextIdx = (currentIndex - 1 + VARIATIONS.length) % VARIATIONS.length;
        applyVariation(nextIdx);
    });

    btnQuickNext.addEventListener('click', () => {
        const nextIdx = (currentIndex + 1) % VARIATIONS.length;
        applyVariation(nextIdx);
    });

    // Modo Zoom / Detalle
    btnZoomToggle.addEventListener('click', () => {
        isZoomed = !isZoomed;
        stageViewport.classList.toggle('zoomed', isZoomed);
        btnZoomToggle.classList.toggle('active', isZoomed);
        showToast(isZoomed ? 'Zoom detalle activado' : 'Vista panorámica');
    });

    // Pantalla completa
    btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            stageViewport.requestFullscreen?.() || document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen?.();
        }
    });

    // Guardar / Copiar Estilo
    btnShareStyle.addEventListener('click', () => {
        const activeItem = VARIATIONS[currentIndex];
        const styleInfo = `Luxbau Master Suite - Acabado Seleccionado: [${activeItem.number}] ${activeItem.name} (${activeItem.tone})`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(styleInfo).then(() => {
                showToast('¡Estilo copiado al portapapeles!');
            }).catch(() => {
                showToast(`Configuración: ${activeItem.name}`);
            });
        } else {
            showToast(`Configuración: ${activeItem.name}`);
        }
    });

    // Botón volver
    btnBack.addEventListener('click', () => {
        showToast('Regresando a la vista principal de proyectos...');
    });

    // =========================================================================
    // 5. ATAJOS DE TECLADO (1, 2, 3, Flechas, F)
    // =========================================================================
    window.addEventListener('keydown', (e) => {
        // Teclas numéricas 1, 2, 3
        if (e.key === '1') applyVariation(0);
        if (e.key === '2') applyVariation(1);
        if (e.key === '3') applyVariation(2);

        // Flechas de dirección
        if (e.key === 'ArrowLeft') {
            const nextIdx = (currentIndex - 1 + VARIATIONS.length) % VARIATIONS.length;
            applyVariation(nextIdx);
        }
        if (e.key === 'ArrowRight') {
            const nextIdx = (currentIndex + 1) % VARIATIONS.length;
            applyVariation(nextIdx);
        }

        // Tecla F para pantalla completa
        if (e.key.toLowerCase() === 'f' && !e.target.matches('input, textarea')) {
            btnFullscreen.click();
        }
    });

    // Inicializar estado base
    updateUIControls(0);
});
