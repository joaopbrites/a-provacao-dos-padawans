function leftIndex(index) {
  return (index * 2) + 1;
}

function rightIndex(index) {
  return (index * 2) + 2;
}

export function runTreePostOrder(inputArray, mapping, seed) {
  const values = [...inputArray];
  const visitOrder = [];
  const snapshots = [];
  let step = 0;

  function push(eventKey, vars) {
    step += 1;
    snapshots.push({
      step,
      line: mapping[eventKey] || 1,
      algorithmId: "tree-post-order",
      vars: { ...vars },
      array: [...visitOrder],
      eventKey,
      seed,
    });
  }

  function visit(index) {
    if (index >= values.length) {
      return;
    }
    visit(leftIndex(index));
    visit(rightIndex(index));
    const value = values[index];
    visitOrder.push(value);
    push("VISIT", { current: value, nodeIndex: index });
  }

  visit(0);
  push("COMPLETE", { totalVisited: visitOrder.length });

  return {
    outputArray: [...visitOrder],
    snapshots,
  };
}
