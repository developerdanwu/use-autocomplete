import { HTMLAttributes, useRef, useState } from "react";
import useChangeHighlightedIndex from "./hooks/useChangeHighlightedIndex";

const useStatefulAutocomplete = <TData extends Record<string, any[]>>({
  // TODO: types for props
  multiple = false,
  freeSolo = false,
  options,
  onChange = () => {},
  value: valueProp = null,
  inputValue = "",
  open = false,
  disableClearable = false,
  componentName = "Autocomplete",
}: {
  multiple?: boolean;
  freeSolo?: boolean;
  options: TData;
  onChange?: (event: any, value: any, reason: any, details: any) => void;
  value?: any;
  inputValue?: string;
  open?: boolean;
  disableClearable?: boolean;
  componentName?: string;
}) => {
  const states = Object.keys(options) as (keyof typeof options)[];
  const [optionsState, setOptionsState] = useState<keyof typeof options>(
    // must exist because it is a required parameter
    states[0]
  );
  const [valueState, setValueState] = useState(valueProp);
  const listboxRef = useRef<HTMLUListElement>(null);
  const activeOptions = options[optionsState];
  const listItemsRef = useRef<HTMLLIElement[]>([]);
  const itemHighlight = useChangeHighlightedIndex({
    includeInputInList: false,
    filteredOptions: activeOptions,
    listboxRef,
    listItemsRef,
  });

  console.log("STATE", valueState);

  // const handleOptionClick = (event) => {
  //   const index = Number(event.currentTarget.getAttribute('data-option-index'));
  //   selectNewValue(event, filteredOptions[index], 'selectOption');
  //
  //   isTouch.current = false;
  // };

  const handleValue = (event, newValue, reason, details) => {
    // if (multiple) {
    //   if (
    //     valueSta.length === newValue.length &&
    //     value.every((val, i) => val === newValue[i])
    //   ) {
    //     return;
    //   }
    // } else if (value === newValue) {
    //   return;
    // }

    if (onChange) {
      onChange(event, newValue, reason, details);
    }

    setValueState(newValue);
  };

  const selectNewValue = (
    event,
    option: TData[keyof TData][number],
    reasonProp = "selectOption",
    origin = "options"
  ) => {
    // TODO: handle multiple
    // TODO:  Reset Input

    console.log(option);
    handleValue(event, option, reasonProp, { origin });
  };

  const handleKeyDown =
    (others: {
      onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    }) =>
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (others?.onKeyDown) {
        others.onKeyDown(event);
      }
      switch (event.key) {
        case "ArrowDown":
          itemHighlight.changeHighlightedIndex({
            diff: 1,
            direction: "next",
            reason: "keyboard",
            event,
          });
          // TODO: handle opening of popper
          console.log("ARROW DOWN");
          break;
        case "ArrowUp": {
          // Prevent cursor move
          event.preventDefault();
          itemHighlight.changeHighlightedIndex({
            diff: -1,
            direction: "previous",
            reason: "keyboard",
            event,
          });
          // TODO: handle opening of popper
          break;
        }
        case "Enter": {
          if (itemHighlight.highlightedIndexRef.current !== -1) {
            const option =
              activeOptions[itemHighlight.highlightedIndexRef.current];
            const disabled = false;
            // Avoid early form validation, let the end-users continue filling the form.
            event.preventDefault();

            if (disabled) {
              return;
            }

            selectNewValue(event, option, "selectOption");

            // Move the selection to the end.
            // if (autoComplete) {
            //   inputRef.current.setSelectionRange(
            //     inputRef.current.value.length,
            //     inputRef.current.value.length
            //   );
            // }
          }
          // else if (
          //   freeSolo &&
          //   inputValue !== "" &&
          //   inputValueIsSelectedValue === false
          // ) {
          //   if (multiple) {
          //     // Allow people to add new values before they submit the form.
          //     event.preventDefault();
          //   }
          //   selectNewValue(event, inputValue, "createOption", "freeSolo");
          // }
          break;
        }
        default:
          break;
      }
    };

  return {
    activeOptions,
    setOptionsState: states.reduce<Record<keyof typeof options, () => void>>(
      (acc, nextVal) => {
        acc[nextVal] = () => setOptionsState(nextVal);
        return acc;
      },
      {} as Record<keyof typeof options, () => void>
    ),
    states,
    optionsState,
    getRootProps: (others?: any) => ({
      "aria-owns": undefined,
      ...others,
      onKeyDown: handleKeyDown(others),
      // onMouseDown,
      // onClick,
    }),
    getInputProps: () => ({
      // id,
      // value,
      // onBlur,
      // onFocus,
      // onChange,
      // onMouseDown,
      // "aria-activedescendant": popupOpen ? "" : null,
      // "aria-autocomplete": autoComplete ? "both" : "list",
      // "aria-controls": listboxAvailable ? `${id}-listbox` : undefined,
      // "aria-expanded": listboxAvailable,
      // autoComplete: 'off',
      // ref: inputRef,
      // autoCapitalize: 'none',
      // spellCheck: 'false',
      // role: 'combobox',
      // disabled: disabledProp,
    }),
    getClearProps: () => ({
      // tabIndex: -1,
      // onClick: handleClear,
    }),
    getPopupIndicatorProps: () => ({
      // tabIndex: -1,
      // onClick: handlePopupIndicator,
    }),
    getTagProps: ({ index }) => ({
      // key: index,
      // 'data-tag-index': index,
      // tabIndex: -1,
      // ...(!readOnly && { onDelete: handleTagDelete(index) }),
    }),
    getListboxProps: () => ({
      role: "listbox",
      id: `listbox`,
      "aria-labelledby": `label`,
      ref: listboxRef,
      onMouseDown: (event) => {
        // Prevent blur
        event.preventDefault();
      },
    }),
    getOptionProps: ({ index, option }) => {
      // const selected = (multiple ? value : [value]).some(
      //     (value2) => value2 != null && isOptionEqualToValue(option, value2),
      // );
      const disabled = false;

      return {
        key: `${option}-${index}`,
        tabIndex: -1,
        role: "option",
        id: `-option-${index}`,
        ref: (el: HTMLLIElement) => {
          if (el) {
            listItemsRef.current[index] = el;
          }
        },
        // onMouseOver: handleOptionMouseOver,
        // onClick: handleOptionClick,
        // onTouchStart: handleOptionTouchStart,
        "data-option-index": index,
        "aria-disabled": disabled,
        // 'aria-selected': selected,
      };
    },
    getHighlightedIndex: () => itemHighlight.highlightedIndexRef.current,
    // id,
    // inputValue,
    // value,
    // dirty,
    // popupOpen,
    // focused,
    // anchorEl,
    // setAnchorEl,
    // focusedTag,
  };
};

export { useStatefulAutocomplete };
