export function renderCodeLines(container, lines) {
  container.innerHTML = "";
  lines.forEach((line, index) => {
    const row = document.createElement("div");
    row.className = "code-line";
    row.dataset.line = String(index + 1);
    row.textContent = `${index + 1}. ${line}`;
    container.appendChild(row);
  });
}

export function highlightLine(container, lineNumber) {
  for (const node of container.querySelectorAll(".code-line")) {
    node.classList.remove("active");
  }
  const target = container.querySelector(`.code-line[data-line=\"${lineNumber}\"]`);
  if (target) {
    target.classList.add("active");
  }
}

export function renderVariables(container, snapshot, expandedArray) {
  const vars = snapshot?.vars || {};
  const entries = Object.entries(vars);
  let html = "<h3>Variaveis</h3><ul>";
  for (const [key, value] of entries) {
    html += `<li><strong>${key}:</strong> ${value}</li>`;
  }
  html += "</ul>";

  html += `<button id=\"toggle-array\">${expandedArray ? "Ocultar" : "Mostrar"} array</button>`;
  if (expandedArray) {
    html += "<ul>";
    for (let i = 0; i < (snapshot?.array || []).length; i += 1) {
      html += `<li>[${i}] = ${snapshot.array[i]}</li>`;
    }
    html += "</ul>";
  }

  container.innerHTML = html;
}

export function updateHeader(state) {
  const mode = document.getElementById("hud-mode");
  const score = document.getElementById("hud-score");
  const errors = document.getElementById("hud-errors");
  const phase = document.getElementById("hud-phase");
  const algorithm = document.getElementById("hud-algorithm");
  const seed = document.getElementById("hud-seed");

  mode.textContent = state.mode;
  score.textContent = String(state.score);
  errors.textContent = String(state.errors);
  phase.textContent = String(state.phaseNumber);
  algorithm.textContent = state.phase?.algorithmName || "-";
  seed.textContent = String(state.phase?.seed ?? "-");
}
