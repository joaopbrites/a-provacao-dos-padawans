export const treePreOrderQuestions = [
  {
    idPergunta: "tpre-q1",
    eventKey: "VISIT",
    repeatable: false,
    weight: 1,
    offsetRange: [0, 0],
    snapshotField: "vars.current",
    enunciadoTemplate: {
      pt: "Qual no foi visitado agora?",
      en: "Which node value was just visited?",
    },
    wrongAnswersFn: "fromArray",
  },
  {
    idPergunta: "tpre-q2",
    eventKey: "VISIT",
    repeatable: true,
    weight: 2,
    offsetRange: [1, 1],
    snapshotField: "array[0]",
    enunciadoTemplate: {
      pt: "No proximo passo, qual sera o primeiro valor visitado?",
      en: "In the next step, what will be the first visited value?",
    },
    wrongAnswersFn: "fromArray",
  },
  {
    idPergunta: "tpre-q3",
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
