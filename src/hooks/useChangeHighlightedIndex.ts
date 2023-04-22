import useEventCallback from "./utils";
import React, { useRef, useState } from "react";
import { Option } from "../main";

const classPrefix = "stateful-autocomplete";

const CLASSNAMES = {
  option: {
    focused: `${classPrefix}-option__focused`,
    focusVisible: `${classPrefix}-option__focusVisible`,
  },
};

const useChangeHighlightedIndex = <TOptionData, TState extends string>({
  //TODO: expose autohighlight
  // autoHighlight = true,
  includeInputInList,
  // disableListWrap,
  // autocomplete,
  inputRef,
  id,
  onHighlightChange,
  // inputValue,
  // popupOpen,
  filteredOptions,
  listboxRef,
  listItemsRef,
}: // disabledItemsFocusable,
// getOptionLabel,
{
  id: string;
  listItemsRef: React.RefObject<HTMLLIElement[]>;
  // autoHighlight?: boolean;
  // disabledItemsFocusable: boolean;
  listboxRef: React.RefObject<HTMLUListElement>;
  // popupOpen: boolean;
  // TODO: types
  // TODO: types
  filteredOptions: any;
  // getOptionLabel: (option: string) => string;
  // inputValue: any;
  inputRef: React.RefObject<HTMLInputElement>;
  // defaultHighlighted: 0 | -1;
  // autocomplete: boolean;
  // disableListWrap: boolean;
  onHighlightChange?: (
    event: React.SyntheticEvent,
    option: Option<TOptionData, TState> | null,
    reason: any
  ) => void;
  includeInputInList: boolean;
}) => {
  const disabledItemsFocusable = false;
  const disableListWrap = false;
  const defaultHighlighted = /*autoHighlight ? 0 : -1*/ 0;
  const highlightedIndexRef = useRef<number>(defaultHighlighted);
  const popupOpen = true;

  const setHighlightedIndex = useEventCallback(
    ({ event, index, reason = "auto" }) => {
      highlightedIndexRef.current = index;

      // does the index exist?
      if (inputRef.current) {
        if (index === -1) {
          inputRef.current.removeAttribute("aria-activedescendant");
        } else {
          inputRef.current.setAttribute(
            "aria-activedescendant",
            `${id}-option-${index}`
          );
        }
      }

      if (onHighlightChange) {
        onHighlightChange(
          event,
          index === -1 ? null : filteredOptions[index],
          reason
        );
      }

      if (!listboxRef.current) {
        return;
      }

      const prev = listboxRef.current.querySelector(
        `[role="option"].${CLASSNAMES.option.focused}`
      );
      if (prev) {
        prev.classList.remove(CLASSNAMES.option.focused);
        prev.classList.remove(CLASSNAMES.option.focusVisible);
      }

      const listboxNode = listboxRef.current;

      // "No results"
      if (!listboxNode) {
        return;
      }

      if (index === -1) {
        listboxNode.scrollTop = 0;
        return;
      }

      const option = listboxRef.current.querySelector(
        `[data-option-index="${index}"]`
      );

      if (!option) {
        return;
      }

      option.classList.add(CLASSNAMES.option.focused);
      if (reason === "keyboard") {
        option.classList.add(CLASSNAMES.option.focusVisible);
      }

      if (reason !== "mouse") {
        listboxNode.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  );

  function validOptionIndex(index: number, direction: "next" | "previous") {
    if (!listboxRef.current || index === -1) {
      return -1;
    }

    let nextFocus = index;

    while (true) {
      // Out of range
      if (
        (direction === "next" && nextFocus === filteredOptions.length) ||
        (direction === "previous" && nextFocus === -1)
      ) {
        return -1;
      }

      // TODO: can improve logic here?
      const option = listboxRef.current.querySelector(
        `[data-option-index="${nextFocus}"]`
      ) as HTMLButtonElement;

      // Same logic as MenuList.js
      const nextFocusDisabled = disabledItemsFocusable
        ? false
        : !option ||
          option.disabled ||
          option.getAttribute("aria-disabled") === "true";

      if ((option && !option.hasAttribute("tabindex")) || nextFocusDisabled) {
        // Move to the next element.
        nextFocus += direction === "next" ? 1 : -1;
      } else {
        return nextFocus;
      }
    }
  }

  const changeHighlightedIndex = useEventCallback(
    ({
      event,
      diff,
      direction = "next",
      reason = "auto",
    }: {
      event: any;
      diff: "end" | "start" | number | "reset";
      direction: "next" | "previous";
      reason: any;
    }) => {
      if (!popupOpen) {
        return;
      }

      const getNextIndex = () => {
        const maxIndex = filteredOptions.length - 1;

        console.log("OPT", filteredOptions, diff);
        if (diff === "reset") {
          return defaultHighlighted;
        }

        if (diff === "start") {
          return 0;
        }

        if (diff === "end") {
          return maxIndex;
        }

        const newIndex = highlightedIndexRef.current + diff;

        console.log("NEW", newIndex);
        if (newIndex < 0) {
          if (newIndex === -1 && includeInputInList) {
            return -1;
          }

          if (
            (disableListWrap && highlightedIndexRef.current !== -1) ||
            Math.abs(diff) > 1
          ) {
            return 0;
          }

          return maxIndex;
        }

        if (newIndex > maxIndex) {
          if (newIndex === maxIndex + 1 && includeInputInList) {
            return -1;
          }

          if (disableListWrap || Math.abs(diff) > 1) {
            return maxIndex;
          }

          return 0;
        }

        return newIndex;
      };

      const nextIndex = validOptionIndex(getNextIndex(), direction);
      console.log("NEXT", nextIndex);
      // add list items focused classes
      const listItems = listItemsRef.current;
      // TODO: set styles on highlight ref
      if (listItems) {
        if (highlightedIndexRef.current !== -1) {
          const currentItem = listItems[highlightedIndexRef.current];
          currentItem.classList.remove(CLASSNAMES.option.focused);
          currentItem.classList.remove(CLASSNAMES.option.focusVisible);
        }
        listItems[nextIndex].classList.add(CLASSNAMES.option.focused);
        if (reason === "keyboard") {
          listItems[nextIndex].classList.add(CLASSNAMES.option.focusVisible);
        }
      }

      setHighlightedIndex({ index: nextIndex, reason, event });

      // Sync the content of the input with the highlighted option.
      // if (autocomplete && diff !== "reset") {
      //   if (nextIndex === -1) {
      //     inputRef.current.value = inputValue;
      //   } else {
      //     const option = getOptionLabel(filteredOptions[nextIndex]);
      //     inputRef.current.value = option;
      //
      //     // The portion of the selected suggestion that has not been typed by the user,
      //     // a completion string, appears inline after the input cursor in the textbox.
      //     const index = option.toLowerCase().indexOf(inputValue.toLowerCase());
      //     if (index === 0 && inputValue.length > 0) {
      //       inputRef.current.setSelectionRange(
      //         inputValue.length,
      //         option.length
      //       );
      //     }
      //   }
      // }
    }
  );

  return { highlightedIndexRef, changeHighlightedIndex, setHighlightedIndex };
};

export default useChangeHighlightedIndex;
