
import React, { useState } from 'react';
import { OwnerIcon } from '../OwnerIcons';

interface DatePickerProps {
  label?: string;
  onChange: (date: string) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ label, onChange }) => {
  // This is a visual simulation of a custom date picker trigger. 
  // In a real app, you would likely use a library like date-fns or dayjs logic here.
  const [date, setDate] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDate(e.target.value);
      onChange(e.target.value);
  };

  return (
    <div className="w-full">
      {label && <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{label}</label>}
      <div className="relative">
        <input
          type="date"
          value={date}
          onChange={handleChange}
          className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gyn-blue-medium/20 focus:border-gyn-blue-medium transition-all shadow-inner cursor-pointer"
        />
        <OwnerIcon name="CalendarIcon" className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
      </div>
    </div>
  );
};
