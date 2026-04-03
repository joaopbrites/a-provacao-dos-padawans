import { GAME_CONFIG, MODES } from "./config.js";
import { createInitialState } from "./core/stateStore.js";
import { calculateAnswerScore, addScore, registerError, shouldEndByErrors } from "./core/scoreEngine.js";
import { createPhase, getAlgorithmIds } from "./phaseEngine.js";
import { mulberry32, pickRandom, shuffleWithRng } from "./utils/random.js";

function nowSeed() {
  return Math.floor(Date.now() % 2147483647);
}

export function createEngine() {
  const state = {
    ...createInitialState(MODES.ARCADE),
    phase: null,
    questionQueue: [],
    pendingQuestion: null,
    finalQuestion: null,
    currentSnapshotIndex: 0,
    paused: false,
    gameOverReason: "",
  };

  function start(mode, selectedAlgorithmId) {
    state.mode = mode;
    state.score = 0;
    state.errors = 0;
    state.phaseNumber = 1;
    state.status = "running";
    state.gameOverReason = "";
    beginPhase(selectedAlgorithmId);
  }

  function beginPhase(selectedAlgorithmId) {
    const seed = nowSeed() + state.phaseNumber;
    state.phase = createPhase({ mode: state.mode, selectedAlgorithmId, seed });
    state.currentSnapshotIndex = 0;
    state.paused = false;
    state.pendingQuestion = null;

    const queue = [];
    for (const question of state.phase.questions) {
      const idx = state.phase.snapshots.findIndex((snapshot) => snapshot.step === question.snapshotStep);
      if (idx >= 0) {
        queue.push({ ...question, snapshotIndex: idx });
      }
    }
    state.questionQueue = queue.sort((a, b) => a.snapshotIndex - b.snapshotIndex);

    const allAlgorithmIds = getAlgorithmIds();
    const rng = mulberry32(seed + 9);
    const finalOptions = shuffleWithRng(rng, [
      state.phase.algorithmId,
      ...allAlgorithmIds.filter((id) => id !== state.phase.algorithmId).slice(0, 3),
    ]);

    state.finalQuestion = {
      prompt: "Qual algoritmo foi executado nesta fase?",
      correctAnswer: state.phase.algorithmId,
      options: finalOptions,
    };
  }

  function tick() {
    if (state.paused || state.status !== "running") {
      return { type: "idle" };
    }

    if (state.currentSnapshotIndex >= state.phase.snapshots.length) {
      return { type: "phase-complete", finalQuestion: state.mode === MODES.ARCADE ? state.finalQuestion : null };
    }

    const snapshot = state.phase.snapshots[state.currentSnapshotIndex];
    const currentQuestion = state.questionQueue[0];

    if (currentQuestion && currentQuestion.snapshotIndex === state.currentSnapshotIndex) {
      state.pendingQuestion = currentQuestion;
      state.questionQueue.shift();
      state.paused = true;
      return { type: "question", snapshot, question: currentQuestion };
    }

    state.currentSnapshotIndex += 1;
    return { type: "step", snapshot };
  }

  function answerQuestion(value, elapsedSeconds) {
    if (!state.pendingQuestion) {
      return { correct: false, delta: 0 };
    }

    const isCorrect = Number(value) === Number(state.pendingQuestion.correctAnswer);
    const delta = calculateAnswerScore(isCorrect, elapsedSeconds);
    if (isCorrect) {
      state.score = addScore(state.score, delta);
    } else if (state.mode === MODES.ARCADE) {
      state.errors = registerError(state.errors);
      if (shouldEndByErrors(state.errors, GAME_CONFIG.maxErrorsArcade)) {
        state.status = "game-over";
        state.gameOverReason = "Voce acumulou 3 erros nesta fase.";
      }
    }

    state.pendingQuestion = null;
    if (state.status !== "game-over") {
      state.currentSnapshotIndex += 1;
      state.paused = false;
    }

    return { correct: isCorrect, delta, score: state.score, errors: state.errors };
  }

  function answerFinalQuestion(value) {
    const isCorrect = value === state.finalQuestion.correctAnswer;
    if (!isCorrect) {
      state.status = "game-over";
      state.gameOverReason = "Voce errou a identificacao do algoritmo.";
      return { correct: false, gameOver: true };
    }

    state.errors = 0;
    state.phaseNumber += 1;
    beginPhase(state.mode === MODES.SELECTION ? state.phase.algorithmId : undefined);
    return { correct: true, gameOver: false };
  }

  function nextSelectionPhase() {
    state.phaseNumber += 1;
    beginPhase(state.phase.algorithmId);
  }

  return {
    state,
    start,
    tick,
    answerQuestion,
    answerFinalQuestion,
    nextSelectionPhase,
    getSelectionAlgorithms: getAlgorithmIds,
  };
}
