/**
 * All Measuring Gage - Metrology Training Application Engine
 * Normativas: ASME B89.1.5, ASME B89.7.3.1, ASME Y14.43, ASME B89.6.2
 * Expositora: Ing. Patricia Flores Reyes
 */

(function () {
  'use strict';

  // --- ASME B89.1.5 Gagemaker's Tolerance Data ---
  // Table in Inches: [maxDiameter, XX, X, Y, Z, ZZ] in micro-inches (10^-6 in)
  const ASME_B89_1_5_INCHES = [
    { limit: 0.825, xx: 20, x: 40, y: 70, z: 100, zz: 200 },
    { limit: 1.510, xx: 30, x: 60, y: 90, z: 120, zz: 240 },
    { limit: 2.510, xx: 40, x: 80, y: 120, z: 160, zz: 320 },
    { limit: 4.510, xx: 50, x: 100, y: 150, z: 200, zz: 400 },
    { limit: 6.510, xx: 65, x: 130, y: 190, z: 250, zz: 500 },
    { limit: 9.010, xx: 80, x: 160, y: 240, z: 320, zz: 640 },
    { limit: 12.010, xx: 100, x: 200, y: 300, z: 400, zz: 800 }
  ];

  // Table in Millimeters: [maxDiameter, XX, X, Y, Z, ZZ] in micrometers (µm)
  const ASME_B89_1_5_MM = [
    { limit: 20.95, xx: 0.5, x: 1.0, y: 1.8, z: 2.5, zz: 5.0 },
    { limit: 38.35, xx: 0.8, x: 1.5, y: 2.3, z: 3.0, zz: 6.0 },
    { limit: 63.75, xx: 1.0, x: 2.0, y: 3.0, z: 4.0, zz: 8.0 },
    { limit: 114.55, xx: 1.3, x: 2.5, y: 3.8, z: 5.0, zz: 10.0 },
    { limit: 165.35, xx: 1.7, x: 3.3, y: 4.8, z: 6.4, zz: 12.7 },
    { limit: 228.85, xx: 2.0, x: 4.1, y: 6.1, z: 8.1, zz: 16.3 },
    { limit: 305.05, xx: 2.5, x: 5.1, y: 7.6, z: 10.2, zz: 20.3 }
  ];

  // Coefficients of Thermal Expansion (CTE, 10^-6 / °C) per ASME B89.6.2
  const CTE_VALUES = {
    steel: 11.5,
    carbide: 5.0,
    ceramic: 9.2,
    aluminum: 23.0,
    brass: 18.5,
    titanium: 8.6
  };

  // State Management
  let currentSlide = 0;
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  let activeView = 'presentation'; // 'presentation', 'document', 'calculator', 'quiz'
  let timerInterval = null;
  let elapsedSeconds = 0;

  // DOM Elements
  const prevBtn = document.getElementById('prevSlideBtn');
  const nextBtn = document.getElementById('nextSlideBtn');
  const slideIndicator = document.getElementById('slideIndicator');
  const progressBar = document.getElementById('progressBarFill');
  const notesPanel = document.getElementById('speakerNotesPanel');
  const notesContent = document.getElementById('speakerNotesContent');
  const toggleNotesBtn = document.getElementById('toggleNotesBtn');
  const timerDisplay = document.getElementById('timerDisplay');

  // Initialize
  function init() {
    setupViewSwitching();
    setupNavigation();
    setupKeyboardShortcuts();
    setupThemeToggle();
    setupCalculators();
    setupQuiz();
    setupTimer();
    renderAllSlideDiagrams();
    updateSlide(0);
    renderTablePreview('mm');
  }

  // View Switching
  function setupViewSwitching() {
    const modeButtons = document.querySelectorAll('.mode-btn');
    const viewContainers = {
      presentation: document.getElementById('presentationView'),
      document: document.getElementById('documentView'),
      calculator: document.getElementById('calculatorView'),
      quiz: document.getElementById('quizView')
    };

    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetMode = btn.getAttribute('data-mode');
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        Object.keys(viewContainers).forEach(key => {
          if (viewContainers[key]) {
            viewContainers[key].style.display = (key === targetMode) ? 'block' : 'none';
          }
        });

        const presBar = document.getElementById('presentationBar');
        if (presBar) {
          presBar.style.display = (targetMode === 'presentation') ? 'flex' : 'none';
        }

        activeView = targetMode;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  // Slide Navigation
  function updateSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    slides[currentSlide].classList.remove('active');
    currentSlide = index;
    slides[currentSlide].classList.add('active');

    // Update controls
    if (slideIndicator) slideIndicator.textContent = `${currentSlide + 1} / ${totalSlides}`;
    if (prevBtn) prevBtn.disabled = (currentSlide === 0);
    if (nextBtn) nextBtn.disabled = (currentSlide === totalSlides - 1);
    
    // Update progress bar
    if (progressBar) {
      const percentage = ((currentSlide + 1) / totalSlides) * 100;
      progressBar.style.width = `${percentage}%`;
    }

    // Update Speaker Notes
    const currentNotes = slides[currentSlide].getAttribute('data-speaker-notes') || 'No hay notas adicionales para esta diapositiva.';
    if (notesContent) {
      notesContent.innerHTML = `<p>${currentNotes}</p>`;
    }

    // Dynamic renders on specific slides (Slide 7 y Slide 9)
    if (slides[currentSlide].id === 'slide-7' || slides[currentSlide].id === 'slide-9') {
      renderAllSlideDiagrams();
    }
  }

  function setupNavigation() {
    if (prevBtn) prevBtn.addEventListener('click', () => updateSlide(currentSlide - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => updateSlide(currentSlide + 1));

    if (toggleNotesBtn && notesPanel) {
      toggleNotesBtn.addEventListener('click', () => {
        notesPanel.classList.toggle('open');
      });
    }

    const closeNotesBtn = document.getElementById('closeNotesBtn');
    if (closeNotesBtn && notesPanel) {
      closeNotesBtn.addEventListener('click', () => {
        notesPanel.classList.remove('open');
      });
    }

    // Fullscreen toggle
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => console.log(err));
        } else {
          document.exitFullscreen().catch(err => console.log(err));
        }
      });
    }
  }

  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (activeView !== 'presentation') return;
      if (['input', 'select', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        updateSlide(currentSlide + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        updateSlide(currentSlide - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        updateSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        updateSlide(totalSlides - 1);
      } else if (e.key.toLowerCase() === 'n' && notesPanel) {
        notesPanel.classList.toggle('open');
      } else if (e.key.toLowerCase() === 'f') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => console.log(err));
        } else {
          document.exitFullscreen().catch(err => console.log(err));
        }
      }
    });
  }

  // Presentation Timer for Speaker
  function setupTimer() {
    const startPauseBtn = document.getElementById('timerToggleBtn');
    const resetBtn = document.getElementById('timerResetBtn');
    let isRunning = false;

    function formatTime(secs) {
      const m = Math.floor(secs / 60).toString().padStart(2, '0');
      const s = (secs % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    }

    if (startPauseBtn) {
      startPauseBtn.addEventListener('click', () => {
        if (isRunning) {
          clearInterval(timerInterval);
          isRunning = false;
          startPauseBtn.innerHTML = '▶';
        } else {
          timerInterval = setInterval(() => {
            elapsedSeconds++;
            if (timerDisplay) timerDisplay.textContent = formatTime(elapsedSeconds);
          }, 1000);
          isRunning = true;
          startPauseBtn.innerHTML = '⏸';
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        isRunning = false;
        elapsedSeconds = 0;
        if (timerDisplay) timerDisplay.textContent = '00:00';
        if (startPauseBtn) startPauseBtn.innerHTML = '▶';
      });
    }
  }

  // Theme Toggle (Dark / Light)
  function setupThemeToggle() {
    const themeBtn = document.getElementById('themeToggleBtn');
    if (!themeBtn) return;

    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = (currentTheme === 'dark') ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      themeBtn.innerHTML = (nextTheme === 'light') ? '🌙' : '☀️';
      // Redraw any dynamic SVGs
      calculateGage();
      calculateGuardband();
      renderAllSlideDiagrams();
    });
  }

  // Table Preview Toggle (Inches vs MM)
  window.renderTablePreview = function(unit) {
    const tbody = document.getElementById('asmeTableBody');
    if (!tbody) return;

    const data = (unit === 'in') ? ASME_B89_1_5_INCHES : ASME_B89_1_5_MM;
    const unitSymbol = (unit === 'in') ? 'µin' : 'µm';
    const dimSymbol = (unit === 'in') ? 'in' : 'mm';

    let prev = 0;
    let html = '';
    data.forEach((row, idx) => {
      const rangeText = (idx === 0) ? `Hasta ${row.limit} ${dimSymbol}` : `> ${prev} a ${row.limit} ${dimSymbol}`;
      prev = row.limit;
      html += `
        <tr>
          <td><strong>${rangeText}</strong></td>
          <td class="highlight">${row.xx} ${unitSymbol}</td>
          <td>${row.x} ${unitSymbol}</td>
          <td>${row.y} ${unitSymbol}</td>
          <td>${row.z} ${unitSymbol}</td>
          <td>${row.zz} ${unitSymbol}</td>
        </tr>
      `;
    });
    tbody.innerHTML = html;

    const btnIn = document.getElementById('btnTableIn');
    const btnMm = document.getElementById('btnTableMm');
    if (btnIn && btnMm) {
      if (unit === 'in') {
        btnIn.classList.add('active');
        btnMm.classList.remove('active');
      } else {
        btnMm.classList.add('active');
        btnIn.classList.remove('active');
      }
    }
  };

  // --- CALCULATORS LOGIC ---
  function setupCalculators() {
    const calcGageBtn = document.getElementById('btnCalculateGage');
    if (calcGageBtn) calcGageBtn.addEventListener('click', calculateGage);

    const calcGuardbandBtn = document.getElementById('btnCalculateGuardband');
    if (calcGuardbandBtn) calcGuardbandBtn.addEventListener('click', calculateGuardband);

    const calcThermalBtn = document.getElementById('btnCalculateThermal');
    if (calcThermalBtn) calcThermalBtn.addEventListener('click', calculateThermal);

    // Initial calculations
    calculateGage();
    calculateGuardband();
    calculateThermal();
  }

  // 1. ASME B89.1.5 & Y14.43 Gagemaker Tolerance Calculator
  function calculateGage() {
    const nominal = parseFloat(document.getElementById('inputNominalDiameter')?.value) || 25.0;
    const partTol = parseFloat(document.getElementById('inputPartTolerance')?.value) || 0.040; // mm or in
    const unit = document.getElementById('selectUnit')?.value || 'mm';
    const gageType = document.getElementById('selectGageType')?.value || 'plug'; // plug = internal hole, ring = external shaft
    const wearPercent = parseFloat(document.getElementById('selectWearAllowance')?.value) || 5; // %

    const table = (unit === 'in') ? ASME_B89_1_5_INCHES : ASME_B89_1_5_MM;
    const conversion = (unit === 'in') ? 1e-6 : 0.001; // micro-inches to inches, or µm to mm

    // Find table row
    let matchedRow = table[table.length - 1];
    for (let r of table) {
      if (nominal <= r.limit) {
        matchedRow = r;
        break;
      }
    }

    // Recommended class: 10% rule: tolerance of gage <= 10% of part tolerance
    const maxAllowedGageTol = partTol * 0.10;
    const classes = ['xx', 'x', 'y', 'z', 'zz'];
    let recommendedClass = 'xx';

    // Find the most economical class that still respects <= 10%
    for (let c of classes) {
      const val = matchedRow[c] * conversion;
      if (val <= maxAllowedGageTol) {
        recommendedClass = c;
      }
    }

    const gageTolVal = matchedRow[recommendedClass] * conversion;
    const wearVal = (wearPercent > 0) ? (partTol * (wearPercent / 100)) : 0;

    // Hole: GO checks MMC (Min hole), NOGO checks LMC (Max hole)
    // Shaft: GO checks MMC (Max shaft), NOGO checks LMC (Min shaft)
    let goNominal, goMin, goMax, nogoNominal, nogoMin, nogoMax;

    if (gageType === 'plug') {
      // Internal hole with limits: [Nominal, Nominal + PartTol]
      const holeMMC = nominal;
      const holeLMC = nominal + partTol;

      // GO Plug (ASME Y14.43 absolute practice inside part limits)
      // With wear allowance: nominal moves up by wearVal
      goNominal = holeMMC + wearVal;
      goMin = goNominal;
      goMax = goNominal + gageTolVal;

      // NOGO Plug: checks holeLMC
      // ASME absolute practice: tolerance is minus (-gageTolVal) from LMC
      nogoNominal = holeLMC;
      nogoMin = nogoNominal - gageTolVal;
      nogoMax = nogoNominal;
    } else {
      // External shaft with limits: [Nominal - PartTol, Nominal]
      const shaftMMC = nominal;
      const shaftLMC = nominal - partTol;

      // GO Ring (hole of ring checks shaft MMC)
      // With wear allowance: ring hole starts smaller by wearVal
      goNominal = shaftMMC - wearVal;
      goMax = goNominal;
      goMin = goNominal - gageTolVal;

      // NOGO Ring: checks shaftLMC
      // ASME absolute practice: tolerance is plus (+gageTolVal) from LMC
      nogoNominal = shaftLMC;
      nogoMin = nogoNominal;
      nogoMax = nogoNominal + gageTolVal;
    }

    const unitLabel = (unit === 'in') ? 'in' : 'mm';
    const microLabel = (unit === 'in') ? 'µin' : 'µm';
    const gageTolNative = matchedRow[recommendedClass];

    // Render stats
    document.getElementById('resRecommendedClass').textContent = `Clase ${recommendedClass.toUpperCase()}`;
    document.getElementById('resGageTol').textContent = `${gageTolNative} ${microLabel} (${gageTolVal.toFixed(5)} ${unitLabel})`;
    document.getElementById('resTenPercentCheck').textContent = `${((gageTolVal / partTol) * 100).toFixed(2)}% de la tol. de pieza (Norma: ≤ 10%)`;
    document.getElementById('resWearVal').textContent = `${wearVal.toFixed(5)} ${unitLabel} (${wearPercent}%)`;
    
    document.getElementById('resGoLimits').innerHTML = `<strong>${goMin.toFixed(5)}</strong> a <strong>${goMax.toFixed(5)}</strong> ${unitLabel}`;
    document.getElementById('resNoGoLimits').innerHTML = `<strong>${nogoMin.toFixed(5)}</strong> a <strong>${nogoMax.toFixed(5)}</strong> ${unitLabel}`;

    // Render SVG Visual Diagram
    renderGageToleranceDiagram('gageToleranceSvg', {
      gageType,
      unitLabel,
      nominal,
      partTol,
      goMin,
      goMax,
      nogoMin,
      nogoMax,
      wearVal,
      gageTolVal
    });
  }

  // Diagram rendering for Gagemaker tolerance
  function renderGageToleranceDiagram(svgId, params) {
    const svg = document.getElementById(svgId);
    if (!svg) return;

    const width = 800;
    const height = 240;
    const isPlug = params.gageType === 'plug';

    let html = `
      <defs>
        <linearGradient id="partGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.3"/>
        </linearGradient>
        <linearGradient id="goGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#34d399" stop-opacity="0.9"/>
        </linearGradient>
        <linearGradient id="nogoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ef4444" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#f87171" stop-opacity="0.9"/>
        </linearGradient>
      </defs>
    `;

    // Part tolerance box (large background)
    const partX = 100;
    const partW = 600;
    const partY = 60;
    const partH = 70;

    html += `
      <!-- Tolerancia de la pieza -->
      <rect x="${partX}" y="${partY}" width="${partW}" height="${partH}" fill="url(#partGrad)" stroke="#38bdf8" stroke-width="2" rx="6" />
      <text x="${partX + partW/2}" y="${partY - 15}" fill="#38bdf8" font-size="14" font-weight="700" text-anchor="middle" font-family="Inter, sans-serif">
        ZONA DE TOLERANCIA DEL PRODUCTO (${params.partTol} ${params.unitLabel})
      </text>
      
      <!-- Línea MMC y LMC -->
      <line x1="${partX}" y1="${partY - 8}" x2="${partX}" y2="${partY + partH + 20}" stroke="#9ca3af" stroke-width="1.5" stroke-dasharray="4,4" />
      <text x="${partX}" y="${partY + partH + 35}" fill="#9ca3af" font-size="12" font-family="JetBrains Mono, monospace" text-anchor="middle">
        ${isPlug ? 'MMC (Lím. Inferior)' : 'MMC (Lím. Superior)'}
      </text>

      <line x1="${partX + partW}" y1="${partY - 8}" x2="${partX + partW}" y2="${partY + partH + 20}" stroke="#9ca3af" stroke-width="1.5" stroke-dasharray="4,4" />
      <text x="${partX + partW}" y="${partY + partH + 35}" fill="#9ca3af" font-size="12" font-family="JetBrains Mono, monospace" text-anchor="middle">
        ${isPlug ? 'LMC (Lím. Superior)' : 'LMC (Lím. Inferior)'}
      </text>

      <!-- Tolerancia Gage GO (Verde) -->
      <rect x="${partX + 15}" y="${partY + 12}" width="55" height="46" fill="url(#goGrad)" stroke="#10b981" stroke-width="1.5" rx="4" />
      <text x="${partX + 42}" y="${partY + 39}" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle" font-family="Inter, sans-serif">
        GO
      </text>
      <text x="${partX + 42}" y="${partY + 53}" fill="#e6fffa" font-size="9" text-anchor="middle" font-family="JetBrains Mono, monospace">
        Tol. Gage
      </text>

      <!-- Margen de desgaste (Ámbar) -->
      <rect x="${partX}" y="${partY + 12}" width="15" height="46" fill="#f59e0b" fill-opacity="0.8" stroke="#d97706" stroke-width="1.5" rx="2" />
      <text x="${partX + 7.5}" y="${partY + 39}" fill="#fff" font-size="9" font-weight="800" text-anchor="middle">W</text>

      <!-- Tolerancia Gage NOGO (Rojo) -->
      <rect x="${partX + partW - 55}" y="${partY + 12}" width="55" height="46" fill="url(#nogoGrad)" stroke="#ef4444" stroke-width="1.5" rx="4" />
      <text x="${partX + partW - 27}" y="${partY + 39}" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle" font-family="Inter, sans-serif">
        NO-GO
      </text>
      <text x="${partX + partW - 27}" y="${partY + 53}" fill="#ffe4e6" font-size="9" text-anchor="middle" font-family="JetBrains Mono, monospace">
        Tol. Gage
      </text>

      <!-- Leyenda Práctica ASME Y14.43 -->
      <text x="400" y="215" fill="#9ca3af" font-size="11" text-anchor="middle" font-family="Inter, sans-serif">
        Asignación de Tolerancias: Práctica Absoluta ASME Y14.43 (100% Garantía dentro de especificación)
      </text>
    `;

    svg.innerHTML = html;
  }

  // 2. ASME B89.7.3.1 Guardbanding and Decision Rules
  function calculateGuardband() {
    const lsl = parseFloat(document.getElementById('inputLSL')?.value) || 24.980;
    const usl = parseFloat(document.getElementById('inputUSL')?.value) || 25.020;
    const u95 = parseFloat(document.getElementById('inputU95')?.value) || 0.0025; // Exp. Uncertainty k=2
    const guardbandFactor = parseFloat(document.getElementById('selectGuardbandMultiplier')?.value) || 1.0;

    const span = usl - lsl;
    const tur = (span > 0 && u95 > 0) ? (span / (2 * u95)) : 0;
    const guardband = guardbandFactor * u95;

    // Stringent Guardbanded limits
    const lowerAccept = lsl + guardband;
    const upperAccept = usl - guardband;
    const acceptSpan = upperAccept - lowerAccept;
    const tolLostPercent = (span > 0) ? ((2 * guardband / span) * 100) : 0;

    // DOM Elements
    const turEl = document.getElementById('resTUR');
    const verdictEl = document.getElementById('resTURVerdict');
    const gbValEl = document.getElementById('resGuardbandVal');
    const acceptRangeEl = document.getElementById('resAcceptRange');
    const lostTolEl = document.getElementById('resLostTol');

    if (turEl) turEl.textContent = `${tur.toFixed(2)} : 1`;
    if (gbValEl) gbValEl.textContent = `g = ${guardband.toFixed(4)} mm`;
    if (acceptRangeEl) acceptRangeEl.innerHTML = `[ <strong>${lowerAccept.toFixed(4)}</strong> a <strong>${upperAccept.toFixed(4)}</strong> mm ]`;
    if (lostTolEl) lostTolEl.textContent = `${tolLostPercent.toFixed(1)}% del intervalo`;

    if (verdictEl) {
      if (tur >= 4.0) {
        verdictEl.className = 'metro-badge go';
        verdictEl.textContent = 'CONFORME (TUR ≥ 4:1 Recomendado ASME)';
      } else if (tur >= 3.0) {
        verdictEl.className = 'metro-badge warn';
        verdictEl.textContent = 'MARGINAL (TUR < 4:1, Requiere Guardbanding)';
      } else {
        verdictEl.className = 'metro-badge nogo';
        verdictEl.textContent = 'CRÍTICO (TUR < 3:1, Alto Riesgo del Consumidor)';
      }
    }

    renderGuardbandSvg('guardbandSvg', { lsl, usl, u95, guardband, lowerAccept, upperAccept });
  }

  function renderGuardbandSvg(svgId, params) {
    const svg = document.getElementById(svgId);
    if (!svg) return;

    const width = 800;
    const height = 220;
    const baseX = 80;
    const baseW = 640;
    const baseY = 50;
    const baseH = 80;

    // Proportions
    const totalSpan = params.usl - params.lsl;
    const gbRatio = (totalSpan > 0) ? (params.guardband / totalSpan) : 0.1;
    const gbWidth = Math.min(Math.max(gbRatio * baseW, 25), baseW * 0.4);

    let html = `
      <defs>
        <pattern id="diagonalHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#8b5cf6" stroke-width="1.5" />
        </pattern>
      </defs>

      <!-- Zona de Rechazo Izquierda -->
      <rect x="20" y="${baseY}" width="${baseX - 20}" height="${baseH}" fill="#ef4444" fill-opacity="0.15" stroke="#ef4444" stroke-width="1.5" />
      <text x="${(baseX + 20)/2}" y="${baseY + 45}" fill="#ef4444" font-size="11" font-weight="700" text-anchor="middle">RECHAZO</text>

      <!-- Guardband Inferior (Zona de Duda) -->
      <rect x="${baseX}" y="${baseY}" width="${gbWidth}" height="${baseH}" fill="url(#diagonalHatch)" stroke="#8b5cf6" stroke-width="1.5" />
      <text x="${baseX + gbWidth/2}" y="${baseY + 45}" fill="#8b5cf6" font-size="10" font-weight="700" text-anchor="middle">GUARDBAND</text>

      <!-- Zona de Aceptación Estricta -->
      <rect x="${baseX + gbWidth}" y="${baseY}" width="${baseW - 2*gbWidth}" height="${baseH}" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="2" />
      <text x="${baseX + baseW/2}" y="${baseY + 40}" fill="#10b981" font-size="14" font-weight="800" text-anchor="middle" font-family="Inter, sans-serif">
        ZONA DE ACEPTACIÓN SEGURA (CONFORME)
      </text>
      <text x="${baseX + baseW/2}" y="${baseY + 58}" fill="#9ca3af" font-size="11" text-anchor="middle" font-family="JetBrains Mono, monospace">
        Riesgo del Consumidor β &lt; 2%
      </text>

      <!-- Guardband Superior (Zona de Duda) -->
      <rect x="${baseX + baseW - gbWidth}" y="${baseY}" width="${gbWidth}" height="${baseH}" fill="url(#diagonalHatch)" stroke="#8b5cf6" stroke-width="1.5" />
      <text x="${baseX + baseW - gbWidth/2}" y="${baseY + 45}" fill="#8b5cf6" font-size="10" font-weight="700" text-anchor="middle">GUARDBAND</text>

      <!-- Zona de Rechazo Derecha -->
      <rect x="${baseX + baseW}" y="${baseY}" width="70" height="${baseH}" fill="#ef4444" fill-opacity="0.15" stroke="#ef4444" stroke-width="1.5" />
      <text x="${baseX + baseW + 35}" y="${baseY + 45}" fill="#ef4444" font-size="11" font-weight="700" text-anchor="middle">RECHAZO</text>

      <!-- Marcadores de LSL y USL -->
      <line x1="${baseX}" y1="${baseY - 10}" x2="${baseX}" y2="${baseY + baseH + 20}" stroke="#f3f4f6" stroke-width="2" />
      <text x="${baseX}" y="${baseY + baseH + 35}" fill="#f3f4f6" font-size="11" font-family="JetBrains Mono, monospace" text-anchor="middle">
        LSL = ${params.lsl}
      </text>

      <line x1="${baseX + baseW}" y1="${baseY - 10}" x2="${baseX + baseW}" y2="${baseY + baseH + 20}" stroke="#f3f4f6" stroke-width="2" />
      <text x="${baseX + baseW}" y="${baseY + baseH + 35}" fill="#f3f4f6" font-size="11" font-family="JetBrains Mono, monospace" text-anchor="middle">
        USL = ${params.usl}
      </text>

      <!-- Límites de Aceptación con Guardband -->
      <line x1="${baseX + gbWidth}" y1="${baseY}" x2="${baseX + gbWidth}" y2="${baseY + baseH + 10}" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="3,3" />
      <text x="${baseX + gbWidth}" y="${baseY - 8}" fill="#8b5cf6" font-size="10" font-family="JetBrains Mono, monospace" text-anchor="middle">
        LSL + g
      </text>

      <line x1="${baseX + baseW - gbWidth}" y1="${baseY}" x2="${baseX + baseW - gbWidth}" y2="${baseY + baseH + 10}" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="3,3" />
      <text x="${baseX + baseW - gbWidth}" y="${baseY - 8}" fill="#8b5cf6" font-size="10" font-family="JetBrains Mono, monospace" text-anchor="middle">
        USL - g
      </text>
    `;

    svg.innerHTML = html;
  }

  // 3. ASME B89.6.2 Thermal Expansion Calculator
  function calculateThermal() {
    const length = parseFloat(document.getElementById('inputThermalLength')?.value) || 100.0; // mm
    const temp = parseFloat(document.getElementById('inputAmbientTemp')?.value) || 24.0; // °C
    const gageMat = document.getElementById('selectGageMaterial')?.value || 'steel';
    const partMat = document.getElementById('selectPartMaterial')?.value || 'aluminum';

    const deltaT = temp - 20.0; // Reference 20 °C per ASME B89.6.2
    const alphaGage = (CTE_VALUES[gageMat] || 11.5) * 1e-6;
    const alphaPart = (CTE_VALUES[partMat] || 11.5) * 1e-6;

    // Expansion del gage y de la pieza
    const expGage = length * alphaGage * deltaT; // mm
    const expPart = length * alphaPart * deltaT; // mm
    const diffError = expPart - expGage; // mm error diferencial

    const errorMicrons = diffError * 1000; // µm
    const errorMicroIn = (diffError / 25.4) * 1e6; // µin

    document.getElementById('resDeltaTemp').textContent = `${deltaT > 0 ? '+' : ''}${deltaT.toFixed(1)} °C`;
    document.getElementById('resExpGage').textContent = `${(expGage * 1000).toFixed(2)} µm`;
    document.getElementById('resExpPart').textContent = `${(expPart * 1000).toFixed(2)} µm`;
    document.getElementById('resDiffError').innerHTML = `<strong>${errorMicrons.toFixed(2)} µm</strong> (${errorMicroIn.toFixed(1)} µin)`;

    const impactAlert = document.getElementById('resThermalImpactAlert');
    if (impactAlert) {
      if (Math.abs(errorMicrons) > 5.0) {
        impactAlert.className = 'callout danger';
        impactAlert.innerHTML = `<strong>¡Error Térmico Crítico!</strong> La diferencia de ${errorMicrons.toFixed(2)} µm excede la tolerancia completa de gages de Clase X/Y. Se requiere aclimatación a 20°C o compensación matemática estricta.`;
      } else if (Math.abs(errorMicrons) > 1.5) {
        impactAlert.className = 'callout warning';
        impactAlert.innerHTML = `<strong>Atención Térmica:</strong> El gradiente introduce ${errorMicrons.toFixed(2)} µm de sesgo. Para calibradores de precisión Clase XX o X, esto consume más del 50% de la tolerancia de fabricación.`;
      } else {
        impactAlert.className = 'callout success';
        impactAlert.innerHTML = `<strong>Condición Estable:</strong> Desviación térmica moderada (${errorMicrons.toFixed(2)} µm). Cumple tolerancias estándar de taller.`;
      }
    }
  }

  // --- QUIZ LOGIC ---
  const QUIZ_DATA = [
    {
      q: "1. De acuerdo con el Principio de Taylor (ASME Y14.43), ¿cuál es la función dimensional y geométrica del calibrador PASA (GO)?",
      options: [
        "Verificar dimensiones locales puntuales en la Condición de Mínimo Material (LMC).",
        "Comprobar simultáneamente todos los límites de tamaño y forma en la Condición de Máxima Material (MMC).",
        "Inspeccionar únicamente la rugosidad superficial y concentricidad promedio.",
        "Asegurar que la pieza tenga al menos un 10% de margen de desgaste."
      ],
      correct: 1,
      explanation: "Fundamentación ASME Y14.43: El calibrador GO debe abarcar la longitud funcional completa y evaluar la envolvente de Máxima Condición de Material (MMC), integrando tamaño, rectitud y redondez de forma simultánea."
    },
    {
      q: "2. Según la regla empírica metrológica y ASME B89.1.5 (Gagemaker's 10% Rule), ¿qué proporción máxima de la tolerancia del producto debe consumir la tolerancia del gage?",
      options: [
        "Hasta un 50% para tolerancias comerciales.",
        "Exactamente el 25% dividido equitativamente entre GO y NOGO.",
        "Un máximo del 10% (10:1 Rule), o 5% en requerimientos de alta precisión.",
        "Cero, el gage debe fabricarse sin tolerancia detectable."
      ],
      correct: 2,
      explanation: "Fundamentación ASME B89.1.5: La regla 10:1 (o 10%) establece que la tolerancia combinada del fabricante del gage no debe exceder el 10% de la tolerancia total de la característica inspeccionada."
    },
    {
      q: "3. ¿En qué escenario técnico la norma ASME B89.7.3.1 exige o recomienda fuertemente el uso de Guardbanding (Aceptación Restringida)?",
      options: [
        "Siempre que el Test Uncertainty Ratio (TUR) sea menor a 4:1 para proteger contra falsas aceptaciones (Riesgo del Consumidor).",
        "Únicamente cuando la pieza esté fabricada en carburo de tungsteno.",
        "Cuando la temperatura de medición sea estrictamente igual a 20.0 °C.",
        "Solo si el cliente exige rechazar el 100% de la producción."
      ],
      correct: 0,
      explanation: "Fundamentación ASME B89.7.3.1: Cuando el TUR cae por debajo de 4:1, la incertidumbre de medición se vuelve significativa frente a la tolerancia, por lo que se aplica un guardband (g = 1.0·U) para mantener el riesgo del consumidor β ≤ 2%."
    },
    {
      q: "4. En la política de Asignación Absoluta (Pessimistic Practice) de ASME Y14.43 para un calibrador tapón cilíndrico (Plug Gage), ¿dónde se ubican las tolerancias del gage?",
      options: [
        "Fuera de los límites de tolerancia de la pieza para maximizar la producción.",
        "Íntegramente dentro de los límites de tolerancia del producto, garantizando cero piezas no conformes aceptadas.",
        "Centradas simétricamente sobre el límite nominal (50% adentro, 50% afuera).",
        "Únicamente en el extremo NO-GO."
      ],
      correct: 1,
      explanation: "Fundamentación ASME Y14.43: La Práctica Absoluta sitúa el 100% de la tolerancia del gage dentro de los límites del producto, absorbiendo el riesgo en la manufactura del gage y asegurando que ninguna pieza aceptada sea defectuosa."
    },
    {
      q: "5. Conforme a ASME B89.6.2, ¿cuál es la temperatura de referencia internacional estándar para todas las especificaciones y mediciones dimensionales?",
      options: [
        "25 °C (77 °F)",
        "0 °C (32 °F)",
        "20 °C (68 °F)",
        "22 °C (71.6 °F)"
      ],
      correct: 2,
      explanation: "Fundamentación ASME B89.6.2 / ISO 1: La temperatura internacional de referencia fijada para la metrología dimensional y definición de cotas geométricas es 20 °C (68 °F)."
    }
  ];

  function setupQuiz() {
    const quizContainer = document.getElementById('quizQuestionsContainer');
    if (!quizContainer) return;

    let html = '';
    QUIZ_DATA.forEach((item, qIdx) => {
      html += `
        <div class="quiz-card" data-qindex="${qIdx}">
          <div class="quiz-question">${item.q}</div>
          <div class="quiz-options">
            ${item.options.map((opt, oIdx) => `
              <div class="quiz-option" data-option="${oIdx}">
                <span style="font-weight:700; width:20px;">${String.fromCharCode(65 + oIdx)})</span>
                <span>${opt}</span>
              </div>
            `).join('')}
          </div>
          <div class="quiz-feedback" id="feedback-${qIdx}"></div>
        </div>
      `;
    });
    quizContainer.innerHTML = html;

    // Option click handling
    const quizCards = quizContainer.querySelectorAll('.quiz-card');
    quizCards.forEach(card => {
      const qIdx = parseInt(card.getAttribute('data-qindex'));
      const options = card.querySelectorAll('.quiz-option');
      const feedback = card.querySelector('.quiz-feedback');

      options.forEach(opt => {
        opt.addEventListener('click', () => {
          const selectedIdx = parseInt(opt.getAttribute('data-option'));
          const correctIdx = QUIZ_DATA[qIdx].correct;

          options.forEach(o => o.classList.remove('selected', 'correct', 'incorrect'));
          opt.classList.add('selected');

          feedback.style.display = 'block';
          if (selectedIdx === correctIdx) {
            opt.classList.add('correct');
            feedback.className = 'quiz-feedback callout success';
            feedback.innerHTML = `<strong>¡Respuesta Correcta!</strong> ${QUIZ_DATA[qIdx].explanation}`;
          } else {
            opt.classList.add('incorrect');
            options[correctIdx].classList.add('correct');
            feedback.className = 'quiz-feedback callout danger';
            feedback.innerHTML = `<strong>Incorrecto.</strong> ${QUIZ_DATA[qIdx].explanation}`;
          }
        });
      });
    });
  }

  // Diagrams for slide view (Slide 7 y Slide 9)
  function renderAllSlideDiagrams() {
    renderGageToleranceDiagram('slideGageSvg', {
      gageType: 'plug',
      unitLabel: 'mm',
      nominal: 25.0,
      partTol: 0.05,
      goMin: 25.002,
      goMax: 25.004,
      nogoMin: 25.048,
      nogoMax: 25.050,
      wearVal: 0.002,
      gageTolVal: 0.002
    });

    renderGuardbandSvg('slideGuardbandSvg', {
      lsl: 24.980,
      usl: 25.020,
      u95: 0.0025,
      guardband: 0.0025,
      lowerAccept: 24.9825,
      upperAccept: 25.0175
    });
  }

  // Run on DOM loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
