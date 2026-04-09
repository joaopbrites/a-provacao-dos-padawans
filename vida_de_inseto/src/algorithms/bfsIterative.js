function buildTreeGraph(values) {
  const graph = {};
  for (let i = 0; i < values.length; i += 1) {
    graph[i] = graph[i] || [];
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

export function runBfsIterative(inputArray, mapping, seed) {
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
      algorithmId: "bfs-iterative",
      vars: { ...vars },
      array: [...visitOrder],
      eventKey,
      seed,
    });
  }

  const queue = [0];
  visited.add(0);
  push("INIT", { queueSize: queue.length, start: values[0] ?? null });

  while (queue.length > 0) {
    const node = queue.shift();
    visitOrder.push(values[node]);
    push("VISIT", { current: values[node], queueSize: queue.length });

    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  push("COMPLETE", { totalVisited: visitOrder.length });
  return {
    outputArray: [...visitOrder],
    snapshots,
  };
}
