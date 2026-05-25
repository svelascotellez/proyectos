/**
 * AetherFlow Core Application Controller
 * Handles SPA navigation, database operations, Drag-and-Drop, timer tracker,
 * modal bindings, real-time AI suggestions, and dynamic UI rendering.
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- APPLICATION STATE ---
  let db = null;
  const state = {
    activeTab: "dashboard",
    activeProjectId: null,
    activeSubTab: "resumen",
    
    // Timer state
    timerTask: null, // { projectId, taskId, taskName }
    timerInterval: null,
    timerSeconds: 0
  };

  // --- DATABASE INITIALIZATION ---
  function initDatabase() {
    const cached = localStorage.getItem("aether_db");
    if (cached) {
      db = JSON.parse(cached);
    } else {
      // Use seeded fallback data
      db = window.AetherSeed;
      saveDatabase();
    }
  }

  function saveDatabase() {
    localStorage.setItem("aether_db", JSON.stringify(db));
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(message, type = "success") {
    const container = document.getElementById("toastDisplayContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast-alert ${type}`;
    
    let iconName = "check-circle";
    if (type === "warning") iconName = "alert-triangle";
    if (type === "danger") iconName = "x-circle";

    toast.innerHTML = `
      <i data-lucide="${iconName}"></i>
      <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    lucide.createIcons({ attrs: { class: "lucide-icon" } });

    // Auto-remove after 4.5 seconds
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(50px)";
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // --- SPA NAVIGATION CORE ---
  const navLinks = document.querySelectorAll(".nav-link");
  const tabPanels = document.querySelectorAll(".tab-panel");

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      const targetTab = link.getAttribute("data-tab");
      switchTab(targetTab);
    });
  });

  function switchTab(tabId) {
    state.activeTab = tabId;
    
    // Update Sidebar state
    navLinks.forEach(link => {
      if (link.getAttribute("data-tab") === tabId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Update visibility of panels
    tabPanels.forEach(panel => {
      if (panel.id === `tab-${tabId}`) {
        panel.classList.add("active");
      } else {
        panel.classList.remove("active");
      }
    });

    // Re-render corresponding views
    if (tabId === "dashboard") {
      renderDashboard();
    } else if (tabId === "projects") {
      renderProjectsDirectory();
    } else if (tabId === "team") {
      renderTeamDirectory();
    } else if (tabId === "tracker") {
      renderGlobalTracker();
    } else if (tabId === "instructions") {
      lucide.createIcons({ attrs: { class: "lucide-icon" } });
    }
  }

  // --- THEME SWAPPER (LIGHT / DARK) ---
  const themeTogglerBtn = document.getElementById("themeTogglerBtn");
  const themeIconSun = document.getElementById("themeIconSun");
  const themeIconMoon = document.getElementById("themeIconMoon");

  themeTogglerBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", nextTheme);
    
    if (nextTheme === "light") {
      themeIconSun.style.display = "block";
      themeIconMoon.style.display = "none";
    } else {
      themeIconSun.style.display = "none";
      themeIconMoon.style.display = "block";
    }
    
    // Re-draw graphs to match the theme background colors
    if (state.activeTab === "dashboard") {
      renderDashboard();
    }
  });

  // --- MAIN DASHBOARD DRAWING ---
  function renderDashboard() {
    const projects = db.projects;
    const team = db.team;

    // Calculate core metrics
    const activeProjects = projects.filter(p => p.status === "active");
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    
    let pendingTasksCount = 0;
    let laborCostsTotal = 0;
    let expensesCostsTotal = 0;

    projects.forEach(p => {
      p.tasks.forEach(t => {
        if (t.status !== "done") pendingTasksCount++;
        if (t.spentHours && t.assignee) {
          const member = team.find(m => m.id === t.assignee);
          const rate = member ? member.rate : 0;
          laborCostsTotal += t.spentHours * rate;
        }
      });
      if (p.expenses) {
        expensesCostsTotal += p.expenses.reduce((sum, e) => sum + e.amount, 0);
      }
    });

    const totalActualCost = laborCostsTotal + expensesCostsTotal;
    const profitMargin = totalBudget > 0 ? ((totalBudget - totalActualCost) / totalBudget) * 100 : 0;

    // Populate dashboard visual DOM
    document.getElementById("metricActiveProjects").textContent = activeProjects.length;
    document.getElementById("metricTotalBudget").textContent = `$${(totalBudget / 1000).toFixed(0)}k`;
    document.getElementById("metricPendingTasks").textContent = pendingTasksCount;
    document.getElementById("metricProfitMargin").textContent = `${profitMargin.toFixed(0)}%`;
    
    if (profitMargin < 15) {
      document.getElementById("metricProfitMargin").style.color = "var(--accent-red)";
    } else {
      document.getElementById("metricProfitMargin").style.color = "var(--status-completed)";
    }

    // Call dynamic SVGs
    window.AetherCharts.renderFinancialChart("financialChartContainer", projects, team);
    window.AetherCharts.renderCategoryChart("categoryChartContainer", projects);
    window.AetherCharts.renderTeamWorkload("teamWorkloadContainer", team, projects);

    // AI Global summary summary
    generateGlobalAISuggestions(projects, team);
  }

  function generateGlobalAISuggestions(projects, team) {
    const highRiskProjects = [];
    projects.forEach(p => {
      const diagnosis = window.AetherAI.analyzeProjectRisk(p, team);
      if (diagnosis && diagnosis.riskLevel === "high" && p.status === "active") {
        highRiskProjects.push(p.name);
      }
    });

    // Risk indicator badge count
    const badge = document.getElementById("alertBadgeCount");
    badge.textContent = highRiskProjects.length;
    badge.style.display = highRiskProjects.length > 0 ? "flex" : "none";

    const aiTextBox = document.getElementById("aiGlobalAdvice");
    let text = "";
    if (highRiskProjects.length > 0) {
      text = `¡Alerta crítica! Detecto desviación alta en las iniciativas: [${highRiskProjects.join(", ")}]. Los egresos acumulados superan los avances planificados. Recomiendo suspender pautas opcionales y reasignar ingenieros libres para desatascar las rutas críticas del backlog.`;
    } else {
      text = "Análisis completo. La cartera activa se encuentra en un estado operativo óptimo. No se identifican desviaciones financieras de riesgo medio o alto. Se aconseja mantener el actual ritmo de asignación de horas.";
    }

    // Dynamic typewriter typing effect!
    aiTextBox.textContent = "";
    let i = 0;
    function type() {
      if (i < text.length) {
        aiTextBox.textContent += text.charAt(i);
        i++;
        setTimeout(type, 15);
      }
    }
    type();
  }

  // --- PROJECTS DIRECTORY DIRECTORY ---
  function renderProjectsDirectory() {
    const container = document.getElementById("projectsGridContainer");
    if (!container) return;
    container.innerHTML = "";

    const searchVal = document.getElementById("globalSearchInput").value.toLowerCase();
    const statusVal = document.getElementById("filterStatus").value;
    const riskVal = document.getElementById("filterRisk").value;

    db.projects.forEach(proj => {
      const diagnosis = window.AetherAI.analyzeProjectRisk(proj, db.team);

      // Filters matching
      const matchesSearch = proj.name.toLowerCase().includes(searchVal) || 
                            proj.client.toLowerCase().includes(searchVal) ||
                            proj.category.toLowerCase().includes(searchVal);
      const matchesStatus = statusVal === "all" || proj.status === statusVal;
      const matchesRisk = riskVal === "all" || diagnosis.riskLevel === riskVal;

      if (!matchesSearch || !matchesStatus || !matchesRisk) return;

      // Status Badge Style
      let statusColor = "var(--text-muted)";
      let statusLabel = "Planificación";
      if (proj.status === "active") {
        statusColor = diagnosis.riskLevel === "high" ? "var(--accent-red)" : "var(--status-active)";
        statusLabel = diagnosis.riskLevel === "high" ? "Riesgo Alto" : "Activo";
      } else if (proj.status === "completed") {
        statusColor = "var(--status-completed)";
        statusLabel = "Finalizado";
      }

      const card = document.createElement("div");
      card.className = "glass-panel project-card flex flex-col justify-between";
      card.innerHTML = `
        <div class="project-card-header">
          <span class="project-category">${proj.category}</span>
          <span class="project-status-badge" style="background-color: ${statusColor}1c; color: ${statusColor}">${statusLabel}</span>
        </div>
        <div>
          <h3 class="project-title">${proj.name}</h3>
          <p class="project-desc">${proj.description}</p>
        </div>
        <div class="project-progress-container">
          <div class="progress-header">
            <span>Avance Técnico</span>
            <span>${diagnosis.completionRate}%</span>
          </div>
          <div class="progress-bar-outer">
            <div class="progress-bar-inner" style="width: ${diagnosis.completionRate}%"></div>
          </div>
        </div>
        <div class="project-card-footer">
          <span>Cliente: <strong>${proj.client}</strong></span>
          <span>Presupuesto: <strong>$${proj.budget.toLocaleString()}</strong></span>
        </div>
      `;

      card.addEventListener("click", () => {
        openProjectDetail(proj.id);
      });

      container.appendChild(card);
    });

    if (container.children.length === 0) {
      container.innerHTML = `<div class="glass-panel text-center py-12 text-slate-500 font-semibold w-full" style="grid-column: 1 / -1;">No se encontraron proyectos con los filtros seleccionados</div>`;
    }
  }

  // Bind directory search inputs
  document.getElementById("globalSearchInput").addEventListener("input", () => {
    if (state.activeTab === "projects") renderProjectsDirectory();
  });
  document.getElementById("filterStatus").addEventListener("change", renderProjectsDirectory);
  document.getElementById("filterRisk").addEventListener("change", renderProjectsDirectory);

  // --- PROJECT WORKSPACE DETAIL VIEW ---
  function openProjectDetail(projectId) {
    state.activeProjectId = projectId;
    switchTab("project-detail");
    
    // Renders primary workspace subtabs
    switchSubTab("resumen");
  }

  document.getElementById("btnBackToDirectory").addEventListener("click", () => {
    switchTab("projects");
  });

  const workspaceTabs = document.querySelectorAll(".workspace-tab");
  workspaceTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const subtab = tab.getAttribute("data-subtab");
      switchSubTab(subtab);
    });
  });

  function switchSubTab(subtabId) {
    state.activeSubTab = subtabId;

    // Update visual tab headings
    workspaceTabs.forEach(tab => {
      if (tab.getAttribute("data-subtab") === subtabId) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });

    // Update dynamic sub-panel displays
    const subPanels = document.querySelectorAll(".subtab-panel");
    subPanels.forEach(panel => {
      if (panel.id === `subtab-${subtabId}`) {
        panel.classList.add("active");
      } else {
        panel.classList.remove("active");
      }
    });

    // Fill project-specific contents
    renderProjectDetailCore();
  }

  function renderProjectDetailCore() {
    const project = db.projects.find(p => p.id === state.activeProjectId);
    if (!project) return;

    const diagnosis = window.AetherAI.analyzeProjectRisk(project, db.team);

    // Base header elements
    document.getElementById("detailProjectCategory").textContent = project.category;
    document.getElementById("detailProjectName").textContent = project.name;
    document.getElementById("detailProjectDesc").textContent = project.description;
    
    // Date formats
    const sDate = new Date(project.startDate).toLocaleDateString("es-ES", { day: 'numeric', month: 'short' });
    const eDate = new Date(project.endDate).toLocaleDateString("es-ES", { day: 'numeric', month: 'short', year: 'numeric' });
    document.getElementById("detailProjectDates").textContent = `${sDate} - ${eDate}`;

    // Project Status color badge
    const pBadge = document.getElementById("detailProjectStatus");
    pBadge.textContent = project.status === "active" ? "Activo" : "Finalizado";
    if (project.status === "active") {
      pBadge.style.backgroundColor = "rgba(16, 185, 129, 0.15)";
      pBadge.style.color = "var(--status-active)";
    } else {
      pBadge.style.backgroundColor = "rgba(139, 92, 246, 0.15)";
      pBadge.style.color = "var(--status-completed)";
    }

    // Render Sub Tab Specifics
    if (state.activeSubTab === "resumen") {
      renderSubTabResumen(project, diagnosis);
    } else if (state.activeSubTab === "tareas") {
      renderSubTabTareas(project);
    } else if (state.activeSubTab === "gantt") {
      renderSubTabGantt(project);
    } else if (state.activeSubTab === "finanzas") {
      renderSubTabFinanzas(project);
    } else if (state.activeSubTab === "documentos") {
      renderSubTabDocumentos(project);
    } else if (state.activeSubTab === "correos") {
      renderSubTabCorreos(project);
    } else if (state.activeSubTab === "ai") {
      renderSubTabAI(project, diagnosis);
    }
  }

  // SUBTAB DRAWING: RESUMEN OVERVIEW
  function renderSubTabResumen(project, diagnosis) {
    document.getElementById("resumenBudget").textContent = `$${project.budget.toLocaleString()}`;
    document.getElementById("resumenActualCost").textContent = `$${diagnosis.totalActualCost.toLocaleString()}`;
    document.getElementById("resumenProfitability").textContent = `$${diagnosis.profitability.toLocaleString()} (${diagnosis.profitabilityPercent}%)`;
    
    if (diagnosis.profitabilityPercent < 15) {
      document.getElementById("resumenProfitability").className = "text-sm font-bold text-red-400";
    } else {
      document.getElementById("resumenProfitability").className = "text-sm font-bold text-green-400";
    }

    // Capital spend progress
    document.getElementById("resumenBudgetPercent").textContent = `${diagnosis.budgetUsedPercent}%`;
    const budgetBar = document.getElementById("resumenBudgetBar");
    budgetBar.style.width = `${Math.min(100, diagnosis.budgetUsedPercent)}%`;
    if (diagnosis.budgetUsedPercent > 90) {
      budgetBar.style.background = "var(--accent-red)";
    } else {
      budgetBar.style.background = "linear-gradient(to right, var(--primary-indigo), var(--primary-violet))";
    }

    // Progress technical
    const totalT = project.tasks.length;
    const compT = project.tasks.filter(t => t.status === "done").length;
    document.getElementById("resumenTotalTasks").textContent = `${totalT} Tareas`;
    document.getElementById("resumenCompletedTasks").textContent = `${compT} Completadas`;
    
    // Timeline calculation percentage
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const elapsed = Math.ceil((new Date() - start) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const elapsedPercent = Math.max(0, Math.min(100, Math.round((elapsed / duration) * 100)));
    document.getElementById("resumenTimelineElapsed").textContent = `${elapsedPercent}%`;

    document.getElementById("resumenProgressPercent").textContent = `${diagnosis.completionRate}%`;
    document.getElementById("resumenProgressBar").style.width = `${diagnosis.completionRate}%`;

    // Operational diagnostic summary
    const riskLvl = document.getElementById("resumenRiskLevel");
    riskLvl.textContent = `Riesgo ${diagnosis.riskLevel === "high" ? "Alto" : diagnosis.riskLevel === "medium" ? "Medio" : "Bajo"}`;
    
    const riskPanel = document.getElementById("resumenRiskPanel");
    const rIcon = document.getElementById("resumenRiskIcon");
    if (diagnosis.riskLevel === "high") {
      riskPanel.style.borderColor = "var(--accent-red)";
      riskLvl.style.color = "var(--accent-red)";
      rIcon.style.color = "var(--accent-red)";
    } else if (diagnosis.riskLevel === "medium") {
      riskPanel.style.borderColor = "var(--accent-amber)";
      riskLvl.style.color = "var(--accent-amber)";
      rIcon.style.color = "var(--accent-amber)";
    } else {
      riskPanel.style.borderColor = "var(--border-color)";
      riskLvl.style.color = "var(--status-active)";
      rIcon.style.color = "var(--status-active)";
    }

    document.getElementById("resumenRiskAdvice").textContent = diagnosis.forecast;
    document.getElementById("resumenCriticalPath").textContent = diagnosis.criticalPathTasks.length > 0 ? diagnosis.criticalPathTasks.join(" ➔ ") : "Ninguna (Al día)";
  }

  // SUBTAB DRAWING: KANBAN BOARD
  function renderSubTabTareas(project) {
    const columns = ["todo", "in-progress", "review", "done"];
    
    columns.forEach(col => {
      const listContainer = document.getElementById(`list-${col}`);
      const countLabel = document.getElementById(`count-${col}`);
      listContainer.innerHTML = "";

      const colTasks = project.tasks.filter(t => t.status === col);
      countLabel.textContent = colTasks.length;

      colTasks.forEach(task => {
        const member = db.team.find(m => m.id === task.assignee);
        const initials = member ? member.name.split(" ").map(n => n[0]).join("") : "??";
        const color = member ? member.color : "var(--text-muted)";
        
        const card = document.createElement("div");
        card.className = "kanban-task-card";
        card.draggable = true;
        card.id = `task-card-${task.id}`;
        
        const isTicking = state.timerTask && state.timerTask.taskId === task.id;
        const playIcon = isTicking ? "square" : "play";
        const playClass = isTicking ? "task-timer-action ticking" : "task-timer-action";
        const hoursLabel = task.spentHours > 0 ? `${task.spentHours}h registradas` : "Sin horas";

        card.innerHTML = `
          <div class="flex justify-between items-start">
            <span class="kanban-task-priority task-prio-${task.priority}">${task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}</span>
            <div class="flex gap-2 items-center">
              ${col !== "done" ? `
                <div class="task-action-btn complete-task-btn" data-task-id="${task.id}" title="Completar Tarea" style="cursor: pointer; color: var(--text-muted); display: inline-flex;">
                  <i data-lucide="check-square" style="width: 13px; height: 13px;"></i>
                </div>
              ` : ''}
              <div class="task-action-btn delete-task-btn" data-task-id="${task.id}" title="Eliminar Tarea" style="cursor: pointer; color: var(--text-muted); display: inline-flex;">
                <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
              </div>
              <div class="${playClass}" data-task-id="${task.id}" title="${isTicking ? "Detener Timer" : "Iniciar Timer"}">
                <i data-lucide="${playIcon}" style="width: 14px; height: 14px;"></i>
              </div>
            </div>
          </div>
          <h4 class="kanban-task-name">${task.name}</h4>
          <p class="kanban-task-desc">${task.description}</p>
          <div class="kanban-task-footer">
            <div class="flex items-center gap-1">
              <i data-lucide="clock" style="width: 12px; color: var(--text-muted);"></i>
              <span>${hoursLabel}</span>
            </div>
            <div class="task-avatar" style="background-color: ${color}" title="${member ? member.name : "Sin asignar"}">${initials}</div>
          </div>
        `;

        // Handle Drag operations
        card.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", task.id);
          card.style.opacity = "0.5";
        });

        card.addEventListener("dragend", () => {
          card.style.opacity = "1";
        });

        // Trigger Complete action
        const compBtn = card.querySelector(".complete-task-btn");
        if (compBtn) {
          compBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            task.status = "done";
            saveDatabase();
            showToast("Hito completado correctamente");
            renderProjectDetailCore();
          });
        }

        // Trigger Delete action
        const delTaskBtn = card.querySelector(".delete-task-btn");
        delTaskBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (confirm(`¿Estás seguro de eliminar el hito [${task.name}]?`)) {
            project.tasks = project.tasks.filter(t => t.id !== task.id);
            saveDatabase();
            showToast("Hito eliminado", "warning");
            renderProjectDetailCore();
          }
        });

        // Trigger Timer actions on Click
        const timerBtn = card.querySelector(".task-timer-action");
        timerBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleTaskTimer(project.id, task.id);
        });

        listContainer.appendChild(card);
      });
    });

    lucide.createIcons({ attrs: { class: "lucide-icon" } });

    // Enable drops drops on columns columns
    const kanbanCols = document.querySelectorAll(".kanban-column");
    kanbanCols.forEach(col => {
      col.addEventListener("dragover", (e) => {
        e.preventDefault();
        col.style.backgroundColor = "rgba(99, 102, 241, 0.05)";
      });

      col.addEventListener("dragleave", () => {
        col.style.backgroundColor = "rgba(17, 24, 39, 0.4)";
      });

      col.addEventListener("drop", (e) => {
        e.preventDefault();
        col.style.backgroundColor = "rgba(17, 24, 39, 0.4)";
        const taskId = e.dataTransfer.getData("text/plain");
        const status = col.getAttribute("data-status");

        const targetTask = project.tasks.find(t => t.id === taskId);
        if (targetTask && targetTask.status !== status) {
          targetTask.status = status;
          saveDatabase();
          showToast(`Tarea moved a: ${status === "todo" ? "Por hacer" : status === "in-progress" ? "En curso" : status === "review" ? "En revisión" : "Completadas"}`);
          renderProjectDetailCore();
        }
      });
    });
  }

  // SUBTAB DRAWING: PLANIFICADOR GANTT TIMELINE
  function renderSubTabGantt(project) {
    const container = document.getElementById("ganttViewContainer");
    if (!container) return;
    container.innerHTML = "";

    // Header cells with simulated weeks layout
    let html = `
      <div class="gantt-grid">
        <div class="gantt-left-panel">
          <div class="gantt-header-cell">Hito / Tarea</div>
          <div class="gantt-timeline-area">
    `;

    // Fill left pane tasks list
    project.tasks.forEach(t => {
      html += `
        <div class="gantt-row">
          <span class="gantt-task-label" title="${t.name}">${t.name}</span>
        </div>
      `;
    });

    html += `
          </div>
        </div>
        
        <div class="gantt-right-panel">
          <div class="gantt-weeks-bar">
            <div class="gantt-week-label">Semana 1</div>
            <div class="gantt-week-label">Semana 2</div>
            <div class="gantt-week-label">Semana 3</div>
            <div class="gantt-week-label">Semana 4</div>
            <div class="gantt-week-label">Semana 5</div>
          </div>
          <div class="gantt-timeline-area">
    `;

    // Draw Right Grid slots matching weeks
    project.tasks.forEach((t, idx) => {
      // Deterministic schedule offset using task index to make visual alignments
      const startPercent = Math.min(60, idx * 12);
      const widthPercent = Math.max(20, 45 - (idx * 5));
      const hoursDesc = t.spentHours > 0 ? `(${t.spentHours}h completadas)` : `(Est: ${t.estimatedHours}h)`;

      html += `
        <div class="gantt-bar-row">
          <div class="gantt-bar-filled" style="left: ${startPercent}%; width: ${widthPercent}%" title="${t.name}: ${hoursDesc}">
            <span>${hoursDesc}</span>
          </div>
        </div>
      `;
    });

    html += `
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  // SUBTAB DRAWING: FINANZAS & LEDGER
  function renderSubTabFinanzas(project) {
    const expensesTable = document.getElementById("expensesTableBody");
    expensesTable.innerHTML = "";

    if (project.expenses && project.expenses.length > 0) {
      project.expenses.forEach(e => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="font-semibold text-var(--text-primary)">${e.description}</td>
          <td><span class="px-2 py-0.5 rounded text-[10px] font-bold" style="background-color: var(--timeline-bg); color: var(--primary-teal)">${e.category}</span></td>
          <td class="text-slate-400 font-medium">${new Date(e.date).toLocaleDateString()}</td>
          <td class="font-bold text-red-400">$${e.amount.toLocaleString()}</td>
        `;
        expensesTable.appendChild(tr);
      });
    } else {
      expensesTable.innerHTML = `<tr><td colspan="4" class="text-center text-slate-500 font-medium py-8">Sin gastos registrados</td></tr>`;
    }

    const laborTable = document.getElementById("laborTableBody");
    laborTable.innerHTML = "";

    project.tasks.forEach(task => {
      const member = db.team.find(m => m.id === task.assignee);
      const rate = member ? member.rate : 0;
      const totalCost = task.spentHours * rate;
      const memberName = member ? member.name : "Sin Asignar";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="font-semibold text-var(--text-primary)">${task.name}</td>
        <td class="text-slate-400">${memberName} (${member ? member.role : "-"})</td>
        <td class="font-bold">${task.spentHours}h / ${task.estimatedHours}h</td>
        <td class="font-bold text-slate-300">$${totalCost.toLocaleString()} <span class="text-[10px] text-slate-500 font-normal">($${rate}/h)</span></td>
      `;
      laborTable.appendChild(tr);
    });
  }

  // SUBTAB DRAWING: DOCUMENT STORAGE
  function renderSubTabDocumentos(project) {
    const grid = document.getElementById("detailDocumentsGrid");
    grid.innerHTML = "";

    if (project.documents && project.documents.length > 0) {
      project.documents.forEach(doc => {
        const card = document.createElement("div");
        card.className = "document-item";
        
        let iconName = "file-text";
        if (doc.type === "pdf") iconName = "file-text";
        if (doc.type === "image") iconName = "image";
        if (doc.type === "archive") iconName = "archive";

        card.innerHTML = `
          <div class="document-icon-row">
            <i data-lucide="${iconName}"></i>
            <i data-lucide="download" style="width: 14px; height: 14px; cursor: pointer; color: var(--text-muted);" class="hover:text-white" title="Descargar"></i>
          </div>
          <span class="document-name" title="${doc.name}">${doc.name}</span>
          <div class="document-meta">
            <span>${doc.size}</span>
            <span>${new Date(doc.date).toLocaleDateString()}</span>
          </div>
        `;
        grid.appendChild(card);
      });
    } else {
      grid.innerHTML = `<div class="glass-panel text-center text-slate-500 font-medium py-12 w-full" style="grid-column: 1 / -1;">Bóveda vacía. Registra el primer documento corporativo arriba</div>`;
    }

    lucide.createIcons({ attrs: { class: "lucide-icon" } });
  }

  // SUBTAB DRAWING: EMAILS CENTRALIZER
  function renderSubTabCorreos(project) {
    const list = document.getElementById("detailEmailsList");
    list.innerHTML = "";

    if (project.emails && project.emails.length > 0) {
      project.emails.forEach(em => {
        const item = document.createElement("div");
        item.className = "email-item";
        item.innerHTML = `
          <div class="email-header-row">
            <span class="email-sender">${em.from}</span>
            <span class="email-date">${new Date(em.date).toLocaleString()}</span>
          </div>
          <div class="email-subject">${em.subject}</div>
          <p class="email-body">${em.body}</p>
        `;
        list.appendChild(item);
      });
    } else {
      list.innerHTML = `<div class="text-center text-slate-500 font-medium py-8">Historial de comunicaciones vacío.</div>`;
    }
  }

  // SUBTAB DRAWING: DEEP AI ADVISOR HEURISTICS
  function renderSubTabAI(project, diagnosis) {
    const flagsList = document.getElementById("aiDiagnosticsFlags");
    flagsList.innerHTML = "";

    if (diagnosis.flags && diagnosis.flags.length > 0) {
      diagnosis.flags.forEach(f => {
        const div = document.createElement("div");
        div.className = "glass-panel flex items-start gap-2.5";
        div.style.borderColor = "rgba(239, 68, 68, 0.15)";
        div.style.background = "rgba(239, 68, 68, 0.02)";
        div.innerHTML = `
          <i data-lucide="alert-circle" style="color: var(--accent-red); flex-shrink: 0; width: 16px;"></i>
          <p class="text-xs font-semibold leading-relaxed text-slate-300">${f}</p>
        `;
        flagsList.appendChild(div);
      });
    } else {
      flagsList.innerHTML = `
        <div class="glass-panel flex items-center gap-2.5" style="border-color: rgba(16, 185, 129, 0.2); background: rgba(16, 185, 129, 0.02)">
          <i data-lucide="check-circle" style="color: var(--status-completed); width: 16px;"></i>
          <p class="text-xs font-bold text-slate-300">Portafolio saludable. No hay advertencias de sobrecostos o plazos emitidas por AetherAI.</p>
        </div>
      `;
    }

    document.getElementById("aiDiagnosticsForecast").textContent = diagnosis.forecast;
    document.getElementById("aiDiagnosticsCriticalTasks").textContent = diagnosis.criticalPathTasks.length > 0 ? diagnosis.criticalPathTasks.join(" ➔ ") : "Sin cuellos de botella de prioridad alta activos.";
    
    lucide.createIcons({ attrs: { class: "lucide-icon" } });
  }

  // --- MOCK SIMULATED DOCUMENT UPLOAD ---
  const fileInput = document.getElementById("documentFileInput");
  document.getElementById("btnSimulateUpload").addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length === 0) return;
    
    const file = fileInput.files[0];
    const project = db.projects.find(p => p.id === state.activeProjectId);
    if (!project) return;

    // Trigger fake loading toast
    showToast(`Subiendo ${file.name}...`, "warning");
    
    setTimeout(() => {
      // Append fake document object
      const doc = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: file.name.split(".").pop(),
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: new Date().toISOString().split("T")[0]
      };
      
      if (!project.documents) project.documents = [];
      project.documents.unshift(doc);
      saveDatabase();
      showToast(`Archivo guardado exitosamente en Bóveda`);
      renderProjectDetailCore();
    }, 1500);
  });

  // --- MOCK CLIENT EMAILS FEEDBACK GENERATOR ---
  document.getElementById("btnSimulateEmail").addEventListener("click", () => {
    const project = db.projects.find(p => p.id === state.activeProjectId);
    if (!project) return;

    const subjects = [
      { sub: "Ajuste de presupuesto extraordinario", body: "Revisando el alcance, quisiéramos agregar un módulo de reportes automatizados. ¿Podrían cotizar las horas adicionales necesarias para integrarlo en la planificación?" },
      { sub: "Felicitaciones por avance técnico", body: "Agradecemos la entrega puntual de las maquetas de validación. La velocidad y calidad del diseño superan ampliamente lo esperado." },
      { sub: "Duda sobre fecha de entrega", body: "Hola equipo, nos preocupa el hito de migraciones. ¿Estamos en los plazos correctos para lanzar la fase beta en junio?" }
    ];

    const pick = subjects[Math.floor(Math.random() * subjects.length)];
    const email = {
      id: `em_${Date.now()}`,
      from: `Soporte Técnico (${project.client})`,
      subject: pick.sub,
      body: pick.body,
      date: new Date().toISOString()
    };

    if (!project.emails) project.emails = [];
    project.emails.unshift(email);
    saveDatabase();
    showToast("Nuevo correo de cliente recibido", "warning");
    renderProjectDetailCore();
  });

  // --- TIME TRACKER LOGIC (TIMER ACCURACY) ---
  function toggleTaskTimer(projectId, taskId) {
    if (state.timerInterval) {
      // Running timer exists. Check if stopping current task
      const current = state.timerTask;
      stopTaskTimer();

      if (current.taskId !== taskId) {
        // User clicked a different play button, start that new one!
        startTaskTimer(projectId, taskId);
      }
    } else {
      // Start fresh timer!
      startTaskTimer(projectId, taskId);
    }
  }

  function startTaskTimer(projectId, taskId) {
    const project = db.projects.find(p => p.id === projectId);
    const task = project.tasks.find(t => t.id === taskId);
    
    state.timerTask = { projectId, taskId, taskName: task.name };
    state.timerSeconds = 0;
    
    // Set digital display UI
    const widget = document.getElementById("sidebarTracker");
    widget.style.display = "flex";
    document.getElementById("sidebarTrackerTask").textContent = task.name;
    document.getElementById("sidebarTrackerTime").textContent = "00:00:00";

    // Set ticked intervals
    state.timerInterval = setInterval(() => {
      state.timerSeconds++;
      const fmt = formatTime(state.timerSeconds);
      
      // Update sidebar
      document.getElementById("sidebarTrackerTime").textContent = fmt;
      
      // Update global timer tab displays if active
      if (state.activeTab === "tracker") {
        document.getElementById("trackerDigitalClock").textContent = fmt;
      }
    }, 1000);

    // Refresh current view button ticks
    if (state.activeTab === "project-detail" && state.activeSubTab === "tareas") {
      renderSubTabTareas(project);
    }
    
    showToast(`Timer iniciado en: ${task.name}`);
  }

  function stopTaskTimer() {
    if (!state.timerInterval) return;

    clearInterval(state.timerInterval);
    state.timerInterval = null;

    const taskData = state.timerTask;
    const project = db.projects.find(p => p.id === taskData.projectId);
    const task = project.tasks.find(t => t.id === taskData.taskId);

    // Accumulate tracked hours (e.g. 1 hour = 3600 seconds, here let's map real decimal hours, minimum 0.1 hours to demonstrate immediately!)
    const hoursEarned = Math.max(0.1, Number((state.timerSeconds / 3600).toFixed(2)));
    
    task.spentHours = Number((task.spentHours + hoursEarned).toFixed(2));
    
    // Move from 'todo' to 'in-progress' dynamically
    if (task.status === "todo") {
      task.status = "in-progress";
    }

    saveDatabase();

    // Hide sidebar details widget
    document.getElementById("sidebarTracker").style.display = "none";
    
    showToast(`Registradas ${hoursEarned} horas en [${task.name}] exitosamente.`);
    state.timerTask = null;

    // Reset displays
    if (state.activeTab === "project-detail") {
      renderProjectDetailCore();
    } else if (state.activeTab === "tracker") {
      renderGlobalTracker();
    }
  }

  function formatTime(totalSecs) {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  document.getElementById("sidebarTrackerStop").addEventListener("click", stopTaskTimer);

  // --- TIME TRACKER VIEW CONTROL (TAB 4) ---
  function renderGlobalTracker() {
    const projSelect = document.getElementById("trackerProjectSelect");
    const taskSelect = document.getElementById("trackerTaskSelect");
    
    projSelect.innerHTML = "";
    
    // Load projects selector
    db.projects.forEach(p => {
      if (p.status === "active") {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.name;
        projSelect.appendChild(opt);
      }
    });

    // Handle project selection swap dependencies
    projSelect.removeEventListener("change", populateTrackerTasks);
    projSelect.addEventListener("change", populateTrackerTasks);
    
    populateTrackerTasks();

    // Trigger timer digital clock views states
    const clock = document.getElementById("trackerDigitalClock");
    const sBtn = document.getElementById("trackerStartBtn");
    const stopBtn = document.getElementById("trackerStopBtn");

    if (state.timerInterval) {
      clock.textContent = formatTime(state.timerSeconds);
      sBtn.style.display = "none";
      stopBtn.style.display = "flex";
      
      // select active tracking task option matching active item
      projSelect.value = state.timerTask.projectId;
      populateTrackerTasks();
      taskSelect.value = state.timerTask.taskId;
    } else {
      clock.textContent = "00:00:00";
      sBtn.style.display = "flex";
      stopBtn.style.display = "none";
    }

    // Load sheets history
    const sheetBody = document.getElementById("globalTrackerTimesheetBody");
    sheetBody.innerHTML = "";

    let hasData = false;
    db.projects.forEach(p => {
      p.tasks.forEach(t => {
        if (t.spentHours > 0) {
          hasData = true;
          const member = db.team.find(m => m.id === t.assignee);
          const rate = member ? member.rate : 0;
          const cost = t.spentHours * rate;

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td class="font-semibold text-var(--text-primary)">${p.name}</td>
            <td>${t.name}</td>
            <td>${member ? member.name : "Sin Asignar"}</td>
            <td class="font-bold text-slate-300">${t.spentHours}h</td>
            <td class="font-bold text-red-400">$${cost.toLocaleString()}</td>
          `;
          sheetBody.appendChild(tr);
        }
      });
    });

    if (!hasData) {
      sheetBody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-slate-500 font-medium">Ningún profesional ha registrado horas de mano de obra aún.</td></tr>`;
    }
  }

  function populateTrackerTasks() {
    const projSelect = document.getElementById("trackerProjectSelect");
    const taskSelect = document.getElementById("trackerTaskSelect");
    const activeProj = db.projects.find(p => p.id === projSelect.value);
    
    taskSelect.innerHTML = "";
    if (activeProj) {
      activeProj.tasks.forEach(t => {
        if (t.status !== "done") {
          const opt = document.createElement("option");
          opt.value = t.id;
          opt.textContent = t.name;
          taskSelect.appendChild(opt);
        }
      });
    }
  }

  // Bind big timer buttons buttons
  document.getElementById("trackerStartBtn").addEventListener("click", () => {
    const projSelect = document.getElementById("trackerProjectSelect");
    const taskSelect = document.getElementById("trackerTaskSelect");
    if (!projSelect.value || !taskSelect.value) {
      showToast("Selecciona un proyecto y tarea válidos", "warning");
      return;
    }
    toggleTaskTimer(projSelect.value, taskSelect.value);
    
    // Switch visual buttons
    document.getElementById("trackerStartBtn").style.display = "none";
    document.getElementById("trackerStopBtn").style.display = "flex";
  });

  document.getElementById("trackerStopBtn").addEventListener("click", () => {
    stopTaskTimer();
    document.getElementById("trackerStartBtn").style.display = "flex";
    document.getElementById("trackerStopBtn").style.display = "none";
    document.getElementById("trackerDigitalClock").textContent = "00:00:00";
  });

  // --- MODAL SUBMISSIONS: ADD PROJECTS ---
  const modalProject = document.getElementById("modalNewProject");
  document.getElementById("btnOpenNewProjectModal").addEventListener("click", () => {
    modalProject.style.display = "flex";
    
    // Auto populate dates dates: start = today, end = today + 30 days
    const today = new Date().toISOString().split("T")[0];
    const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    document.getElementById("newProjStart").value = today;
    document.getElementById("newProjEnd").value = end;
  });

  document.getElementById("btnCloseProjectModal").addEventListener("click", () => modalProject.style.display = "none");
  document.getElementById("btnCancelProject").addEventListener("click", () => modalProject.style.display = "none");

  document.getElementById("btnSaveProject").addEventListener("click", () => {
    const name = document.getElementById("newProjName").value.trim();
    const client = document.getElementById("newProjClient").value.trim();
    const desc = document.getElementById("newProjDesc").value.trim();
    const cat = document.getElementById("newProjCategory").value;
    const budget = Number(document.getElementById("newProjBudget").value) || 20000;
    const start = document.getElementById("newProjStart").value;
    const end = document.getElementById("newProjEnd").value;
    const templateType = document.getElementById("newProjTemplate").value;

    if (!name || !client || !desc || !start || !end) {
      showToast("Por favor completa todos los campos del formulario", "danger");
      return;
    }

    // Populate blueprint tasks if template selected
    let taskList = [];
    if (templateType !== "none" && window.AetherTemplates[templateType]) {
      const blueprint = window.AetherTemplates[templateType];
      
      // Map templates to actual fresh task structures
      taskList = blueprint.tasks.map((bt, idx) => {
        // Suggest best profile rate matches
        let recommendedAssignee = "lucas"; // Default backend developer
        if (bt.suggestedRole.includes("UI") || bt.suggestedRole.includes("UX")) recommendedAssignee = "elena";
        if (bt.suggestedRole.includes("QA") || bt.suggestedRole.includes("PO")) recommendedAssignee = "sofia";
        if (bt.suggestedRole.includes("DevOps")) recommendedAssignee = "carlos";

        return {
          id: `task_${Date.now()}_${idx}`,
          name: bt.name,
          description: bt.description,
          status: bt.status,
          estimatedHours: bt.estimatedHours,
          spentHours: bt.status === "done" ? bt.estimatedHours - 2 : 0,
          priority: bt.priority,
          assignee: recommendedAssignee
        };
      });
    } else {
      // Default empty seed tasks
      taskList = [
        {
          id: `task_${Date.now()}_default`,
          name: "Planificación de Requerimientos Iniciales",
          description: "Definición básica del backlog, roles técnicos y cronograma de despliegues.",
          status: "todo",
          estimatedHours: 15,
          spentHours: 0,
          priority: "medium",
          assignee: "sofia"
        }
      ];
    }

    const newProject = {
      id: `proj_${Date.now()}`,
      name,
      client,
      description: desc,
      status: "active",
      category: cat,
      budget,
      startDate: start,
      endDate: end,
      createdAt: new Date().toISOString(),
      tasks: taskList,
      expenses: [],
      documents: [
        { id: `doc_${Date.now()}`, name: "Definicion_Inicial_Alcances.pdf", type: "pdf", size: "1.2 MB", date: start }
      ],
      emails: [
        { id: `em_${Date.now()}`, from: "AetherFlow Suite AI", subject: "Bienvenido a AetherFlow", body: "Tu nuevo proyecto ha sido creado exitosamente en base a las plantillas ágiles corporativas.", date: new Date().toISOString() }
      ]
    };

    db.projects.unshift(newProject);
    saveDatabase();
    showToast(`Proyecto '${name}' lanzado con éxito`);

    // Reset forms and transition transition
    modalProject.style.display = "none";
    document.getElementById("newProjName").value = "";
    document.getElementById("newProjClient").value = "";
    document.getElementById("newProjDesc").value = "";
    document.getElementById("newProjTemplate").value = "none";

    renderProjectsDirectory();
  });

  // --- MODAL SUBMISSIONS: ADD TASKS (REAL-TIME AI ADVISOR) ---
  const modalTask = document.getElementById("modalNewTask");
  const taskNameInput = document.getElementById("newTaskName");
  const taskDescInput = document.getElementById("newTaskDesc");
  const assigneeSelect = document.getElementById("newTaskAssignee");

  document.getElementById("btnOpenNewTaskModal").addEventListener("click", () => {
    modalTask.style.display = "flex";
    
    // Load assignee options dynamically
    assigneeSelect.innerHTML = "";
    db.team.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = `${m.name} (${m.role}) - $${m.rate}/h`;
      assigneeSelect.appendChild(opt);
    });

    document.getElementById("aiTaskAssignmentAdvice").textContent = "Escribe un nombre de tarea para evaluar la disponibilidad del equipo.";
  });

  document.getElementById("btnCloseTaskModal").addEventListener("click", () => modalTask.style.display = "none");
  document.getElementById("btnCancelTask").addEventListener("click", () => modalTask.style.display = "none");

  // Dynamic Heuristic Assignee triggers
  function triggerRealtimeAIAssignmentAdvice() {
    const name = taskNameInput.value.trim();
    const desc = taskDescInput.value.trim();
    if (!name) return;

    const tempTask = { name, description: desc };
    const advice = window.AetherAI.getOptimalAssignee(tempTask, db.team, db.projects);

    const adviceBox = document.getElementById("aiTaskAssignmentAdvice");
    adviceBox.innerHTML = `Especialista recomendado: <strong style="color: ${advice.recommendedColor}">${advice.recommendedName}</strong>. <br>${advice.explanation}`;
    
    // Auto-select in select option
    assigneeSelect.value = advice.recommendedId;
  }

  taskNameInput.addEventListener("input", triggerRealtimeAIAssignmentAdvice);
  taskDescInput.addEventListener("input", triggerRealtimeAIAssignmentAdvice);

  document.getElementById("btnSaveTask").addEventListener("click", () => {
    const name = taskNameInput.value.trim();
    const desc = taskDescInput.value.trim();
    const prio = document.getElementById("newTaskPriority").value;
    const hours = Number(document.getElementById("newTaskHours").value) || 10;
    const assignee = assigneeSelect.value;

    if (!name || !desc) {
      showToast("Completa los datos del hito", "danger");
      return;
    }

    const activeProject = db.projects.find(p => p.id === state.activeProjectId);
    if (!activeProject) return;

    const newTask = {
      id: `task_${Date.now()}`,
      name,
      description: desc,
      status: "todo",
      estimatedHours: hours,
      spentHours: 0,
      priority: prio,
      assignee
    };

    activeProject.tasks.push(newTask);
    saveDatabase();
    showToast(`Hito '${name}' añadido al tablero`);

    // Reset forms and close
    modalTask.style.display = "none";
    taskNameInput.value = "";
    taskDescInput.value = "";
    document.getElementById("newTaskHours").value = "20";

    renderProjectDetailCore();
  });

  // --- MODAL SUBMISSIONS: ADD PHYSICAL EXPENSES ---
  const modalExpense = document.getElementById("modalNewExpense");
  document.getElementById("btnOpenExpenseModal").addEventListener("click", () => {
    modalExpense.style.display = "flex";
    document.getElementById("newExpenseDate").value = new Date().toISOString().split("T")[0];
  });

  document.getElementById("btnCloseExpenseModal").addEventListener("click", () => modalExpense.style.display = "none");
  document.getElementById("btnCancelExpense").addEventListener("click", () => modalExpense.style.display = "none");

  document.getElementById("btnSaveExpense").addEventListener("click", () => {
    const desc = document.getElementById("newExpenseDesc").value.trim();
    const cat = document.getElementById("newExpenseCategory").value;
    const amount = Number(document.getElementById("newExpenseAmount").value) || 0;
    const date = document.getElementById("newExpenseDate").value;

    if (!desc || amount <= 0 || !date) {
      showToast("Completa los datos de la transacción de forma correcta", "danger");
      return;
    }

    const activeProject = db.projects.find(p => p.id === state.activeProjectId);
    if (!activeProject) return;

    const newExpense = {
      id: `exp_${Date.now()}`,
      category: cat,
      amount,
      date,
      description: desc
    };

    if (!activeProject.expenses) activeProject.expenses = [];
    activeProject.expenses.push(newExpense);
    saveDatabase();
    showToast(`Gasto de $${amount.toLocaleString()} registrado`);

    // Close and reset forms
    modalExpense.style.display = "none";
    document.getElementById("newExpenseDesc").value = "";
    document.getElementById("newExpenseAmount").value = "";

    renderProjectDetailCore();
  });

  // --- TEAM DIRECTORY & RESOURCE MANAGEMENT ---
  function renderTeamDirectory() {
    const container = document.getElementById("teamDirectoryGridContainer");
    if (!container) return;
    container.innerHTML = "";

    // Calculate active workloads
    const activeTasksMap = {};
    db.team.forEach(t => { activeTasksMap[t.id] = 0; });
    db.projects.forEach(p => {
      if (p.status === "active") {
        p.tasks.forEach(t => {
          if (t.status !== "done" && t.assignee && activeTasksMap[t.assignee] !== undefined) {
            activeTasksMap[t.assignee]++;
          }
        });
      }
    });

    db.team.forEach(member => {
      const activeTasks = activeTasksMap[member.id] || 0;
      
      // Calculate total registered labor hours
      let totalHours = 0;
      db.projects.forEach(p => {
        p.tasks.forEach(t => {
          if (t.assignee === member.id && t.spentHours > 0) {
            totalHours += t.spentHours;
          }
        });
      });

      const totalEarnings = totalHours * member.rate;

      const card = document.createElement("div");
      card.className = "glass-panel flex flex-col justify-between p-6 project-card";
      card.style.borderTop = `4px solid ${member.color}`;
      card.style.height = "auto";
      card.style.cursor = "default";
      
      card.innerHTML = `
        <div class="flex items-center gap-3 mb-4">
          <div class="user-avatar" style="background: ${member.color}; width: 44px; height: 44px; font-size: 1.1rem; box-shadow: none;">${member.name.split(" ").map(n => n[0]).join("")}</div>
          <div>
            <h4 class="font-extrabold text-var(--text-primary)" style="font-size: 1.05rem;">${member.name}</h4>
            <span class="text-xs text-slate-400 font-semibold">${member.role}</span>
          </div>
        </div>
        
        <div class="space-y-2 text-xs border-t border-slate-700/30 pt-3 mb-4" style="margin-top: auto;">
          <div class="flex justify-between">
            <span class="text-slate-400">Tarifa por Hora:</span>
            <span class="font-bold text-slate-200">$${member.rate}/h</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Tareas Activas:</span>
            <span class="font-bold text-slate-200">${activeTasks} activas</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Horas Registradas:</span>
            <span class="font-bold text-slate-200">${totalHours.toFixed(1)}h</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Labor Invertido:</span>
            <span class="font-bold text-var(--primary-teal)">$${totalEarnings.toLocaleString()}</span>
          </div>
        </div>
        
        <button class="btn-secondary w-full text-xs py-1.5 justify-center btn-delete-member" data-member-id="${member.id}" style="border-color: rgba(239, 68, 68, 0.15); color: var(--accent-red)">
          Remover Colaborador
        </button>
      `;

      const delBtn = card.querySelector(".btn-delete-member");
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeTeamMember(member.id);
      });

      container.appendChild(card);
    });

    if (db.team.length === 0) {
      container.innerHTML = `<div class="glass-panel text-center py-12 text-slate-500 font-semibold w-full" style="grid-column: 1 / -1;">No hay colaboradores registrados en el equipo.</div>`;
    }
    
    lucide.createIcons({ attrs: { class: "lucide-icon" } });
  }

  function removeTeamMember(memberId) {
    if (confirm("¿Estás seguro de remover a este colaborador técnico? Sus estimaciones e historial de horas se mantendrán consolidados en los proyectos.")) {
      db.team = db.team.filter(m => m.id !== memberId);
      saveDatabase();
      showToast("Colaborador removido del equipo", "warning");
      renderTeamDirectory();
    }
  }

  // --- NEW TEAM MEMBER MODAL BINDINGS ---
  const modalMember = document.getElementById("modalNewMember");
  document.getElementById("btnOpenNewMemberModal").addEventListener("click", () => {
    modalMember.style.display = "flex";
  });

  document.getElementById("btnCloseMemberModal").addEventListener("click", () => modalMember.style.display = "none");
  document.getElementById("btnCancelMember").addEventListener("click", () => modalMember.style.display = "none");

  document.getElementById("btnSaveMember").addEventListener("click", () => {
    const name = document.getElementById("newMemName").value.trim();
    const role = document.getElementById("newMemRole").value.trim();
    const rate = Number(document.getElementById("newMemRate").value) || 50;
    const color = document.getElementById("newMemColor").value;

    if (!name || !role) {
      showToast("Por favor ingresa nombre y especialidad técnica", "danger");
      return;
    }

    const newMember = {
      id: `mem_${Date.now()}`,
      name,
      role,
      rate,
      color,
      activeTasks: 0
    };

    db.team.push(newMember);
    saveDatabase();
    showToast(`Colaborador '${name}' agregado exitosamente`);

    modalMember.style.display = "none";
    document.getElementById("newMemName").value = "";
    document.getElementById("newMemRole").value = "";
    document.getElementById("newMemRate").value = "50";

    renderTeamDirectory();
  });

  // --- INITIAL BOOTSTRAP ---
  initDatabase();
  switchTab("dashboard");
  
  // Create icons globally on launch
  lucide.createIcons({ attrs: { class: "lucide-icon" } });
});
