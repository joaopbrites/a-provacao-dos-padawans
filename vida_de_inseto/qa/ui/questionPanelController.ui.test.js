import test from "node:test";
import assert from "node:assert/strict";

import {
  onIncomingQuestion,
  onClearQuestion,
  onToggleByUser,
  onManualClose,
  onResize,
} from "../../src/js/core/questionPanelController.js";

test("UI: nova pergunta sempre abre e destrava o painel", () => {
  const initial = { questionOpen: false, questionPanelLocked: true };
  const next = onIncomingQuestion(initial);
  assert.equal(next.questionOpen, true);
  assert.equal(next.questionPanelLocked, false);
});

test("UI: fechar manualmente trava painel e click no atalho alterna corretamente", () => {
  const opened = { questionOpen: true, questionPanelLocked: false };
  const closed = onManualClose(opened);
  assert.equal(closed.questionOpen, false);
  assert.equal(closed.questionPanelLocked, true);

  const reopened = onToggleByUser(closed, true);
  assert.equal(reopened.questionOpen, true);
  assert.equal(reopened.questionPanelLocked, false);
});

test("UI: toggle sem pergunta ativa nao altera estado", () => {
  const state = { questionOpen: false, questionPanelLocked: false };
  const next = onToggleByUser(state, false);
  assert.deepEqual(next, state);
});

test("UI: clear no desktop fecha painel e remove lock", () => {
  const state = { questionOpen: true, questionPanelLocked: true };
  const next = onClearQuestion(state, true);
  assert.equal(next.questionOpen, false);
  assert.equal(next.questionPanelLocked, false);
});

test("UI: clear no mobile preserva abertura atual, mas remove lock", () => {
  const state = { questionOpen: true, questionPanelLocked: true };
  const next = onClearQuestion(state, false);
  assert.equal(next.questionOpen, true);
  assert.equal(next.questionPanelLocked, false);
});

test("UI: resize para desktop reabre painel quando ha pergunta e nao esta travado", () => {
  const state = { questionOpen: false, questionPanelLocked: false };
  const next = onResize(state, 1200, true);
  assert.equal(next.questionOpen, true);
});

test("UI: resize para desktop nao abre painel quando travado", () => {
  const state = { questionOpen: false, questionPanelLocked: true };
  const next = onResize(state, 1200, true);
  assert.equal(next.questionOpen, false);
});
