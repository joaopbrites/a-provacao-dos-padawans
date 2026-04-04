export function renderCodeLines(contentContainer, gutterContainer, lines) {
  contentContainer.innerHTML = "";
  gutterContainer.innerHTML = "";

  lines.forEach((line, index) => {
    const row = document.createElement("div");
    row.className = "code-line";
    row.dataset.line = String(index + 1);
    row.textContent = line;
    contentContainer.appendChild(row);

    const gutter = document.createElement("div");
    gutter.className = "gutter-line";
    gutter.dataset.line = String(index + 1);
    gutter.textContent = String(index + 1);
    gutterContainer.appendChild(gutter);
  });
}

export function highlightLine(contentContainer, gutterContainer, lineNumber) {
  for (const node of contentContainer.querySelectorAll(".code-line")) {
    node.classList.remove("active");
  }
  for (const node of gutterContainer.querySelectorAll(".gutter-line")) {
    node.classList.remove("active");
  }

  const target = contentContainer.querySelector(`.code-line[data-line=\"${lineNumber}\"]`);
  if (target) {
    target.classList.add("active");
  }

  const gutterTarget = gutterContainer.querySelector(`.gutter-line[data-line=\"${lineNumber}\"]`);
  if (gutterTarget) {
    gutterTarget.classList.add("active");
  }
}

function renderScalar(value) {
  if (typeof value === "string") {
    return `\"${value}\"`;
  }
  if (value === null || value === undefined) {
    return String(value);
  }
  return String(value);
}

function isArrayLike(value) {
  return Array.isArray(value);
}

export function renderVariables(container, snapshot, treeState = { scopes: {}, arrays: {} }) {
  const rawScopes = snapshot?.scopeVars && typeof snapshot.scopeVars === "object"
    ? snapshot.scopeVars
    : { principal: snapshot?.vars || {} };

  if (!rawScopes.principal) {
    rawScopes.principal = {};
  }

  rawScopes.principal.array = snapshot?.array || [];

  let html = "<div class=\"tree-group\"><div class=\"tree-title\">VARIABLES</div>";
  html += "<ul class=\"tree-list\">";

  for (const [scopeName, scopeVars] of Object.entries(rawScopes)) {
    const scopeKey = `scope:${scopeName}`;
    const isScopeOpen = treeState.scopes[scopeKey] !== false;
    const scopeArrow = isScopeOpen ? "v" : ">";

    html += "<li class=\"tree-node\">";
    html += `<button class=\"tree-toggle\" data-toggle-scope=\"${scopeKey}\" type=\"button\">${scopeArrow}</button>`;
    html += `<span class=\"tree-label scope\">${scopeName}</span>`;
    html += "</li>";

    if (isScopeOpen) {
      for (const [varName, value] of Object.entries(scopeVars)) {
        if (isArrayLike(value)) {
          const arrayKey = `${scopeKey}:${varName}`;
          const isArrayOpen = treeState.arrays[arrayKey] === true;
          const arrayArrow = isArrayOpen ? "v" : ">";

          html += "<li class=\"tree-node tree-child\">";
          html += `<button class=\"tree-toggle\" data-toggle-array=\"${arrayKey}\" type=\"button\">${arrayArrow}</button>`;
          html += `<span class=\"tree-label\">${varName} = Array(${value.length})</span>`;
          html += "</li>";

          if (isArrayOpen) {
            for (let i = 0; i < value.length; i += 1) {
              html += `<li class=\"tree-node tree-child tree-grandchild\"><span class=\"tree-indent\"></span><span class=\"tree-label\">[${i}] = ${renderScalar(value[i])}</span></li>`;
            }
          }
        } else {
          html += `<li class=\"tree-node tree-child\"><span class=\"tree-indent\"></span><span class=\"tree-label\">${varName} = ${renderScalar(value)}</span></li>`;
        }
      }
    }
  }

  html += "</ul></div>";
  container.innerHTML = html;
}

export function updateHeader(state) {
  const mode = document.getElementById("hud-mode");
  const score = document.getElementById("hud-score");
  const errors = document.getElementById("hud-errors");
  const phase = document.getElementById("hud-phase");
  const phaseTab = document.getElementById("hud-phase-tab");

  if (mode) {
    mode.textContent = state.mode;
  }
  if (score) {
    score.textContent = String(state.score);
  }
  if (errors) {
    errors.textContent = String(state.errors);
  }
  if (phase) {
    phase.textContent = String(state.phaseNumber);
  }
  if (phaseTab) {
    phaseTab.textContent = `Fase ${state.phaseNumber}`;
  }
}
