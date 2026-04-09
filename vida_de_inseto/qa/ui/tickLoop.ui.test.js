import test from "node:test";
import assert from "node:assert/strict";

function createStartTickHarness({ handleTick, setIntervalImpl, clearIntervalImpl }) {
  let tickInterval = null;
  function stopTick() {
    if (tickInterval) {
      clearIntervalImpl(tickInterval);
      tickInterval = null;
    }
  }
  function startTick(delayMs) {
    stopTick();
    handleTick();
    tickInterval = setIntervalImpl(handleTick, delayMs);
  }
  return { startTick, stopTick };
}

test("UI tick loop: startTick executa um tick imediato antes do intervalo", () => {
  const calls = [];
  const harness = createStartTickHarness({
    handleTick: () => calls.push("tick"),
    setIntervalImpl: () => 123,
    clearIntervalImpl: () => {},
  });

  harness.startTick(700);
  assert.deepEqual(calls, ["tick"]);
});

test("UI tick loop: startTick reinicia intervalo anterior sem acumular", () => {
  const cleared = [];
  let id = 0;
  const harness = createStartTickHarness({
    handleTick: () => {},
    setIntervalImpl: () => {
      id += 1;
      return id;
    },
    clearIntervalImpl: (intervalId) => cleared.push(intervalId),
  });

  harness.startTick(700);
  harness.startTick(700);
  assert.deepEqual(cleared, [1]);
});
