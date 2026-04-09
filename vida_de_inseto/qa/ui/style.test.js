import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const css = fs.readFileSync(new URL("../../src/css/style.css", import.meta.url), "utf8");

test("style: layout novo com painel de perguntas a esquerda", () => {
  assert.match(css, /\.workspace-shell\s*\{[\s\S]*grid-template-columns:\s*360px minmax\(0, 1fr\)/);
  assert.match(css, /\.side-panel\s*\{/);
  assert.match(css, /\.editor-zone\s*\{/);
});

test("style: possui estilos de feedback e responsividade", () => {
  assert.match(css, /\.toast\.success/);
  assert.match(css, /\.toast\.error/);
  assert.match(css, /@media \(max-width: 900px\)/);
});
