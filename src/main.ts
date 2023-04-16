import { HTMLAttributes, useState } from "react";

const useStatefulAutocomplete = <TData extends Record<string, any[]>>({
  // TODO: types for props
  multiple = false,
  freeSolo = false,
  options,
  onChange = () => {},
  value = null,
  inputValue = "",
  open = false,
  disableClearable = false,
  componentName = "Autocomplete",
}: {
  multiple?: boolean;
  freeSolo?: boolean;
  options: TData;
  onChange?: (event: any, value: any, reason: any) => void;
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
  const activeOptions = options[optionsState];

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
          console.log("ARROW DOWN");
          break;
        default:
          break;
        // case "ArrowDown":
        //   // Prevent cursor move
        //   event.preventDefault();
        //   changeHighlightedIndex({
        //     diff: 1,
        //     direction: "next",
        //     reason: "keyboard",
        //     event,
        //   });
        //   handleOpen(event);
        //
        //   break;
        // case "ArrowUp":
        //   // Prevent cursor move
        //   event.preventDefault();
        //   changeHighlightedIndex({
        //     diff: -1,
        //     direction: "previous",
        //     reason: "keyboard",
        //     event,
        //   });
        //   handleOpen(event);
        //   break;
        // case "Enter":
        //   if (highlightedIndexRef.current !== -1 && popupOpen) {
        //     const option = filteredOptions[highlightedIndexRef.current];
        //     const disabled = getOptionDisabled
        //       ? getOptionDisabled(option)
        //       : false;
        //
        //     // Avoid early form validation, let the end-users continue filling the form.
        //     event.preventDefault();
        //
        //     if (disabled) {
        //       return;
        //     }
        //
        //     selectNewValue(event, option, "selectOption");
        //
        //     // Move the selection to the end.
        //     if (autoComplete) {
        //       inputRef.current.setSelectionRange(
        //         inputRef.current.value.length,
        //         inputRef.current.value.length
        //       );
        //     }
        //   } else if (
        //     freeSolo &&
        //     inputValue !== "" &&
        //     inputValueIsSelectedValue === false
        //   ) {
        //     if (multiple) {
        //       // Allow people to add new values before they submit the form.
        //       event.preventDefault();
        //     }
        //     selectNewValue(event, inputValue, "createOption", "freeSolo");
        //   }
        //   break;
        // case "Escape":
        //   if (popupOpen) {
        //     // Avoid Opera to exit fullscreen mode.
        //     event.preventDefault();
        //     // Avoid the Modal to handle the event.
        //     event.stopPropagation();
        //     handleClose(event, "escape");
        //   } else if (
        //     clearOnEscape &&
        //     (inputValue !== "" || (multiple && value.length > 0))
        //   ) {
        //     // Avoid Opera to exit fullscreen mode.
        //     event.preventDefault();
        //     // Avoid the Modal to handle the event.
        //     event.stopPropagation();
        //     handleClear(event);
        //   }
        //   break;
        // default:
        //   break;
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
    getRootProps: (others: any) => ({
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
      // role: 'listbox',
      // id: `${id}-listbox`,
      // 'aria-labelledby': `${id}-label`,
      // ref: handleListboxRef,
      // onMouseDown: (event) => {
      //   // Prevent blur
      //   event.preventDefault();
      // },
    }),
    getOptionProps: ({ index, option }) => {
      // const selected = (multiple ? value : [value]).some(
      //     (value2) => value2 != null && isOptionEqualToValue(option, value2),
      // );
      // const disabled = getOptionDisabled ? getOptionDisabled(option) : false;
      //
      // return {
      //   key: getOptionLabel(option),
      //   tabIndex: -1,
      //   role: 'option',
      //   id: `${id}-option-${index}`,
      //   onMouseOver: handleOptionMouseOver,
      //   onClick: handleOptionClick,
      //   onTouchStart: handleOptionTouchStart,
      //   'data-option-index': index,
      //   'aria-disabled': disabled,
      //   'aria-selected': selected,
      // };
    },
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
