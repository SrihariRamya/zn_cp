import { useMemo, useState } from 'react';
import { filter, isEmpty, isEqual } from 'lodash';

export default function UseUndoAbleState(init) {
  const abc = init ? [init] : [];
  const [states, setStates] = useState(abc); // Used to store history of all states
  const [index, setIndex] = useState(0); // Index of current state within `states`
  const state = useMemo(() => states[index], [states, index]); // Current state
  const setState = (value) => {
    // If state has not changed, return to avoid triggering a re-render
    if (isEqual(state, value)) {
      return;
    }
    const copy = states.slice(0, index + 1); // This removes all future (redo) states after current index
    copy.push(value);
    filter(copy, isEmpty);
    setStates(copy);
    setIndex(copy.length - 1);
  };

  const resetState = (resetInit) => {
    setIndex(0);
    setStates([resetInit]);
  };

  const goBack = (steps = 1) => {
    setIndex(Math.max(0, Number(index) - (Number(steps) || 1)));
  };

  const goForward = (steps = 1) => {
    setIndex(Math.min(states.length - 1, Number(index) + (Number(steps) || 1)));
  };
  return {
    state,
    setState,
    resetState,
    index,
    lastIndex: states.length - 1,
    goBack,
    goForward,
  };
}
