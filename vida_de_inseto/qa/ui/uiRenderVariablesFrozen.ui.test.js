import test from "node:test";
import assert from "node:assert/strict";

import { renderVariables } from "../../src/js/ui.js";

test("UI renderVariables: nao falha com snapshot congelado", () => {
  const container = { innerHTML: "" };
  const snapshot = Object.freeze({
    vars: Object.freeze({ i: 1, j: 2 }),
    array: Object.freeze([5, 3, 1]),
  });

  assert.doesNotThrow(() => {
    renderVariables(container, snapshot, { scopes: {}, arrays: {} });
  });

  assert.match(container.innerHTML, /VARIABLES/);
  assert.match(container.innerHTML, /array = Array\(3\)/);
});
