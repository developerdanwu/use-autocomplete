import React from "react";
import useControlled from "./useControlled";

const usePopupState = (props: { open: boolean; componentName: string }) => {
  const [open, setOpenState] = useControlled({
    controlled: props.open,
    default: false,
    name: props.componentName,
    state: "open",
  });
  const popupOpen = open;

  return {
    open: popupOpen,
    setOpenState,
  };
};

export default usePopupState;
