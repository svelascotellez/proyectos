/**
 * AetherAI: Clientside Project Analytics & Advisory Engine
 * Simulates high-end AI recommendations, risk warnings, and allocation optimization
 * using deterministic heuristics on live project statistics.
 */

window.AetherAI = {
  /**
   * Suggests the absolute best team member for a new task based on role matching and current workload.
   * @param {Object} taskData - Object containing task name, description, priority, etc.
   * @param {Array} team - List of team members
   * @param {Array} projects - List of all projects (to compute real active workloads)
   */
  getOptimalAssignee(taskData, team, projects) {
    const taskName = (taskData.name || "").toLowerCase();
    const taskDesc = (taskData.description || "").toLowerCase();
    const combinedText = `${taskName} ${taskDesc}`;

    // Compute live workloads
    const activeTasksMap = {};
    team.forEach(t => { activeTasksMap[t.id] = 0; });
    projects.forEach(p => {
      if (p.status === "active") {
        p.tasks.forEach(t => {
          if (t.status !== "done" && t.assignee && activeTasksMap[t.assignee] !== undefined) {
            activeTasksMap[t.assignee]++;
          }
        });
      }
    });

    // Score candidates based on keywords + availability
    const candidates = team.map(member => {
      let roleScore = 0;
      const role = (member.role || "").toLowerCase();
      const name = (member.name || "").toLowerCase();

      // Keyword matching matching
      if (role.includes("ux") || role.includes("design") || name.includes("elena")) {
        if (combinedText.includes("diseño") || combinedText.includes("ux") || combinedText.includes("ui") || combinedText.includes("figma") || combinedText.includes("pantalla") || combinedText.includes("interfaz") || combinedText.includes("maquetado")) {
          roleScore += 10;
        }
      }
      if (role.includes("backend") || role.includes("engine") || name.includes("lucas")) {
        if (combinedText.includes("api") || combinedText.includes("base de datos") || combinedText.includes("backend") || combinedText.includes("servidor") || combinedText.includes("sql") || combinedText.includes("migración") || combinedText.includes("stripe")) {
          roleScore += 10;
        }
      }
      if (role.includes("devops") || name.includes("carlos")) {
        if (combinedText.includes("despliegue") || combinedText.includes("clúster") || combinedText.includes("cloud") || combinedText.includes("terraform") || combinedText.includes("aws") || combinedText.includes("pipeline") || combinedText.includes("seguridad")) {
          roleScore += 10;
        }
      }
      if (role.includes("qa") || role.includes("analyst") || name.includes("sofia")) {
        if (combinedText.includes("pruebas") || combinedText.includes("qa") || combinedText.includes("test") || combinedText.includes("auditoría") || combinedText.includes("validación") || combinedText.includes("stakeholders")) {
          roleScore += 10;
        }
      }

      // Workload penalties: -2 points per active task
      const activeTasks = activeTasksMap[member.id] || 0;
      const workloadScore = -2 * activeTasks;

      return {
        member,
        activeTasks,
        totalScore: roleScore + workloadScore,
        roleMatch: roleScore > 0
      };
    });

    // Sort by highest score
    candidates.sort((a, b) => b.totalScore - a.totalScore);
    const primary = candidates[0];

    // Build the AI explanation explanation
    let explanation = "";
    if (primary.roleMatch) {
      explanation = `Recomendado por especialidad técnica (${primary.member.role}). `;
    } else {
      explanation = `Recomendado por disponibilidad óptima. `;
    }

    if (primary.activeTasks === 0) {
      explanation += "Actualmente cuenta con su bandeja de tareas libre, permitiendo una entrega rápida.";
    } else if (primary.activeTasks >= 4) {
      explanation += `¡Alerta! Cuenta con carga elevada (${primary.activeTasks} tareas activas), pero posee el perfil técnico ideal.`;
    } else {
      explanation += `Tiene una carga balanceada de ${primary.activeTasks} tareas en paralelo.`;
    }

    return {
      recommendedId: primary.member.id,
      recommendedName: primary.member.name,
      recommendedColor: primary.member.color,
      explanation
    };
  },

  /**
   * Generates high-fidelity project risk evaluations, calculating deviations and forecasting financial margins.
   * @param {Object} project - The project object to analyze
   * @param {Array} team - List of team members to map labor rates
   */
  analyzeProjectRisk(project, team) {
    if (!project) return null;

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(t => t.status === "done").length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) : 0;

    // Calculate labor costs
    const laborCost = project.tasks.reduce((sum, t) => {
      if (!t.spentHours || !t.assignee) return sum;
      const member = team.find(m => m.id === t.assignee);
      const rate = member ? member.rate : 0;
      return sum + (t.spentHours * rate);
    }, 0);

    const expensesCost = project.expenses ? project.expenses.reduce((sum, e) => sum + e.amount, 0) : 0;
    const totalActualCost = laborCost + expensesCost;
    const budgetUsedPercent = project.budget > 0 ? (totalActualCost / project.budget) : 0;

    // Timeline calculation
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const now = new Date();
    
    let totalDurationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (totalDurationDays <= 0) totalDurationDays = 30;
    
    let elapsedDays = Math.ceil((now - start) / (1000 * 60 * 60 * 24));
    if (elapsedDays < 0) elapsedDays = 0;
    if (elapsedDays > totalDurationDays) elapsedDays = totalDurationDays;
    
    const timeElapsedPercent = elapsedDays / totalDurationDays;

    // Evaluate Risk Signals
    const flags = [];
    let riskLevel = "low";
    let score = 0;

    // Financial overrun check
    if (budgetUsedPercent > 0.9 && completionRate < 0.8) {
      flags.push("Presupuesto crítico: Has agotado el " + Math.round(budgetUsedPercent * 100) + "% del capital pero el avance de tareas es de solo el " + Math.round(completionRate * 100) + "%.");
      score += 4;
    } else if (budgetUsedPercent > 0.75 && completionRate < 0.5) {
      flags.push("Desviación financiera media: La quema de presupuesto supera la tasa de entrega de entregables.");
      score += 2;
    }

    // Timeline delay check
    const timelineDeviation = timeElapsedPercent - completionRate;
    if (project.status === "active") {
      if (timelineDeviation > 0.25) {
        flags.push("Retraso de cronograma: Se ha consumido el " + Math.round(timeElapsedPercent * 100) + "% del tiempo disponible, pero solo se ha completado el " + Math.round(completionRate * 100) + "% de los hitos.");
        score += 3;
      } else if (timelineDeviation > 0.1) {
        flags.push("Alineación ajustada: El avance de tareas va ligeramente detrás de la línea de tiempo ideal.");
        score += 1;
      }
      
      // Close to deadline check
      const daysRemaining = totalDurationDays - elapsedDays;
      if (daysRemaining <= 15 && completionRate < 0.75) {
        flags.push(`Fecha límite crítica: Quedan solo ${daysRemaining} días para la entrega y restan tareas fundamentales sin completar.`);
        score += 3;
      }
    }

    // Task Bottlenecks check
    const activeHighPriorityTasks = project.tasks.filter(t => t.status !== "done" && t.priority === "high").length;
    if (activeHighPriorityTasks >= 3) {
      flags.push(`Cuello de botella de prioridad alta: Existen ${activeHighPriorityTasks} tareas críticas atascadas o pendientes por iniciar.`);
      score += 2;
    }

    // Determine final risk rating
    if (score >= 5) {
      riskLevel = "high";
    } else if (score >= 2) {
      riskLevel = "medium";
    }

    if (project.status === "completed") {
      riskLevel = "low";
    }

    // Generate Dynamic AI Forecast text
    let forecast = "";
    if (project.status === "completed") {
      const savings = project.budget - totalActualCost;
      if (savings >= 0) {
        forecast = `AetherAI dictamina éxito rotundo. El proyecto cerró en estado óptimo con un ahorro financiero neto de $${savings.toLocaleString()} (${Math.round((savings / project.budget) * 100)}% de margen).`;
      } else {
        forecast = `El proyecto ha cerrado exitosamente, pero con un sobrecosto financiero final de $${Math.abs(savings).toLocaleString()} debido a gastos extraordinarios.`;
      }
    } else if (riskLevel === "high") {
      forecast = `AetherAI pronostica una desviación alta en la fecha de cierre del proyecto y una probabilidad de sobrepasar el presupuesto de un ${Math.round((budgetUsedPercent + 0.25) * 100)}% si no se redistribuyen las tareas inmediatas. Se sugiere congelar nuevos gastos no operativos y reasignar tareas críticas de inmediato.`;
    } else if (riskLevel === "medium") {
      forecast = `AetherAI identifica riesgos moderados. Existe una ligera holgura pero hay tareas críticas acumulándose en la columna 'Por Hacer'. Sugerimos priorizar el desarrollo y activar revisiones QA diarias para evitar desvíos finales.`;
    } else {
      forecast = `AetherAI dictamina salud del proyecto óptima. El avance de hitos se encuentra perfectamente alineado con los consumos presupuestales y cronológicos. Continúen con el ritmo operativo establecido.`;
    }

    // Critical Path
    const criticalPathTasks = project.tasks
      .filter(t => t.status !== "done")
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 2)
      .map(t => t.name);

    return {
      riskLevel,
      score,
      flags,
      forecast,
      completionRate: Math.round(completionRate * 100),
      budgetUsedPercent: Math.round(budgetUsedPercent * 100),
      totalActualCost,
      profitability: project.budget - totalActualCost,
      profitabilityPercent: Math.round(((project.budget - totalActualCost) / project.budget) * 100),
      criticalPathTasks
    };
  }
};
