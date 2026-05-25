/**
 * AetherFlow SVG Charting Engine
 * Generates beautifully animated, interactive SVG charts (Dual-Bar, Doughnut, and Progress Meters)
 * tailored to a dark-mode obsidian glass dashboard.
 */

window.AetherCharts = {
  /**
   * Generates a Dual-Bar Chart comparing Budget vs. Actual Costs for all projects
   * @param {string} containerId - The element ID to append the SVG to
   * @param {Array} projects - The array of current projects
   * @param {Array} team - The team members list (to compute labor rates)
   */
  renderFinancialChart(containerId, projects, team) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const containerWidth = container.clientWidth || 500;
    const containerHeight = container.clientHeight || 260;
    const padding = { top: 30, right: 30, bottom: 45, left: 60 };

    const chartWidth = containerWidth - padding.left - padding.right;
    const chartHeight = containerHeight - padding.top - padding.bottom;

    // Process Project Financials (Calculate actual = expenses + labor cost)
    const data = projects.map(proj => {
      const expenseSum = proj.expenses ? proj.expenses.reduce((sum, e) => sum + e.amount, 0) : 0;
      const laborCost = proj.tasks.reduce((sum, task) => {
        if (!task.spentHours || !task.assignee) return sum;
        const member = team.find(m => m.id === task.assignee);
        const rate = member ? member.rate : 0;
        return sum + (task.spentHours * rate);
      }, 0);
      return {
        name: proj.name.length > 15 ? proj.name.substring(0, 15) + "..." : proj.name,
        fullName: proj.name,
        budget: proj.budget,
        actual: expenseSum + laborCost
      };
    });

    if (data.length === 0) {
      container.innerHTML = `<div class="flex items-center justify-center h-full text-slate-500 font-medium">Sin datos financieros para graficar</div>`;
      return;
    }

    // Find Max Value for scaling
    const maxVal = Math.max(...data.flatMap(d => [d.budget, d.actual])) * 1.15 || 10000;

    let svg = `<svg width="100%" height="100%" viewBox="0 0 ${containerWidth} ${containerHeight}" class="overflow-visible select-none">
      <defs>
        <!-- Gradients -->
        <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#6366f1" stop-opacity="0.2"/>
        </linearGradient>
        <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#10b981" stop-opacity="0.2"/>
        </linearGradient>
        <!-- Drop Shadow Filters -->
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    `;

    // Draw Grid Lines (Y-Axis)
    const gridCount = 4;
    for (let i = 0; i <= gridCount; i++) {
      const y = padding.top + chartHeight - (i / gridCount) * chartHeight;
      const value = Math.round((i / gridCount) * maxVal);
      svg += `
        <line x1="${padding.left}" y1="${y}" x2="${containerWidth - padding.right}" y2="${y}" stroke="var(--grid-color)" stroke-width="1" stroke-dasharray="4 6" />
        <text x="${padding.left - 10}" y="${y + 4}" fill="var(--text-secondary)" font-size="10" font-family="Inter, sans-serif" text-anchor="end">$${(value / 1000).toFixed(0)}k</text>
      `;
    }

    // Render Bars
    const groupCount = data.length;
    const groupWidth = chartWidth / groupCount;
    const barWidth = Math.min(22, groupWidth * 0.3);
    const spacing = 4;

    data.forEach((d, idx) => {
      const groupCenterX = padding.left + (idx * groupWidth) + (groupWidth / 2);
      
      const budgetHeight = (d.budget / maxVal) * chartHeight;
      const budgetY = padding.top + chartHeight - budgetHeight;
      const budgetX = groupCenterX - barWidth - spacing;

      const actualHeight = (d.actual / maxVal) * chartHeight;
      const actualY = padding.top + chartHeight - actualHeight;
      const actualX = groupCenterX + spacing;

      const isAlert = d.actual > d.budget;
      const actualBarColor = isAlert ? "url(#actualGrad)" : "url(#actualGrad)";
      
      svg += `
        <!-- Budget Bar -->
        <rect x="${budgetX}" y="${budgetY}" width="${barWidth}" height="${budgetHeight}" rx="4" fill="url(#budgetGrad)" class="chart-bar transition-all duration-700 origin-bottom" style="--bar-h: ${budgetHeight}px">
          <title>${d.fullName} (Presupuesto): $${d.budget.toLocaleString()}</title>
        </rect>
        
        <!-- Actual Bar -->
        <rect x="${actualX}" y="${actualY}" width="${barWidth}" height="${actualHeight}" rx="4" fill="${actualBarColor}" class="chart-bar transition-all duration-700 origin-bottom" style="--bar-h: ${actualHeight}px">
          <title>${d.fullName} (Gastos + Labor): $${d.actual.toLocaleString()}</title>
        </rect>
        
        <!-- X-Axis Label -->
        <text x="${groupCenterX}" y="${containerHeight - padding.bottom + 20}" fill="var(--text-primary)" font-size="10" font-family="Outfit, sans-serif" font-weight="500" text-anchor="middle">${d.name}</text>
      `;
    });

    svg += `</svg>`;
    container.innerHTML = svg;
  },

  /**
   * Renders a Beautiful Circular Doughnut Chart for Categories Distribution
   * @param {string} containerId - The element ID to append the SVG to
   * @param {Array} projects - The array of current projects
   */
  renderCategoryChart(containerId, projects) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const containerWidth = container.clientWidth || 300;
    const containerHeight = container.clientHeight || 260;
    const size = Math.min(containerWidth, containerHeight) - 30;
    const center = containerWidth / 2;
    const centerY = containerHeight / 2 - 10;
    const radius = size * 0.35;
    const strokeWidth = 20;

    // Categorize
    const categoryCounts = {};
    projects.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    const total = projects.length;
    const categories = Object.keys(categoryCounts).map(cat => ({
      name: cat,
      count: categoryCounts[cat],
      percentage: (categoryCounts[cat] / total) * 100
    }));

    if (total === 0) {
      container.innerHTML = `<div class="flex items-center justify-center h-full text-slate-500 font-medium">Sin datos de categorías</div>`;
      return;
    }

    // Modern color array
    const colors = ["#6366f1", "#14b8a6", "#f59e0b", "#e0e7ff", "#ec4899"];

    let svg = `<svg width="100%" height="100%" viewBox="0 0 ${containerWidth} ${containerHeight}" class="overflow-visible select-none">
      <defs>
        <filter id="glowArc" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    `;

    let accumulatedAngle = -90; // Start at top

    categories.forEach((cat, idx) => {
      const percentage = cat.percentage;
      const angle = (percentage / 100) * 360;
      const color = colors[idx % colors.length];

      // Arc calculation coordinates
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angle;
      accumulatedAngle = endAngle;

      const rad = Math.PI / 180;
      const x1 = center + radius * Math.cos(startAngle * rad);
      const y1 = centerY + radius * Math.sin(startAngle * rad);
      const x2 = center + radius * Math.cos(endAngle * rad);
      const y2 = centerY + radius * Math.sin(endAngle * rad);

      const largeArcFlag = angle > 180 ? 1 : 0;

      // Special case: 100% circle
      let pathD = "";
      if (percentage === 100) {
        pathD = `M ${center} ${centerY - radius} A ${radius} ${radius} 0 1 1 ${center - 0.01} ${centerY - radius}`;
      } else {
        pathD = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
      }

      svg += `
        <path d="${pathD}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" class="chart-arc cursor-pointer" style="--arc-len: ${2 * Math.PI * radius}px" filter="url(#glowArc)">
          <title>${cat.name}: ${cat.count} (${percentage.toFixed(0)}%)</title>
        </path>
      `;
    });

    // Center Label info
    svg += `
      <circle cx="${center}" cy="${centerY}" r="${radius - strokeWidth / 2 - 5}" fill="var(--card-bg)" />
      <text x="${center}" y="${centerY - 2}" fill="var(--text-primary)" font-size="18" font-family="Outfit, sans-serif" font-weight="700" text-anchor="middle">${total}</text>
      <text x="${center}" y="${centerY + 14}" fill="var(--text-secondary)" font-size="9" font-family="Inter, sans-serif" font-weight="600" text-anchor="middle" letter-spacing="1">PROYECTOS</text>
    `;

    // Legend placement
    const legendYStart = containerHeight - 35;
    const legendItemWidth = containerWidth / categories.length;
    
    categories.forEach((cat, idx) => {
      const color = colors[idx % colors.length];
      const xPos = idx * legendItemWidth + (legendItemWidth / 2);
      svg += `
        <circle cx="${xPos - 30}" cy="${legendYStart + 2}" r="5" fill="${color}" />
        <text x="${xPos - 20}" y="${legendYStart + 5}" fill="var(--text-primary)" font-size="10" font-family="Inter, sans-serif" font-weight="600">${cat.name}</text>
        <text x="${xPos - 20}" y="${legendYStart + 16}" fill="var(--text-secondary)" font-size="9" font-family="Inter, sans-serif">${cat.percentage.toFixed(0)}%</text>
      `;
    });

    svg += `</svg>`;
    container.innerHTML = svg;
  },

  /**
   * Renders a highly visual Horizontal workload completion rate for the team
   * @param {string} containerId - Element container to draw within
   * @param {Array} team - The team members list
   * @param {Array} projects - The list of active projects (to count actual active tasks per member)
   */
  renderTeamWorkload(containerId, team, projects) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    // Calculate actual active tasks per team member
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

    let html = `<div class="team-load-list space-y-4">`;

    team.forEach(member => {
      const tasksCount = activeTasksMap[member.id] || 0;
      
      // Limit scale: 5 tasks represents 100% full capacity
      const capacityPercent = Math.min(100, (tasksCount / 5) * 100);
      let statusColor = "var(--primary-indigo)"; // Normal
      let label = "Equilibrada";
      if (tasksCount >= 5) {
        statusColor = "var(--accent-red)"; // Overloaded
        label = "Sobrecargado";
      } else if (tasksCount >= 3) {
        statusColor = "var(--accent-amber)"; // Medium load
        label = "Productiva";
      } else if (tasksCount === 0) {
        statusColor = "var(--accent-lavender)"; // Underloaded
        label = "Disponible";
      }

      html += `
        <div class="team-load-item flex flex-col space-y-1.5">
          <div class="flex justify-between items-center text-xs">
            <div class="flex items-center space-x-2">
              <span class="w-2 h-2 rounded-full" style="background-color: ${member.color}"></span>
              <span class="font-semibold text-var(--text-primary)">${member.name}</span>
              <span class="text-slate-400 font-medium">(${member.role})</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <span class="px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase" style="background-color: ${statusColor}1c; color: ${statusColor}">${label}</span>
              <span class="font-bold text-var(--text-primary)">${tasksCount} Tareas</span>
            </div>
          </div>
          <div class="relative w-full h-2 rounded-full overflow-hidden" style="background-color: var(--timeline-bg)">
            <div class="absolute top-0 left-0 h-full rounded-full transition-all duration-700" style="width: ${capacityPercent}%; background-color: ${statusColor}"></div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }
};
