import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../../index.html", import.meta.url), "utf8");

test("interface simplificada: elementos principais existem", () => {
  const ids = [
    "screen-menu",
    "screen-game",
    "screen-graduation",
    "btn-start",
    "select-mode",
    "select-goal",
    "select-theme",
    "btn-back-menu",
    "question-panel",
    "question-topic",
    "question-text",
    "question-options",
    "btn-next-question",
    "code-view",
    "score",
    "answered",
    "correct",
    "current-topic",
    "goal-progress",
    "graduation-title",
    "graduation-summary",
    "btn-graduation-menu",
    "confetti-container",
    "feedback-toast",
  ];

  for (const id of ids) {
    assert.match(html, new RegExp(`id=\\"${id}\\"`), `ID ausente: ${id}`);
  }
});

test("interface simplificada: usa app.js como entrada", () => {
  assert.match(html, /src\/js\/app\.js\?v=/);
  assert.doesNotMatch(html, /src\/js\/main\.js/);
});
