import test from "node:test";
import assert from "node:assert/strict";

import { createEngine } from "../../src/js/gameEngine.js";
import { GAME_CONFIG, MODES } from "../../src/js/config.js";

function runSinglePhase(mode, selectedAlgorithmId) {
  const engine = createEngine();
  engine.start(mode, selectedAlgorithmId);

  let questionCount = 0;
  let safety = 0;

  while (safety < 2000) {
    const event = engine.tick();
    if (event.type === "question") {
      questionCount += 1;
      engine.answerQuestion(String(event.question.correctAnswer), 1);
    }
    if (event.type === "phase-complete") {
      break;
    }
    safety += 1;
  }

  return questionCount;
}

test("Engine: respeita questionsPerPhase no modo arcade", () => {
  const count = runSinglePhase(MODES.ARCADE);
  assert.ok(count <= GAME_CONFIG.questionsPerPhase);
});

test("Engine: respeita questionsPerPhase no modo selection", () => {
  const countBubble = runSinglePhase(MODES.SELECTION, "bubble-sort");
  const countSelection = runSinglePhase(MODES.SELECTION, "selection-sort");
  assert.ok(countBubble <= GAME_CONFIG.questionsPerPhase);
  assert.ok(countSelection <= GAME_CONFIG.questionsPerPhase);
});
