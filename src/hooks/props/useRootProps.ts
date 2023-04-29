import React, { MutableRefObject, RefObject } from "react";

const useRootProps = (props: {
  id: string;
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement>;
  firstFocus: MutableRefObject<boolean>;
  selectOnFocus: boolean;
}) => {
  const handleOnClick = () => {
    if (props.inputRef.current) {
      props.inputRef.current.focus();
    }
    if (
      props.inputRef.current &&
      props.inputRef.current.selectionEnd &&
      props.inputRef.current.selectionStart &&
      props.selectOnFocus &&
      props.firstFocus.current &&
      props.inputRef.current.selectionEnd -
        props.inputRef.current.selectionStart ===
        0
    ) {
      props.inputRef.current.select();
    }

    props.firstFocus.current = false;
  };

  const onMouseDown = (event: React.MouseEvent<Element>) => {
    const target = event.target as HTMLElement;
    if (target.getAttribute("id") !== props.id) {
      event.preventDefault();
    }
  };

  return { handleOnClick, onMouseDown };
};

export default useRootProps;
