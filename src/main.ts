import React, { useId } from "react";
import useItemHighlight from "./hooks/useItemHighlight";
import useAutocompleteState from "./hooks/useAutocompleteState";
import usePopupState from "./hooks/usePopupState";
import useAutocompleteOptions from "./hooks/useAutocompleteOptions";
import useKeydown from "./hooks/useKeydown";
import useInputProps from "./hooks/props/useInputProps";
import useOptionsProps from "./hooks/props/useOptionsProps";
import useRootProps from "./hooks/props/useRootProps";
// TODO: configurable?

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

const useStatefulAutocomplete = <TOptionData, TState extends string, TValue>({
  onOpen,
  disabled: disabledProp,
  autoComplete,
  id: idProp,
  defaultValue,
  // TODO: types for props
  onHighlightChange,
  selectOnFocus = true,
  isOptionEqualToValue = (option, value) => option === value,
  options,
  onChange,
  value: valueProp,
  inputValue: inputValueProp,
  onInputChange,
  open,
  disableClearable = false,
  componentName = "Autocomplete",
  onClose,
}: {
  onOpen?: () => void;
  disabled?: boolean;
  autoComplete?: boolean;
  onInputChange?: (
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
  id?: string;
  isOptionEqualToValue?: (option: TOptionData, value: TOptionData) => boolean;
  defaultValue?: Option<TOptionData, TState> | null;
  // TODO: generics
  options: Record<TState, Option<TOptionData, TState>[]>;
  onChange?: (
    event: any,
    value: Option<TOptionData, TState> | null,
    reason: string,
    details?: {
      origin: string;
      option: Option<TOptionData, TState>;
    }
  ) => void;
  value?: Option<TOptionData, TState> | null;
  inputValue?: string;
  open?: boolean;
  disableClearable?: boolean;
  componentName?: string;
  onClose?: (event: any, reason: any) => void;
}) => {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const states = Object.keys(options) as (keyof typeof options)[];

  const autocompleteState = useAutocompleteState({
    valueProp,
    defaultValue,
    componentName,
  });
  const rootProps = useRootProps({
    id,
    inputRef: autocompleteState.inputRef,
    firstFocus: autocompleteState.firstFocus,
    selectOnFocus,
  });

  const popupState = usePopupState({
    open,
    componentName,
    setInputPristine: autocompleteState.setInputPristine,
    onOpen,
    onClose,
  });

  const inputProps = useInputProps({
    setFocused: autocompleteState.setFocused,
    firstFocus: autocompleteState.firstFocus,
    ignoreFocus: autocompleteState.ignoreFocus,
    inputValue: inputValueProp,
    componentName,
    onInputChange,
    disableClearable,
    popupOpen: popupState.open,
    handleClose: popupState.handleClose,
    handleOpen: popupState.handleOpen,
    inputPristine: autocompleteState.inputPristine,
    setInputPristine: autocompleteState.setInputPristine,
  });

  const autocompleteOptions = useAutocompleteOptions({
    options,
    popupOpen: popupState.open,
  });

  const itemHighlight = useItemHighlight({
    id,
    onHighlightChange,
    inputRef: autocompleteState.inputRef,
    includeInputInList: false,
    filteredOptions: autocompleteOptions.activeOptions,
    listboxRef: autocompleteState.listboxRef,
    listItemsRef: autocompleteState.listItemsRef,
    defaultHighlighted: -1,
  });

  const listboxAvailable =
    popupState.open && autocompleteOptions.activeOptions.length > 0;

  const handleValue = (
    event: React.FormEvent<Element>,
    newValue: Option<TOptionData, TState> | null,
    reason: string,
    details?: {
      origin: string;
      option: Option<TOptionData, TState>;
      context: unknown;
    }
  ) => {
    // runs if onChange provided
    if (onChange) {
      onChange(event, newValue, reason, details);
    }

    // only runs if uncontrolled
    autocompleteState.setValueState(newValue);
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
      context: onSelectHandlerValue,
    });
  };

  const optionsProps = useOptionsProps({
    highlightedIndexRef: itemHighlight.highlightedIndexRef,
    setHighlightedIndex: itemHighlight.setHighlightedIndex,
    isTouchRef: autocompleteState.isTouch,
    selectNewValue,
  });

  const keydown = useKeydown({
    popupOpen: popupState.open,
    activeOptions: autocompleteOptions.activeOptions,
    highlightedIndexRef: itemHighlight.highlightedIndexRef,
    changeHighlightedIndex: itemHighlight.changeHighlightedIndex,
    selectNewValue,
    handleOpenPopup: popupState.handleOpen,
    handleClosePopup: popupState.handleClose,
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
      onMouseDown: rootProps.onMouseDown,
      onClick: rootProps.handleOnClick,
    }),
    getInputProps: () => ({
      id,
      value: inputProps.inputValue,
      onBlur: inputProps.handleBlur,
      onFocus: inputProps.handleFocus,
      onChange: inputProps.handleInputChange,
      onMouseDown: inputProps.handleInputMouseDown,
      "aria-activedescendant": popupState.open ? "" : undefined,
      "aria-autocomplete": autoComplete ? ("both" as const) : ("list" as const),
      "aria-controls": listboxAvailable ? `${id}-listbox` : undefined,
      "aria-expanded": listboxAvailable,
      autoComplete: "off",
      ref: autocompleteState.inputRef,
      autoCapitalize: "none" as const,
      spellCheck: "false" as const,
      role: "combobox" as const,
      disabled: disabledProp,
    }),
    getListboxProps: () => ({
      role: "listbox",
      id: `${id}-listbox`,
      "aria-labelledby": `${id}-label`,
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
      const selected = [autocompleteState.value].some(
        (value2) =>
          value2 != null && isOptionEqualToValue(option.data, value2.data)
      );
      const disabled = false;
      return {
        key: `${option}-${index}`,
        tabIndex: -1,
        role: "option",
        id: `${id}-option-${index}`,
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
    inputValue: inputProps.inputValue,
    value: autocompleteState.value,
    dirty: autocompleteState.value !== null,
    popupOpen: popupState.open,
    focused: autocompleteState.focused,
    anchorEl: popupState.anchorEl,
    setAnchorEl: popupState.setAnchorEl,
  };
};

export { useStatefulAutocomplete };
