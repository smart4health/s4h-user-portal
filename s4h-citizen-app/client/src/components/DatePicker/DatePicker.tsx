import classnames from 'classnames';
import React, { Component } from 'react';
import { DayPickerProps } from 'react-day-picker';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import { WithTranslation, withTranslation } from 'react-i18next';
import {
  DE_DISPLAY_DATE_FORMAT,
  formatDate,
  parseDate,
} from '../../utils/dateHelper';
import './DatePicker.scss';
import DatePickerInput from './DatePickerInput';

interface Props extends WithTranslation {
  placeholder?: string;
  month?: Date | string;
  className?: string;
  dateFormat?: string;
  name: string;
  error?: boolean;
  selectedDays?: string | undefined; // fixme: check
  value: Date | string | undefined;
  customComponent?: React.ComponentType;
  onDayChange: (date: Date) => void;
  inputProps?: Object;
}

class DatePicker extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.today = new Date();
  }

  today: Date;

  render() {
    const {
      customComponent,
      className,
      dateFormat = DE_DISPLAY_DATE_FORMAT,
      inputProps,
      i18n,
    } = this.props;
    const dayPickerProps: DayPickerProps = {
      disabledDays: { after: this.today },
      month: this.today,
    };

    return (
      <DayPickerInput
        formatDate={formatDate}
        format={dateFormat}
        parseDate={parseDate}
        dayPickerProps={dayPickerProps}
        component={customComponent || DatePickerInput}
        inputProps={inputProps}
        placeholder={`${formatDate(this.today, dateFormat, i18n.language)}`}
        classNames={{
          container: classnames('DatePicker', className),
          overlay: 'DayPickerInput-Overlay DayPicker__overlay',
          overlayWrapper: 'DayPickerInput-OverlayWrapper DayPicker__overlay-wrapper',
        }}
        {...this.props}
      />
    );
  }
}

export default withTranslation()(DatePicker);
