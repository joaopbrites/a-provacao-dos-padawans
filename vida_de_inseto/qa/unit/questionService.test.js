import test from "node:test";
import assert from "node:assert/strict";

import {
  questionBank,
  createInitialState,
  pickRandomQuestion,
  isAnswerCorrect,
  applyAnswer,
} from "../../src/js/questionService.js";

test("questionBank possui perguntas validas", () => {
  assert.ok(Array.isArray(questionBank));
  assert.ok(questionBank.length >= 20);

  for (const q of questionBank) {
    assert.equal(typeof q.id, "string");
    assert.equal(typeof q.topic, "string");
    assert.equal(typeof q.prompt, "string");
    assert.equal(Array.isArray(q.options), true);
    assert.equal(q.options.length, 4);
    assert.equal(typeof q.correctOption, "number");
    assert.ok(q.correctOption >= 0 && q.correctOption < q.options.length);
    assert.equal(typeof q.code, "string");
    assert.ok(q.code.length > 40);
    assert.match(q.code, /#include|using namespace|struct\s+\w+|class\s+\w+|void\s+\w+|int\s+\w+|size_t\s+\w+|vector<|queue<|for\s*\(|if\s*\(/);
  }
});

test("createInitialState cria estado zerado", () => {
  const state = createInitialState();
  assert.deepEqual(state, {
    score: 0,
    answered: 0,
    correct: 0,
    currentQuestion: null,
  });
});

test("pickRandomQuestion retorna item deterministico com rng fixo", () => {
  const rng = () => 0;
  const q = pickRandomQuestion(questionBank, rng);
  assert.equal(q.id, questionBank[0].id);
});

test("pickRandomQuestion falha com banco vazio", () => {
  assert.throws(() => pickRandomQuestion([], Math.random), /Banco de perguntas vazio/);
});

test("isAnswerCorrect valida alternativa correta", () => {
  const q = questionBank[0];
  assert.equal(isAnswerCorrect(q, q.correctOption), true);
  assert.equal(isAnswerCorrect(q, (q.correctOption + 1) % 4), false);
});

test("applyAnswer atualiza score e contadores", () => {
  const q = questionBank[0];
  const state1 = createInitialState();
  const correctState = applyAnswer(state1, q, q.correctOption);
  assert.equal(correctState.answered, 1);
  assert.equal(correctState.correct, 1);
  assert.equal(correctState.score, 10);

  const wrongState = applyAnswer(state1, q, (q.correctOption + 1) % 4);
  assert.equal(wrongState.answered, 1);
  assert.equal(wrongState.correct, 0);
  assert.equal(wrongState.score, 0);
});
