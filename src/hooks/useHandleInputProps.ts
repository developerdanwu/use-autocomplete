import React from "react";
import useControlled from "./useControlled";

const useHandleInputProps = (props: {
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

  const handleBlur = (event) => {
    // Ignore the event when using the scrollbar with IE11

    setFocused(false);
    firstFocus.current = true;
    ignoreFocus.current = false;

    if (autoSelect && highlightedIndexRef.current !== -1 && popupOpen) {
      selectNewValue(
        event,
        filteredOptions[highlightedIndexRef.current],
        "blur"
      );
    } else if (autoSelect && freeSolo && inputValue !== "") {
      selectNewValue(event, inputValue, "blur", "freeSolo");
    } else if (clearOnBlur) {
      resetInputValue(event, value);
    }

    handleClose(event, "blur");
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

  return {
    handleInputChange,
    inputValue,
    inputPristine,
  };
};

export default useHandleInputProps;
