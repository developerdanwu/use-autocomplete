import React from "react";
import { Option } from "../main";

// Number of options to jump in list box when `Page Up` and `Page Down` keys are used.
const pageSize = 5;

const useKeydown = <TOptionData, TState extends string>(props: {
  popupOpen: boolean;
  handleClosePopup: (event: any, reason: any) => void;
  handleOpenPopup: (event: any) => void;
  activeOptions: Record<TState, Option<TOptionData, TState>[]>[TState];
  highlightedIndexRef: React.MutableRefObject<number>;
  changeHighlightedIndex: (args_0: {
    event: any;
    diff: "end" | "start" | number | "reset";
    direction: "next" | "previous";
    reason: any;
  }) => void;
  selectNewValue: (
    event: React.UIEvent<Element, UIEvent>,
    option: Option<TOptionData, TState>,
    reasonProp: string,
    origin?: string
  ) => void;
}) => {
  const handleKeyDown =
    (others: {
      onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    }) =>
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (others?.onKeyDown) {
        others.onKeyDown(event);
      }
      switch (event.key) {
        case "PageUp": {
          // Prevent scroll of the page
          event.preventDefault();
          props.handleOpenPopup(event);
          props.changeHighlightedIndex({
            diff: -pageSize,
            direction: "previous",
            reason: "keyboard",
            event,
          });
          break;
        }
        case "PageDown": {
          // Prevent scroll of the page
          event.preventDefault();
          if (props.popupOpen) {
            props.changeHighlightedIndex({
              diff: pageSize,
              direction: "next",
              reason: "keyboard",
              event,
            });
          } else {
            props.handleOpenPopup(event);
          }

          break;
        }
        case "ArrowDown":
          if (props.popupOpen) {
            props.changeHighlightedIndex({
              diff: 1,
              direction: "next",
              reason: "keyboard",
              event,
            });
          } else {
            props.handleOpenPopup(event);
          }

          break;
        case "ArrowUp": {
          // Prevent cursor move
          event.preventDefault();
          props.changeHighlightedIndex({
            diff: -1,
            direction: "previous",
            reason: "keyboard",
            event,
          });
          // TODO: handle opening of popper
          break;
        }
        case "Enter": {
          if (props.highlightedIndexRef.current !== -1) {
            const option =
              props.activeOptions[props.highlightedIndexRef.current];
            const disabled = false;
            // Avoid early form validation, let the end-users continue filling the form.
            event.preventDefault();

            if (disabled) {
              return;
            }

            props.selectNewValue(event, option, "selectOption");
          }

          break;
        }
        case "Home": {
          // Prevent scroll of the page
          event.preventDefault();
          if (props.popupOpen) {
            props.changeHighlightedIndex({
              diff: "start",
              direction: "next",
              reason: "keyboard",
              event,
            });
          }

          break;
        }
        case "End": {
          // Prevent scroll of the page
          event.preventDefault();
          if (props.popupOpen) {
            props.changeHighlightedIndex({
              diff: "end",
              direction: "next",
              reason: "keyboard",
              event,
            });
          } else {
            props.handleOpenPopup(event);
            props.changeHighlightedIndex({
              diff: "reset",
              direction: "next",
              reason: "keyboard",
              event,
            });
          }
        }
        case "Escape": {
          event.preventDefault();
          props.handleClosePopup(event, "escape");
          props.changeHighlightedIndex({
            diff: "reset",
            direction: "next",
            reason: "escape",
            event,
          });
        }
        default:
          break;
      }
    };

  return {
    handleKeyDown,
  };
};

export default useKeydown;
