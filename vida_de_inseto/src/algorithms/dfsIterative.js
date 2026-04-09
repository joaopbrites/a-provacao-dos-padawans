function buildTreeGraph(values) {
  const graph = {};
  for (let i = 0; i < values.length; i += 1) {
    graph[i] = [];
    const left = (i * 2) + 1;
    const right = (i * 2) + 2;
    if (left < values.length) {
      graph[i].push(left);
      graph[left] = graph[left] || [];
      graph[left].push(i);
    }
    if (right < values.length) {
      graph[i].push(right);
      graph[right] = graph[right] || [];
      graph[right].push(i);
    }
  }
  return graph;
}

export function runDfsIterative(inputArray, mapping, seed) {
  const values = [...inputArray];
  const graph = buildTreeGraph(values);
  const snapshots = [];
  const visitOrder = [];
  const visited = new Set();
  let step = 0;

  function push(eventKey, vars) {
    step += 1;
    snapshots.push({
      step,
      line: mapping[eventKey] || 1,
      algorithmId: "dfs-iterative",
      vars: { ...vars },
      array: [...visitOrder],
      eventKey,
      seed,
    });
  }

  const stack = [0];
  push("INIT", { topValue: values[0] ?? null });

  while (stack.length > 0) {
    const node = stack.pop();
    if (visited.has(node)) {
      continue;
    }
    visited.add(node);
    visitOrder.push(values[node]);
    push("VISIT", { current: values[node], stackSize: stack.length });

    const neighbors = graph[node] || [];
    for (let i = neighbors.length - 1; i >= 0; i -= 1) {
      const next = neighbors[i];
      if (!visited.has(next)) {
        stack.push(next);
      }
    }
  }

  push("COMPLETE", { totalVisited: visitOrder.length });
  return {
    outputArray: [...visitOrder],
    snapshots,
  };
}
