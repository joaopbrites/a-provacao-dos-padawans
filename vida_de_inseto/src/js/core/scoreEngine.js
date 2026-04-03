export function calculateScoreByTime(seconds) {
  if (seconds <= 15) {
    return 100;
  }

  const discountSteps = Math.floor((seconds - 15) / 3);
  const score = 100 - discountSteps * 10;
  return Math.max(0, score);
}

export function calculateAnswerScore(isCorrect, seconds) {
  if (!isCorrect) {
    return 0;
  }

  return calculateScoreByTime(seconds);
}

export function addScore(currentScore, delta) {
  if (delta < 0) {
    throw new Error("Delta de pontuacao nao pode ser negativo");
  }

  return currentScore + delta;
}

export function registerError(currentErrors) {
  return currentErrors + 1;
}

export function shouldEndByErrors(errors, maxErrors = 3) {
  return errors >= maxErrors;
}
