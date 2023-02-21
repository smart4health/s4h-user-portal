import React from 'react';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import { useTranslation } from 'react-i18next';
import { ReactComponent as Calendar } from './images/calendar.svg';

const VALID_DATE_PICKER_INPUT_PROPS = [
  'error',
  'value',
  'placeholder',
  'label',
  'onChange',
  'onFocus',
  'onBlur',
  'onKeyDown',
  'onKeyUp',
  'onClick',
  'required',
];

/*
 * The MUI Textfield will look weird if we actually inherit all props through it.
 * Passing all props to the textfield will cause React to complain about invalid DOM properties.
 * Therefore, we filter props first before passing them down.
 * */

export const filterProps = props => {
  const filteredProps = {};
  Object.keys(props).forEach(propKey => {
    if (VALID_DATE_PICKER_INPUT_PROPS.includes(propKey)) {
      filteredProps[propKey] = props[propKey];
    }
  });
  return filteredProps;
};

const DatePickerInput = React.forwardRef((props, ref) => {
  const { t } = useTranslation();
  const { label } = props;

  return (
    <TextField
      className="DatePickerInput"
      name="date"
      ref={ref}
      InputProps={{
        endAdornment: (
          <InputAdornment position="start">
            <Calendar />
          </InputAdornment>
        ),
        inputProps: {
          'data-test': 'datePickerInput',
          readOnly: true,
        },
      }}
      label={label || t('date')}
      {...filterProps(props)}
    />
  );
});

export default DatePickerInput;
