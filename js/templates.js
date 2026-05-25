/**
 * AetherFlow Project Templates Blueprints
 * Defines standardized tasks, durations, budgets, and milestones for project acceleration.
 */

window.AetherTemplates = {
  softwareLaunch: {
    id: "softwareLaunch",
    name: "Lanzamiento de Software",
    description: "Plan de desarrollo ágil que incluye fases de planificación, desarrollo, pruebas beta y despliegue final.",
    defaultBudget: 45000,
    estimatedDurationDays: 60,
    category: "Tecnología",
    tasks: [
      {
        name: "Definición del Backlog y Requerimientos",
        description: "Reuniones iniciales con stakeholders para refinar las historias de usuario y alcances del MVP.",
        status: "done",
        estimatedHours: 16,
        priority: "high",
        suggestedRole: "Gerente de Producto"
      },
      {
        name: "Diseño UX/UI de Alta Fidelidad",
        description: "Crear mockups interactivos en Figma y definir el sistema de diseño visual corporativo.",
        status: "done",
        estimatedHours: 40,
        priority: "high",
        suggestedRole: "Diseñadora UI"
      },
      {
        name: "Configuración de Arquitectura y Base de Datos",
        description: "Montar el repositorio central, definir esquemas de tablas e integrar servicios en la nube.",
        status: "in-progress",
        estimatedHours: 24,
        priority: "high",
        suggestedRole: "Ingeniero Backend"
      },
      {
        name: "Desarrollo del Core Front-end",
        description: "Implementación de vistas responsivas, componentes clave y rutas primarias de la aplicación.",
        status: "todo",
        estimatedHours: 80,
        priority: "high",
        suggestedRole: "Desarrollador Frontend"
      },
      {
        name: "Implementación de APIs Backend",
        description: "Crear endpoints seguros, autenticación JWT e integración de pagos automatizados.",
        status: "todo",
        estimatedHours: 64,
        priority: "medium",
        suggestedRole: "Ingeniero Backend"
      },
      {
        name: "Pruebas de Calidad y QA Automatizado",
        description: "Desarrollar suite de pruebas unitarias, de integración y auditoría de seguridad OWASP.",
        status: "todo",
        estimatedHours: 32,
        priority: "high",
        suggestedRole: "Especialista QA"
      },
      {
        name: "Despliegue y Configuración CI/CD",
        description: "Automatización de pipelines y lanzamiento oficial en servidores de producción seguros.",
        status: "todo",
        estimatedHours: 12,
        priority: "medium",
        suggestedRole: "DevOps Engineer"
      }
    ]
  },
  marketingCampaign: {
    id: "marketingCampaign",
    name: "Campaña de Marketing Digital",
    description: "Estrategia integral que cubre investigación de mercado, creación de contenidos, pauta publicitaria e informes de rendimiento.",
    defaultBudget: 15000,
    estimatedDurationDays: 30,
    category: "Marketing",
    tasks: [
      {
        name: "Análisis Competitivo y Target Persona",
        description: "Definir los segmentos clave y analizar las tácticas publicitarias activas de los competidores.",
        status: "done",
        estimatedHours: 12,
        priority: "medium",
        suggestedRole: "Estratega Digital"
      },
      {
        name: "Redacción de Copy y Guiones Creativos",
        description: "Escribir contenidos persuasivos para anuncios en redes sociales, landing pages y correos electrónicos.",
        status: "in-progress",
        estimatedHours: 20,
        priority: "high",
        suggestedRole: "Copywriter"
      },
      {
        name: "Diseño Gráfico y Producción de Video",
        description: "Producción de banners atractivos y videos cortos optimizados para Instagram, TikTok y YouTube Ads.",
        status: "todo",
        estimatedHours: 35,
        priority: "high",
        suggestedRole: "Diseñadora UI"
      },
      {
        name: "Configuración de Campañas Paid Ads",
        description: "Establecer píxeles de seguimiento, definir presupuestos diarios y configurar audiencias en Meta y Google Ads.",
        status: "todo",
        estimatedHours: 10,
        priority: "high",
        suggestedRole: "Media Buyer"
      },
      {
        name: "Lanzamiento y Optimización Semanal",
        description: "Monitorear conversiones, ajustar costos por click (CPC) y redistribuir presupuestos de pauta.",
        status: "todo",
        estimatedHours: 15,
        priority: "medium",
        suggestedRole: "Media Buyer"
      },
      {
        name: "Reporte de KPIs e Impacto de Retorno (ROI)",
        description: "Consolidar leads generados, CAC (costo de adquisición) e ingresos atribuidos directos en un panel analítico.",
        status: "todo",
        estimatedHours: 8,
        priority: "low",
        suggestedRole: "Estratega Digital"
      }
    ]
  },
  constructionPlan: {
    id: "constructionPlan",
    name: "Diseño y Construcción Comercial",
    description: "Cronograma estructurado para la planificación arquitectónica, gestión de permisos oficiales y fases iniciales de construcción.",
    defaultBudget: 180000,
    estimatedDurationDays: 120,
    category: "Construcción",
    tasks: [
      {
        name: "Estudios Geotécnicos y de Suelo",
        description: "Analizar la capacidad de carga del terreno y topografía del lote para cimentación segura.",
        status: "done",
        estimatedHours: 24,
        priority: "high",
        suggestedRole: "Ingeniero Civil"
      },
      {
        name: "Planos Arquitectónicos Finales",
        description: "Desarrollar y validar los planos estructurales, mecánicos, eléctricos e hidráulicos en CAD.",
        status: "done",
        estimatedHours: 80,
        priority: "high",
        suggestedRole: "Arquitecto Líder"
      },
      {
        name: "Tramitación de Licencias y Permisos",
        description: "Gestión de permisos ante la secretaría de urbanismo y auditorías ecológicas gubernamentales.",
        status: "in-progress",
        estimatedHours: 48,
        priority: "high",
        suggestedRole: "Asesor Legal"
      },
      {
        name: "Preparación del Terreno y Excavaciones",
        description: "Nivelación del área, excavación de zanjas y colocación de barreras de contención contra agua.",
        status: "todo",
        estimatedHours: 60,
        priority: "high",
        suggestedRole: "Jefe de Obra"
      },
      {
        name: "Vaciado de Cimientos y Estructura Base",
        description: "Colado de zapatas de concreto armado y levantamiento de columnas de soporte principales.",
        status: "todo",
        estimatedHours: 120,
        priority: "high",
        suggestedRole: "Jefe de Obra"
      },
      {
        name: "Supervisión de Calidad e Inspección",
        description: "Auditoría técnica de resistencia del concreto curado y validación de las instalaciones básicas.",
        status: "todo",
        estimatedHours: 16,
        priority: "high",
        suggestedRole: "Ingeniero Civil"
      }
    ]
  }
};
