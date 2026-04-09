import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../../index.html", import.meta.url), "utf8");

const REQUIRED_IDS = [
  "screen-menu",
  "screen-selection",
  "screen-game",
  "btn-arcade",
  "btn-selection",
  "btn-theme-toggle",
  "btn-back-menu",
  "selection-list",
  "btn-toggle-vars",
  "btn-open-question",
  "btn-open-options",
  "vars-panel",
  "code-content",
  "code-gutter",
  "code-scroll",
  "question-panel",
  "question-content",
  "btn-close-question",
  "options-panel",
  "btn-close-options",
  "speed-select",
  "btn-back-home",
  "vars-backdrop",
  "feedback-toast",
  "hud-mode",
  "hud-score",
  "hud-errors",
  "hud-phase",
  "hud-phase-tab",
];

test("UI markup: elementos essenciais existem no HTML", () => {
  for (const id of REQUIRED_IDS) {
    assert.match(html, new RegExp(`id=\\"${id}\\"`), `Elemento ausente: ${id}`);
  }
});

test("UI markup: script principal e css principal estao referenciados", () => {
  assert.match(html, /src\/css\/style\.css\?v=/);
  assert.match(html, /src\/js\/main\.js\?v=/);
});

test("UI markup: estrutura de telas e paineis foi mantida", () => {
  assert.match(html, /<section id=\"screen-menu\"/);
  assert.match(html, /<section id=\"screen-selection\"/);
  assert.match(html, /<section id=\"screen-game\"/);
  assert.match(html, /<aside id=\"vars-panel\"/);
  assert.match(html, /<aside id=\"question-panel\"/);
  assert.match(html, /<aside id=\"options-panel\"/);
});
