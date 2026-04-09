import test from "node:test";
import assert from "node:assert/strict";

import { bubbleSortQuestions } from "../../src/data/questions/bubbleSort.js";
import { bubbleSortMapping } from "../../src/data/mappings/bubbleSort.js";
import { runBubbleSort } from "../../src/algorithms/bubbleSort.js";
import { generateAllSnapshots, validateQuestionDefinitions } from "../../src/js/phaseEngine.js";
import {
  resolveSnapshotField,
  resolveTargetSnapshot,
  renderQuestionTemplateWithContext,
  resolveTemplateByLocale,
  buildWrongAnswers,
} from "../../src/js/quizEngine.js";
import { mulberry32 } from "../../src/js/utils/random.js";

const ALLOWED_WRONG = new Set(["fromArray", "fromVars", "numericNoise", "fixedStrings", "fromVarsAndArray"]);

test("bubble questions: estrutura basica e distribuicao por nivel", () => {
  const ids = new Set();
  const level = { 1: 0, 2: 0, 3: 0, 4: 0 };

  for (const question of bubbleSortQuestions) {
    assert.equal(ids.has(question.idPergunta), false);
    ids.add(question.idPergunta);

    assert.equal(typeof question.enunciadoTemplate.pt, "string");
    assert.equal(typeof question.enunciadoTemplate.en, "string");
    assert.equal(ALLOWED_WRONG.has(question.wrongAnswersFn), true);
    assert.equal(["vars.i", "vars.j", "vars.minIdx", "vars.pos"].includes(question.snapshotField), false);

    if (question.offsetRange[0] === 0) {
      assert.equal(question.repeatable, false);
    } else {
      assert.equal(question.repeatable, true);
    }

    level[question.weight] += 1;
  }

  assert.ok(level[1] >= 3);
  assert.ok(level[2] >= 3);
  assert.ok(level[3] >= 3);
  assert.ok(level[4] >= 3);
});

test("bubble questions: integracao de snapshotField, template e fromArray", () => {
  const snapshots = generateAllSnapshots(
    (arr) => runBubbleSort(arr, bubbleSortMapping.lineMap, 909),
    [7, 2, 5, 1]
  );

  for (const question of bubbleSortQuestions) {
    const indexes = snapshots
      .map((snapshot, idx) => ({ snapshot, idx }))
      .filter((entry) => entry.snapshot.eventKey === question.eventKey)
      .map((entry) => entry.idx);

    let validated = false;
    for (const idx of indexes) {
      const resolved = resolveTargetSnapshot(idx, question.offsetRange, snapshots, mulberry32(300 + idx));
      if (!resolved) {
        continue;
      }
      const answer = resolveSnapshotField(question.snapshotField, snapshots[idx], resolved.targetSnapshot);
      if (answer === null) {
        continue;
      }

      const pt = renderQuestionTemplateWithContext(
        resolveTemplateByLocale(question.enunciadoTemplate, "pt"),
        snapshots[idx],
        resolved.targetSnapshot,
        resolved.offset,
        { variant: { order: "asc" } },
        "pt"
      );
      const en = renderQuestionTemplateWithContext(
        resolveTemplateByLocale(question.enunciadoTemplate, "en"),
        snapshots[idx],
        resolved.targetSnapshot,
        resolved.offset,
        { variant: { order: "asc" } },
        "en"
      );

      assert.equal(pt.includes("{"), false);
      assert.equal(en.includes("{"), false);

      if (question.wrongAnswersFn === "fromArray") {
        const wrong = buildWrongAnswers("fromArray", answer, resolved.targetSnapshot, snapshots);
        assert.equal(wrong.length, 3);
        for (const value of wrong) {
          assert.equal(resolved.targetSnapshot.array.includes(value), true);
          assert.notEqual(value, answer);
        }
      }

      validated = true;
      break;
    }

    assert.equal(validated, true, `Pergunta sem cenário elegível: ${question.idPergunta}`);
  }
});

test("bubble questions: validacao estatica do sistema", () => {
  const errors = validateQuestionDefinitions(bubbleSortQuestions, "bubble-sort");
  assert.deepEqual(errors, []);
});
