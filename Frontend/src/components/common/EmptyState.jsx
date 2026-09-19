import { FileText } from 'lucide-react';

const EmptyState = ({ title, description, children }) => {
  return (
    <div className='min-h-72 rounded-2xl border border-dashed border-slate-300 bg-white p-10 flex flex-col items-center justify-center text-center'>
      <div className='mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500'>
        <FileText size={28} />
      </div>
      <h4 className='text-lg font-semibold text-slate-900'>{title}</h4>
      <p className='mt-2 max-w-sm text-sm text-slate-500'>{description}</p>
      {children}
    </div>
  );
};

export default EmptyState;
