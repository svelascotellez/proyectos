/**
 * AetherFlow Database Seed Data
 * Generates highly realistic, high-fidelity mock projects, financials, tasks, and communications.
 */

window.AetherSeed = {
  team: [
    { id: "elena", name: "Elena Rostova", role: "UX Designer", rate: 55, color: "#8b5cf6", activeTasks: 2 },
    { id: "lucas", name: "Lucas Bennett", role: "Backend Engineer", rate: 70, color: "#3b82f6", activeTasks: 5 },
    { id: "carlos", name: "Carlos Méndez", role: "DevOps Engineer", rate: 65, color: "#10b981", activeTasks: 1 },
    { id: "sofia", name: "Sofía Chen", role: "QA Analyst & PO", rate: 50, color: "#f59e0b", activeTasks: 3 }
  ],
  
  projects: [
    {
      id: "proj_001",
      name: "Rediseño Core Bancario",
      client: "Banco Multilateral",
      description: "Migración completa del núcleo transaccional legado hacia una arquitectura moderna basada en microservicios y bases de datos distribuidas con alta tolerancia a fallos.",
      status: "active",
      category: "Tecnología",
      budget: 95000,
      startDate: "2026-04-01",
      endDate: "2026-08-15",
      createdAt: "2026-04-01T08:00:00Z",
      tasks: [
        {
          id: "task_101",
          name: "Levantamiento e Inventario de APIs Legadas",
          description: "Mapear todos los endpoints activos en el mainframe COBOL y documentar sus payloads.",
          status: "done",
          estimatedHours: 40,
          spentHours: 38,
          priority: "high",
          assignee: "lucas"
        },
        {
          id: "task_102",
          name: "Propuesta de Prototipo UI/UX para Cajeros",
          description: "Generar layouts interactivos con Figma y validarlos con el equipo de innovación del banco.",
          status: "done",
          estimatedHours: 30,
          spentHours: 32,
          priority: "medium",
          assignee: "elena"
        },
        {
          id: "task_103",
          name: "Arquitectura de Clúster Kubernetes e IAC",
          description: "Definir infraestructura como código mediante Terraform para levantar clústeres en AWS y Azure.",
          status: "in-progress",
          estimatedHours: 45,
          spentHours: 35,
          priority: "high",
          assignee: "carlos"
        },
        {
          id: "task_104",
          name: "Migración de Base de Datos relacional SQL",
          description: "Desarrollar y ejecutar scripts ETL para migrar registros históricos sin pérdida de consistencia.",
          status: "todo",
          estimatedHours: 60,
          spentHours: 0,
          priority: "high",
          assignee: "lucas"
        },
        {
          id: "task_105",
          name: "Auditoría de Penetración y Criptografía",
          description: "Pruebas de vulnerabilidad de capa OWASP y cifrado AES-256 en reposo.",
          status: "todo",
          estimatedHours: 20,
          spentHours: 0,
          priority: "high",
          assignee: "sofia"
        }
      ],
      expenses: [
        { id: "exp_101", category: "Licencias", amount: 5400, date: "2026-04-05", description: "Suscripción anual AWS Advanced Architect Suite" },
        { id: "exp_102", category: "Viajes", amount: 1200, date: "2026-04-12", description: "Vuelos y estadía para talleres de alineación en oficinas corporativas" },
        { id: "exp_103", category: "Materiales", amount: 350, date: "2026-04-20", description: "Pizarras magnéticas y kits de prototipado físico" }
      ],
      documents: [
        { id: "doc_101", name: "Contrato_Firmado_Banco_Multilateral.pdf", type: "pdf", size: "4.2 MB", date: "2026-04-02" },
        { id: "doc_102", name: "Arquitectura_Core_Microservicios_v2.1.png", type: "image", size: "12.8 MB", date: "2026-04-15" },
        { id: "doc_103", name: "Especificaciones_Criptograficas.docx", type: "document", size: "1.4 MB", date: "2026-04-20" }
      ],
      emails: [
        { id: "em_101", from: "Alejandro Ruiz (Gerente Innovación Banco)", subject: "Aprobación de Prototipos de UI/UX", body: "Hola Elena, revisamos la propuesta de los flujos de cajeros y nos parece espectacular. Pueden proceder a la fase de maquetado front-end.", date: "2026-04-16T15:30:00Z" },
        { id: "em_102", from: "Lucas Bennett", subject: "Bloqueo técnico en pruebas COBOL", body: "Equipo, la conexión VPN del mainframe de desarrollo está inestable hoy. Envié ticket de soporte al banco para que lo revisen con urgencia.", date: "2026-04-25T09:12:00Z" }
      ]
    },
    {
      id: "proj_002",
      name: "App Móvil de Delivery Go",
      client: "Sistemas Logísticos Express",
      description: "Plataforma móvil nativa de entregas rápidas (iOS & Android) que integra localización por GPS en tiempo real, ruteo inteligente y pasarela de pago diversificada.",
      status: "active",
      category: "Tecnología",
      budget: 35000,
      startDate: "2026-03-01",
      endDate: "2026-05-30",
      createdAt: "2026-03-01T09:00:00Z",
      tasks: [
        {
          id: "task_201",
          name: "Integración de Mapas y Ruteo Inteligente",
          description: "Conectar SDK de Google Maps para el cálculo dinámico de trayectorias óptimas de repartidores.",
          status: "in-progress",
          estimatedHours: 50,
          spentHours: 65,
          priority: "high",
          assignee: "lucas"
        },
        {
          id: "task_202",
          name: "Pasarela de Pagos Stripe & Apple Pay",
          description: "Desarrollar flujos seguros de checkout para tarjetas de crédito, débito y billeteras móviles.",
          status: "in-progress",
          estimatedHours: 35,
          spentHours: 38,
          priority: "high",
          assignee: "lucas"
        },
        {
          id: "task_203",
          name: "Diseño de Interfaces de Pantalla y Flujos",
          description: "Diseño visual de las apps de Usuario, Repartidor y Negocio Asociado.",
          status: "done",
          estimatedHours: 40,
          spentHours: 52,
          priority: "high",
          assignee: "elena"
        },
        {
          id: "task_204",
          name: "Configuración de Notificaciones Push",
          description: "Configurar Firebase Cloud Messaging para alertas en tiempo real sobre el estado del pedido.",
          status: "todo",
          estimatedHours: 20,
          spentHours: 0,
          priority: "medium",
          assignee: "sofia"
        },
        {
          id: "task_205",
          name: "Pruebas de Carga en Backend de Ubicación",
          description: "Simular 5,000 conexiones concurrentes reportando coordenadas GPS por websocket.",
          status: "todo",
          estimatedHours: 15,
          spentHours: 0,
          priority: "medium",
          assignee: "sofia"
        }
      ],
      expenses: [
        { id: "exp_201", category: "Servicios", amount: 8900, date: "2026-03-10", description: "Adquisición de hardware de prueba (Dispositivos iOS y Android de gama media/baja)" },
        { id: "exp_202", category: "Licencias", amount: 4800, date: "2026-03-25", description: "Consola de Google Cloud Services (Mapas y Directions API) prepago" },
        { id: "exp_203", category: "Dietas", amount: 850, date: "2026-04-18", description: "Catering y cenas de desvelo para hackathon interna de integración" }
      ],
      documents: [
        { id: "doc_201", name: "Propuesta_Economica_Aprobada.pdf", type: "pdf", size: "2.1 MB", date: "2026-03-02" },
        { id: "doc_202", name: "Assets_Graficos_Resoluciones.zip", type: "archive", size: "34.5 MB", date: "2026-03-28" }
      ],
      emails: [
        { id: "em_201", from: "Rogelio Garza (CEO Sistemas Logísticos)", subject: "Preocupación por consumo de API de Mapas", body: "Estimados, notamos que el presupuesto de Google Maps de prueba se agotó muy rápido este mes. ¿Hay algún bucle infinito en las peticiones GPS del background?", date: "2026-04-20T17:45:00Z" },
        { id: "em_202", from: "Elena Rostova", subject: "Assets de Tiendas listos", body: "Subí a la carpeta del proyecto los iconos vectoriales de todas las categorías de tiendas para la visualización en el mapa principal.", date: "2026-03-30T10:15:00Z" }
      ]
    },
    {
      id: "proj_003",
      name: "Estrategia Global de Redes",
      client: "Cosméticos Aura",
      description: "Campaña publicitaria multicanal de lanzamiento de marca orgánica en Latinoamérica. Creación de contenidos digitales y optimización de pauta.",
      status: "completed",
      category: "Marketing",
      budget: 18000,
      startDate: "2026-01-15",
      endDate: "2026-03-20",
      createdAt: "2026-01-15T10:00:00Z",
      tasks: [
        {
          id: "task_301",
          name: "Definición del Plan de Medios y KPIs",
          description: "Fijar metas de Costo por Lead y Click-Through Rate (CTR) para cada canal digital.",
          status: "done",
          estimatedHours: 15,
          spentHours: 14,
          priority: "high",
          assignee: "sofia"
        },
        {
          id: "task_302",
          name: "Producción Audiovisual de Reels y Tiktok Ads",
          description: "Grabar y editar 12 videos de producto interactivos utilizando tendencias orgánicas.",
          status: "done",
          estimatedHours: 40,
          spentHours: 38,
          priority: "high",
          assignee: "elena"
        },
        {
          id: "task_303",
          name: "Redacción del Copy de Anuncios",
          description: "Generar copies llamativos y persuasivos adaptados para cada país de la región.",
          status: "done",
          estimatedHours: 20,
          spentHours: 18,
          priority: "medium",
          assignee: "sofia"
        },
        {
          id: "task_304",
          name: "Configuración y Pauta Paid Search & Social",
          description: "Programación de campañas en Meta Ads Manager y Google Ads.",
          status: "done",
          estimatedHours: 25,
          spentHours: 25,
          priority: "high",
          assignee: "carlos"
        }
      ],
      expenses: [
        { id: "exp_301", category: "Servicios", amount: 6500, date: "2026-01-20", description: "Pauta directa asignada a Meta Ads" },
        { id: "exp_302", category: "Licencias", amount: 450, date: "2026-01-18", description: "Licencia temporal de música comercial para videos publicitarios" }
      ],
      documents: [
        { id: "doc_301", name: "Reporte_Performance_Campana_Final.pdf", type: "pdf", size: "5.8 MB", date: "2026-03-22" },
        { id: "doc_302", name: "Guion_Audiovisual_Cosmeticos.docx", type: "document", size: "850 KB", date: "2026-01-22" }
      ],
      emails: [
        { id: "em_301", from: "Gabriela Montes (Directora Aura)", subject: "Éxito total en el Lanzamiento", body: "Equipo, superamos las metas de leads en un 35% y el costo de adquisición se mantuvo abajo de lo estimado. ¡Gran trabajo! Nos vemos para la campaña de invierno.", date: "2026-03-21T18:00:00Z" }
      ]
    }
  ]
};
