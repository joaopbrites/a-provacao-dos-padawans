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

export function runDfsRecursive(inputArray, mapping, seed) {
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
      algorithmId: "dfs-recursive",
      vars: { ...vars },
      array: [...visitOrder],
      eventKey,
      seed,
    });
  }

  function dfs(node, depth) {
    if (visited.has(node)) {
      return;
    }
    visited.add(node);
    visitOrder.push(values[node]);
    push("VISIT", { current: values[node], depth });

    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, depth + 1);
      }
    }
  }

  push("INIT", { start: values[0] ?? null });
  if (values.length > 0) {
    dfs(0, 0);
  }
  push("COMPLETE", { totalVisited: visitOrder.length });

  return {
    outputArray: [...visitOrder],
    snapshots,
  };
}
