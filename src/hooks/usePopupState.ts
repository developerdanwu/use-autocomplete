import React, { useRef, useState } from "react";
import useControlled from "./useControlled";

const usePopupState = (props: {
  open: boolean | undefined;
  componentName: string;
  setInputPristine: React.Dispatch<React.SetStateAction<boolean>>;
  onOpen: ((event: any) => void) | undefined;
  onClose: ((event: any, reason: any) => void) | undefined;
}) => {
  const [open = false, setOpenState] = useControlled({
    controlled: props.open,
    default: false,
    name: props.componentName,
    state: "open",
  });
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const popupOpen = open;
  const handleOpen = (event: any) => {
    if (open) {
      return;
    }
    setOpenState(true);
    props.setInputPristine(true);
    if (props.onOpen) {
      props.onOpen(event);
    }
  };

  const handleClose = (event, reason) => {
    if (!open) {
      return;
    }
    setOpenState(false);
    if (props.onClose) {
      props.onClose(event, reason);
    }
  };
  return {
    handleClose,
    handleOpen,
    anchorEl,
    setAnchorEl,
    open: popupOpen,
  };
};

export default usePopupState;
