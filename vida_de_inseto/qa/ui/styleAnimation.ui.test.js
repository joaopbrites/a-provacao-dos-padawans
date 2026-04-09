import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const css = fs.readFileSync(new URL("../../src/css/style.css", import.meta.url), "utf8");

test("UI animation CSS: transicoes principais de interacao existem", () => {
  assert.match(css, /transition:\s*transform 120ms ease, filter 120ms ease;/);
  assert.match(css, /#vars-panel,\s*\n\s*#question-panel\s*\{[\s\S]*transition:\s*transform 180ms ease;/);
});

test("UI animation CSS: estados de abertura/fechamento dos paineis existem", () => {
  assert.match(css, /#screen-game\.question-collapsed #question-panel/);
  assert.match(css, /#screen-game\.sidebar-collapsed #vars-panel/);
  assert.match(css, /#screen-game\.sidebar-open #vars-panel,\s*\n\s*#screen-game\.question-open #question-panel/);
});

test("UI animation CSS: modo mobile possui transform de entrada/saida", () => {
  assert.match(css, /#question-panel\s*\{[\s\S]*transform:\s*translateX\(110%\);/);
  assert.match(css, /#vars-panel\s*\{[\s\S]*transform:\s*translateX\(-110%\);/);
  assert.match(css, /#screen-game\.question-open #question-panel\s*\{[\s\S]*transform:\s*translateX\(0\);/);
});

test("UI animation CSS: feedback visual de toast e overlay existem", () => {
  assert.match(css, /\.toast\s*\{/);
  assert.match(css, /\.toast\.error\s*\{/);
  assert.match(css, /\.hidden\s*\{\s*display:\s*none;/);
  assert.match(css, /\.vars-backdrop\s*\{\s*display:\s*none;/);
});
