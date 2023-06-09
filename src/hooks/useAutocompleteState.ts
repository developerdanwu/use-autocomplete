import React, { useRef, useState } from "react";
import useControlled from "./useControlled";
import { Option } from "../main";

const useAutocompleteState = <TOptionData, TState extends string>(props: {
  inputValue: string | undefined;
  valueProp: Option<TOptionData, TState> | null | undefined;
  defaultValue: Option<TOptionData, TState> | null | undefined;
  componentName: string;
}) => {
  const [inputValue, setInputValueState] = useControlled({
    controlled: props.inputValue,
    default: "",
    name: props.componentName,
    state: "inputValue",
  });
  const [inputPristine, setInputPristine] = React.useState(true);
  const [focused, setFocused] = useState(false);
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
    inputValue,
    setInputValueState,
    inputPristine,
    setInputPristine,
    focused,
    setFocused,
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
