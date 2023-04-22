import React, { MutableRefObject, RefObject } from "react";
import { Option } from "../main";

const useOptionsProps = <TOptionData, TState extends string>(props: {
  highlightedIndexRef: RefObject<number>;
  setHighlightedIndex: (args_0: {
    event: any;
    index: any;
    reason?: string | undefined;
  }) => void;
  isTouchRef: MutableRefObject<boolean>;
  selectNewValue: (
    event: React.UIEvent<Element, UIEvent>,
    option: Option<TOptionData, TState>,
    reasonProp: string,
    origin?: string
  ) => void;
}) => {
  const handleOptionMouseMove = (event: React.UIEvent<Element, UIEvent>) => {
    const index = Number(event.currentTarget.getAttribute("data-option-index"));
    if (props.highlightedIndexRef.current !== index) {
      props.setHighlightedIndex({
        event,
        index,
        reason: "mouse",
      });
    }
  };

  const handleOptionClick =
    (option: Option<TOptionData, TState>) =>
    (
      event:
        | React.MouseEvent<HTMLAnchorElement>
        | React.MouseEvent<HTMLLIElement>
    ) => {
      props.selectNewValue(event, option, "selectOption");
      props.isTouchRef.current = false;
    };

  const handleOptionTouchStart = (event: React.UIEvent<Element, UIEvent>) => {
    props.setHighlightedIndex({
      event,
      index: Number(event.currentTarget.getAttribute("data-option-index")),
      reason: "touch",
    });
    props.isTouchRef.current = true;
  };

  return {
    handleOptionClick,
    handleOptionTouchStart,
    handleOptionMouseMove,
  };
};

export default useOptionsProps;
