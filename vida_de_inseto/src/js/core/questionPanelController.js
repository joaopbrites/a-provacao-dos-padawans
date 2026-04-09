/**
 * @typedef {Object} QuestionPanelState
 * @property {boolean} questionOpen
 * @property {boolean} questionPanelLocked
 */

/**
 * @param {QuestionPanelState} state
 * @returns {QuestionPanelState}
 */
export function onIncomingQuestion(state) {
  return {
    ...state,
    questionOpen: true,
    questionPanelLocked: false,
  };
}

/**
 * @param {QuestionPanelState} state
 * @param {boolean} isDesktop
 * @returns {QuestionPanelState}
 */
export function onClearQuestion(state, isDesktop) {
  return {
    ...state,
    questionPanelLocked: false,
    questionOpen: isDesktop ? false : state.questionOpen,
  };
}

/**
 * @param {QuestionPanelState} state
 * @param {boolean} hasCurrentQuestion
 * @returns {QuestionPanelState}
 */
export function onToggleByUser(state, hasCurrentQuestion) {
  if (!hasCurrentQuestion) {
    return state;
  }
  const nextOpen = !state.questionOpen;
  return {
    ...state,
    questionOpen: nextOpen,
    questionPanelLocked: !nextOpen,
  };
}

/**
 * @param {QuestionPanelState} state
 * @returns {QuestionPanelState}
 */
export function onManualClose(state) {
  return {
    ...state,
    questionOpen: false,
    questionPanelLocked: true,
  };
}

/**
 * @param {QuestionPanelState} state
 * @param {number} viewportWidth
 * @param {boolean} hasCurrentQuestion
 * @returns {QuestionPanelState}
 */
export function onResize(state, viewportWidth, hasCurrentQuestion) {
  if (viewportWidth > 900 && !state.questionOpen && hasCurrentQuestion && !state.questionPanelLocked) {
    return {
      ...state,
      questionOpen: true,
    };
  }
  return state;
}
