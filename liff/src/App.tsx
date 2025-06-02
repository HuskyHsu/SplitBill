import React, { useState } from 'react';

// Define simple types for placeholder data (these would be more complex later)
interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface SplitDetail {
  userId: string;
  value: number; // For percentage, amount, or shares
}

// Placeholder data for UI rendering
const mockCurrentUser: User = {
  id: 'user123',
  name: '陳大文 (自己)',
  avatarUrl: 'https://ui-avatars.com/api/?name=陳大文&background=00B900&color=fff&size=40',
};

const mockSharers: User[] = [
  mockCurrentUser,
  {
    id: 'user456',
    name: '林小美',
    avatarUrl: 'https://ui-avatars.com/api/?name=林小美&background=4A90E2&color=fff&size=40',
  },
  {
    id: 'user789',
    name: '張三豐',
    avatarUrl: 'https://ui-avatars.com/api/?name=張三豐&background=D0021B&color=fff&size=40',
  },
];

// Component for displaying a user tag/pill
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

const App: React.FC = () => {
  // --- UI State (for demonstration of dynamic sections) ---
  const [billName, setBillName] = useState('週末聚餐');
  const [totalAmount, setTotalAmount] = useState<number | string>(1500);
  const [currency, setCurrency] = useState('TWD');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const [payer, setPayer] = useState<User | null>(mockCurrentUser);
  const [sharers, setSharers] = useState<User[]>(mockSharers); // For UI display

  const [splitMethod, setSplitMethod] = useState<'equally' | 'percentage' | 'amount' | 'shares'>(
    'equally'
  );

  // Placeholder for split details based on method (would be dynamic)
  const [splitDetails, setSplitDetails] = useState<SplitDetail[]>([]);

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // --- Input Row Component for Split Details ---
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
          // value={findDetailValue(sharer.id)} // JS logic needed
          // onChange={(e) => handleDetailChange(sharer.id, e.target.value)} // JS logic needed
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

  return (
    <div className='bg-slate-100 min-h-screen font-sans'>
      {/* Header */}
      <header className='bg-white shadow-sm sticky top-0 z-50'>
        <div className='max-w-md mx-auto px-4 py-3'>
          <h1 className='text-xl font-semibold text-slate-800 text-center'>新增一筆分帳</h1>
        </div>
      </header>

      <main className='max-w-md mx-auto p-4 pb-24'>
        <form id='splitBillForm' className='space-y-6'>
          {/* Bill Information Section */}
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
                  <label
                    htmlFor='totalAmount'
                    className='block text-sm font-medium text-slate-600 mb-1'
                  >
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
                  <label
                    htmlFor='currency'
                    className='block text-sm font-medium text-slate-600 mb-1'
                  >
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
                <label
                  htmlFor='description'
                  className='block text-sm font-medium text-slate-600 mb-1'
                >
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

          {/* Participants Section */}
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
                  // onClick={handleSelectPayer} // JS Logic
                  className='mt-2 w-full flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium py-2 px-3 border border-indigo-500 rounded-md hover:bg-indigo-50'
                >
                  <i className='fa-solid fa-user-plus'></i> 選擇出錢者
                </button>
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-600 mb-1'>
                  一起分攤的人*
                </label>
                <div className='min-h-[40px] p-2 border border-dashed border-slate-300 rounded-md flex flex-wrap gap-2 items-center'>
                  {sharers.length > 0 ? (
                    sharers.map((sharer) => (
                      <UserTag
                        key={sharer.id}
                        user={sharer}
                        onRemove={() => {
                          /* JS Logic to remove sharer */
                        }}
                      />
                    ))
                  ) : (
                    <span className='italic text-slate-400 text-sm'>點擊下方按鈕選擇</span>
                  )}
                </div>
                <button
                  type='button'
                  // onClick={handleSelectSharers} // JS Logic
                  className='mt-2 w-full flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium py-2 px-3 border border-indigo-500 rounded-md hover:bg-indigo-50'
                >
                  <i className='fa-solid fa-users'></i> 新增/管理分攤者
                </button>
              </div>
            </div>
          </div>

          {/* Split Method Section */}
          <div className='bg-white p-5 rounded-lg shadow'>
            <h2 className='text-lg font-semibold text-slate-700 mb-4 border-b pb-2'>如何分攤？</h2>
            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='splitMethod'
                  className='block text-sm font-medium text-slate-600 mb-1'
                >
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

              {/* Dynamic Split Details */}
              <div className='mt-3 space-y-3 pt-3 border-t border-slate-200'>
                {splitMethod === 'equally' && (
                  <div className='p-3 bg-indigo-50 rounded-md'>
                    <p className='text-sm text-indigo-700'>
                      <i className='fa-solid fa-calculator mr-2'></i>
                      總金額將平均分配給 <strong id='sharerCountEqually'>
                        {sharers.length}
                      </strong>{' '}
                      位分攤者。
                    </p>
                    <p className='text-sm text-indigo-700'>
                      每人應付：
                      <strong id='amountPerPersonEqually'>
                        {currency}{' '}
                        {(
                          parseFloat(totalAmount.toString() || '0') / (sharers.length || 1)
                        ).toFixed(2)}
                      </strong>
                    </p>
                  </div>
                )}

                {splitMethod === 'percentage' && (
                  <div className='space-y-2'>
                    <p className='text-sm text-slate-600'>
                      請為每位分攤者輸入百分比 (總和需為 100%)：
                    </p>
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
                      % {/* JS Calculated */}
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
                      <span id='currencyForCheck'>{currency}</span> {/* JS Calculated */}
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
                      <span id='totalSharesCount'>0</span> 份) {/* JS Calculated */}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Optional: Receipt */}
          <div className='bg-white p-5 rounded-lg shadow'>
            <h2 className='text-lg font-semibold text-slate-700 mb-4 border-b pb-2'>其他 (選填)</h2>
            <div>
              <label
                htmlFor='receiptImageUpload'
                className='block text-sm font-medium text-slate-600 mb-1'
              >
                上傳收據/圖片
              </label>
              <div className='mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md'>
                <div className='space-y-1 text-center'>
                  <i className='fa-solid fa-cloud-arrow-up mx-auto h-10 w-10 text-slate-400'></i>
                  <div className='flex text-sm text-slate-600'>
                    <label
                      htmlFor='receiptImageUploadInput'
                      className='relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2'
                    >
                      <span>選擇檔案</span>
                      <input
                        id='receiptImageUploadInput'
                        name='receiptImageUploadInput'
                        type='file'
                        className='sr-only'
                        accept='image/*'
                        multiple
                        // onChange={handleImageUpload} // JS Logic
                      />
                    </label>
                    <p className='pl-1'>或拖曳到此</p>
                  </div>
                  <p className='text-xs text-slate-500'>PNG, JPG, GIF (單檔上限 5MB)</p>
                </div>
              </div>
              <div className='mt-2 grid grid-cols-3 gap-2'>
                {imagePreviews.map((src, index) => (
                  <div
                    key={index}
                    className='relative aspect-square border rounded-md overflow-hidden group'
                  >
                    <img
                      src={src}
                      alt={`preview ${index}`}
                      className='w-full h-full object-cover'
                    />
                    <button
                      type='button'
                      // onClick={() => removeImagePreview(index)} // JS Logic
                      className='absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <i className='fa-solid fa-times text-xs'></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Action Bar - Sticky Footer */}
      <footer className='bg-white border-t border-slate-200 p-4 fixed bottom-0 left-0 right-0 shadow-top'>
        {/* Adjust for non-mobile if needed */}
        <div className='max-w-md mx-auto'>
          <button
            type='submit'
            form='splitBillForm'
            // onClick={handleSubmit} // JS Logic
            className='w-full bg-green-600 hover:bg-green-dark text-white font-semibold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out'
          >
            <i className='fa-solid fa-check mr-2'></i>建立分帳
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
