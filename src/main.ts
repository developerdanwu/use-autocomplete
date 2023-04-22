import React, { HTMLAttributes, useId, useRef, useState } from "react";
import useItemHighlight from "./hooks/useItemHighlight";
import useControlled from "./hooks/useControlled";
import { Simulate } from "react-dom/test-utils";
import input = Simulate.input;
import useHandleInputProps from "./hooks/useHandleInputProps";
import useAutocompleteState from "./hooks/useAutocompleteState";
import usePopupState from "./hooks/usePopupState";
import useAutocompleteOptions from "./hooks/useAutocompleteOptions";
import useOptionsProps from "./hooks/useOptionsProps";
import useKeydown from "./hooks/useKeydown";
// TODO: configurable?
// Number of options to jump in list box when `Page Up` and `Page Down` keys are used.

export type Option<TOptionData, TState extends string> = {
  data: TOptionData;
  onSelect?: (options: {
    option: Option<TOptionData, TState>;
    // TODO: types for state change
    setOptionsState: React.Dispatch<React.SetStateAction<TState>>;
    resetHighlightIndex: () => void;
    // return true then onChange will also be run
    // TODO: better typing for this
  }) => any;
};

const useStatefulAutocomplete = <
  TOptionData,
  TMultiple extends boolean,
  TState extends string,
  // do you need?
  TValue
>({
  autoComplete,
  id: idProp,
  defaultValue,
  // TODO: types for props
  onHighlightChange,
  multiple = false,
  freeSolo = false,
  selectOnFocus = !freeSolo,
  isOptionEqualToValue = (option, value) => option === value,
  options,
  onChange,
  value: valueProp,
  onOptionsStateChange,
  inputValue: inputValueProp,
  onInputChange,
  open = false,
  disableClearable = false,
  componentName = "Autocomplete",
}: {
  autoComplete?: boolean;
  onInputChange: (
    event: React.SyntheticEvent,
    value: string,
    reason: string
  ) => void;
  selectOnFocus?: boolean;
  onHighlightChange?: (
    event: React.SyntheticEvent,
    option: Option<TOptionData, TState> | null,
    reason: any
  ) => void;
  id: string;
  isOptionEqualToValue: (option: TOptionData, value: TOptionData) => boolean;
  defaultValue: Option<TOptionData, TState> | null;
  multiple?: TMultiple;
  freeSolo?: boolean;
  // TODO: generics
  options: Record<TState, Option<TOptionData, TState>[]>;
  onOptionsStateChange?: (
    event: any,
    value: any,
    reason: any,
    details: any
  ) => void;
  onChange?: (
    event: any,
    value: Option<TOptionData, TState> | null,
    reason: string,
    details?: {
      origin: string;
      option: Option<TOptionData, TState>;
    }
  ) => void;
  value: Option<TOptionData, TState> | null;
  inputValue?: string;
  open?: boolean;
  disableClearable?: boolean;
  componentName?: string;
}) => {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const states = Object.keys(options) as (keyof typeof options)[];
  const autocompleteOptions = useAutocompleteOptions({
    options,
  });

  // for options value
  const [value, setValueState] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: componentName,
  });

  const popupState = usePopupState({ open, componentName });
  const autocompleteState = useAutocompleteState();
  const listboxAvailable = open && autocompleteOptions.activeOptions.length > 0;
  const itemHighlight = useItemHighlight({
    id,
    onHighlightChange,
    inputRef: autocompleteState.inputRef,
    includeInputInList: false,
    filteredOptions: autocompleteOptions.activeOptions,
    listboxRef: autocompleteState.listboxRef,
    listItemsRef: autocompleteState.listItemsRef,
  });

  const handleInputProps = useHandleInputProps({
    firstFocus: autocompleteState.firstFocus,
    ignoreFocus: autocompleteState.ignoreFocus,
    inputValue: inputValueProp,
    componentName,
    onInputChange,
    disableClearable,
    multiple,
  });

  const handleValue = (
    event: React.FormEvent<Element>,
    newValue: Option<TOptionData, TState> | null,
    reason: string,
    details?: {
      origin: string;
      option: Option<TOptionData, TState>;
      onSelectHandlerValue: any;
    }
  ) => {
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

    // runs if onChange provided
    if (onChange) {
      onChange(event, newValue, reason, details);
    }

    // only runs if uncontrolled
    if (typeof setValueState === "function") {
      setValueState(newValue);
    }
  };

  const selectNewValue = (
    event: React.UIEvent<Element, UIEvent>,
    option: (typeof options)[keyof typeof options][number],
    reasonProp = "selectOption",
    origin = "options"
  ) => {
    // TODO: handle multiple
    // TODO:  Reset Input

    // different onSelect side effects that can be run for different options
    let onSelectHandlerValue;
    if (option.onSelect) {
      onSelectHandlerValue = option.onSelect({
        option,
        setOptionsState: autocompleteOptions.setOptionsState,
        resetHighlightIndex: () => {
          itemHighlight.changeHighlightedIndex({
            diff: "start",
            direction: "previous",
            reason: "keyboard",
            event,
          });
        },
      });

      // if undefined is returned then don't run handleValue
      if (onSelectHandlerValue === undefined) {
        return;
      }
    }
    handleValue(event, option, reasonProp, {
      origin,
      option,
      onSelectHandlerValue,
    });
  };

  const optionsProps = useOptionsProps({
    highlightedIndexRef: itemHighlight.highlightedIndexRef,
    setHighlightedIndex: itemHighlight.setHighlightedIndex,
    isTouchRef: autocompleteState.isTouch,
    selectNewValue,
  });

  const keydown = useKeydown({
    activeOptions: autocompleteOptions.activeOptions,
    highlightedIndexRef: itemHighlight.highlightedIndexRef,
    changeHighlightedIndex: itemHighlight.changeHighlightedIndex,
    selectNewValue,
  });

  return {
    activeOptions: autocompleteOptions.activeOptions,
    setOptionsState: states.reduce<Record<keyof typeof options, () => void>>(
      (acc, nextVal) => {
        acc[nextVal] = () => autocompleteOptions.setOptionsState(nextVal);
        return acc;
      },
      {} as Record<keyof typeof options, () => void>
    ),
    states,
    optionsState: autocompleteOptions.optionsState,
    getRootProps: (others?: any) => ({
      "aria-owns": undefined,
      ...others,
      onKeyDown: keydown.handleKeyDown(others),
      onMouseDown: (event: React.MouseEvent<Element>) => {
        const target = event.target as HTMLElement;
        if (target.getAttribute("id") !== id) {
          event.preventDefault();
        }
      },
      onClick: () => {
        if (autocompleteState.inputRef.current) {
          autocompleteState.inputRef.current.focus();
        }
        if (
          autocompleteState.inputRef.current &&
          autocompleteState.inputRef.current.selectionEnd &&
          autocompleteState.inputRef.current.selectionStart &&
          selectOnFocus &&
          autocompleteState.firstFocus.current &&
          autocompleteState.inputRef.current.selectionEnd -
            autocompleteState.inputRef.current.selectionStart ===
            0
        ) {
          autocompleteState.inputRef.current.select();
        }

        autocompleteState.firstFocus.current = false;
      },
    }),
    getInputProps: () => ({
      id,
      value: handleInputProps.inputValue,
      onBlur: handleInputProps.handleBlur,
      // onFocus,
      onChange: handleInputProps.handleInputChange,
      // onMouseDown,
      "aria-activedescendant": popupState.open ? "" : null,
      "aria-autocomplete": autoComplete ? "both" : "list",
      "aria-controls": listboxAvailable ? `${id}-listbox` : undefined,
      "aria-expanded": listboxAvailable,
      autoComplete: "off",
      ref: autocompleteState.inputRef,
      autoCapitalize: "none" as const,
      spellCheck: "false" as const,
      role: "combobox" as const,
      // disabled: disabledProp,
    }),
    getListboxProps: () => ({
      role: "listbox",
      id: `listbox`,
      "aria-labelledby": `label`,
      ref: autocompleteState.listboxRef,
      onMouseDown: (event: React.MouseEvent<HTMLUListElement>) => {
        // Prevent blur
        event.preventDefault();
      },
    }),
    getOptionProps: ({
      index,
      option,
    }: {
      index: number;
      option: Option<TOptionData, TState>;
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
            autocompleteState.listItemsRef.current[index] = el;
          }
        },
        onMouseOver: optionsProps.handleOptionMouseMove,
        onClick: optionsProps.handleOptionClick(option),
        onTouchStart: optionsProps.handleOptionTouchStart,
        "data-option-index": index,
        "aria-disabled": disabled,
        "aria-selected": selected,
      };
    },
    id,
    inputValue: handleInputProps.inputValue,
    value,
    // dirty,
    popupOpen: popupState.open,
    // focused,
    // anchorEl,
    // setAnchorEl,
    // focusedTag,
  };
};

export { useStatefulAutocomplete };
