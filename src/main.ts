import { HTMLAttributes, useRef, useState } from "react";
import useChangeHighlightedIndex from "./hooks/useChangeHighlightedIndex";
import useControlled from "./hooks/useControlled";
// TODO: configurable?
// Number of options to jump in list box when `Page Up` and `Page Down` keys are used.
const pageSize = 5;

const useStatefulAutocomplete = <
  TOptionData,
  TMultiple extends boolean,
  TState extends string,
  // do you need?
  TValue
>({
  defaultValue,
  // TODO: types for props
  multiple = false,
  freeSolo = false,
  isOptionEqualToValue = (option, value) => option === value,
  options,
  onChange,
  value: valueProp,
  onOptionsStateChange,
  inputValue = "",
  open = false,
  disableClearable = false,
  componentName = "Autocomplete",
}: {
  isOptionEqualToValue: (option: TOptionData, value: TOptionData) => boolean;
  defaultValue: { data: TOptionData; stateChange?: TState };
  multiple?: TMultiple;
  freeSolo?: boolean;
  // TODO: generics
  options: Record<TState, { data: TOptionData; stateChange?: TState }[]>;
  onOptionsStateChange?: (
    event: any,
    value: any,
    reason: any,
    details: any
  ) => void;
  onChange?: (
    event: any,
    value: { data: TOptionData; stateChange?: TState },
    reason: string,
    details: {
      origin: string;
      option: { data: TOptionData; stateChange?: TState };
    }
  ) => void;
  value: { data: TOptionData; stateChange?: TState | undefined };
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

  const [value, setValueState] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: componentName,
  });
  const listboxRef = useRef<HTMLUListElement>(null);
  const activeOptions = options[optionsState];
  const listItemsRef = useRef<HTMLLIElement[]>([]);
  const itemHighlight = useChangeHighlightedIndex({
    includeInputInList: false,
    filteredOptions: activeOptions,
    listboxRef,
    listItemsRef,
  });

  console.log("STATE", optionsState);

  // const handleOptionClick = (event) => {
  //   const index = Number(event.currentTarget.getAttribute('data-option-index'));
  //   selectNewValue(event, filteredOptions[index], 'selectOption');
  //
  //   isTouch.current = false;
  // };

  const handleValue = (
    event: React.KeyboardEvent<HTMLDivElement>,
    newValue: { data: TOptionData; stateChange?: TState },
    reason: string,
    details: {
      origin: string;
      option: { data: TOptionData; stateChange?: TState };
    }
  ) => {
    // don't record value if it's a state change
    if (details.option?.stateChange) {
      if (onOptionsStateChange) {
        onOptionsStateChange(event, newValue, reason, details);
      }
      return;
    }
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
    event: React.KeyboardEvent<HTMLDivElement>,
    option: (typeof options)[keyof typeof options][number],
    reasonProp = "selectOption",
    origin = "options"
  ) => {
    // TODO: handle multiple
    // TODO:  Reset Input
    if (option.stateChange) {
      setOptionsState(option.stateChange);
    }
    handleValue(event, option, reasonProp, { origin, option });
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
        case "PageUp": {
          // Prevent scroll of the page
          event.preventDefault();
          itemHighlight.changeHighlightedIndex({
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
          itemHighlight.changeHighlightedIndex({
            diff: pageSize,
            direction: "next",
            reason: "keyboard",
            event,
          });
          break;
        }
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
          }

          break;
        }
        case "Home": {
          // Prevent scroll of the page
          event.preventDefault();
          itemHighlight.changeHighlightedIndex({
            diff: "start",
            direction: "next",
            reason: "keyboard",
            event,
          });
          break;
        }
        case "End": {
          // Prevent scroll of the page
          event.preventDefault();
          itemHighlight.changeHighlightedIndex({
            diff: "end",
            direction: "next",
            reason: "keyboard",
            event,
          });
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
    getOptionProps: ({
      index,
      option,
    }: {
      index: number;
      option: { data: TOptionData; stateChange?: TState };
    }) => {
      const selected = [value].some(
        (value2) =>
          value2 != null && isOptionEqualToValue(option.data, value2.data)
      );
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
        "aria-selected": selected,
      };
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
