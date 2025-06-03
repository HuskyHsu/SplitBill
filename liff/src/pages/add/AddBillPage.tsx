import React, { useState } from 'react';
import { mockCurrentUser, mockSharers } from '../../mocks/users';
import { SplitDetail } from '../../types/splitDetail';
import { User } from '../../types/user';
import AddBillFooter from './components/AddBillFooter';
import BillInfoSection from './components/BillInfoSection';
import ParticipantsSection from './components/ParticipantsSection';
import ReceiptSection from './components/ReceiptSection';
import SplitMethodSection from './components/SplitMethodSection';

const AddBillPage: React.FC = () => {
  const [billName, setBillName] = useState('週末聚餐');
  const [totalAmount, setTotalAmount] = useState<number | string>(1500);
  const [currency, setCurrency] = useState('TWD');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [payer, setPayer] = useState<User | null>(mockCurrentUser);
  const [sharers, setSharers] = useState<User[]>(mockSharers);
  const [splitMethod, setSplitMethod] = useState<'equally' | 'percentage' | 'amount' | 'shares'>(
    'equally'
  );
  const [splitDetails, setSplitDetails] = useState<SplitDetail[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  return (
    <div className='bg-slate-100 min-h-screen font-sans'>
      <header className='bg-white shadow-sm sticky top-0 z-50'>
        <div className='max-w-md mx-auto px-4 py-3'>
          <h1 className='text-xl font-semibold text-slate-800 text-center'>新增一筆分帳</h1>
        </div>
      </header>
      <main className='max-w-md mx-auto p-4 pb-24'>
        <form id='splitBillForm' className='space-y-6'>
          <BillInfoSection
            billName={billName}
            setBillName={setBillName}
            totalAmount={totalAmount}
            setTotalAmount={setTotalAmount}
            currency={currency}
            setCurrency={setCurrency}
            transactionDate={transactionDate}
            setTransactionDate={setTransactionDate}
            description={description}
            setDescription={setDescription}
          />
          <ParticipantsSection
            payer={payer}
            setPayer={setPayer}
            sharers={sharers}
            setSharers={setSharers}
          />
          <SplitMethodSection
            splitMethod={splitMethod}
            setSplitMethod={setSplitMethod}
            sharers={sharers}
            totalAmount={totalAmount}
            currency={currency}
            splitDetails={splitDetails}
            setSplitDetails={setSplitDetails}
          />
          <ReceiptSection imagePreviews={imagePreviews} setImagePreviews={setImagePreviews} />
        </form>
      </main>
      <AddBillFooter />
    </div>
  );
};

export default AddBillPage;
