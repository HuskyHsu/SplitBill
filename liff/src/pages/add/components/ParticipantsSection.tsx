import React from 'react';
import UserTag from '../../../components/UserTag';
import { User } from '../../../types/user';

interface ParticipantsSectionProps {
  payer: User | null;
  setPayer: (u: User | null) => void;
  sharers: User[];
  setSharers: (u: User[]) => void;
}

const ParticipantsSection: React.FC<ParticipantsSectionProps> = ({
  payer,
  setPayer,
  sharers,
  setSharers,
}) => {
  return (
    <div className='bg-white p-5 rounded-lg shadow'>
      <h2 className='text-lg font-semibold text-slate-700 mb-4 border-b pb-2'>參與者</h2>
      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-slate-600 mb-1'>出錢的人*</label>
          <div className='min-h-[40px] p-2 border border-dashed border-slate-300 rounded-md flex flex-wrap gap-2 items-center'>
            {payer ? (
              <UserTag user={payer} isPayer />
            ) : (
              <span className='italic text-slate-400 text-sm'>點擊下方按鈕選擇</span>
            )}
          </div>
          <button
            type='button'
            // onClick={handleSelectPayer}
            className='mt-2 w-full flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium py-2 px-3 border border-indigo-500 rounded-md hover:bg-indigo-50'
          >
            <i className='fa-solid fa-user-plus'></i> 選擇出錢者
          </button>
        </div>
        <div>
          <label className='block text-sm font-medium text-slate-600 mb-1'>一起分攤的人*</label>
          <div className='min-h-[40px] p-2 border border-dashed border-slate-300 rounded-md flex flex-wrap gap-2 items-center'>
            {sharers.length > 0 ? (
              sharers.map((sharer) => (
                <UserTag
                  key={sharer.id}
                  user={sharer}
                  onRemove={() => {
                    // JS Logic to remove sharer
                  }}
                />
              ))
            ) : (
              <span className='italic text-slate-400 text-sm'>點擊下方按鈕選擇</span>
            )}
          </div>
          <button
            type='button'
            // onClick={handleSelectSharers}
            className='mt-2 w-full flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium py-2 px-3 border border-indigo-500 rounded-md hover:bg-indigo-50'
          >
            <i className='fa-solid fa-users'></i> 新增/管理分攤者
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsSection;
