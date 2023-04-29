import React, { MutableRefObject, RefObject } from "react";
import { Option } from "../main";
import useItemHighlight from "./useItemHighlight";
import useAutocompleteOptions from "./useAutocompleteOptions";
import useAutocompleteState from "./useAutocompleteState";

const useEnhancedEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/**
 * https://github.com/facebook/react/issues/14099#issuecomment-440013892
 */
export const useEventCallback = <Args extends unknown[], Return>(
  fn: (...args: Args) => Return
): ((...args: Args) => Return) => {
  const ref = React.useRef(fn);
  useEnhancedEffect(() => {
    ref.current = fn;
  });
  return React.useCallback(
    (...args: Args) =>
      // @ts-expect-error hide `this`
      // tslint:disable-next-line:ban-comma-operator
      (0, ref.current!)(...args),
    []
  );
};

export const getSelectNewValueFn =
  <TOptionData, TState extends string>(props: {
    setOptionsState: ReturnType<
      typeof useAutocompleteOptions<TOptionData, TState>
    >["setOptionsState"];
    changeHighlightedIndex: ReturnType<
      typeof useItemHighlight
    >["changeHighlightedIndex"];
    handleValue: (
      event: React.FormEvent<Element>,
      newValue: Option<TOptionData, TState> | null,
      reason: string,
      details?: {
        origin: string;
        option: Option<TOptionData, TState>;
        context: unknown;
      }
    ) => void;
  }) =>
  (
    event: React.UIEvent<Element, UIEvent>,
    option: Option<TOptionData, TState>,
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
        setOptionsState: props.setOptionsState,
        resetHighlightIndex: () => {
          props.changeHighlightedIndex({
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
    props.handleValue(event, option, reasonProp, {
      origin,
      option,
      context: onSelectHandlerValue,
    });
  };

export const getRootProps = (props: {
  id: string;
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement>;
  firstFocus: MutableRefObject<boolean>;
  selectOnFocus: boolean;
}) => {
  const handleOnClick = () => {
    if (props.inputRef.current) {
      props.inputRef.current.focus();
    }
    if (
      props.inputRef.current &&
      props.inputRef.current.selectionEnd &&
      props.inputRef.current.selectionStart &&
      props.selectOnFocus &&
      props.firstFocus.current &&
      props.inputRef.current.selectionEnd -
        props.inputRef.current.selectionStart ===
        0
    ) {
      props.inputRef.current.select();
    }

    props.firstFocus.current = false;
  };

  const onMouseDown = (event: React.MouseEvent<Element>) => {
    const target = event.target as HTMLElement;
    if (target.getAttribute("id") !== props.id) {
      event.preventDefault();
    }
  };

  return { onClick: handleOnClick, onMouseDown };
};

export const getInputProps = (props: {
  setInputValueState: ReturnType<
    typeof useAutocompleteState
  >["setInputValueState"];
  popupOpen: boolean;
  handleClose: (event: any, reason: any) => void;
  setFocused: React.Dispatch<React.SetStateAction<boolean>>;
  inputPristine: boolean;
  setInputPristine: React.Dispatch<React.SetStateAction<boolean>>;
  handleOpen: (event: any) => void;
  ignoreFocus: MutableRefObject<boolean>;
  firstFocus: MutableRefObject<boolean>;
  inputValue: string | undefined;
  componentName: string;
  onInputChange:
    | ((event: React.SyntheticEvent, value: string, reason: string) => void)
    | undefined;
  disableClearable: boolean;
}) => {
  const handleInputMouseDown = (event: any) => {
    if (props.inputValue === "" || !props.popupOpen) {
      props.handleOpen(event);
    }
  };

  const handleBlur = (
    event: React.FormEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    // Ignore the event when using the scrollbar with IE11

    props.setFocused(false);
    props.firstFocus.current = true;
    props.ignoreFocus.current = false;
    props.handleClose(event, "blur");
    //
    // if (autoSelect && highlightedIndexRef.current !== -1 && popupOpen) {
    //   selectNewValue(
    //     event,
    //     filteredOptions[highlightedIndexRef.current],
    //     "blur"
    //   );
    // } else if (autoSelect && freeSolo && inputValue !== "") {
    //   selectNewValue(event, inputValue, "blur", "freeSolo");
    // } else if (clearOnBlur) {
    //   resetInputValue(event, value);
    // }
    //
    // handleClose(event, "blur");
  };

  const handleInputChange = (
    event: React.FormEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;

    if (props.inputValue !== newValue) {
      props.setInputValueState(newValue);

      props.setInputPristine(false);

      if (props.onInputChange) {
        props.onInputChange(event, newValue, "input");
      }
    }

    if (newValue === "") {
    }
    // TODO: handle open
    props.handleOpen(event);
  };

  const handleFocus = (
    event: React.FormEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    props.setFocused(true);
    props.handleOpen(event);
  };

  return {
    onMousDown: handleInputMouseDown,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onChange: handleInputChange,
  };
};

export const getOptionsProps = <TOptionData, TState extends string>(props: {
  option: Option<TOptionData, TState>;
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
    onClick: handleOptionClick(props.option),
    onTouchStart: handleOptionTouchStart,
    onMouseOver: handleOptionMouseMove,
  };
};
