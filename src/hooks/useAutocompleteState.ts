import { useRef } from "react";

const useAutocompleteState = () => {
  const firstFocus = useRef(true);
  const isTouch = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const listItemsRef = useRef<HTMLLIElement[]>([]);
  const ignoreFocus = useRef(false);

  return {
    ignoreFocus,
    firstFocus,
    isTouch,
    inputRef,
    listboxRef,
    listItemsRef,
  };
};

export default useAutocompleteState;
