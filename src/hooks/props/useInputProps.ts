import React, { MutableRefObject, RefObject } from "react";
import useControlled from "../useControlled";
const useInputProps = (props: {
  ignoreFocus: MutableRefObject<boolean>;
  firstFocus: MutableRefObject<boolean>;
  inputValue: string | undefined;
  componentName: string;
  onInputChange: (
    event: React.SyntheticEvent,
    value: string,
    reason: string
  ) => void | undefined;
  disableClearable: boolean;
  multiple: boolean;
}) => {
  const [inputValue, setInputValueState] = useControlled({
    controlled: props.inputValue,
    default: "",
    name: props.componentName,
    state: "inputValue",
  });
  const [inputPristine, setInputPristine] = React.useState(true);
  const [focused, setFocused] = React.useState(false);

  const handleBlur = (
    event: React.FormEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    // Ignore the event when using the scrollbar with IE11

    setFocused(false);

    props.firstFocus.current = true;
    props.ignoreFocus.current = false;
    //
    // if (autoSelect && highlightedIndexRef.current !== -1 && popupOpen) {
    //   selectNewValue(
    //     event,
    //     filteredOptions[highlightedIndexRef.current],
    //     "blur"
    //   );
    // } else if (autoSelect && freeSolo && inputValue !== "") {
    //   selectNewValue(event, inputValue, "blur", "freeSolo");
    // } else if (clearOnBlur) {
    //   resetInputValue(event, value);
    // }
    //
    // handleClose(event, "blur");
  };

  const handleInputChange = (
    event: React.FormEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;

    if (inputValue !== newValue) {
      if (typeof setInputValueState === "function") {
        setInputValueState(newValue);
      }
      setInputPristine(false);

      if (props.onInputChange) {
        props.onInputChange(event, newValue, "input");
      }
    }

    if (newValue === "") {
      if (!props.disableClearable && !props.multiple) {
        // TODO: handle open
        // handleValue(event, null, "clear");
      }
    } else {
      // TODO: handle open
      // handleOpen(event);
    }
  };

  const handleFocus = (
    event: React.FormEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setFocused(true);

    // if (openOnFocus && !ignoreFocus.current) {
    //   handleOpen(event);
    // }
  };

  return {
    handleFocus,
    handleBlur,
    handleInputChange,
    inputValue,
    inputPristine,
  };
};

export default useInputProps;
