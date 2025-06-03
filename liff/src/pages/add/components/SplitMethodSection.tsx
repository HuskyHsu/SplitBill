import React from 'react';
import SplitDetailInputRow from '../../../components/SplitDetailInputRow';
import { SplitDetail } from '../../../types/splitDetail';
import { User } from '../../../types/user';

interface SplitMethodSectionProps {
  splitMethod: 'equally' | 'percentage' | 'amount' | 'shares';
  setSplitMethod: (v: 'equally' | 'percentage' | 'amount' | 'shares') => void;
  sharers: User[];
  totalAmount: number | string;
  currency: string;
  splitDetails: SplitDetail[];
  setSplitDetails: (v: SplitDetail[]) => void;
}

const SplitMethodSection: React.FC<SplitMethodSectionProps> = ({
  splitMethod,
  setSplitMethod,
  sharers,
  totalAmount,
  currency,
  splitDetails,
  setSplitDetails,
}) => {
  return (
    <div className='bg-white p-5 rounded-lg shadow'>
      <h2 className='text-lg font-semibold text-slate-700 mb-4 border-b pb-2'>如何分攤？</h2>
      <div className='space-y-4'>
        <div>
          <label htmlFor='splitMethod' className='block text-sm font-medium text-slate-600 mb-1'>
            分攤方式*
          </label>
          <select
            id='splitMethod'
            name='splitMethod'
            value={splitMethod}
            onChange={(e) => setSplitMethod(e.target.value as typeof splitMethod)}
            className='block w-full rounded-md border-slate-300 py-2.5 text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          >
            <option value='equally'>平均分攤</option>
            <option value='percentage'>按百分比</option>
            <option value='amount'>按指定金額</option>
            <option value='shares'>按權重/份額</option>
          </select>
        </div>
        <div className='mt-3 space-y-3 pt-3 border-t border-slate-200'>
          {splitMethod === 'equally' && (
            <div className='p-3 bg-indigo-50 rounded-md'>
              <p className='text-sm text-indigo-700'>
                <i className='fa-solid fa-calculator mr-2'></i>
                總金額將平均分配給 <strong id='sharerCountEqually'>{sharers.length}</strong>{' '}
                位分攤者。
              </p>
              <p className='text-sm text-indigo-700'>
                每人應付：
                <strong id='amountPerPersonEqually'>
                  {currency}{' '}
                  {(parseFloat(totalAmount.toString() || '0') / (sharers.length || 1)).toFixed(2)}
                </strong>
              </p>
            </div>
          )}
          {splitMethod === 'percentage' && (
            <div className='space-y-2'>
              <p className='text-sm text-slate-600'>請為每位分攤者輸入百分比 (總和需為 100%)：</p>
              <div className='space-y-2'>
                {sharers.map((sharer) => (
                  <SplitDetailInputRow
                    key={sharer.id}
                    sharer={sharer}
                    type='percentage'
                    unit='%'
                    placeholder='例如: 33.33'
                  />
                ))}
              </div>
              <p className='text-sm text-right font-medium text-slate-700'>
                已分配總百分比：
                <span id='totalPercentage' className='text-indigo-600'>
                  0
                </span>
                %
              </p>
            </div>
          )}
          {splitMethod === 'amount' && (
            <div className='space-y-2'>
              <p className='text-sm text-slate-600'>
                請為每位分攤者輸入指定金額 (總和需等於總金額)：
              </p>
              <div className='space-y-2'>
                {sharers.map((sharer) => (
                  <SplitDetailInputRow
                    key={sharer.id}
                    sharer={sharer}
                    type='amount'
                    unit={currency}
                    placeholder='例如: 500'
                  />
                ))}
              </div>
              <p className='text-sm text-right font-medium text-slate-700'>
                已分配總額：
                <span id='totalSpecifiedAmount' className='text-indigo-600'>
                  0.00
                </span>{' '}
                /
                <span id='billTotalForCheck'>
                  {' '}
                  {parseFloat(totalAmount.toString() || '0').toFixed(2)}
                </span>{' '}
                <span id='currencyForCheck'>{currency}</span>
              </p>
            </div>
          )}
          {splitMethod === 'shares' && (
            <div className='space-y-2'>
              <p className='text-sm text-slate-600'>請為每位分攤者輸入份額數：</p>
              <div className='space-y-2'>
                {sharers.map((sharer) => (
                  <SplitDetailInputRow
                    key={sharer.id}
                    sharer={sharer}
                    type='shares'
                    unit='份'
                    placeholder='例如: 1 或 2'
                  />
                ))}
              </div>
              <p className='text-sm text-right font-medium text-slate-700'>
                每份金額：<strong id='amountPerShare'>{currency} 0.00</strong> (
                <span id='totalSharesCount'>0</span> 份)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitMethodSection;
