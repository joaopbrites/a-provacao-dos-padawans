export function runSelectionSort(inputArray, mapping, seed) {
  const arr = [...inputArray];
  const snapshots = [];
  let step = 0;

  function push(eventKey, vars) {
    step += 1;
    snapshots.push({
      step,
      line: mapping[eventKey] || 1,
      algorithmId: "selection-sort",
      vars: { ...vars },
      array: [...arr],
      eventKey,
      seed,
    });
  }

  for (let i = 0; i < arr.length - 1; i += 1) {
    let minIdx = i;
    push("OUTER_LOOP_START", { i, minIdx });

    for (let j = i + 1; j < arr.length; j += 1) {
      push("INNER_LOOP_START", { i, j, minIdx });
      push("COMPARE", { i, j, minIdx, candidate: arr[j], currentMin: arr[minIdx] });

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        push("UPDATE_MIN", { i, j, minIdx });
      }
    }

    if (minIdx !== i) {
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;
      push("SWAP", { i, minIdx });
    }

    push("OUTER_LOOP_END", { i, minIdx });
  }

  push("COMPLETE", {});

  return {
    outputArray: arr,
    snapshots,
  };
}
