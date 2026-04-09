import { mulberry32, randomInt, shuffleWithRng } from "./utils/random.js";

const FIELD_ARRAY_STATIC_REGEX = /^array\[(\d+)\]$/;
const FIELD_ARRAY_DYNAMIC_REGEX = /^array\[vars\.([a-zA-Z_$][\w$]*)\]$/;
const FIELD_VARS_REGEX = /^vars\.([a-zA-Z_$][\w$]*)$/;
const FIELD_META_REGEX = /^meta(?:\.[a-zA-Z_$][\w$]*)+$/;

function readPathValue(root, path) {
  const parts = path.split(".");
  let cursor = root;
  for (const part of parts) {
    if (cursor == null || typeof cursor !== "object" || !(part in cursor)) {
      return null;
    }
    cursor = cursor[part];
  }
  return cursor;
}

function uniqueValues(values) {
  const result = [];
  for (const value of values) {
    if (!result.some((entry) => Object.is(entry, value))) {
      result.push(value);
    }
  }
  return result;
}

function valuesFromAllSnapshots(allSnapshots, getter) {
  const values = [];
  for (const snapshot of allSnapshots) {
    values.push(...getter(snapshot));
  }
  return uniqueValues(values);
}

/**
 * @param {string} field
 * @returns {boolean}
 */
export function isValidSnapshotFieldSyntax(field) {
  if (typeof field !== "string" || field.length === 0) {
    return false;
  }
  return FIELD_ARRAY_STATIC_REGEX.test(field)
    || FIELD_ARRAY_DYNAMIC_REGEX.test(field)
    || FIELD_VARS_REGEX.test(field)
    || FIELD_META_REGEX.test(field);
}

/**
 * @param {string} field
 * @param {Object} currentSnapshot
 * @param {Object} targetSnapshot
 * @returns {*}
 */
export function resolveSnapshotField(field, currentSnapshot, targetSnapshot) {
  if (!isValidSnapshotFieldSyntax(field)) {
    console.warn(`snapshotField invalido: ${field}`);
    return null;
  }

  const staticMatch = field.match(FIELD_ARRAY_STATIC_REGEX);
  if (staticMatch) {
    const index = Number(staticMatch[1]);
    const value = targetSnapshot?.array?.[index];
    return value === undefined ? null : value;
  }

  const dynamicMatch = field.match(FIELD_ARRAY_DYNAMIC_REGEX);
  if (dynamicMatch) {
    const varName = dynamicMatch[1];
    const index = currentSnapshot?.vars?.[varName];
    if (!Number.isInteger(index)) {
      console.warn(`indice dinamico invalido em ${field}`);
      return null;
    }
    const value = targetSnapshot?.array?.[index];
    return value === undefined ? null : value;
  }

  const varsMatch = field.match(FIELD_VARS_REGEX);
  if (varsMatch) {
    const value = targetSnapshot?.vars?.[varsMatch[1]];
    return value === undefined ? null : value;
  }

  const metaValue = readPathValue(targetSnapshot, field);
  if (metaValue === null || metaValue === undefined) {
    console.warn(`caminho invalido em ${field}`);
    return null;
  }
  return metaValue;
}

/**
 * @param {string} template
 * @param {Object} currentSnapshot
 * @param {Object} targetSnapshot
 * @param {number} offset
 * @returns {string}
 */
export function renderQuestionTemplate(template, currentSnapshot, targetSnapshot, offset) {
  if (typeof template !== "string") {
    return "";
  }

  return template.replace(/\{([^{}]+)\}/g, (match, token) => {
    if (token === "offset") {
      return String(offset);
    }
    const resolved = resolveSnapshotField(token, currentSnapshot, targetSnapshot);
    return resolved === null ? match : String(resolved);
  });
}

/**
 * @param {Object|string} templateDef
 * @param {string} locale
 * @returns {string}
 */
export function resolveTemplateByLocale(templateDef, locale) {
  if (typeof templateDef === "string") {
    return templateDef;
  }
  if (!templateDef || typeof templateDef !== "object") {
    throw new Error("enunciadoTemplate invalido: esperado objeto por locale");
  }
  if (!(locale in templateDef)) {
    throw new Error(`Locale inexistente no enunciadoTemplate: ${locale}`);
  }
  return templateDef[locale];
}

function resolveVariantOrderForLocale(variantOrder, locale) {
  if (locale === "pt") {
    if (variantOrder === "asc") {
      return "crescente";
    }
    if (variantOrder === "desc") {
      return "decrescente";
    }
  }
  return variantOrder;
}

/**
 * @param {string} template
 * @param {Object} currentSnapshot
 * @param {Object} targetSnapshot
 * @param {number} offset
 * @param {Object} algorithmDescriptor
 * @param {string} locale
 * @returns {string}
 */
export function renderQuestionTemplateWithContext(
  template,
  currentSnapshot,
  targetSnapshot,
  offset,
  algorithmDescriptor,
  locale
) {
  if (typeof template !== "string") {
    return "";
  }

  return template.replace(/\{([^{}]+)\}/g, (match, token) => {
    if (token === "offset") {
      return String(offset);
    }
    if (token === "variant.order") {
      return resolveVariantOrderForLocale(algorithmDescriptor?.variant?.order, locale);
    }
    const resolved = resolveSnapshotField(token, currentSnapshot, targetSnapshot);
    return resolved === null ? match : String(resolved);
  });
}

/**
 * @param {number} currentIndex
 * @param {[number, number]} offsetRange
 * @param {Object[]} allSnapshots
 * @param {Function} rng
 * @param {{offsetUnit?: "snapshot"|"event", anchorEventKey?: string}} options
 * @returns {{targetSnapshot: Object, offset: number} | null}
 */
export function resolveTargetSnapshot(currentIndex, offsetRange, allSnapshots, rng = Math.random, options = {}) {
  const [minOffsetRaw = 0, maxOffsetRaw = 0] = offsetRange || [0, 0];
  const minOffset = Number(minOffsetRaw);
  const maxOffset = Number(maxOffsetRaw);

  const offsetUnit = options.offsetUnit || "snapshot";
  if (offsetUnit === "event") {
    const currentSnapshot = allSnapshots[currentIndex];
    const anchorEventKey = options.anchorEventKey || currentSnapshot?.eventKey;
    const futureMatches = [];

    for (let i = currentIndex + 1; i < allSnapshots.length; i += 1) {
      if (allSnapshots[i].eventKey === anchorEventKey) {
        futureMatches.push(i);
      }
    }

    const remaining = futureMatches.length;
    const effectiveMax = Math.min(maxOffset, remaining);
    if (effectiveMax < minOffset) {
      return null;
    }

    const offset = minOffset === effectiveMax
      ? minOffset
      : randomInt(rng, minOffset, effectiveMax);

    if (offset === 0) {
      return {
        targetSnapshot: allSnapshots[currentIndex],
        offset,
      };
    }

    return {
      targetSnapshot: allSnapshots[futureMatches[offset - 1]],
      offset,
    };
  }

  const remaining = allSnapshots.length - 1 - currentIndex;
  const effectiveMax = Math.min(maxOffset, remaining);

  if (effectiveMax < minOffset) {
    return null;
  }

  const offset = minOffset === effectiveMax
    ? minOffset
    : randomInt(rng, minOffset, effectiveMax);
  return {
    targetSnapshot: allSnapshots[currentIndex + offset],
    offset,
  };
}

/**
 * @param {Array<Object>} eligibleQuestions
 * @param {Function} rng
 * @returns {Object | null}
 */
export function pickQuestion(eligibleQuestions, rng = Math.random) {
  if (!Array.isArray(eligibleQuestions) || eligibleQuestions.length === 0) {
    return null;
  }

  const weighted = eligibleQuestions.filter((q) => (q.weight ?? 1) > 0);
  if (weighted.length === 0) {
    return null;
  }

  const totalWeight = weighted.reduce((sum, q) => sum + (q.weight ?? 1), 0);
  let cursor = rng() * totalWeight;

  for (const question of weighted) {
    cursor -= (question.weight ?? 1);
    if (cursor <= 0) {
      return question;
    }
  }

  return weighted[weighted.length - 1];
}

/**
 * @returns {{usedQuestions: Set<string>, reset: Function}}
 */
export function createSessionState() {
  return {
    usedQuestions: new Set(),
    reset() {
      this.usedQuestions.clear();
    },
  };
}

function normalizeWrongAnswers(wrongAnswers, correctAnswer) {
  const unique = uniqueValues(wrongAnswers).filter((value) => !Object.is(value, correctAnswer));
  return unique.slice(0, 3);
}

/**
 * @param {*} correctAnswer
 * @param {Object} snapshot
 * @param {Object[]} allSnapshots
 * @returns {Array}
 */
function fromArray(correctAnswer, snapshot, allSnapshots) {
  const local = (snapshot?.array || []).filter((value) => !Object.is(value, correctAnswer));
  const fromHistory = valuesFromAllSnapshots(allSnapshots, (item) => item.array || []);
  const candidates = [...local, ...fromHistory];
  return normalizeWrongAnswers(candidates, correctAnswer);
}

/**
 * @param {*} correctAnswer
 * @param {Object} snapshot
 * @returns {Array}
 */
function fromVars(correctAnswer, snapshot) {
  const vars = Object.values(snapshot?.vars || {});
  return normalizeWrongAnswers(vars, correctAnswer);
}

/**
 * @param {*} correctAnswer
 * @returns {Array}
 */
function numericNoise(correctAnswer) {
  if (typeof correctAnswer !== "number" || !Number.isFinite(correctAnswer)) {
    return [];
  }
  return normalizeWrongAnswers([
    correctAnswer - 1,
    correctAnswer + 1,
    correctAnswer + 2,
    correctAnswer - 2,
    correctAnswer + 3,
  ], correctAnswer);
}

/**
 * @param {Array<string>} values
 * @returns {Function}
 */
export function fixedStrings(values) {
  return function fixedStringsGenerator(correctAnswer) {
    return normalizeWrongAnswers(values, correctAnswer);
  };
}

/**
 * @param {*} correctAnswer
 * @param {Object} snapshot
 * @returns {Array}
 */
function fromVarsAndArray(correctAnswer, snapshot) {
  const vars = Object.values(snapshot?.vars || {});
  const arr = snapshot?.array || [];
  return normalizeWrongAnswers([...vars, ...arr], correctAnswer);
}

export const WrongAnswerGenerators = {
  fromArray,
  fromVars,
  numericNoise,
  fixedStrings: fixedStrings(["A", "B", "C", "D", "E"]),
  fromVarsAndArray,
};

/**
 * @param {string} name
 * @param {Function} fn
 * @returns {void}
 */
export function registerWrongAnswerGenerator(name, fn) {
  WrongAnswerGenerators[name] = fn;
}

/**
 * @param {string} wrongAnswersFn
 * @param {*} correctAnswer
 * @param {Object} snapshot
 * @param {Object[]} allSnapshots
 * @returns {Array}
 */
export function buildWrongAnswers(wrongAnswersFn, correctAnswer, snapshot, allSnapshots) {
  const generator = WrongAnswerGenerators[wrongAnswersFn];
  if (!generator) {
    throw new Error(`wrongAnswersFn inexistente: ${wrongAnswersFn}`);
  }

  const generated = normalizeWrongAnswers(generator(correctAnswer, snapshot, allSnapshots), correctAnswer);
  if (generated.length !== 3) {
    throw new Error(`Gerador ${wrongAnswersFn} nao retornou exatamente 3 alternativas`);
  }
  return generated;
}

/**
 * @param {Object} params
 * @returns {Object | null}
 */
export function buildQuestion(params) {
  const {
    questionDef,
    currentSnapshot,
    targetSnapshot,
    offset,
    allSnapshots,
    seed,
    locale,
    algorithmDescriptor,
  } = params;

  const correctAnswer = resolveSnapshotField(questionDef.snapshotField, currentSnapshot, targetSnapshot);
  if (correctAnswer === null) {
    return null;
  }

  const wrongAnswers = buildWrongAnswers(
    questionDef.wrongAnswersFn || "fromVarsAndArray",
    correctAnswer,
    targetSnapshot,
    allSnapshots
  );

  const rng = mulberry32(seed);
  const selectedTemplate = resolveTemplateByLocale(questionDef.enunciadoTemplate, locale);
  const prompt = renderQuestionTemplateWithContext(
    selectedTemplate,
    currentSnapshot,
    targetSnapshot,
    offset,
    algorithmDescriptor,
    locale
  );

  return {
    id: questionDef.idPergunta,
    eventKey: questionDef.eventKey,
    lineToPause: currentSnapshot.line,
    snapshotStep: currentSnapshot.step,
    offset,
    prompt,
    correctAnswer,
    options: shuffleWithRng(rng, [correctAnswer, ...wrongAnswers]),
  };
}

/**
 * @param {Object} params
 * @returns {Object | null}
 */
export function selectQuestionForSnapshot(params) {
  const {
    questionDefinitions,
    allSnapshots,
    currentIndex,
    sessionState,
    seed,
    locale,
    algorithmDescriptor,
  } = params;

  const currentSnapshot = allSnapshots[currentIndex];
  if (!currentSnapshot) {
    return null;
  }

  const rng = mulberry32(seed + currentSnapshot.step);
  const eligible = [];

  for (const questionDef of questionDefinitions) {
    if (questionDef.eventKey !== currentSnapshot.eventKey) {
      continue;
    }

    const repeatable = questionDef.repeatable ?? true;
    if (!repeatable && sessionState.usedQuestions.has(questionDef.idPergunta)) {
      continue;
    }

    const resolved = resolveTargetSnapshot(
      currentIndex,
      questionDef.offsetRange || [0, 0],
      allSnapshots,
      rng,
      {
        offsetUnit: questionDef.offsetUnit || "event",
        anchorEventKey: questionDef.offsetEventKey || currentSnapshot.eventKey,
      }
    );
    if (!resolved) {
      continue;
    }

    eligible.push({
      questionDef,
      targetSnapshot: resolved.targetSnapshot,
      offset: resolved.offset,
      weight: questionDef.weight ?? 1,
    });
  }

  const selected = pickQuestion(eligible, rng);
  if (!selected) {
    return null;
  }

  const question = buildQuestion({
    questionDef: selected.questionDef,
    currentSnapshot,
    targetSnapshot: selected.targetSnapshot,
    offset: selected.offset,
    allSnapshots,
    seed: seed + currentSnapshot.step,
    locale,
    algorithmDescriptor,
  });

  if (!question) {
    return null;
  }

  if ((selected.questionDef.repeatable ?? true) === false) {
    sessionState.usedQuestions.add(selected.questionDef.idPergunta);
  }

  return question;
}

export function calculateQuestionScore(seconds) {
  if (seconds <= 15) {
    return 100;
  }
  const discountSteps = Math.floor((seconds - 15) / 3);
  return Math.max(0, 100 - discountSteps * 10);
}
