import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const appJs = fs.readFileSync(new URL("../../src/js/app.js", import.meta.url), "utf8");

test("app wiring: importa questionService e usa banco de perguntas", () => {
  assert.match(appJs, /from \"\.\/questionService\.js\"/);
  assert.match(appJs, /questionQueue = shuffle\(filtered, Math\.random\)/);
  assert.match(appJs, /questionQueue\.shift\(\)/);
});

test("app wiring: botoes principais estao ligados", () => {
  assert.match(appJs, /ui\.btnStart\.addEventListener\("click"/);
  assert.match(appJs, /ui\.btnBackMenu\.addEventListener\("click"/);
  assert.match(appJs, /ui\.btnNextQuestion\.addEventListener\("click"/);
});

test("app wiring: renderiza codigo c\+\+ no editor", () => {
  assert.match(appJs, /ui\.codeView\.textContent = question\.code/);
  assert.match(appJs, /showToast\(/);
});

test("app wiring: tema e persistencia estao ligados", () => {
  assert.match(appJs, /localStorage\.setItem\("vida\.theme", theme\)/);
  assert.match(appJs, /ui\.selectTheme\.addEventListener\("change"/);
});

test("app wiring: percurso curricular por etapas existe", () => {
  assert.match(appJs, /CURRICULUM_STAGES = \["IALG", "ED", "POO", "Grafos", "CPA"\]/);
  assert.match(appJs, /currentMode === "curriculum"/);
  assert.match(appJs, /renderFinalScreen\(/);
});

test("app wiring: regra de aprovacao exige 60%", () => {
  assert.match(appJs, /const MIN_PASS_RATE = 0\.6/);
  assert.match(appJs, /Minimo exigido: 60%/);
  assert.match(appJs, /desempenho abaixo de 60%/);
});
