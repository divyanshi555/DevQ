import { useState } from 'react';
import { Check, RotateCcw, Star } from 'lucide-react';

const Flashcard = ({ flashcard, onToggleStar, onReview }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className='group relative min-h-64 rounded-2xl border border-slate-200/70 bg-white shadow-lg shadow-slate-200/40 p-6 flex flex-col'>
      <div className='flex items-center justify-between gap-3 mb-5'>
        <span className={`text-xs font-semibold uppercase tracking-wide ${flashcard.difficulty === 'hard' ? 'text-rose-600' : flashcard.difficulty === 'easy' ? 'text-emerald-600' : 'text-amber-600'}`}>
          {flashcard.difficulty || 'medium'}
        </span>
        <button type='button' onClick={() => onToggleStar?.(flashcard._id)} aria-label={flashcard.isStarred ? 'Unstar flashcard' : 'Star flashcard'} className='text-slate-400 hover:text-amber-500 transition-colors'>
          <Star size={18} fill={flashcard.isStarred ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className='flex-1'>
        <p className='text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2'>{isFlipped ? 'Answer' : 'Question'}</p>
        <p className='text-lg font-medium leading-relaxed text-slate-900'>{isFlipped ? flashcard.answer : flashcard.question}</p>
      </div>

      <div className='flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100'>
        <button type='button' onClick={() => setIsFlipped((current) => !current)} className='inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700'>
          <RotateCcw size={16} />
          {isFlipped ? 'Show question' : 'Reveal answer'}
        </button>
        <button type='button' onClick={() => onReview?.(flashcard._id)} className='inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900'>
          <Check size={16} />
          Review
        </button>
      </div>
    </div>
  );
};

export default Flashcard;
