import { MODES, GAME_CONFIG } from "./config.js";
import { createEngine } from "./gameEngine.js";
import { renderCodeLines, highlightLine, renderVariables, updateHeader } from "./ui.js";

const engine = createEngine();
let tickInterval = null;
let activeQuestionStart = 0;
let arrayExpanded = false;
let modalMinimized = false;

const screens = {
  menu: document.getElementById("screen-menu"),
  selection: document.getElementById("screen-selection"),
  game: document.getElementById("screen-game"),
};

const ui = {
  btnArcade: document.getElementById("btn-arcade"),
  btnSelection: document.getElementById("btn-selection"),
  btnBackMenu: document.getElementById("btn-back-menu"),
  selectionList: document.getElementById("selection-list"),
  codeViewer: document.getElementById("code-viewer"),
  varsPanel: document.getElementById("vars-panel"),
  phaseActions: document.getElementById("phase-actions"),
  questionModal: document.getElementById("question-modal"),
  questionText: document.getElementById("question-text"),
  questionOptions: document.getElementById("question-options"),
  questionTimer: document.getElementById("question-timer"),
  btnMinimizeQuestion: document.getElementById("btn-minimize-question"),
  minimizedQuestion: document.getElementById("minimized-question"),
  btnRestoreQuestion: document.getElementById("btn-restore-question"),
  toast: document.getElementById("feedback-toast"),
};

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

function closeQuestionModal() {
  ui.questionModal.classList.add("hidden");
  ui.minimizedQuestion.classList.add("hidden");
  modalMinimized = false;
}

function openQuestionModal(question) {
  ui.questionText.textContent = question.prompt;
  ui.questionOptions.innerHTML = "";
  ui.questionTimer.textContent = "Tempo: 0s";
  activeQuestionStart = Date.now();

  for (const option of question.options) {
    const button = document.createElement("button");
    button.textContent = String(option);
    button.addEventListener("click", () => {
      const elapsedSeconds = Math.floor((Date.now() - activeQuestionStart) / 1000);
      const result = engine.answerQuestion(Number(option), elapsedSeconds);
      if (result.correct) {
        showToast(`Correto! +${result.delta} pontos`);
      } else {
        showToast("Resposta incorreta", true);
      }

      updateHeader(engine.state);
      closeQuestionModal();
      if (engine.state.status === "game-over") {
        renderGameOver();
      }
    });
    ui.questionOptions.appendChild(button);
  }

  ui.questionModal.classList.remove("hidden");

  const timerInterval = setInterval(() => {
    if (ui.questionModal.classList.contains("hidden") && ui.minimizedQuestion.classList.contains("hidden")) {
      clearInterval(timerInterval);
      return;
    }
    const elapsed = Math.floor((Date.now() - activeQuestionStart) / 1000);
    ui.questionTimer.textContent = `Tempo: ${elapsed}s`;
  }, 1000);
}

function renderSelectionButtons() {
  ui.selectionList.innerHTML = "";
  for (const algorithmId of engine.getSelectionAlgorithms()) {
    const button = document.createElement("button");
    button.textContent = algorithmId;
    button.addEventListener("click", () => startGame(MODES.SELECTION, algorithmId));
    ui.selectionList.appendChild(button);
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
  arrayExpanded = false;
  ui.phaseActions.innerHTML = "";
  renderCodeLines(ui.codeViewer, engine.state.phase.pseudocode);
  renderVariables(ui.varsPanel, engine.state.phase.snapshots[0], arrayExpanded);
  updateHeader(engine.state);
}

function handleTick() {
  const event = engine.tick();
  if (event.type === "idle") {
    return;
  }

  if (event.type === "step") {
    highlightLine(ui.codeViewer, event.snapshot.line);
    if (!modalMinimized) {
      renderVariables(ui.varsPanel, event.snapshot, arrayExpanded);
      bindArrayToggle(event.snapshot);
    }
    return;
  }

  if (event.type === "question") {
    highlightLine(ui.codeViewer, event.snapshot.line);
    renderVariables(ui.varsPanel, event.snapshot, arrayExpanded);
    bindArrayToggle(event.snapshot);
    openQuestionModal(event.question);
    return;
  }

  if (event.type === "phase-complete") {
    renderPhaseEnd(event.finalQuestion);
  }
}

function bindArrayToggle(snapshot) {
  const button = document.getElementById("toggle-array");
  if (!button) {
    return;
  }
  button.addEventListener("click", () => {
    arrayExpanded = !arrayExpanded;
    renderVariables(ui.varsPanel, snapshot, arrayExpanded);
    bindArrayToggle(snapshot);
  });
}

function startTick() {
  stopTick();
  tickInterval = setInterval(handleTick, GAME_CONFIG.snapshotDelayMs);
}

function stopTick() {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

function startGame(mode, selectionAlgorithmId) {
  engine.start(mode, selectionAlgorithmId);
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

  ui.btnBackMenu.addEventListener("click", () => {
    setScreen("menu");
  });

  ui.btnMinimizeQuestion.addEventListener("click", () => {
    modalMinimized = true;
    ui.questionModal.classList.add("hidden");
    ui.minimizedQuestion.classList.remove("hidden");
  });

  ui.btnRestoreQuestion.addEventListener("click", () => {
    modalMinimized = false;
    ui.questionModal.classList.remove("hidden");
    ui.minimizedQuestion.classList.add("hidden");
  });
}

function init() {
  bindEvents();
  setScreen("menu");
}

init();
