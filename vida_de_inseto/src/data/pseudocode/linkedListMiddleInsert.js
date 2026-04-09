export const linkedListMiddleInsertPseudo = {
  title: "Linked List Middle Insert",
  lines: [
    "slow = head, fast = head",
    "while fast and fast.next",
    "  advance slow by 1 and fast by 2",
    "create new node with insertValue",
    "link previous node to new node",
    "finalize list",
  ],
};
