import { useState } from 'react';
import { Eye, Star } from 'lucide-react';

const Flashcard = ({ flashcard, onToggleStar, onReview }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const toggleCard = () => setIsFlipped((current) => !current);

  return (
    <div className='w-full max-w-2xl'>
      <div className='flashcard-scene'>
      <div
        role='button'
        tabIndex={0}
        onClick={toggleCard}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleCard();
          }
        }}
        aria-label={isFlipped ? 'Show flashcard question' : 'Reveal flashcard answer'}
        className={`flashcard-inner relative min-h-[330px] cursor-pointer rounded-2xl shadow-xl transition-transform duration-500 ease-in-out hover:-translate-y-1 hover:shadow-2xl ${isFlipped ? 'is-flipped' : ''}`}
      >
        <div className='flashcard-face flashcard-front absolute inset-0 rounded-2xl border border-slate-200 bg-white p-8 text-slate-900'>
          <div className='flex items-start justify-between gap-4'>
            <span className='rounded-md bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500'>{flashcard.difficulty || 'medium'}</span>
            <button type='button' onClick={(event) => { event.stopPropagation(); onToggleStar?.(flashcard._id); }} aria-label={flashcard.isStarred ? 'Unstar flashcard' : 'Star flashcard'} className='flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-white hover:bg-amber-500'>
              <Star size={18} fill={flashcard.isStarred ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div className='flex min-h-[205px] flex-col items-center justify-center text-center'>
            <p className='mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400'>Question</p>
            <p className='max-w-xl text-xl font-semibold leading-relaxed'>{flashcard.question}</p>
          </div>
          <div className='flex items-center justify-center gap-2 text-xs font-medium text-slate-400'><Eye size={15} /> Click to reveal answer</div>
        </div>

        <div className='flashcard-face flashcard-back absolute inset-0 rounded-2xl border border-emerald-500 bg-linear-to-br from-emerald-500 to-teal-500 p-8 text-white'>
          <div className='flex items-start justify-between gap-4'>
            <span className='rounded-md bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white'>Answer</span>
            <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-white/15'><Star size={18} fill={flashcard.isStarred ? 'currentColor' : 'none'} /></span>
          </div>
          <div className='flex min-h-[205px] flex-col items-center justify-center text-center'><p className='max-w-xl text-xl font-semibold leading-relaxed'>{flashcard.answer}</p></div>
          <div className='flex items-center justify-center gap-2 text-xs font-medium text-white/80'><Eye size={15} /> Click to see question</div>
        </div>
      </div>
      </div>

      {onReview && (
        <button type='button' onClick={() => onReview(flashcard._id)} className='mx-auto mt-4 block text-sm font-semibold text-emerald-600 hover:text-emerald-700'>
          Mark as reviewed
        </button>
      )}
    </div>
  );
};

export default Flashcard;
