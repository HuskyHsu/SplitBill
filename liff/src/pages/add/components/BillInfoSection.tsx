import React from 'react';

interface BillInfoSectionProps {
  billName: string;
  setBillName: (v: string) => void;
  totalAmount: number | string;
  setTotalAmount: (v: number | string) => void;
  currency: string;
  setCurrency: (v: string) => void;
  transactionDate: string;
  setTransactionDate: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
}

const BillInfoSection: React.FC<BillInfoSectionProps> = ({
  billName,
  setBillName,
  totalAmount,
  setTotalAmount,
  currency,
  setCurrency,
  transactionDate,
  setTransactionDate,
  description,
  setDescription,
}) => {
  return (
    <div className='bg-white p-5 rounded-lg shadow'>
      <h2 className='text-lg font-semibold text-slate-700 mb-4 border-b pb-2'>帳單資訊</h2>
      <div className='space-y-4'>
        <div>
          <label htmlFor='billName' className='block text-sm font-medium text-slate-600 mb-1'>
            帳單名稱*
          </label>
          <div className='relative rounded-md shadow-sm'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
              <i className='fa-solid fa-pen-to-square text-slate-400'></i>
            </div>
            <input
              type='text'
              id='billName'
              name='billName'
              placeholder='例如：東京五日遊 Day 3'
              required
              value={billName}
              onChange={(e) => setBillName(e.target.value)}
              className='block w-full rounded-md border-slate-300 pl-10 py-2 text-slate-700 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
          </div>
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label htmlFor='totalAmount' className='block text-sm font-medium text-slate-600 mb-1'>
              總金額*
            </label>
            <div className='relative rounded-md shadow-sm'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                <i className='fa-solid fa-dollar-sign text-slate-400'></i>
              </div>
              <input
                type='number'
                id='totalAmount'
                name='totalAmount'
                placeholder='1500'
                step='0.01'
                required
                value={totalAmount}
                onChange={(e) =>
                  setTotalAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                }
                className='block w-full rounded-md border-slate-300 pl-10 py-2 text-slate-700 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              />
            </div>
          </div>
          <div>
            <label htmlFor='currency' className='block text-sm font-medium text-slate-600 mb-1'>
              貨幣
            </label>
            <select
              id='currency'
              name='currency'
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className='block w-full rounded-md border-slate-300 py-2.5 text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            >
              <option value='TWD'>TWD</option>
              <option value='JPY'>JPY</option>
              <option value='USD'>USD</option>
            </select>
          </div>
        </div>
        <div>
          <label
            htmlFor='transactionDate'
            className='block text-sm font-medium text-slate-600 mb-1'
          >
            日期*
          </label>
          <div className='relative rounded-md shadow-sm'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
              <i className='fa-solid fa-calendar-days text-slate-400'></i>
            </div>
            <input
              type='date'
              id='transactionDate'
              name='transactionDate'
              required
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className='block w-full rounded-md border-slate-300 pl-10 py-2 text-slate-700 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
          </div>
        </div>
        <div>
          <label htmlFor='description' className='block text-sm font-medium text-slate-600 mb-1'>
            項目/備註 (選填)
          </label>
          <textarea
            id='description'
            name='description'
            rows={2}
            placeholder='詳細說明這筆花費...'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className='block w-full rounded-md border-slate-300 py-2 px-3 text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default BillInfoSection;
