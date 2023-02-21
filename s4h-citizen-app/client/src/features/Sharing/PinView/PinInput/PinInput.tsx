import React, {
  ChangeEvent,
  Dispatch,
  KeyboardEvent,
  SetStateAction,
  useEffect,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../../redux';
import { isBlank } from '../../../../utils/validation';
import { validatePin } from '../../reduxSlice';
import './PinInput.scss';

interface Props {
  pin: string;
  setPin: Dispatch<SetStateAction<string>>;
  isPinValid: boolean;
}

const PinInput: React.FC<Props> = ({ pin, setPin, isPinValid }) => {
  const PIN_LENGTH = 6;
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isValidatingPin = useSelector(
    (state: AppState) => state.sharing.isValidatingPin
  );
  const focusPreviousInput = (inputIndex: number) => {
    if (inputIndex > 0) {
      inputRefs.current[inputIndex - 1].focus();
    }
  };

  const focusNextInput = (inputIndex: number) => {
    if (inputIndex === PIN_LENGTH - 1) {
      inputRefs.current[inputIndex].blur();
    } else {
      inputRefs.current[inputIndex + 1].focus();
    }
  };
  const deleteSelectedInput = (inputIndex: number) => {
    if (inputIndex >= 0) {
      const pinArray = pin.split('');
      pinArray.splice(inputIndex, 1);
      const newPin = pinArray.join('');
      setPin(newPin);
      inputRefs.current[inputIndex].value = '';
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace' && isBlank(pin[index])) {
      focusPreviousInput(index);
      deleteSelectedInput(index - 1);
    }

    if (['Left', 'ArrowLeft'].includes(event.key)) {
      event.preventDefault();

      focusPreviousInput(index);
    } else if (['Right', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      focusNextInput(index);
    }
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
    inputIndex: number
  ) => {
    const inputValue = event.target.value;
    const pinArray = pin.split('');
    pinArray.splice(inputIndex, 1, inputValue);
    const newPin = pinArray.join('');
    setPin(newPin);

    if (!isBlank(inputValue)) {
      focusNextInput(inputIndex);
    }
  };

  const handleInput = (
    event: React.FormEvent<HTMLInputElement>,
    inputIndex: number
  ) => {
    const value = event.currentTarget.value;
    inputRefs.current[inputIndex].value = value.replace(/[^\d.]/g, '');
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    const pastedPin = clipboardData.getData('text').replace(/[^\d]/g, '');

    if (!validatePinInput(pastedPin)) {
      return;
    }

    setPin(pastedPin);
  };

  const validatePinInput = (pin: string) =>
    pin.length === PIN_LENGTH && !/\s/.test(pin);

  const renderPinValidity = () => {
    if (pin.length === PIN_LENGTH && !isValidatingPin) {
      if (isPinValid) {
        return <div className="PinInput--is-valid">{t('pin_valid')}</div>;
      }
      return <div className="PinInput--is-invalid">{t('pin_not_valid')}</div>;
    }
    return null;
  };

  useEffect(function onMount() {
    // Focus directly the first input element on rendering the component
    inputRefs.current[0].focus();
  }, []);

  useEffect(
    function checkPinValidity() {
      if (pin.length === PIN_LENGTH) {
        dispatch(validatePin(pin));
      }
    },
    [pin, dispatch]
  );

  return (
    <>
      <div className="PinInput">
        {Array(PIN_LENGTH)
          .fill('')
          .map((_item, i) => {
            const pinValue = pin[i];
            const pinCellKey = `pinCell_${i}`;

            return (
              <input
                type="number"
                step="0.1"
                key={pinCellKey}
                ref={(element: HTMLInputElement) => (inputRefs.current[i] = element)}
                maxLength={1}
                className="PinInput__cell"
                value={pinValue ? pinValue : ''}
                onKeyDown={event => handleKeyDown(event, i)}
                onChange={event => handleChange(event, i)}
                onInput={event => handleInput(event, i)}
                onPaste={event => handlePaste(event)}
              />
            );
          })}
        {pin.split('').map((character, i) => {
          const pinCharKey = `pinChar_${i}`;
          return (
            <span key={pinCharKey} className="PinInput__pin-character">
              {character}
            </span>
          );
        })}
      </div>
      <div className="PinInput__valid-status">{renderPinValidity()}</div>
    </>
  );
};

export default PinInput;
