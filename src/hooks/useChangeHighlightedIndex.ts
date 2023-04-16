import useEventCallback from "./utils";
import { useRef, useState } from "react";

const classPrefix = "stateful-autocomplete";

const CLASSNAMES = {
  option: {
    focused: `${classPrefix}-option__focused`,
    focusVisible: `${classPrefix}-option__focusVisible`,
  },
};

const useChangeHighlightedIndex = ({
  //TODO: expose autohighlight
  // autoHighlight = true,
  includeInputInList,
  // disableListWrap,
  // autocomplete,
  // inputRef,
  // inputValue,
  // setHighlightedIndex,
  // popupOpen,
  filteredOptions,
  listboxRef,
  listItemsRef,
}: // disabledItemsFocusable,
// getOptionLabel,
{
  listItemsRef: React.RefObject<HTMLLIElement[]>;
  // autoHighlight?: boolean;
  // disabledItemsFocusable: boolean;
  listboxRef: React.RefObject<HTMLUListElement>;
  // popupOpen: boolean;
  // TODO: types
  // setHighlightedIndex: ({
  //   index,
  //   reason,
  //   event,
  // }: {
  //   index: number;
  //   reason: any;
  //   event: any;
  // }) => void;
  // TODO: types
  filteredOptions: any;
  // getOptionLabel: (option: string) => string;
  // inputValue: any;
  // inputRef: React.MutableRefObject<HTMLInputElement>;
  // defaultHighlighted: 0 | -1;
  // autocomplete: boolean;
  // disableListWrap: boolean;
  includeInputInList: boolean;
}) => {
  const disabledItemsFocusable = false;
  const disableListWrap = false;
  const defaultHighlighted = /*autoHighlight ? 0 : -1*/ 0;
  const highlightedIndexRef = useRef<number>(defaultHighlighted);
  const popupOpen = true;
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
      diff: any;
      direction: "next" | "previous";
      reason: any;
    }) => {
      if (!popupOpen) {
        return;
      }

      const getNextIndex = () => {
        const maxIndex = filteredOptions.length - 1;

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
      highlightedIndexRef.current = nextIndex;

      // setHighlightedIndex({ index: nextIndex, reason, event });

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

  return { highlightedIndexRef, changeHighlightedIndex };
};

export default useChangeHighlightedIndex;
