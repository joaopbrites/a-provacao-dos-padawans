import { mulberry32, randomInt, shuffleWithRng } from "./utils/random.js";

export function readSnapshotField(snapshot, path) {
  if (!path) {
    return undefined;
  }

  if (path.startsWith("array[")) {
    const idx = Number(path.replace("array[", "").replace("]", ""));
    return snapshot.array[idx];
  }

  if (path.startsWith("vars.")) {
    const key = path.replace("vars.", "");
    return snapshot.vars?.[key];
  }

  return snapshot[path];
}

function distinctNumbers(values) {
  const set = new Set();
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      set.add(value);
    }
  }
  return Array.from(set);
}

export function generateQuestionOptions(correctValue, snapshot, seed) {
  const rng = mulberry32(seed);
  const candidates = [];
  const vars = Object.values(snapshot.vars || {});
  candidates.push(...vars);
  candidates.push(...snapshot.array);

  const uniq = distinctNumbers(candidates).filter((v) => v !== correctValue);
  const picked = [];

  for (const value of uniq) {
    if (picked.length >= 3) {
      break;
    }
    picked.push(value);
  }

  while (picked.length < 3) {
    const candidate = randomInt(rng, 0, 99);
    if (candidate !== correctValue && !picked.includes(candidate)) {
      picked.push(candidate);
    }
  }

  return shuffleWithRng(rng, [correctValue, ...picked]);
}

export function buildQuestion({ questionDef, snapshot, seed }) {
  const correctAnswer = readSnapshotField(snapshot, questionDef.snapshotField);
  if (typeof correctAnswer !== "number") {
    throw new Error(`Resposta invalida para ${questionDef.idPergunta}`);
  }

  const prompt = questionDef.enunciadoTemplate
    .replace("{var}", questionDef.snapshotField)
    .replace("{line}", String(snapshot.line));

  return {
    id: questionDef.idPergunta,
    eventKey: questionDef.eventKey,
    lineToPause: snapshot.line,
    snapshotStep: snapshot.step,
    prompt,
    correctAnswer,
    options: generateQuestionOptions(correctAnswer, snapshot, seed + snapshot.step),
  };
}

export function calculateQuestionScore(seconds) {
  if (seconds <= 15) {
    return 100;
  }
  const discountSteps = Math.floor((seconds - 15) / 3);
  return Math.max(0, 100 - discountSteps * 10);
}
