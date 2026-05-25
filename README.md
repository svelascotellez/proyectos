# 🌌 AetherFlow // Inteligencia en Administración de Proyectos

AetherFlow es una plataforma web premium de tipo **SPA (Single Page Application)** diseñada para la gestión inteligente, visualización de datos y diagnóstico en tiempo real de portafolios de proyectos. La aplicación combina una estética visual vanguardista (basada en el diseño semitransparente *glassmorphism* y transiciones fluidas) con un motor analítico heurístico local que simula asistencia de Inteligencia Artificial para el equipo de gestión.

---

## 🚀 Características Clave

### 1. Cuadro de Mando Global (Dashboard)
* **Métricas Clave en Tiempo Real**: Proyectos activos, capital total administrado, tareas pendientes y margen de rentabilidad neto del portafolio.
* **AetherAI Copilot Global**: Un panel analítico superior que evalúa la salud de todo el portafolio en tiempo real, emitiendo recomendaciones dinámicas mediante un efecto visual de máquina de escribir (*typewriter effect*).
* **Gráficos Dinámicos Nativos (SVG)**: Visualizaciones personalizadas sin librerías externas pesadas:
  * *Presupuesto vs. Costo Real*: Gráfico de barras comparativo de finanzas por proyecto.
  * *Categorías*: Gráfico de dona que clasifica el portafolio por sectores (Tecnología, Operaciones, etc.).
  * *Bandeja de Trabajo y Capacidad*: Gráficos de barra horizontal de carga de tareas por especialista de equipo.

### 2. Directorio de Iniciativas
* **Búsqueda y Filtrado Avanzado**: Filtros inmediatos por texto, estado del proyecto (Activo, Completado) e índice de riesgo estimado por la IA.
* **Creación de Proyectos**: Formulario interactivo con soporte de **Plantillas Ágiles Preconfiguradas** (Lanzamiento de Software, Campaña de Marketing, Construcción) que inicializan la iniciativa con una estructura de hitos base de forma instantánea.

### 3. Ficha Técnica y Área de Trabajo (*Workspace*)
* **Resumen General**: Progreso técnico y financiero representado mediante barras de porcentaje interactivas, cálculo automático de días transcurridos y determinación de la **ruta crítica inmediata**.
* **Tablero Kanban Interactivo**:
  * Control del flujo ágil de hitos mediante **Drag-and-Drop** (Arrastrar y Soltar) nativo.
  * Botones rápidos de marcado rápido (completar tarea) y remoción.
* **Planificador Gantt**: Cronograma visual detallado que alinea el avance, estimación y secuencia temporal de las tareas semanalmente.
* **Presupuestos e Inversión (Ledger)**: Historial financiero detallado que divide los costos en mano de obra técnica (tarifa por hora del recurso) y egresos directos de capital (materiales, licencias, viajes, etc.).
* **Bóveda de Documentos**: Gestor simulado de archivos compartidos (PDF, imágenes, archivos comprimidos) con cálculo de tamaño e indicador de carga de red.
* **Historial de Comunicación**: Registro cronológico de retroalimentación con el cliente, con un simulador interactivo de correos entrantes del cliente.
* **AetherAI Heurísticas**: Diagnósticos avanzados que exponen advertencias financieras específicas, cuellos de botella de prioridad y predicciones de retraso en la entrega.

### 4. Temporizador y Costeo de Mano de Obra
* **Widget de Cronómetro Tildante**: Un temporizador activo permanente en la barra lateral lateral que permite medir los segundos dedicados a un hito.
* **Liquidación de Labor**: Convierte los segundos registrados en horas decimales (ej. 45 min = 0.75h) y calcula automáticamente el costo generado multiplicándolo por la tarifa horaria individual de cada especialista asignado.

---

## 🛠️ Arquitectura Técnica

La plataforma está diseñada con una arquitectura de cliente puro (**Vanilla JS / CSS3 / HTML5**), garantizando un rendimiento óptimo, independencia de frameworks complejos y un tiempo de carga inmediato.

```
📂 Proyectos
 ├── 📂 data
 │    └── seed.js             # Datos base iniciales y estructura de plantillas
 ├── 📂 js
 │    ├── app.js              # Controlador principal, navegación SPA y bindings de UI
 │    ├── ai.js               # Motor analítico, cálculo de riesgos y asignación de tareas
 │    ├── charts.js           # Generador dinámico de gráficos vectoriales SVG
 │    └── templates.js        # Estructura de plantillas de proyectos precargadas
 ├── index.html               # Estructura semántica HTML5 y modales
 ├── style.css                # Sistema de diseño, variables HSL y soporte de Dark Mode
 └── README.md                # Documentación del proyecto (Este archivo)
```

### 🧠 El Motor Analítico AetherAI (`js/ai.js`)
El motor inteligente utiliza algoritmos deterministas locales que evalúan las variables del proyecto y del equipo:
1. **Asignación Sugerida de Tareas**: Lee palabras clave del título del hito (ej: `API`, `Figma`, `Testing`, `Pipeline`) y cruza los datos con las especialidades del equipo y su carga actual. Sugiere al profesional más idóneo con la bandeja de entrada más libre.
2. **Índice de Riesgo**: Analiza la desviación entre el tiempo cronológico consumido y la tasa de finalización de tareas. Si la desviación temporal supera el `20%`, el proyecto se etiqueta en **Riesgo Medio** o **Riesgo Alto**.
3. **Advertencias Financieras**: Evalúa el consumo presupuestario acumulado. Si se ha gastado más del `90%` del capital asignado pero el avance técnico es inferior al `80%`, genera una alerta crítica de sobrecosto inminente.

---

## 🎨 Sistema de Diseño y Estética Premium

AetherFlow implementa un estándar de diseño state-of-the-art:
* **Tema Híbrido (Obsidian / Cool Gray)**: Selector dinámico en la cabecera flotante que alterna entre un tema oscuro basado en negros volcánicos y grises profundos, y un tema claro de alta legibilidad.
* **Glow & Glassmorphism**: Bordes semitransparentes sutiles, efectos de desenfoque de fondo (*backdrop-filter*) y sombras con gradientes luminosos.
* **Tipografía e Iconografía**: Integración directa de Google Fonts (fuente sans-serif moderna) e iconos vectoriales mediante la CDN de Lucide Icons.

---

## 🔌 Cómo Ejecutar la Aplicación

Al ser una aplicación 100% de cliente, no requiere compilación ni instalación de bases de datos externas. Todo el estado se sincroniza en el almacenamiento local del navegador (`localStorage`).

### 1. Servidor de Desarrollo Local
Para evitar restricciones de seguridad del navegador al cargar recursos y scripts locales, se recomienda utilizar un servidor HTTP ligero. 

Puedes iniciarlo con Python desde la consola en la carpeta raíz del proyecto:
```powershell
python -m http.server 8000
```

Luego, accede a la siguiente dirección en tu navegador:
```
http://localhost:8000
```

### 2. Persistencia de Datos
* La aplicación se inicializa automáticamente con los datos simulados de `data/seed.js`.
* Cualquier cambio (crear proyectos, mover tareas en el Kanban, registrar gastos, iniciar temporizadores) se guarda de forma persistente en el `localStorage` del navegador bajo la clave `aether_db`. Para restablecer el sistema, basta con limpiar los datos de navegación del sitio.
