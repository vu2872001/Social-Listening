enum State {
  Working = 'Working',
  Pause = 'Pause',
}

export const WorkingState: Readonly<Record<State, boolean>> = {
  [State.Working]: false,
  [State.Pause]: true,
};
