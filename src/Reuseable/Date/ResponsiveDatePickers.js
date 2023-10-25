import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../Reuseable/Date/ResponsiveDatePicker.css';

const ResponsiveDatePicker = ({ selectedDate, setSelectedDate }) => (
  <div className="custom-datepicker" style={{ marginRight: '15px' }}>
    <DatePicker
      selected={selectedDate}
      onChange={(date) => setSelectedDate(date)}
      dateFormat="MM/dd/yyyy"
      value={selectedDate}
      placeholderText="Select a date"
      isClearable
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      maxDate={new Date()}
      responsive
      className="custom-datepicker-input"
    />
  </div>
);

export default ResponsiveDatePicker;
