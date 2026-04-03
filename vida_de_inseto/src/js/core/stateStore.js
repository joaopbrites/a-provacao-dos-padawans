export function createInitialState(mode = "arcade") {
  return {
    mode,
    score: 0,
    errors: 0,
    maxErrors: 3,
    phaseNumber: 1,
    status: "idle",
  };
}

export function transitionStatus(currentStatus, nextStatus) {
  const valid = {
    idle: ["running"],
    running: ["paused-quiz", "phase-ended", "game-over"],
    "paused-quiz": ["running", "game-over"],
    "phase-ended": ["running", "game-over"],
    "game-over": [],
  };

  if (!valid[currentStatus] || !valid[currentStatus].includes(nextStatus)) {
    throw new Error(`Transicao invalida: ${currentStatus} -> ${nextStatus}`);
  }

  return nextStatus;
}

export function resetPhaseState(state) {
  return {
    ...state,
    errors: 0,
    status: "idle",
    phaseNumber: state.phaseNumber + 1,
  };
}

export function resetGameState(mode = "arcade") {
  return createInitialState(mode);
}
