import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const mainJs = fs.readFileSync(new URL("../../src/js/main.js", import.meta.url), "utf8");

test("UI wiring: eventos de botoes principais estao conectados", () => {
  assert.match(mainJs, /ui\.btnArcade\.addEventListener\("click"/);
  assert.match(mainJs, /ui\.btnSelection\.addEventListener\("click"/);
  assert.match(mainJs, /ui\.btnToggleVars\.addEventListener\("click"/);
  assert.match(mainJs, /ui\.btnOpenQuestion\.addEventListener\("click"/);
  assert.match(mainJs, /ui\.btnCloseQuestion\.addEventListener\("click"/);
  assert.match(mainJs, /ui\.btnOpenOptions\.addEventListener\("click"/);
  assert.match(mainJs, /ui\.btnCloseOptions\.addEventListener\("click"/);
  assert.match(mainJs, /ui\.btnBackHome\.addEventListener\("click"/);
});

test("UI wiring: fluxo de tick contempla step, question e phase-complete", () => {
  assert.match(mainJs, /if \(event\.type === "step"\)/);
  assert.match(mainJs, /if \(event\.type === "question"\)/);
  assert.match(mainJs, /if \(event\.type === "phase-complete"\)/);
  assert.match(mainJs, /highlightLine\(/);
  assert.match(mainJs, /openQuestionPanel\(/);
  assert.match(mainJs, /renderPhaseEnd\(/);
});

test("UI wiring: loop protege contra falha em tick e executa tick imediato", () => {
  assert.match(mainJs, /try \{\s*\n\s*event = engine\.tick\(\);/);
  assert.match(mainJs, /showToast\(`Erro na execucao:/);
  assert.match(mainJs, /handleTick\(\);\s*\n\s*tickInterval = setInterval\(handleTick, tickDelayMs\);/);
});
