export const linkedListMiddleInsertQuestions = [
  {
    idPergunta: "llm-q1",
    eventKey: "POINTER_STEP",
    repeatable: false,
    weight: 1,
    offsetRange: [0, 0],
    snapshotField: "vars.slowVal",
    enunciadoTemplate: {
      pt: "Qual e o valor no ponteiro slow agora?",
      en: "What is the value at slow pointer now?",
    },
    wrongAnswersFn: "fromArray",
  },
  {
    idPergunta: "llm-q2",
    eventKey: "INSERT",
    repeatable: true,
    weight: 2,
    offsetRange: [1, 1],
    snapshotField: "array[1]",
    enunciadoTemplate: {
      pt: "No proximo passo, qual sera o valor em arr[1]?",
      en: "In the next step, what will be arr[1]?",
    },
    wrongAnswersFn: "fromArray",
  },
  {
    idPergunta: "llm-q3",
    eventKey: "POINTER_STEP",
    repeatable: true,
    weight: 3,
    offsetRange: [2, 3],
    snapshotField: "array[0]",
    enunciadoTemplate: {
      pt: "Daqui a {offset} passos, qual sera o valor em arr[0]?",
      en: "In {offset} steps, what will be arr[0]?",
    },
    wrongAnswersFn: "fromArray",
  },
];
