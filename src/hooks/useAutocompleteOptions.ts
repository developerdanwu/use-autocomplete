import React, { useState } from "react";
import { Option } from "../main";

const useAutocompleteOptions = <TOptionData, TState extends string>(props: {
  options: Record<TState, Option<TOptionData, TState>[]>;
  popupOpen: boolean;
}) => {
  const states = Object.keys(props.options) as (keyof typeof props.options)[];
  const [optionsState, setOptionsState] = useState<keyof typeof props.options>(
    // must exist because it is a required parameter
    states[0]
  );
  const activeOptions = props.popupOpen ? props.options[optionsState] : [];
  return {
    optionsState,
    activeOptions,
    setOptionsState,
  };
};

export default useAutocompleteOptions;
