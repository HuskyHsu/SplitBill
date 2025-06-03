import React from 'react';
import { User } from '../types/user';

const SplitDetailInputRow: React.FC<{
  sharer: User;
  type: 'percentage' | 'amount' | 'shares';
  unit: string;
  placeholder: string;
}> = ({ sharer, type, unit, placeholder }) => (
  <div className='flex items-center space-x-2 bg-slate-50 p-2 rounded'>
    <label htmlFor={`${type}_${sharer.id}`} className='text-sm text-slate-700 w-2/5 truncate'>
      {sharer.name}
    </label>
    <div className='relative w-3/5'>
      <input
        type='number'
        id={`${type}_${sharer.id}`}
        name={`${type}_${sharer.id}`}
        min={type === 'shares' ? 1 : 0}
        step={type === 'percentage' || type === 'amount' ? '0.01' : '1'}
        placeholder={placeholder}
        className='block w-full rounded-md border-slate-300 py-1.5 px-2 text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
      />
      {type !== 'shares' && (
        <span className='absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-slate-500'>
          {unit}
        </span>
      )}
    </div>
  </div>
);

export default SplitDetailInputRow;
