import React, { useId } from "react";
import useItemHighlight from "./hooks/useItemHighlight";
import useAutocompleteState from "./hooks/useAutocompleteState";
import usePopupState from "./hooks/usePopupState";
import useAutocompleteOptions from "./hooks/useAutocompleteOptions";
import useKeydown from "./hooks/useKeydown";
import {
  getInputProps,
  getOptionsProps,
  getRootProps,
  getSelectNewValueFn,
} from "./hooks/utils";
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

  // autocomplete state (focused etc.)
  const autocompleteState = useAutocompleteState({
    inputValue: inputValueProp,
    valueProp,
    defaultValue,
    componentName,
  });

  // handles the popper state
  const popupState = usePopupState({
    componentName,
    open,
    setInputPristine: autocompleteState.setInputPristine,
    onOpen,
    onClose,
  });

  // handles the options for autocomplete
  const autocompleteOptions = useAutocompleteOptions({
    options,
    popupOpen: popupState.open,
  });

  // handles item highlighting
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

  // handles input props
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
  const selectNewValue = getSelectNewValueFn({
    setOptionsState: autocompleteOptions.setOptionsState,
    changeHighlightedIndex: itemHighlight.changeHighlightedIndex,
    handleValue,
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
      ...getRootProps({
        id,
        inputRef: autocompleteState.inputRef,
        firstFocus: autocompleteState.firstFocus,
        selectOnFocus,
      }),
    }),
    getInputProps: () => ({
      id,
      value: autocompleteState.inputValue,
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
      ...getInputProps({
        setFocused: autocompleteState.setFocused,
        firstFocus: autocompleteState.firstFocus,
        ignoreFocus: autocompleteState.ignoreFocus,
        inputValue: autocompleteState.inputValue,
        setInputValueState: autocompleteState.setInputValueState,
        componentName,
        onInputChange,
        disableClearable,
        popupOpen: popupState.open,
        handleClose: popupState.handleClose,
        handleOpen: popupState.handleOpen,
        inputPristine: autocompleteState.inputPristine,
        setInputPristine: autocompleteState.setInputPristine,
      }),
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
        "data-option-index": index,
        "aria-disabled": disabled,
        "aria-selected": selected,
        ...getOptionsProps({
          highlightedIndexRef: itemHighlight.highlightedIndexRef,
          setHighlightedIndex: itemHighlight.setHighlightedIndex,
          isTouchRef: autocompleteState.isTouch,
          selectNewValue,
          option,
        }),
      };
    },
    id,
    inputValue: autocompleteState.inputValue,
    value: autocompleteState.value,
    dirty: autocompleteState.value !== null,
    popupOpen: popupState.open,
    focused: autocompleteState.focused,
    anchorEl: popupState.anchorEl,
    setAnchorEl: popupState.setAnchorEl,
  };
};

export { useStatefulAutocomplete };
