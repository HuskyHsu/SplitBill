import React from 'react';

const AddBillFooter: React.FC = () => (
  <footer className='bg-white border-t border-slate-200 p-4 fixed bottom-0 left-0 right-0 shadow-top'>
    <div className='max-w-md mx-auto'>
      <button
        type='submit'
        form='splitBillForm'
        // onClick={handleSubmit}
        className='w-full bg-green-600 hover:bg-green-dark text-white font-semibold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out'
      >
        <i className='fa-solid fa-check mr-2'></i>建立分帳
      </button>
    </div>
  </footer>
);

export default AddBillFooter;
