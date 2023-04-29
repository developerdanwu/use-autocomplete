import React, { MutableRefObject, RefObject } from "react";
import useControlled from "../useControlled";
import { Simulate } from "react-dom/test-utils";
import input = Simulate.input;
const useInputProps = (props: {
  popupOpen: boolean;
  handleClose: (event: any, reason: any) => void;
  setFocused: React.Dispatch<React.SetStateAction<boolean>>;
  inputPristine: boolean;
  setInputPristine: React.Dispatch<React.SetStateAction<boolean>>;
  handleOpen: (event: any) => void;
  ignoreFocus: MutableRefObject<boolean>;
  firstFocus: MutableRefObject<boolean>;
  inputValue: string | undefined;
  componentName: string;
  onInputChange:
    | ((event: React.SyntheticEvent, value: string, reason: string) => void)
    | undefined;
  disableClearable: boolean;
}) => {
  const [inputValue, setInputValueState] = useControlled({
    controlled: props.inputValue,
    default: "",
    name: props.componentName,
    state: "inputValue",
  });

  const handleInputMouseDown = (event: any) => {
    if (inputValue === "" || !props.popupOpen) {
      props.handleOpen(event);
    }
  };

  const handleBlur = (
    event: React.FormEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    // Ignore the event when using the scrollbar with IE11

    props.setFocused(false);
    props.firstFocus.current = true;
    props.ignoreFocus.current = false;
    props.handleClose(event, "blur");
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
      setInputValueState(newValue);

      props.setInputPristine(false);

      if (props.onInputChange) {
        props.onInputChange(event, newValue, "input");
      }
    }

    if (newValue === "") {
    }
    // TODO: handle open
    props.handleOpen(event);
  };

  const handleFocus = (
    event: React.FormEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    props.setFocused(true);
    props.handleOpen(event);
  };

  return {
    handleInputMouseDown,
    handleFocus,
    handleBlur,
    handleInputChange,
    inputValue,
  };
};

export default useInputProps;
