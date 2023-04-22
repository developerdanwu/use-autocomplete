import { useRef } from "react";
import useControlled from "./useControlled";
import { Option } from "../main";

const useAutocompleteState = <TOptionData, TState extends string>(props: {
  valueProp: Option<TOptionData, TState> | null;
  defaultValue: Option<TOptionData, TState> | null;
  componentName: string;
}) => {
  const firstFocus = useRef(true);
  const isTouch = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const listItemsRef = useRef<HTMLLIElement[]>([]);
  const ignoreFocus = useRef(false);
  const [value, setValueState] = useControlled({
    controlled: props.valueProp,
    default: props.defaultValue,
    name: props.componentName,
  });

  return {
    value,
    setValueState,
    ignoreFocus,
    firstFocus,
    isTouch,
    inputRef,
    listboxRef,
    listItemsRef,
  };
};

export default useAutocompleteState;
