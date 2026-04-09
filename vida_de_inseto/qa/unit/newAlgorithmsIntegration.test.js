import test from "node:test";
import assert from "node:assert/strict";

import { createPhase, getAlgorithmIds } from "../../src/js/phaseEngine.js";

const NEW_ALGORITHMS = [
  "linked-list-middle-insert",
  "tree-pre-order",
  "tree-in-order",
  "tree-post-order",
  "dfs-iterative",
  "dfs-recursive",
  "bfs-iterative",
  "bfs-recursive",
];

test("Novos algoritmos aparecem na lista de algoritmos", () => {
  const ids = getAlgorithmIds();
  for (const id of NEW_ALGORITHMS) {
    assert.equal(ids.includes(id), true);
  }
});

test("Novos algoritmos geram fase valida com snapshots e perguntas", () => {
  for (const algorithmId of NEW_ALGORITHMS) {
    const phase = createPhase({
      mode: "selection",
      selectedAlgorithmId: algorithmId,
      seed: 12345,
    });

    assert.equal(phase.algorithmId, algorithmId);
    assert.ok(Array.isArray(phase.snapshots));
    assert.ok(phase.snapshots.length > 0);
    assert.equal(phase.snapshots[phase.snapshots.length - 1].eventKey, "COMPLETE");
    assert.ok(Array.isArray(phase.questionDefinitions));
    assert.ok(phase.questionDefinitions.length > 0);
  }
});
