import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const uiJs = fs.readFileSync(new URL("../../src/js/ui.js", import.meta.url), "utf8");

test("UI renderers: funcoes exportadas essenciais existem", () => {
  assert.match(uiJs, /export function renderCodeLines\(/);
  assert.match(uiJs, /export function highlightLine\(/);
  assert.match(uiJs, /export function renderVariables\(/);
  assert.match(uiJs, /export function updateHeader\(/);
});

test("UI renderers: renderCodeLines limpa e renderiza linhas com dataset", () => {
  assert.match(uiJs, /contentContainer\.innerHTML = "";/);
  assert.match(uiJs, /gutterContainer\.innerHTML = "";/);
  assert.match(uiJs, /row\.className = "code-line"/);
  assert.match(uiJs, /row\.dataset\.line = String\(index \+ 1\)/);
  assert.match(uiJs, /gutter\.className = "gutter-line"/);
});

test("UI renderers: highlightLine remove estado antigo e ativa alvo", () => {
  assert.match(uiJs, /querySelectorAll\("\.code-line"\)/);
  assert.match(uiJs, /querySelectorAll\("\.gutter-line"\)/);
  assert.match(uiJs, /node\.classList\.remove\("active"\)/);
  assert.match(uiJs, /target\.classList\.add\("active"\)/);
  assert.match(uiJs, /gutterTarget\.classList\.add\("active"\)/);
});

test("UI renderers: renderVariables suporta escopos, arrays e fallback", () => {
  assert.match(uiJs, /snapshot\?\.scopeVars/);
  assert.match(uiJs, /const rawScopes = \{ \.\.\.baseScopes \}/);
  assert.match(uiJs, /rawScopes\.principal = \{/);
  assert.match(uiJs, /array: snapshot\?\.array \|\| \[\]/);
  assert.match(uiJs, /data-toggle-scope/);
  assert.match(uiJs, /data-toggle-array/);
  assert.match(uiJs, /Array\(\$\{value\.length\}\)/);
});

test("UI renderers: updateHeader atualiza HUD de modo, score, erros e fase", () => {
  assert.match(uiJs, /document\.getElementById\("hud-mode"\)/);
  assert.match(uiJs, /document\.getElementById\("hud-score"\)/);
  assert.match(uiJs, /document\.getElementById\("hud-errors"\)/);
  assert.match(uiJs, /document\.getElementById\("hud-phase"\)/);
  assert.match(uiJs, /document\.getElementById\("hud-phase-tab"\)/);
});
