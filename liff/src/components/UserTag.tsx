import React from 'react';
import { User } from '../types/user';

const UserTag: React.FC<{ user: User; onRemove?: () => void; isPayer?: boolean }> = ({
  user,
  onRemove,
  isPayer,
}) => (
  <span
    className={`flex items-center text-sm font-medium px-3 py-1.5 rounded-full shadow-sm ${
      isPayer ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
    }`}
  >
    {user.avatarUrl ? (
      <img
        src={user.avatarUrl}
        alt={user.name}
        className='w-5 h-5 rounded-full mr-2 object-cover'
      />
    ) : (
      <i className='fa-solid fa-user-circle text-xl mr-2'></i>
    )}
    {user.name}
    {onRemove && (
      <button
        type='button'
        onClick={onRemove}
        className='ml-2 text-sky-500 hover:text-sky-700 focus:outline-none'
      >
        <i className='fa-solid fa-times-circle text-xs'></i>
      </button>
    )}
  </span>
);

export default UserTag;
