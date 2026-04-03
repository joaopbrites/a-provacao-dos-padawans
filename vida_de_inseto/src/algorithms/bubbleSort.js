export function runBubbleSort(inputArray, mapping, seed) {
  const arr = [...inputArray];
  const snapshots = [];
  let step = 0;

  function push(eventKey, vars) {
    step += 1;
    snapshots.push({
      step,
      line: mapping[eventKey] || 1,
      algorithmId: "bubble-sort",
      vars: { ...vars },
      array: [...arr],
      eventKey,
      seed,
    });
  }

  for (let i = 0; i < arr.length - 1; i += 1) {
    push("OUTER_LOOP_START", { i });

    for (let j = 0; j < arr.length - 1 - i; j += 1) {
      push("INNER_LOOP_START", { i, j });
      push("COMPARE", { i, j, left: arr[j], right: arr[j + 1] });

      if (arr[j] > arr[j + 1]) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        push("SWAP", { i, j });
      }
    }

    push("OUTER_LOOP_END", { i });
  }

  push("COMPLETE", {});

  return {
    outputArray: arr,
    snapshots,
  };
}
