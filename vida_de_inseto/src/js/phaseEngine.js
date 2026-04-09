import { GAME_CONFIG } from "./config.js";
import { mulberry32, pickRandom, generateUniqueArray, shuffleWithRng } from "./utils/random.js";
import { runBubbleSort } from "../algorithms/bubbleSort.js";
import { runSelectionSort } from "../algorithms/selectionSort.js";
import { runLinkedListMiddleInsert } from "../algorithms/linkedListMiddleInsert.js";
import { runTreePreOrder } from "../algorithms/treePreOrder.js";
import { runTreeInOrder } from "../algorithms/treeInOrder.js";
import { runTreePostOrder } from "../algorithms/treePostOrder.js";
import { runDfsIterative } from "../algorithms/dfsIterative.js";
import { runDfsRecursive } from "../algorithms/dfsRecursive.js";
import { runBfsIterative } from "../algorithms/bfsIterative.js";
import { runBfsRecursive } from "../algorithms/bfsRecursive.js";
import { bubbleSortPseudo } from "../data/pseudocode/bubbleSort.js";
import { selectionSortPseudo } from "../data/pseudocode/selectionSort.js";
import { linkedListMiddleInsertPseudo } from "../data/pseudocode/linkedListMiddleInsert.js";
import { treePreOrderPseudo } from "../data/pseudocode/treePreOrder.js";
import { treeInOrderPseudo } from "../data/pseudocode/treeInOrder.js";
import { treePostOrderPseudo } from "../data/pseudocode/treePostOrder.js";
import { dfsIterativePseudo } from "../data/pseudocode/dfsIterative.js";
import { dfsRecursivePseudo } from "../data/pseudocode/dfsRecursive.js";
import { bfsIterativePseudo } from "../data/pseudocode/bfsIterative.js";
import { bfsRecursivePseudo } from "../data/pseudocode/bfsRecursive.js";
import { bubbleSortMapping } from "../data/mappings/bubbleSort.js";
import { selectionSortMapping } from "../data/mappings/selectionSort.js";
import { linkedListMiddleInsertMapping } from "../data/mappings/linkedListMiddleInsert.js";
import { treePreOrderMapping } from "../data/mappings/treePreOrder.js";
import { treeInOrderMapping } from "../data/mappings/treeInOrder.js";
import { treePostOrderMapping } from "../data/mappings/treePostOrder.js";
import { dfsIterativeMapping } from "../data/mappings/dfsIterative.js";
import { dfsRecursiveMapping } from "../data/mappings/dfsRecursive.js";
import { bfsIterativeMapping } from "../data/mappings/bfsIterative.js";
import { bfsRecursiveMapping } from "../data/mappings/bfsRecursive.js";
import { bubbleSortQuestions } from "../data/questions/bubbleSort.js";
import { selectionSortQuestions } from "../data/questions/selectionSort.js";
import { linkedListMiddleInsertQuestions } from "../data/questions/linkedListMiddleInsert.js";
import { treePreOrderQuestions } from "../data/questions/treePreOrder.js";
import { treeInOrderQuestions } from "../data/questions/treeInOrder.js";
import { treePostOrderQuestions } from "../data/questions/treePostOrder.js";
import { dfsIterativeQuestions } from "../data/questions/dfsIterative.js";
import { dfsRecursiveQuestions } from "../data/questions/dfsRecursive.js";
import { bfsIterativeQuestions } from "../data/questions/bfsIterative.js";
import { bfsRecursiveQuestions } from "../data/questions/bfsRecursive.js";
import { WrongAnswerGenerators, isValidSnapshotFieldSyntax } from "./quizEngine.js";

const SUPPORTED_LOCALES = ["pt", "en"];
const DEFAULT_LOCALE = "pt";

const ALGORITHMS = {
  "bubble-sort": {
    algorithmKey: "bubbleSort",
    pseudocode: bubbleSortPseudo,
    mapping: bubbleSortMapping.lineMap,
    questions: bubbleSortQuestions,
    run: runBubbleSort,
  },
  "selection-sort": {
    algorithmKey: "selectionSort",
    pseudocode: selectionSortPseudo,
    mapping: selectionSortMapping.lineMap,
    questions: selectionSortQuestions,
    run: runSelectionSort,
  },
  "linked-list-middle-insert": {
    algorithmKey: "linkedListMiddleInsert",
    pseudocode: linkedListMiddleInsertPseudo,
    mapping: linkedListMiddleInsertMapping.lineMap,
    questions: linkedListMiddleInsertQuestions,
    run: runLinkedListMiddleInsert,
  },
  "tree-pre-order": {
    algorithmKey: "treePreOrder",
    pseudocode: treePreOrderPseudo,
    mapping: treePreOrderMapping.lineMap,
    questions: treePreOrderQuestions,
    run: runTreePreOrder,
  },
  "tree-in-order": {
    algorithmKey: "treeInOrder",
    pseudocode: treeInOrderPseudo,
    mapping: treeInOrderMapping.lineMap,
    questions: treeInOrderQuestions,
    run: runTreeInOrder,
  },
  "tree-post-order": {
    algorithmKey: "treePostOrder",
    pseudocode: treePostOrderPseudo,
    mapping: treePostOrderMapping.lineMap,
    questions: treePostOrderQuestions,
    run: runTreePostOrder,
  },
  "dfs-iterative": {
    algorithmKey: "dfsIterative",
    pseudocode: dfsIterativePseudo,
    mapping: dfsIterativeMapping.lineMap,
    questions: dfsIterativeQuestions,
    run: runDfsIterative,
  },
  "dfs-recursive": {
    algorithmKey: "dfsRecursive",
    pseudocode: dfsRecursivePseudo,
    mapping: dfsRecursiveMapping.lineMap,
    questions: dfsRecursiveQuestions,
    run: runDfsRecursive,
  },
  "bfs-iterative": {
    algorithmKey: "bfsIterative",
    pseudocode: bfsIterativePseudo,
    mapping: bfsIterativeMapping.lineMap,
    questions: bfsIterativeQuestions,
    run: runBfsIterative,
  },
  "bfs-recursive": {
    algorithmKey: "bfsRecursive",
    pseudocode: bfsRecursivePseudo,
    mapping: bfsRecursiveMapping.lineMap,
    questions: bfsRecursiveQuestions,
    run: runBfsRecursive,
  },
};

export function getAlgorithmIds() {
  return Object.keys(ALGORITHMS);
}

/**
 * @param {string} algorithmKey
 * @returns {Object[]}
 */
export function getQuestionDefinitionsByAlgorithmKey(algorithmKey) {
  const entry = Object.values(ALGORITHMS).find((algorithm) => algorithm.algorithmKey === algorithmKey);
  if (!entry) {
    throw new Error(`algorithmKey desconhecido: ${algorithmKey}`);
  }
  return entry.questions;
}

export function pickLanguage(seed) {
  const rng = mulberry32(seed);
  const fromPool = pickRandom(rng, GAME_CONFIG.languagePool);
  if (SUPPORTED_LOCALES.includes(fromPool)) {
    return fromPool;
  }
  return DEFAULT_LOCALE;
}

/**
 * @typedef {Object} AlgorithmDescriptor
 * @property {string} algorithmKey
 * @property {{order: "asc"|"desc", implementation: "iterative"|"recursive"}} variant
 * @property {string} locale
 */

/**
 * @param {AlgorithmDescriptor} descriptor
 * @returns {void}
 */
export function validateAlgorithmDescriptor(descriptor) {
  if (!descriptor || typeof descriptor !== "object") {
    throw new Error("AlgorithmDescriptor invalido: objeto obrigatorio");
  }
  if (!descriptor.algorithmKey) {
    throw new Error("AlgorithmDescriptor invalido: algorithmKey obrigatorio");
  }
  if (!descriptor.variant || typeof descriptor.variant !== "object") {
    throw new Error("AlgorithmDescriptor invalido: variant obrigatorio");
  }
  if (!["asc", "desc"].includes(descriptor.variant.order)) {
    throw new Error("AlgorithmDescriptor invalido: variant.order deve ser asc ou desc");
  }
  if (!["iterative", "recursive"].includes(descriptor.variant.implementation)) {
    throw new Error("AlgorithmDescriptor invalido: variant.implementation deve ser iterative ou recursive");
  }
  if (!descriptor.locale) {
    throw new Error("AlgorithmDescriptor invalido: locale obrigatorio");
  }
  if (!SUPPORTED_LOCALES.includes(descriptor.locale)) {
    throw new Error(`AlgorithmDescriptor invalido: locale nao suportado (${descriptor.locale})`);
  }
}

/**
 * @param {string} algorithmId
 * @param {string} locale
 * @returns {AlgorithmDescriptor}
 */
export function createAlgorithmDescriptor(algorithmId, locale) {
  const algorithm = ALGORITHMS[algorithmId];
  if (!algorithm) {
    throw new Error(`Algoritmo invalido para descriptor: ${algorithmId}`);
  }
  const descriptor = {
    algorithmKey: algorithm.algorithmKey,
    variant: {
      order: "asc",
      implementation: "iterative",
    },
    locale,
  };
  validateAlgorithmDescriptor(descriptor);
  return descriptor;
}

function deepFreezeSnapshot(snapshot) {
  if (snapshot.vars && typeof snapshot.vars === "object") {
    Object.freeze(snapshot.vars);
  }
  if (Array.isArray(snapshot.array)) {
    Object.freeze(snapshot.array);
  }
  Object.freeze(snapshot);
  return snapshot;
}

/**
 * Executa um algoritmo completamente e retorna snapshots ordenados por step.
 * @param {Function} algorithmFn
 * @param {number[]} input
 * @returns {Object[]}
 */
export function generateAllSnapshots(algorithmFn, input) {
  const runResult = algorithmFn([...input]);
  const snapshots = Array.isArray(runResult)
    ? runResult
    : (runResult?.snapshots || []);

  const ordered = [...snapshots].sort((a, b) => a.step - b.step).map(deepFreezeSnapshot);
  return Object.freeze(ordered);
}

/**
 * Valida definições de perguntas durante carregamento.
 * @param {Object[]} questions
 * @param {string} algorithmKey
 * @returns {string[]}
 */
export function validateQuestionDefinitions(questions, algorithmKey) {
  const errors = [];
  const ids = new Set();
  const algorithm = ALGORITHMS[algorithmKey];
  const knownEvents = new Set(Object.keys(algorithm?.mapping || {}));

  for (const question of questions) {
    if (ids.has(question.idPergunta)) {
      errors.push(`idPergunta duplicado: ${question.idPergunta}`);
    }
    ids.add(question.idPergunta);

    if (!knownEvents.has(question.eventKey)) {
      errors.push(`eventKey inexistente (${algorithmKey}): ${question.eventKey}`);
    }

    const offsetRange = question.offsetRange || [0, 0];
    if (!Array.isArray(offsetRange) || offsetRange.length !== 2) {
      errors.push(`offsetRange invalido para ${question.idPergunta}`);
    } else {
      const [min, max] = offsetRange;
      if (min < 0 || min > max) {
        errors.push(`offsetRange invalido para ${question.idPergunta}`);
      }
      if ((question.repeatable ?? true) === false && min > 0) {
        errors.push(`repeatable=false com offset futuro em ${question.idPergunta}`);
      }
    }

    if (question.offsetUnit && !["snapshot", "event"].includes(question.offsetUnit)) {
      errors.push(`offsetUnit invalido em ${question.idPergunta}: ${question.offsetUnit}`);
    }

    if (!isValidSnapshotFieldSyntax(question.snapshotField)) {
      errors.push(`snapshotField invalido em ${question.idPergunta}: ${question.snapshotField}`);
    }

    if (!WrongAnswerGenerators[question.wrongAnswersFn || "fromVarsAndArray"]) {
      errors.push(`wrongAnswersFn inexistente em ${question.idPergunta}: ${question.wrongAnswersFn}`);
    }

    if (!question.enunciadoTemplate || typeof question.enunciadoTemplate !== "object") {
      errors.push(`enunciadoTemplate invalido em ${question.idPergunta}: esperado objeto por locale`);
    } else {
      if (!question.enunciadoTemplate.pt) {
        errors.push(`enunciadoTemplate sem locale padrao pt em ${question.idPergunta}`);
      }
      for (const localeKey of Object.keys(question.enunciadoTemplate)) {
        if (!SUPPORTED_LOCALES.includes(localeKey)) {
          errors.push(`enunciadoTemplate com locale desconhecido (${localeKey}) em ${question.idPergunta}`);
        }
      }
    }
  }

  return errors;
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

  const locale = pickLanguage(seed + 1);
  const algorithmDescriptor = createAlgorithmDescriptor(algorithmId, locale);

  const allSnapshots = generateAllSnapshots(
    (arr) => algorithm.run(arr, algorithm.mapping, seed),
    inputArray
  );
  const runResult = {
    outputArray: [...allSnapshots[allSnapshots.length - 1].array],
  };

  const validationErrors = validateQuestionDefinitions(algorithm.questions, algorithmId);
  if (validationErrors.length > 0) {
    throw new Error(`Definicoes de perguntas invalidas: ${validationErrors.join(" | ")}`);
  }

  return {
    seed,
    mode,
    language: locale,
    algorithmDescriptor,
    algorithmId,
    algorithmName: algorithm.pseudocode.title,
    pseudocode: algorithm.pseudocode.lines,
    inputArray,
    outputArray: runResult.outputArray,
    snapshots: allSnapshots,
    questionDefinitions: shuffleWithRng(rng, algorithm.questions),
  };
}
