import { GAME_CONFIG } from "./config.js";
import { mulberry32, pickRandom, generateUniqueArray, shuffleWithRng } from "./utils/random.js";
import { runBubbleSort } from "../algorithms/bubbleSort.js";
import { runSelectionSort } from "../algorithms/selectionSort.js";
import { bubbleSortPseudo } from "../data/pseudocode/bubbleSort.js";
import { selectionSortPseudo } from "../data/pseudocode/selectionSort.js";
import { bubbleSortMapping } from "../data/mappings/bubbleSort.js";
import { selectionSortMapping } from "../data/mappings/selectionSort.js";
import { bubbleSortQuestions } from "../data/questions/bubbleSort.js";
import { selectionSortQuestions } from "../data/questions/selectionSort.js";
import { buildQuestion } from "./quizEngine.js";

const ALGORITHMS = {
  "bubble-sort": {
    pseudocode: bubbleSortPseudo,
    mapping: bubbleSortMapping.lineMap,
    questions: bubbleSortQuestions,
    run: runBubbleSort,
  },
  "selection-sort": {
    pseudocode: selectionSortPseudo,
    mapping: selectionSortMapping.lineMap,
    questions: selectionSortQuestions,
    run: runSelectionSort,
  },
};

export function getAlgorithmIds() {
  return Object.keys(ALGORITHMS);
}

export function pickLanguage(seed) {
  const rng = mulberry32(seed);
  return pickRandom(rng, GAME_CONFIG.languagePool);
}

export function createPhase({ mode, selectedAlgorithmId, seed }) {
  const rng = mulberry32(seed);
  const algorithmIds = getAlgorithmIds();
  const algorithmId = mode === "selection" && selectedAlgorithmId
    ? selectedAlgorithmId
    : pickRandom(rng, algorithmIds);

  const algorithm = ALGORITHMS[algorithmId];
  if (!algorithm) {
    throw new Error("Algoritmo invalido para fase");
  }

  const inputArray = generateUniqueArray(
    GAME_CONFIG.arraySize,
    GAME_CONFIG.minValue,
    GAME_CONFIG.maxValue,
    seed
  );

  const runResult = algorithm.run(inputArray, algorithm.mapping, seed);
  const allSnapshots = runResult.snapshots;

  const questionCandidates = [];
  for (const questionDef of algorithm.questions) {
    const candidateSnapshot = allSnapshots.find((snapshot) => snapshot.eventKey === questionDef.eventKey);
    if (candidateSnapshot) {
      questionCandidates.push(buildQuestion({ questionDef, snapshot: candidateSnapshot, seed }));
    }
  }

  const questions = shuffleWithRng(rng, questionCandidates).slice(0, GAME_CONFIG.questionsPerPhase);

  return {
    seed,
    mode,
    language: pickLanguage(seed + 1),
    algorithmId,
    algorithmName: algorithm.pseudocode.title,
    pseudocode: algorithm.pseudocode.lines,
    inputArray,
    outputArray: runResult.outputArray,
    snapshots: allSnapshots,
    questions,
  };
}
