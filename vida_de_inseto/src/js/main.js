import { MODES, GAME_CONFIG } from "./config.js";
import { createEngine } from "./gameEngine.js";
import { renderCodeLines, highlightLine, renderVariables, updateHeader } from "./ui.js?v=20260408c";
import {
  onIncomingQuestion,
  onClearQuestion,
  onToggleByUser,
  onManualClose,
  onResize,
} from "./core/questionPanelController.js?v=20260408c";

const engine = createEngine();
let tickInterval = null;
let activeQuestionStart = 0;
let varsOpen = window.innerWidth > 900;
let questionOpen = false;
let questionPanelLocked = false;
let optionsOpen = false;
let latestSnapshot = null;
let currentQuestion = null;
let tickDelayMs = GAME_CONFIG.snapshotDelayMs;
const varTreeState = {
  scopes: {},
  arrays: {},
};
const THEME_STORAGE_KEY = "vida-inseto-theme";
const THEMES = [
  { key: "midnight", label: "Midnight Code" },
  { key: "sunset", label: "Sunset Debug" },
];
const selectionTreeState = {
  expanded: {},
};

const screens = {
  menu: document.getElementById("screen-menu"),
  selection: document.getElementById("screen-selection"),
  game: document.getElementById("screen-game"),
};

const ui = {
  btnArcade: document.getElementById("btn-arcade"),
  btnSelection: document.getElementById("btn-selection"),
  btnThemeToggle: document.getElementById("btn-theme-toggle"),
  btnBackMenu: document.getElementById("btn-back-menu"),
  workspaceShell: document.querySelector(".workspace-shell"),
  selectionList: document.getElementById("selection-list"),
  codeContent: document.getElementById("code-content"),
  codeGutter: document.getElementById("code-gutter"),
  codeScroll: document.getElementById("code-scroll"),
  varsPanel: document.getElementById("vars-panel"),
  varsContent: document.getElementById("vars-content"),
  btnToggleVars: document.getElementById("btn-toggle-vars"),
  btnCloseVars: document.getElementById("btn-close-vars"),
  btnOpenQuestion: document.getElementById("btn-open-question"),
  btnCloseQuestion: document.getElementById("btn-close-question"),
  btnOpenOptions: document.getElementById("btn-open-options"),
  btnCloseOptions: document.getElementById("btn-close-options"),
  optionsPanel: document.getElementById("options-panel"),
  speedSelect: document.getElementById("speed-select"),
  speedCurrent: document.getElementById("speed-current"),
  btnBackHome: document.getElementById("btn-back-home"),
  questionPanel: document.getElementById("question-panel"),
  questionContent: document.getElementById("question-content"),
  varsBackdrop: document.getElementById("vars-backdrop"),
  phaseActions: document.getElementById("phase-actions"),
  toast: document.getElementById("feedback-toast"),
};

function getThemeByKey(key) {
  const found = THEMES.find((theme) => theme.key === key);
  return found || THEMES[0];
}

function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredTheme(themeKey) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeKey);
  } catch {
    // Ignore storage failures to avoid breaking gameplay controls.
  }
}

function applyTheme(themeKey) {
  const theme = getThemeByKey(themeKey);
  document.body.dataset.theme = theme.key;
  if (ui.btnThemeToggle) {
    ui.btnThemeToggle.textContent = `Tema: ${theme.label}`;
  }
  writeStoredTheme(theme.key);
}

function initTheme() {
  const storedTheme = readStoredTheme();
  applyTheme(storedTheme || THEMES[0].key);
}

function toggleTheme() {
  const currentKey = document.body.dataset.theme || THEMES[0].key;
  const currentIndex = THEMES.findIndex((theme) => theme.key === currentKey);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % THEMES.length : 0;
  applyTheme(THEMES[nextIndex].key);
}

function syncWorkspaceColumns() {
  if (!ui.workspaceShell) {
    return;
  }

  if (window.innerWidth <= 900) {
    ui.workspaceShell.style.gridTemplateColumns = "52px minmax(0, 1fr)";
    ui.varsPanel.style.display = "flex";
    ui.questionPanel.style.display = "flex";
    return;
  }

  const varsCol = varsOpen ? "280px" : "0px";
  const questionCol = questionOpen ? "340px" : "0px";
  const shellWidth = ui.workspaceShell.clientWidth;
  const varsWidth = varsOpen ? 280 : 0;
  const questionWidth = questionOpen ? 340 : 0;
  const editorWidth = Math.max(0, shellWidth - 52 - varsWidth - questionWidth);
  ui.workspaceShell.style.gridTemplateColumns = `52px ${varsCol} ${editorWidth}px ${questionCol}`;
  ui.varsPanel.style.display = varsOpen ? "flex" : "none";
  ui.questionPanel.style.display = questionOpen ? "flex" : "none";
}

function applySidebarState() {
  screens.game.classList.toggle("sidebar-collapsed", !varsOpen);
  screens.game.classList.toggle("sidebar-open", varsOpen && window.innerWidth <= 900);
  ui.btnToggleVars.classList.toggle("active", varsOpen);
  syncWorkspaceColumns();
  if (varsOpen && latestSnapshot) {
    renderVariables(ui.varsContent, latestSnapshot, varTreeState);
    bindVarTreeInteractions(latestSnapshot);
  }
}

function setVarsOpen(next) {
  varsOpen = next;
  applySidebarState();
}

function applyQuestionState() {
  screens.game.classList.toggle("question-open", questionOpen && window.innerWidth <= 900);
  screens.game.classList.toggle("question-collapsed", !questionOpen && window.innerWidth > 900);
  ui.btnOpenQuestion.classList.toggle("active", !!currentQuestion && questionOpen);
  syncWorkspaceColumns();
}

function setQuestionOpen(next) {
  questionOpen = next;
  applyQuestionState();
}

function applyOptionsState() {
  if (!ui.optionsPanel || !ui.btnOpenOptions) {
    return;
  }
  ui.optionsPanel.classList.toggle("open", optionsOpen);
  ui.btnOpenOptions.classList.toggle("active", optionsOpen);
}

function setOptionsOpen(next) {
  optionsOpen = next;
  applyOptionsState();
}

function updateSpeedIndicator() {
  if (!ui.speedCurrent) {
    return;
  }
  ui.speedCurrent.textContent = `Atual: ${tickDelayMs}ms`;
}

function applyTickSpeed(nextSpeedMs) {
  if (!Number.isFinite(nextSpeedMs) || nextSpeedMs <= 0) {
    return;
  }
  tickDelayMs = nextSpeedMs;
  if (ui.speedSelect && Number(ui.speedSelect.value) !== nextSpeedMs) {
    ui.speedSelect.value = String(nextSpeedMs);
  }
  updateSpeedIndicator();
  if (tickInterval) {
    startTick();
  }
}

function returnToHome() {
  stopTick();
  clearQuestionPanel();
  setOptionsOpen(false);
  setScreen("menu");
}

function setScreen(name) {
  for (const key of Object.keys(screens)) {
    screens[key].classList.remove("screen-active");
  }
  screens[name].classList.add("screen-active");
}

function showToast(message, isError = false) {
  ui.toast.textContent = message;
  ui.toast.classList.remove("hidden", "error");
  if (isError) {
    ui.toast.classList.add("error");
  }
  setTimeout(() => {
    ui.toast.classList.add("hidden");
  }, 1500);
}

function clearQuestionPanel() {
  currentQuestion = null;
  ({ questionOpen, questionPanelLocked } = onClearQuestion(
    { questionOpen, questionPanelLocked },
    window.innerWidth > 900
  ));
  ui.btnOpenQuestion.classList.remove("active");
  ui.questionContent.classList.add("empty");
  ui.questionContent.innerHTML = "<p>A pergunta aparecera aqui quando a execucao pausar.</p>";
  if (window.innerWidth > 900) {
    setQuestionOpen(false);
  }
}

function openQuestionPanel(question) {
  currentQuestion = question;
  ({ questionOpen, questionPanelLocked } = onIncomingQuestion({ questionOpen, questionPanelLocked }));
  setQuestionOpen(true);
  ui.btnOpenQuestion.classList.add("active");
  activeQuestionStart = Date.now();

  function renderQuestionContent() {
    if (!currentQuestion) {
      return;
    }

    const elapsed = Math.floor((Date.now() - activeQuestionStart) / 1000);
    let html = "";
    html += `<h4 class=\"question-title\">${currentQuestion.prompt}</h4>`;
    html += `<div class=\"question-options\">`;
    for (const option of currentQuestion.options) {
      html += `<button class=\"question-option\" data-option=\"${option}\" type=\"button\">${option}</button>`;
    }
    html += "</div>";
    html += `<small class=\"question-timer\">Tempo: ${elapsed}s</small>`;
    ui.questionContent.classList.remove("empty");
    ui.questionContent.innerHTML = html;

    for (const button of ui.questionContent.querySelectorAll(".question-option")) {
      button.addEventListener("click", () => {
        const elapsedSeconds = Math.floor((Date.now() - activeQuestionStart) / 1000);
        const result = engine.answerQuestion(button.dataset.option, elapsedSeconds);
        if (result.correct) {
          showToast(`Correto! +${result.delta} pontos`);
        } else {
          showToast("Resposta incorreta", true);
        }

        updateHeader(engine.state);
        clearQuestionPanel();
        if (engine.state.status === "game-over") {
          renderGameOver();
          return;
        }

        if (window.innerWidth <= 900) {
          setQuestionOpen(false);
        }
      });
    }
  }

  renderQuestionContent();

  const timerInterval = setInterval(() => {
    if (!currentQuestion) {
      clearInterval(timerInterval);
      return;
    }

    renderQuestionContent();
  }, 1000);
}

function renderSelectionButtons() {
  ui.selectionList.innerHTML = "";

  const algorithms = engine.getSelectionAlgorithms();
  const root = document.createElement("ul");
  root.className = "selection-tree";

  for (const algorithmId of algorithms) {
    const li = document.createElement("li");
    li.className = "selection-node";

    const folderButton = document.createElement("button");
    folderButton.type = "button";
    folderButton.className = "selection-folder";
    folderButton.dataset.algorithm = algorithmId;
    const isExpanded = selectionTreeState.expanded[algorithmId] === true;
    folderButton.innerHTML = `<span class="selection-chevron">${isExpanded ? "v" : ">"}</span><span class="selection-folder-icon">DIR</span><span class="selection-folder-name">${algorithmId}</span>`;
    li.appendChild(folderButton);

    if (isExpanded) {
      const variantList = document.createElement("ul");
      variantList.className = "selection-variants";

      const optionLi = document.createElement("li");
      const optionButton = document.createElement("button");
      optionButton.type = "button";
      optionButton.className = "selection-option";
      optionButton.dataset.startAlgorithm = algorithmId;
      optionButton.innerHTML = `<span class="selection-file-icon">JS</span><span>Pseudocodigo iterativo</span>`;
      optionLi.appendChild(optionButton);
      variantList.appendChild(optionLi);

      const hintLi = document.createElement("li");
      hintLi.className = "selection-hint";
      hintLi.textContent = "Variacoes futuras podem ser adicionadas aqui.";
      variantList.appendChild(hintLi);

      li.appendChild(variantList);
    }

    root.appendChild(li);
  }

  ui.selectionList.appendChild(root);

  for (const folderButton of ui.selectionList.querySelectorAll(".selection-folder")) {
    folderButton.addEventListener("click", () => {
      const { algorithm } = folderButton.dataset;
      selectionTreeState.expanded[algorithm] = !selectionTreeState.expanded[algorithm];
      renderSelectionButtons();
    });
  }

  for (const optionButton of ui.selectionList.querySelectorAll(".selection-option")) {
    optionButton.addEventListener("click", () => {
      startGame(MODES.SELECTION, optionButton.dataset.startAlgorithm);
    });
  }
}

function renderGameOver() {
  stopTick();
  ui.phaseActions.innerHTML = "";
  const backButton = document.createElement("button");
  backButton.textContent = "Voltar ao menu";
  backButton.addEventListener("click", () => {
    setScreen("menu");
  });
  ui.phaseActions.appendChild(backButton);
  showToast(`Game over: ${engine.state.gameOverReason}`, true);
}

function renderPhaseEnd(finalQuestion) {
  stopTick();
  ui.phaseActions.innerHTML = "";

  if (engine.state.mode === MODES.SELECTION) {
    const nextButton = document.createElement("button");
    nextButton.textContent = "Nova fase didatica";
    nextButton.addEventListener("click", () => {
      engine.nextSelectionPhase();
      startTick();
      renderNewPhase();
    });
    ui.phaseActions.appendChild(nextButton);
    return;
  }

  const title = document.createElement("p");
  title.textContent = "Pergunta final: identifique o algoritmo executado.";
  ui.phaseActions.appendChild(title);

  for (const option of finalQuestion.options) {
    const button = document.createElement("button");
    button.textContent = option;
    button.addEventListener("click", () => {
      const result = engine.answerFinalQuestion(option);
      if (!result.correct) {
        renderGameOver();
        return;
      }
      showToast("Correto! Proxima fase iniciada.");
      renderNewPhase();
      startTick();
    });
    ui.phaseActions.appendChild(button);
  }
}

function renderNewPhase() {
  varTreeState.scopes = {};
  varTreeState.arrays = {};
  clearQuestionPanel();
  ui.phaseActions.innerHTML = "";
  renderCodeLines(ui.codeContent, ui.codeGutter, engine.state.phase.pseudocode);
  latestSnapshot = engine.state.phase.snapshots[0];
  if (varsOpen) {
    renderVariables(ui.varsContent, latestSnapshot, varTreeState);
    bindVarTreeInteractions(latestSnapshot);
  }
  updateHeader(engine.state);
  applySidebarState();
  applyQuestionState();
}

function handleTick() {
  let event;
  try {
    event = engine.tick();
  } catch (error) {
    stopTick();
    showToast(`Erro na execucao: ${error?.message || error}`, true);
    return;
  }

  if (event.type === "idle") {
    return;
  }

  if (event.type === "step") {
    latestSnapshot = event.snapshot;
    highlightLine(ui.codeContent, ui.codeGutter, event.snapshot.line);
    if (varsOpen) {
      renderVariables(ui.varsContent, event.snapshot, varTreeState);
      bindVarTreeInteractions(event.snapshot);
    }
    return;
  }

  if (event.type === "question") {
    latestSnapshot = event.snapshot;
    highlightLine(ui.codeContent, ui.codeGutter, event.snapshot.line);
    if (varsOpen) {
      renderVariables(ui.varsContent, event.snapshot, varTreeState);
      bindVarTreeInteractions(event.snapshot);
    }
    openQuestionPanel(event.question);
    return;
  }

  if (event.type === "phase-complete") {
    renderPhaseEnd(event.finalQuestion);
  }
}

function bindVarTreeInteractions(snapshot) {
  for (const button of ui.varsContent.querySelectorAll("[data-toggle-scope]")) {
    button.addEventListener("click", () => {
      const key = button.dataset.toggleScope;
      varTreeState.scopes[key] = !varTreeState.scopes[key];
      renderVariables(ui.varsContent, snapshot, varTreeState);
      bindVarTreeInteractions(snapshot);
    });
  }

  for (const button of ui.varsContent.querySelectorAll("[data-toggle-array]")) {
    button.addEventListener("click", () => {
      const key = button.dataset.toggleArray;
      varTreeState.arrays[key] = !varTreeState.arrays[key];
      renderVariables(ui.varsContent, snapshot, varTreeState);
      bindVarTreeInteractions(snapshot);
    });
  }
}

function startTick() {
  stopTick();
  handleTick();
  tickInterval = setInterval(handleTick, tickDelayMs);
}

function stopTick() {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

function startGame(mode, selectionAlgorithmId) {
  engine.start(mode, selectionAlgorithmId);
  latestSnapshot = null;
  varsOpen = window.innerWidth > 900;
  questionOpen = false;
  questionPanelLocked = false;
  optionsOpen = false;
  applyOptionsState();
  setScreen("game");
  renderNewPhase();
  startTick();
}

function bindEvents() {
  ui.btnArcade.addEventListener("click", () => {
    startGame(MODES.ARCADE);
  });

  ui.btnSelection.addEventListener("click", () => {
    renderSelectionButtons();
    setScreen("selection");
  });

  if (ui.btnThemeToggle) {
    ui.btnThemeToggle.addEventListener("click", () => {
      toggleTheme();
    });
  }

  if (ui.btnOpenOptions) {
    ui.btnOpenOptions.addEventListener("click", () => {
      setOptionsOpen(!optionsOpen);
    });
  }

  if (ui.btnCloseOptions) {
    ui.btnCloseOptions.addEventListener("click", () => {
      setOptionsOpen(false);
    });
  }

  if (ui.speedSelect) {
    ui.speedSelect.addEventListener("change", () => {
      applyTickSpeed(Number(ui.speedSelect.value));
    });
  }

  if (ui.btnBackHome) {
    ui.btnBackHome.addEventListener("click", () => {
      returnToHome();
    });
  }

  ui.btnBackMenu.addEventListener("click", () => {
    setScreen("menu");
  });

  ui.btnToggleVars.addEventListener("click", () => {
    setVarsOpen(!varsOpen);
  });

  ui.btnCloseVars.addEventListener("click", () => {
    setVarsOpen(false);
  });

  ui.varsBackdrop.addEventListener("click", () => {
    setVarsOpen(false);
    setQuestionOpen(false);
  });

  ui.btnOpenQuestion.addEventListener("click", () => {
    ({ questionOpen, questionPanelLocked } = onToggleByUser(
      { questionOpen, questionPanelLocked },
      Boolean(currentQuestion)
    ));
    setQuestionOpen(questionOpen);
  });

  ui.btnCloseQuestion.addEventListener("click", () => {
    ({ questionOpen, questionPanelLocked } = onManualClose({ questionOpen, questionPanelLocked }));
    setQuestionOpen(questionOpen);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900 && !varsOpen) {
      setVarsOpen(true);
    }
    ({ questionOpen, questionPanelLocked } = onResize(
      { questionOpen, questionPanelLocked },
      window.innerWidth,
      Boolean(currentQuestion)
    ));
    if (window.innerWidth > 900 && questionOpen) {
      setQuestionOpen(true);
    }

    applySidebarState();
    applyQuestionState();
  });

  ui.codeScroll.addEventListener("scroll", () => {
    const y = ui.codeScroll.scrollTop;
    ui.codeGutter.style.transform = `translateY(${-y}px)`;
  });
}

function init() {
  initTheme();
  applyTickSpeed(GAME_CONFIG.snapshotDelayMs);
  bindEvents();
  setScreen("menu");
}

init();
