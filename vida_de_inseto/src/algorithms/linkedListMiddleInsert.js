function listFromArray(values) {
  if (values.length === 0) {
    return null;
  }
  const head = { value: values[0], next: null };
  let cursor = head;
  for (let i = 1; i < values.length; i += 1) {
    cursor.next = { value: values[i], next: null };
    cursor = cursor.next;
  }
  return head;
}

function listToArray(head) {
  const arr = [];
  let cursor = head;
  while (cursor) {
    arr.push(cursor.value);
    cursor = cursor.next;
  }
  return arr;
}

export function runLinkedListMiddleInsert(inputArray, mapping, seed) {
  const snapshots = [];
  let step = 0;
  const insertValue = (seed % 90) + 10;
  const head = listFromArray(inputArray);

  function push(eventKey, vars, snapshotArray) {
    step += 1;
    snapshots.push({
      step,
      line: mapping[eventKey] || 1,
      algorithmId: "linked-list-middle-insert",
      vars: { ...vars },
      array: [...snapshotArray],
      eventKey,
      seed,
    });
  }

  if (!head) {
    push("COMPLETE", { inserted: insertValue }, []);
    return { outputArray: [], snapshots };
  }

  let slow = head;
  let fast = head;
  let prev = null;

  push("INIT", { slowVal: slow.value, fastVal: fast.value, insertValue }, listToArray(head));

  while (fast && fast.next) {
    prev = slow;
    slow = slow.next;
    fast = fast.next.next;
    push(
      "POINTER_STEP",
      { slowVal: slow ? slow.value : null, fastVal: fast ? fast.value : null, insertValue },
      listToArray(head)
    );
  }

  const newNode = { value: insertValue, next: slow };
  if (prev) {
    prev.next = newNode;
  }

  const afterInsert = listToArray(head);
  push("INSERT", { inserted: insertValue, nextVal: slow ? slow.value : null }, afterInsert);
  push("COMPLETE", { inserted: insertValue }, afterInsert);

  return {
    outputArray: afterInsert,
    snapshots,
  };
}
