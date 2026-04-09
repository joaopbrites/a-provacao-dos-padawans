export const treeInOrderQuestions = [
  {
    idPergunta: "tin-q1",
    eventKey: "VISIT",
    repeatable: false,
    weight: 1,
    offsetRange: [0, 0],
    snapshotField: "vars.current",
    enunciadoTemplate: {
      pt: "Qual valor foi visitado agora?",
      en: "Which value was visited now?",
    },
    wrongAnswersFn: "fromArray",
  },
  {
    idPergunta: "tin-q2",
    eventKey: "VISIT",
    repeatable: true,
    weight: 2,
    offsetRange: [1, 1],
    snapshotField: "array[0]",
    enunciadoTemplate: {
      pt: "No proximo passo, qual sera o valor em arr[0]?",
      en: "In the next step, what will be arr[0]?",
    },
    wrongAnswersFn: "fromArray",
  },
  {
    idPergunta: "tin-q3",
    eventKey: "VISIT",
    repeatable: true,
    weight: 3,
    offsetRange: [2, 4],
    snapshotField: "array[1]",
    enunciadoTemplate: {
      pt: "Daqui a {offset} passos, qual sera o valor em arr[1]?",
      en: "In {offset} steps, what will be arr[1]?",
    },
    wrongAnswersFn: "fromArray",
  },
];
