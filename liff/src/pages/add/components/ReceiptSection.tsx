import React from 'react';

interface ReceiptSectionProps {
  imagePreviews: string[];
  setImagePreviews: (v: string[]) => void;
}

const ReceiptSection: React.FC<ReceiptSectionProps> = ({ imagePreviews, setImagePreviews }) => {
  return (
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
                  // onChange={handleImageUpload}
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
              <img src={src} alt={`preview ${index}`} className='w-full h-full object-cover' />
              <button
                type='button'
                // onClick={() => removeImagePreview(index)}
                className='absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
              >
                <i className='fa-solid fa-times text-xs'></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReceiptSection;
