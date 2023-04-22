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
