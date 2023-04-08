import { useCallback, useState } from "react";

export interface Toggle {
  on: boolean;
  toggle: () => void;
  setOn: () => void;
  setOff: () => void;
}

export default function useToggle(initialState = false): Toggle {
  const [on, setToggle] = useState<boolean>(initialState);

  const toggle = useCallback((): void => setToggle((state) => !state), []);
  const setOn = useCallback((): void => setToggle(true), []);
  const setOff = useCallback((): void => setToggle(false), []);

  return { on, toggle, setOn, setOff };
}
