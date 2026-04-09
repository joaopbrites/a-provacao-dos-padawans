import {
  questionBank,
  createInitialState,
  applyAnswer,
  isAnswerCorrect,
} from "./questionService.js";

const ui = {
  screenMenu: document.getElementById("screen-menu"),
  screenGame: document.getElementById("screen-game"),
  screenGraduation: document.getElementById("screen-graduation"),
  btnStart: document.getElementById("btn-start"),
  groupCategory: document.getElementById("group-category"),
  groupGoal: document.getElementById("group-goal"),
  selectMode: document.getElementById("select-mode"),
  selectCategory: document.getElementById("select-category"),
  selectGoal: document.getElementById("select-goal"),
  selectTheme: document.getElementById("select-theme"),
  btnBackMenu: document.getElementById("btn-back-menu"),
  btnNextQuestion: document.getElementById("btn-next-question"),
  questionTopic: document.getElementById("question-topic"),
  questionText: document.getElementById("question-text"),
  questionOptions: document.getElementById("question-options"),
  questionDifficulty: document.getElementById("question-difficulty"),
  codeView: document.getElementById("code-view"),
  score: document.getElementById("score"),
  answered: document.getElementById("answered"),
  correct: document.getElementById("correct"),
  currentTopic: document.getElementById("current-topic"),
  goalProgress: document.getElementById("goal-progress"),
  graduationTitle: document.getElementById("graduation-title"),
  graduationSummary: document.getElementById("graduation-summary"),
  confettiContainer: document.getElementById("confetti-container"),
  btnGraduationMenu: document.getElementById("btn-graduation-menu"),
  toast: document.getElementById("feedback-toast"),
};

const CURRICULUM_STAGES = ["IALG", "ED", "POO", "Grafos", "CPA"];
const CURRICULUM_STAGE_GOAL = 5;
const MIN_PASS_RATE = 0.6;

let state = createInitialState();
let currentMode = "curriculum";
let currentCategory = "all";
let questionQueue = [];
let answerLocked = false;
let targetQuestions = 15;
let runFinished = false;
let stageIndex = 0;
let stageAnswered = 0;
let stageCorrect = 0;

function shuffle(list, rng = Math.random) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getFilteredQuestions() {
  const activeCategory = currentMode === "curriculum"
    ? CURRICULUM_STAGES[stageIndex]
    : currentCategory;

  if (activeCategory === "all") {
    return questionBank;
  }
  return questionBank.filter((question) => question.category === activeCategory);
}

function getQuestionCountForCategory(category) {
  if (category === "all") {
    return questionBank.length;
  }
  return questionBank.filter((question) => question.category === category).length;
}

function refillQueue() {
  const filtered = getFilteredQuestions();
  if (filtered.length === 0) {
    const activeCategory = currentMode === "curriculum"
      ? CURRICULUM_STAGES[stageIndex]
      : currentCategory;
    throw new Error(`Sem perguntas para categoria: ${activeCategory}`);
  }

  questionQueue = shuffle(filtered, Math.random);
  if (
    state.currentQuestion
    && questionQueue.length > 1
    && questionQueue[0].id === state.currentQuestion.id
  ) {
    [questionQueue[0], questionQueue[1]] = [questionQueue[1], questionQueue[0]];
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("vida.theme", theme);
  } catch {
    // Ignore storage errors in restricted contexts.
  }
}

function bootstrapTheme() {
  const allowed = ["ocean", "light", "forest"];
  let theme = "ocean";

  try {
    const stored = localStorage.getItem("vida.theme");
    if (allowed.includes(stored)) {
      theme = stored;
    }
  } catch {
    // Keep default theme.
  }

  applyTheme(theme);
  if (ui.selectTheme) {
    ui.selectTheme.value = theme;
  }
}

function setScreen(name) {
  ui.screenMenu.classList.remove("screen-active");
  ui.screenGame.classList.remove("screen-active");
  ui.screenGraduation.classList.remove("screen-active");
  if (name === "menu") {
    ui.screenMenu.classList.add("screen-active");
  } else if (name === "graduation") {
    ui.screenGraduation.classList.add("screen-active");
  } else {
    ui.screenGame.classList.add("screen-active");
  }
}

function showToast(message, type) {
  ui.toast.textContent = message;
  ui.toast.classList.remove("hidden", "success", "error");
  if (type) {
    ui.toast.classList.add(type);
  }
  setTimeout(() => {
    ui.toast.classList.add("hidden");
  }, 1400);
}

function setOptionButtonsState({ disabled, selectedIndex = null, correctIndex = null }) {
  const optionButtons = ui.questionOptions.querySelectorAll(".option-btn");
  optionButtons.forEach((button) => {
    const optionIndex = Number(button.dataset.optionIndex);
    button.disabled = disabled;
    button.classList.toggle("locked", disabled);
    if (selectedIndex !== null) {
      if (optionIndex === correctIndex) {
        button.classList.add("correct");
      } else if (optionIndex === selectedIndex && selectedIndex !== correctIndex) {
        button.classList.add("wrong");
      }
    }
  });
}

function renderFinalScreen({ passed, message }) {
  const accuracy = state.answered > 0
    ? Math.round((state.correct / state.answered) * 100)
    : 0;
  ui.graduationTitle.textContent = passed
    ? "Parabens, voce se formou no percurso!"
    : "Fim de jornada: desempenho abaixo de 60%";
  ui.graduationSummary.textContent = `${message} Pontuacao final: ${state.score} | Acertos: ${state.correct}/${state.answered} (${accuracy}%).`;

  ui.confettiContainer.innerHTML = "";

  if (passed) {
    const palette = ["#34d399", "#38bdf8", "#f59e0b", "#f87171", "#a78bfa", "#60a5fa"];
    for (let i = 0; i < 60; i += 1) {
      const confetti = document.createElement("span");
      confetti.className = "confetti";
      confetti.style.left = `${Math.floor(Math.random() * 100)}%`;
      confetti.style.top = `${-20 - Math.floor(Math.random() * 120)}px`;
      confetti.style.background = palette[i % palette.length];
      confetti.style.animationDelay = `${Math.random() * 0.8}s`;
      confetti.style.animationDuration = `${1200 + Math.floor(Math.random() * 1600)}ms`;
      ui.confettiContainer.appendChild(confetti);
    }
  }

  setScreen("graduation");
}

function updateStatus() {
  ui.score.textContent = String(state.score);
  ui.answered.textContent = String(state.answered);
  ui.correct.textContent = String(state.correct);
  ui.currentTopic.textContent = state.currentQuestion ? state.currentQuestion.topic : "-";
  if (currentMode === "curriculum") {
    const stageName = CURRICULUM_STAGES[stageIndex] || "Concluido";
    ui.goalProgress.textContent = `${state.answered}/${targetQuestions} (${stageName})`;
  } else {
    ui.goalProgress.textContent = `${state.answered}/${targetQuestions}`;
  }
}

async function requestQuestion() {
  if (questionQueue.length === 0) {
    refillQueue();
  }
  const next = questionQueue.shift();
  if (!next) {
    throw new Error("Nao foi possivel carregar pergunta.");
  }
  return next;
}

function renderQuestion(question) {
  state.currentQuestion = question;
  answerLocked = false;
  ui.btnNextQuestion.disabled = true;
  ui.questionTopic.textContent = question.topic;
  ui.questionText.textContent = question.prompt;
  ui.questionDifficulty.textContent = `Dificuldade: ${question.difficulty}`;
  ui.codeView.textContent = question.code;
  ui.questionOptions.innerHTML = "";

  const options = shuffle(
    question.options.map((option, index) => ({ text: option, originalIndex: index })),
    Math.random
  );

  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-btn";
    button.dataset.optionIndex = String(option.originalIndex);
    button.textContent = option.text;
    button.addEventListener("click", () => answer(option.originalIndex));
    ui.questionOptions.appendChild(button);
  });

  setOptionButtonsState({ disabled: false });

  updateStatus();
}

function answer(chosenIndex) {
  if (!state.currentQuestion || answerLocked || runFinished) {
    return;
  }
  answerLocked = true;

  const correct = isAnswerCorrect(state.currentQuestion, chosenIndex);
  state = applyAnswer(state, state.currentQuestion, chosenIndex);
  setOptionButtonsState({
    disabled: true,
    selectedIndex: chosenIndex,
    correctIndex: state.currentQuestion.correctOption,
  });
  if (correct) {
    if (currentMode === "curriculum") {
      stageCorrect += 1;
    }
    showToast("Resposta correta! +10", "success");
  } else {
    showToast("Resposta incorreta.", "error");
  }

  ui.btnNextQuestion.disabled = false;

  if (currentMode === "curriculum") {
    stageAnswered += 1;
    const stageDone = stageAnswered >= CURRICULUM_STAGE_GOAL;
    if (stageDone) {
      const stageRate = stageAnswered > 0 ? stageCorrect / stageAnswered : 0;
      if (stageRate < MIN_PASS_RATE) {
        runFinished = true;
        ui.btnNextQuestion.disabled = true;
        renderFinalScreen({
          passed: false,
          message: `Voce ficou com ${Math.round(stageRate * 100)}% na etapa ${CURRICULUM_STAGES[stageIndex]}. Minimo exigido: 60%. `,
        });
        return;
      }

      const finishedAll = stageIndex >= CURRICULUM_STAGES.length - 1;
      if (finishedAll) {
        runFinished = true;
        ui.btnNextQuestion.disabled = true;
        ui.questionDifficulty.textContent = "Formado no jogo";
        renderFinalScreen({ passed: true, message: "Curso concluido com sucesso. " });
      } else {
        stageIndex += 1;
        stageAnswered = 0;
        stageCorrect = 0;
        questionQueue = [];
        showToast(`Etapa concluida! Avancando para ${CURRICULUM_STAGES[stageIndex]}.`, "success");
      }
    }
  }

  if (currentMode !== "curriculum" && state.answered >= targetQuestions) {
    runFinished = true;
    ui.btnNextQuestion.disabled = true;
    const rate = state.answered > 0 ? state.correct / state.answered : 0;
    const passed = rate >= MIN_PASS_RATE;
    renderFinalScreen({
      passed,
      message: passed
        ? "Treino concluido. "
        : "Treino encerrado por desempenho abaixo de 60%. ",
    });
  }

  updateStatus();
}

async function nextQuestion() {
  if (runFinished) {
    showToast("Objetivo concluido. Volte ao menu para iniciar nova sessao.", "success");
    return;
  }

  if (!answerLocked && state.currentQuestion) {
    showToast("Responda a pergunta atual antes de avancar.", "error");
    return;
  }

  try {
    const question = await requestQuestion();
    renderQuestion(question);
  } catch (error) {
    showToast(error instanceof Error ? error.message : "Falha ao carregar pergunta.", "error");
  }
}

function resetSession() {
  state = createInitialState();
  questionQueue = [];
  answerLocked = false;
  runFinished = false;
  stageIndex = 0;
  stageAnswered = 0;
  stageCorrect = 0;
  ui.btnNextQuestion.disabled = true;
  updateStatus();
}

function syncMenuByMode() {
  const isCurriculum = (ui.selectMode?.value || "curriculum") === "curriculum";
  if (ui.groupCategory) {
    ui.groupCategory.classList.toggle("hidden", isCurriculum);
  }
  if (ui.groupGoal) {
    ui.groupGoal.classList.toggle("hidden", isCurriculum);
  }
  if (ui.selectCategory) {
    ui.selectCategory.disabled = isCurriculum;
  }
  if (ui.selectGoal) {
    ui.selectGoal.disabled = isCurriculum;
  }
  if (isCurriculum && ui.selectGoal) {
    ui.selectGoal.value = String(CURRICULUM_STAGE_GOAL);
  }
}

ui.btnStart.addEventListener("click", async () => {
  currentMode = ui.selectMode?.value || "curriculum";
  currentCategory = ui.selectCategory?.value || "all";
  const selectedGoal = Number(ui.selectGoal?.value || 10);
  const availableInCategory = getQuestionCountForCategory(currentCategory);
  const cappedGoal = Math.max(1, Math.min(selectedGoal, availableInCategory));
  targetQuestions = currentMode === "curriculum"
    ? CURRICULUM_STAGE_GOAL * CURRICULUM_STAGES.length
    : cappedGoal;

  if (currentMode === "free" && cappedGoal < selectedGoal) {
    showToast(`Meta ajustada para ${cappedGoal} para evitar repeticao.`, "success");
  }
  resetSession();
  setScreen("game");
  await nextQuestion();
});

ui.btnBackMenu.addEventListener("click", () => {
  setScreen("menu");
});

if (ui.btnGraduationMenu) {
  ui.btnGraduationMenu.addEventListener("click", () => {
    setScreen("menu");
  });
}

ui.btnNextQuestion.addEventListener("click", async () => {
  await nextQuestion();
});

if (ui.selectTheme) {
  ui.selectTheme.addEventListener("change", () => {
    applyTheme(ui.selectTheme.value || "ocean");
  });
}

if (ui.selectMode) {
  ui.selectMode.addEventListener("change", syncMenuByMode);
}

bootstrapTheme();
syncMenuByMode();
setScreen("menu");
updateStatus();
