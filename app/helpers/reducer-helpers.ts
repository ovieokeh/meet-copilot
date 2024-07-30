export const safeUpdateState = <T>(states: T[], newState: T) => {
  if (states.includes(newState)) {
    return states;
  }

  return [...states, newState];
};

export const removeLoadingState = <T extends string>(
  states: T[],
  newState: string,
) => {
  const typeToRemove = newState.split("_")[0];
  return states.filter(
    (state) =>
      !state.includes(`FETCHING_${typeToRemove}` || `${typeToRemove}_ERROR`),
  );
};
