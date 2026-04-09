import test from "node:test";
import assert from "node:assert/strict";

import { runBubbleSort } from "../../src/algorithms/bubbleSort.js";
import { runSelectionSort } from "../../src/algorithms/selectionSort.js";
import { bubbleSortMapping } from "../../src/data/mappings/bubbleSort.js";
import { selectionSortMapping } from "../../src/data/mappings/selectionSort.js";
import { bubbleSortQuestions } from "../../src/data/questions/bubbleSort.js";
import { selectionSortQuestions } from "../../src/data/questions/selectionSort.js";
import {
  createAlgorithmDescriptor,
  generateAllSnapshots,
  getQuestionDefinitionsByAlgorithmKey,
  validateAlgorithmDescriptor,
  validateQuestionDefinitions,
} from "../../src/js/phaseEngine.js";
import {
  buildWrongAnswers,
  buildQuestion,
  createSessionState,
  pickQuestion,
  registerWrongAnswerGenerator,
  renderQuestionTemplateWithContext,
  resolveSnapshotField,
  resolveTargetSnapshot,
  resolveTemplateByLocale,
  selectQuestionForSnapshot,
  WrongAnswerGenerators,
} from "../../src/js/quizEngine.js";
import { mulberry32 } from "../../src/js/utils/random.js";

const baseSnapshots = Object.freeze([
  Object.freeze({
    step: 1,
    eventKey: "COMPARE",
    line: 3,
    vars: Object.freeze({ j: 1, left: 3, right: 7, currentMin: 3 }),
    array: Object.freeze([9, 3, 7, 1]),
    meta: Object.freeze({ metrics: Object.freeze({ swaps: 1 }) }),
  }),
  Object.freeze({
    step: 2,
    eventKey: "COMPARE",
    line: 3,
    vars: Object.freeze({ j: 2, left: 7, right: 1, currentMin: 1 }),
    array: Object.freeze([9, 3, 7, 1]),
    meta: Object.freeze({ metrics: Object.freeze({ swaps: 1 }) }),
  }),
  Object.freeze({
    step: 3,
    eventKey: "SWAP",
    line: 4,
    vars: Object.freeze({ j: 2, left: 7, right: 1, currentMin: 1 }),
    array: Object.freeze([9, 3, 1, 7]),
    meta: Object.freeze({ metrics: Object.freeze({ swaps: 2 }) }),
  }),
  Object.freeze({
    step: 4,
    eventKey: "COMPARE",
    line: 3,
    vars: Object.freeze({ j: 1, left: 3, right: 1, currentMin: 1 }),
    array: Object.freeze([9, 3, 1, 7]),
    meta: Object.freeze({ metrics: Object.freeze({ swaps: 2 }) }),
  }),
]);

test("Bloco 1: generateAllSnapshots gera e congela snapshots em ordem", () => {
  const mapping = { A: 1, B: 2, C: 3 };
  const input = [3, 2, 1];
  const first = generateAllSnapshots((arr) => runBubbleSort(arr, mapping, 123), input);
  const second = generateAllSnapshots((arr) => runBubbleSort(arr, mapping, 123), input);

  assert.deepEqual(first, second);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first[0]), true);
  assert.equal(Object.isFrozen(first[0].vars), true);
  assert.equal(Object.isFrozen(first[0].array), true);

  for (let i = 1; i < first.length; i += 1) {
    assert.ok(first[i].step > first[i - 1].step);
  }
});

test("Bloco 1: bubble e selection mantem quantidade de snapshots para input conhecido", () => {
  const input = [4, 3, 2, 1];
  const bubble = generateAllSnapshots((arr) => runBubbleSort(arr, bubbleSortMapping.lineMap, 7), input);
  const selection = generateAllSnapshots((arr) => runSelectionSort(arr, selectionSortMapping.lineMap, 7), input);

  assert.equal(bubble.length, 25);
  assert.equal(selection.length, 25);
  assert.equal(bubble[0].step, 1);
  assert.equal(selection[0].step, 1);
  assert.equal(bubble[bubble.length - 1].eventKey, "COMPLETE");
  assert.equal(selection[selection.length - 1].eventKey, "COMPLETE");
});

test("Bloco 1: generateAllSnapshots funciona para algoritmos distintos sem mudancas", () => {
  const input = [9, 8, 7, 6];
  const bubble = generateAllSnapshots((arr) => runBubbleSort(arr, bubbleSortMapping.lineMap, 10), input);
  const selection = generateAllSnapshots((arr) => runSelectionSort(arr, selectionSortMapping.lineMap, 10), input);
  assert.ok(bubble.length > 0);
  assert.ok(selection.length > 0);
});

test("Bloco 2: AlgorithmDescriptor valida obrigatorios e locale", () => {
  const descriptor = createAlgorithmDescriptor("bubble-sort", "pt");
  assert.equal(descriptor.algorithmKey, "bubbleSort");
  assert.equal(descriptor.locale, "pt");
  assert.equal(descriptor.variant.order, "asc");
  assert.equal(descriptor.variant.implementation, "iterative");

  assert.throws(
    () => validateAlgorithmDescriptor({ algorithmKey: "bubbleSort", locale: "pt" }),
    /variant obrigatorio/
  );
  assert.throws(
    () => validateAlgorithmDescriptor({ algorithmKey: "bubbleSort", variant: { order: "asc", implementation: "iterative" }, locale: "fr" }),
    /locale nao suportado/
  );
});

test("Bloco 2: algorithmKey controla arquivo de perguntas e variantes compartilham o mesmo arquivo", () => {
  const bubbleQuestions = getQuestionDefinitionsByAlgorithmKey("bubbleSort");
  const selectionQuestions = getQuestionDefinitionsByAlgorithmKey("selectionSort");
  assert.notDeepEqual(bubbleQuestions, selectionQuestions);

  const variantA = {
    algorithmKey: "bubbleSort",
    variant: { order: "asc", implementation: "iterative" },
    locale: "pt",
  };
  const variantB = {
    algorithmKey: "bubbleSort",
    variant: { order: "desc", implementation: "recursive" },
    locale: "en",
  };
  validateAlgorithmDescriptor(variantA);
  validateAlgorithmDescriptor(variantB);

  const byVariantA = getQuestionDefinitionsByAlgorithmKey(variantA.algorithmKey);
  const byVariantB = getQuestionDefinitionsByAlgorithmKey(variantB.algorithmKey);
  assert.equal(byVariantA, byVariantB);
});

test("Bloco 3: resolveTargetSnapshot respeita limites e [0,0]", () => {
  const rng = mulberry32(99);
  const same = resolveTargetSnapshot(2, [0, 0], baseSnapshots, rng);
  assert.equal(same.offset, 0);
  assert.equal(same.targetSnapshot.step, baseSnapshots[2].step);

  const none = resolveTargetSnapshot(3, [1, 3], baseSnapshots, rng);
  assert.equal(none, null);

  const sample = resolveTargetSnapshot(0, [2, 5], baseSnapshots, mulberry32(5));
  assert.ok(sample.offset >= 2 && sample.offset <= 3);
  assert.equal(sample.targetSnapshot, baseSnapshots[sample.offset]);
});

test("Bloco 3: resolveTargetSnapshot em modo event conta ocorrencias do evento", () => {
  const snapshots = [
    { eventKey: "COMPARE", step: 1 },
    { eventKey: "SWAP", step: 2 },
    { eventKey: "COMPARE", step: 3 },
    { eventKey: "INNER", step: 4 },
    { eventKey: "COMPARE", step: 5 },
    { eventKey: "COMPARE", step: 6 },
  ];

  const resolved = resolveTargetSnapshot(
    0,
    [2, 2],
    snapshots,
    mulberry32(11),
    { offsetUnit: "event", anchorEventKey: "COMPARE" }
  );

  assert.ok(resolved !== null);
  assert.equal(resolved.offset, 2);
  assert.equal(resolved.targetSnapshot.step, 5);

  const none = resolveTargetSnapshot(
    4,
    [2, 3],
    snapshots,
    mulberry32(11),
    { offsetUnit: "event", anchorEventKey: "COMPARE" }
  );
  assert.equal(none, null);
});

test("Bloco 4: parser resolve sintaxes e usa indice dinamico do snapshot atual", () => {
  const current = baseSnapshots[0];
  const target = baseSnapshots[2];

  assert.equal(resolveSnapshotField("array[2]", current, target), 1);
  assert.equal(resolveSnapshotField("array[vars.j]", current, target), 3);
  assert.equal(resolveSnapshotField("vars.currentMin", current, target), 1);
  assert.equal(resolveSnapshotField("meta.metrics.swaps", current, target), 2);

  const rendered = renderQuestionTemplateWithContext(
    "Daqui a {offset} passos ({variant.order}), arr[2]={array[2]} e j alvo={vars.j}",
    current,
    target,
    2,
    { variant: { order: "asc" } },
    "pt"
  );
  assert.equal(rendered, "Daqui a 2 passos (crescente), arr[2]=1 e j alvo=2");

  const renderedEn = renderQuestionTemplateWithContext(
    "Order={variant.order}",
    current,
    target,
    0,
    { variant: { order: "desc" } },
    "en"
  );
  assert.equal(renderedEn, "Order=desc");

  assert.equal(resolveTemplateByLocale({ pt: "Oi", en: "Hi" }, "pt"), "Oi");
  assert.throws(() => resolveTemplateByLocale({ pt: "Oi" }, "en"), /Locale inexistente/);
  assert.equal(resolveSnapshotField("array[vars.naoExiste]", current, target), null);
});

test("Bloco 5: pickQuestion faz sorteio ponderado e peso zero nao aparece", () => {
  const rng = mulberry32(1234);
  const pool = [
    { id: "A", weight: 1 },
    { id: "B", weight: 3 },
    { id: "C", weight: 0 },
  ];

  const counts = { A: 0, B: 0, C: 0 };
  for (let i = 0; i < 10_000; i += 1) {
    const picked = pickQuestion(pool, rng);
    counts[picked.id] += 1;
  }

  assert.equal(counts.C, 0);
  const ratioB = counts.B / (counts.A + counts.B);
  assert.ok(ratioB > 0.70 && ratioB < 0.80);
});

test("Bloco 6: controle de repeatable por SessionState", () => {
  const session = createSessionState();
  const defs = [
    {
      idPergunta: "once",
      eventKey: "COMPARE",
      repeatable: false,
      weight: 1,
      offsetRange: [0, 0],
      offsetUnit: "event",
      snapshotField: "array[0]",
      enunciadoTemplate: { pt: "X", en: "X" },
      wrongAnswersFn: "fromArray",
    },
  ];

  const q1 = selectQuestionForSnapshot({
    questionDefinitions: defs,
    allSnapshots: baseSnapshots,
    currentIndex: 0,
    sessionState: session,
    seed: 1,
    locale: "pt",
    algorithmDescriptor: { variant: { order: "asc" } },
  });
  assert.ok(q1);

  const q2 = selectQuestionForSnapshot({
    questionDefinitions: defs,
    allSnapshots: baseSnapshots,
    currentIndex: 1,
    sessionState: session,
    seed: 2,
    locale: "pt",
    algorithmDescriptor: { variant: { order: "asc" } },
  });
  assert.equal(q2, null);

  session.reset();
  const q3 = selectQuestionForSnapshot({
    questionDefinitions: defs,
    allSnapshots: baseSnapshots,
    currentIndex: 1,
    sessionState: session,
    seed: 3,
    locale: "pt",
    algorithmDescriptor: { variant: { order: "asc" } },
  });
  assert.ok(q3);
});

test("Bloco 7: geradores de respostas incorretas respeitam contrato", () => {
  const wrongArray = buildWrongAnswers("fromArray", 9, baseSnapshots[0], baseSnapshots);
  assert.equal(wrongArray.length, 3);
  for (const wrong of wrongArray) {
    assert.notEqual(wrong, 9);
    assert.equal(baseSnapshots[0].array.includes(wrong), true);
  }

  assert.equal(typeof WrongAnswerGenerators.numericNoise, "function");

  registerWrongAnswerGenerator("__probe", (correct, snapshot, allSnapshots) => {
    assert.equal(correct, 9);
    assert.equal(snapshot, baseSnapshots[0]);
    assert.equal(allSnapshots, baseSnapshots);
    return [1, 2, 3];
  });

  const wrongProbe = buildWrongAnswers("__probe", 9, baseSnapshots[0], baseSnapshots);
  assert.deepEqual(wrongProbe, [1, 2, 3]);

  assert.throws(
    () => buildWrongAnswers("inexistente", 9, baseSnapshots[0], baseSnapshots),
    /inexistente/
  );
});

test("Bloco 8: validateQuestionDefinitions detecta violacoes", () => {
  const validErrors = validateQuestionDefinitions(bubbleSortQuestions, "bubble-sort");
  assert.deepEqual(validErrors, []);

  const invalid = [
    {
      idPergunta: "dup",
      eventKey: "COMPARE",
      repeatable: false,
      weight: 1,
      offsetRange: [1, 0],
      offsetUnit: "foo",
      snapshotField: "vars.x.y.z",
      enunciadoTemplate: { pt: "{offset}", fr: "{offset}" },
      wrongAnswersFn: "naoExiste",
    },
    {
      idPergunta: "dup",
      eventKey: "NAO_MAPEADO",
      repeatable: false,
      weight: 1,
      offsetRange: [2, 3],
      snapshotField: "array[vars.j+1]",
      enunciadoTemplate: { en: "{offset}" },
      wrongAnswersFn: "fromArray",
    },
  ];

  const errors = validateQuestionDefinitions(invalid, "bubble-sort");
  assert.ok(errors.some((line) => line.includes("idPergunta duplicado")));
  assert.ok(errors.some((line) => line.includes("eventKey inexistente")));
  assert.ok(errors.some((line) => line.includes("offsetRange invalido")));
  assert.ok(errors.some((line) => line.includes("snapshotField invalido")));
  assert.ok(errors.some((line) => line.includes("wrongAnswersFn inexistente")));
  assert.ok(errors.some((line) => line.includes("repeatable=false")));
  assert.ok(errors.some((line) => line.includes("locale padrao pt")));
  assert.ok(errors.some((line) => line.includes("locale desconhecido")));
  assert.ok(errors.some((line) => line.includes("offsetUnit invalido")));

  const validSelection = validateQuestionDefinitions(selectionSortQuestions, "selection-sort");
  assert.deepEqual(validSelection, []);
});

test("Bloco 4: parser funciona com perguntas reais de bubble e selection", () => {
  const bubbleSnapshots = generateAllSnapshots(
    (arr) => runBubbleSort(arr, bubbleSortMapping.lineMap, 55),
    [8, 2, 6, 4]
  );
  const selectionSnapshots = generateAllSnapshots(
    (arr) => runSelectionSort(arr, selectionSortMapping.lineMap, 77),
    [8, 2, 6, 4]
  );

  for (const question of bubbleSortQuestions) {
    const candidateIndexes = bubbleSnapshots
      .map((snapshot, idx) => ({ snapshot, idx }))
      .filter((entry) => entry.snapshot.eventKey === question.eventKey)
      .map((entry) => entry.idx);
    let solved = false;
    for (const idx of candidateIndexes) {
      const resolved = resolveTargetSnapshot(idx, question.offsetRange, bubbleSnapshots, mulberry32(101 + idx));
      if (!resolved) {
        continue;
      }
      const answer = resolveSnapshotField(question.snapshotField, bubbleSnapshots[idx], resolved.targetSnapshot);
      if (answer === null) {
        continue;
      }
      const promptPt = renderQuestionTemplateWithContext(
        resolveTemplateByLocale(question.enunciadoTemplate, "pt"),
        bubbleSnapshots[idx],
        resolved.targetSnapshot,
        resolved.offset,
        { variant: { order: "asc" } },
        "pt"
      );
      const promptEn = renderQuestionTemplateWithContext(
        resolveTemplateByLocale(question.enunciadoTemplate, "en"),
        bubbleSnapshots[idx],
        resolved.targetSnapshot,
        resolved.offset,
        { variant: { order: "asc" } },
        "en"
      );
      assert.equal(promptPt.includes("{"), false);
      assert.equal(promptEn.includes("{"), false);
      solved = true;
      break;
    }
    assert.equal(solved, true, `Pergunta bubble sem snapshot elegivel: ${question.idPergunta}`);
  }

  for (const question of selectionSortQuestions) {
    const candidateIndexes = selectionSnapshots
      .map((snapshot, idx) => ({ snapshot, idx }))
      .filter((entry) => entry.snapshot.eventKey === question.eventKey)
      .map((entry) => entry.idx);
    let solved = false;
    for (const idx of candidateIndexes) {
      const resolved = resolveTargetSnapshot(idx, question.offsetRange, selectionSnapshots, mulberry32(202 + idx));
      if (!resolved) {
        continue;
      }
      const answer = resolveSnapshotField(question.snapshotField, selectionSnapshots[idx], resolved.targetSnapshot);
      if (answer === null) {
        continue;
      }
      const promptPt = renderQuestionTemplateWithContext(
        resolveTemplateByLocale(question.enunciadoTemplate, "pt"),
        selectionSnapshots[idx],
        resolved.targetSnapshot,
        resolved.offset,
        { variant: { order: "desc" } },
        "pt"
      );
      const promptEn = renderQuestionTemplateWithContext(
        resolveTemplateByLocale(question.enunciadoTemplate, "en"),
        selectionSnapshots[idx],
        resolved.targetSnapshot,
        resolved.offset,
        { variant: { order: "desc" } },
        "en"
      );
      assert.equal(promptPt.includes("{"), false);
      assert.equal(promptEn.includes("{"), false);
      solved = true;
      break;
    }
    assert.equal(solved, true, `Pergunta selection sem snapshot elegivel: ${question.idPergunta}`);
  }
});

test("Documento geracao_de_perguntas: distribuicao minima por nivel e regras estruturais", () => {
  for (const [name, questions] of [["bubble", bubbleSortQuestions], ["selection", selectionSortQuestions]]) {
    const idSet = new Set();
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const question of questions) {
      assert.equal(idSet.has(question.idPergunta), false, `${name}: id duplicado ${question.idPergunta}`);
      idSet.add(question.idPergunta);
      assert.equal(typeof question.enunciadoTemplate.pt, "string");
      assert.equal(typeof question.enunciadoTemplate.en, "string");
      assert.equal(["fromArray", "fromVars", "numericNoise", "fixedStrings", "fromVarsAndArray"].includes(question.wrongAnswersFn), true);
      if (question.offsetRange[0] === 0) {
        assert.equal(question.repeatable, false);
      }
      if (question.offsetRange[0] > 0) {
        assert.equal(question.repeatable, true);
      }
      if ([1, 2, 3, 4].includes(question.weight)) {
        counts[question.weight] += 1;
      }
      assert.equal(["vars.i", "vars.j", "vars.minIdx", "vars.pos"].includes(question.snapshotField), false);
    }
    assert.ok(counts[1] >= 3, `${name}: nivel 1 insuficiente`);
    assert.ok(counts[2] >= 3, `${name}: nivel 2 insuficiente`);
    assert.ok(counts[3] >= 3, `${name}: nivel 3 insuficiente`);
    assert.ok(counts[4] >= 3, `${name}: nivel 4 insuficiente`);
  }
});

test("Documento geracao_de_perguntas: fromArray gera alternativas validas no snapshot alvo", () => {
  const snapshots = generateAllSnapshots(
    (arr) => runBubbleSort(arr, bubbleSortMapping.lineMap, 88),
    [5, 2, 8, 1]
  );

  const question = bubbleSortQuestions.find((entry) => entry.wrongAnswersFn === "fromArray");
  const idx = snapshots.findIndex((snapshot) => snapshot.eventKey === question.eventKey);
  const resolved = resolveTargetSnapshot(idx, question.offsetRange, snapshots, mulberry32(99));
  const answer = resolveSnapshotField(question.snapshotField, snapshots[idx], resolved.targetSnapshot);
  const wrong = buildWrongAnswers("fromArray", answer, resolved.targetSnapshot, snapshots);

  assert.equal(wrong.length, 3);
  for (const value of wrong) {
    assert.equal(resolved.targetSnapshot.array.includes(value), true);
    assert.notEqual(value, answer);
  }
});
