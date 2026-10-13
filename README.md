# Capacitación Empresarial: Tolerancias Metrológicas para Gages (ASME)

> **Expositora Oficial:** Ing. Patricia Flores Reyes  
> **Organización:** All Measuring Gage  
> **Marco Normativo:** ASME B89.1.5, ASME B89.7.3.1, ASME Y14.43, ASME B89.6.2, ASME B1.2  

---

## 🎯 Descripción del Proyecto

Aplicación web interactiva de alto rigor técnico diseñada para la presentación de capacitación empresarial, manual de referencia de ingeniería y laboratorio de cálculo para inspectores de calidad, metrólogos y diseñadores.

### ✨ Funcionalidades Principales

1. **🖥️ Modo Presentación (Diapositivas Interactivas):**
   - 13 diapositivas de alta ingeniería con navegación fluida.
   - Atajos de teclado: `[←]` / `[→]`, `[Espacio]`, `[F]` (pantalla completa), `[N]` (notas de la oradora).
   - Notas técnicas dedicadas para la **Ing. Patricia Flores Reyes**.
   - Cronómetro de exposición en tiempo real integrado.

2. **📖 Modo Manual Técnico (Documento Exhaustivo):**
   - Texto técnico continuo con referencias a cláusulas ASME y fórmulas en LaTeX / KaTeX.
   - Índice lateral flotante interactivo (TOC).
   - Optimizado para impresión o exportación directa a formato PDF.

3. **🧮 Laboratorio de Cálculo Interactivo:**
   - **Calculadora 1 (ASME B89.1.5 & Y14.43):** Dimensionamiento de calibradores cilíndricos plug/ring, clase recomendada (XX, X, Y, Z, ZZ), comprobación de la regla 10:1, margen de desgaste (*Wear Allowance*) y renderizado dinámico en SVG.
   - **Calculadora 2 (ASME B89.7.3.1):** Evaluación de Test Uncertainty Ratio (TUR), zonas de aceptación estricta con guardband ($g = r \cdot U$) y control del riesgo del consumidor ($\beta \le 2\%$).
   - **Calculadora 3 (ASME B89.6.2):** Análisis de dilatación térmica diferencial entre materiales a temperaturas distintas a 20 °C.

4. **📝 Quiz de Evaluación de Aprendizaje:**
   - Preguntas técnicas de opción múltiple con retroalimentación fundamentada en normas ASME.

---

## 🚀 Guía de Despliegue en GitHub y GitHub Pages

Para publicar esta capacitación en internet de forma gratuita y que se actualice cada vez que solicites cambios aquí:

### Paso 1: Crear el repositorio en GitHub
1. Inicia sesión en [GitHub](https://github.com).
2. Haz clic en **New repository** (o el botón `+` en la esquina superior derecha).
3. Asigna un nombre a tu repositorio (por ejemplo: `capacitacion-gages-asme`).
4. Selecciona **Public**.
5. **No marques** "Add a README" ni "Add .gitignore" (ya los tenemos creados aquí).
6. Haz clic en **Create repository**.

### Paso 2: Vincular este proyecto local a tu repositorio de GitHub
Abre tu terminal en esta carpeta (`c:\Users\madia\Documents\antigravity\vibrant-hubble`) y ejecuta los siguientes comandos (sustituyendo `TU-USUARIO` y `TU-REPOSITORIO` por los tuyos):

```powershell
# 1. Registrar todos los archivos iniciales
git add .
git commit -m "feat: publicacion inicial capacitacion tolerancias metrologicas ASME"

# 2. Renombrar la rama a main (recomendado por GitHub)
git branch -M main

# 3. Vincular con tu repositorio en GitHub
git remote add origin https://github.com/TU-USUARIO/capacitacion-gages-asme.git

# 4. Subir los archivos por primera vez
git push -u origin main
```

*(Si usas autenticación por SSH o GitHub CLI, también puedes usar `git@github.com:...`)*

### Paso 3: Activar GitHub Pages (Página Web Pública)
1. En tu repositorio de GitHub, dirígete a la pestaña **Settings** (Configuración).
2. En el menú lateral izquierdo, haz clic en **Pages**.
3. En la sección **Build and deployment**:
   - **Source:** Selecciona `Deploy from a branch`.
   - **Branch:** Selecciona `main` (o `master`) y la carpeta `/ (root)`.
   - Haz clic en **Save**.
4. Espera entre 30 y 60 segundos. GitHub te mostrará el enlace público en verde:
   `https://TU-USUARIO.github.io/capacitacion-gages-asme/`

---

## 🔄 Flujo de Trabajo para Pedirme Modificaciones y Actualizar Automáticamente

Cuando desees cambiar contenido, agregar diapositivas, ajustar fórmulas o personalizar logotipos:

1. **Pídeme la modificación directamente en el chat:**
   *Ejemplo: "Agrega una diapositiva sobre calibración de anillos patrón clase XX" o "Cambia el color de acento a verde".*
2. Yo editaré los archivos correspondientes en tu carpeta de trabajo.
3. Para sincronizar los cambios hacia GitHub Pages, simplemente ejecuta el script automático:
   - En Windows: Haz doble clic en `sync.bat` o ejecuta en PowerShell:
     ```powershell
     .\sync.ps1 "Modificaciones solicitadas a la capacitacion"
     ```
   - O manualmente mediante los comandos estándar:
     ```bash
     git add .
     git commit -m "Actualizacion de capacitacion"
     git push
     ```
4. GitHub Pages detectará el nuevo `push` y en menos de 1 minuto el sitio web publicado se actualizará en vivo.

---

## 🛠️ Tecnologías Empleadas
- **HTML5 Semántico:** Estructura limpia y accesible.
- **CSS3 Moderno:** Variables CSS, diseño responsivo, temas Dark/Light, Glassmorphism y estilos de impresión.
- **JavaScript Vanilla (ES6+):** Motor de presentación sin dependencias externas pesadas ni compilación.
- **KaTeX:** Renderizado matemático ultrarrápido de fórmulas metrológicas.
- **SVG Dinámico:** Diagramas vectoriales de zonas de tolerancia e incertidumbre renderizados en tiempo real.
