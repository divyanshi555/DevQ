import { useEffect, useState } from 'react';
import { Brain, ChevronLeft, ChevronRight, Eye, RotateCcw, Star, Trash2 } from 'lucide-react';

const formatCreatedDate = (date) => {
  if (!date) return 'DATE UNAVAILABLE';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date)).toUpperCase();
};

const Flashcard = ({ flashcardSet, onDelete, onOpen, flashcard, onToggleStar, onReview, cardIndex, cardCount, onPrevious, onNext }) => {
  const [reviewing, setReviewing] = useState(false);

  if (flashcard) {
    const markAsRead = async () => {
      if (reviewing || flashcard.reviewCount > 0) return;

      setReviewing(true);
      try {
        await onReview?.(flashcard._id);
      } finally {
        setReviewing(false);
      }
    };

    return (
      <div className='w-full max-w-2xl'>
        <div className='flashcard-scene'>
          <ReviewCard flashcard={flashcard} onToggleStar={onToggleStar} />
        </div>
        <button
          type='button'
          onClick={markAsRead}
          disabled={reviewing || flashcard.reviewCount > 0}
          className='mx-auto mt-4 block text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700 disabled:cursor-default disabled:text-slate-400'
        >
          {reviewing ? 'Marking as read...' : flashcard.reviewCount > 0 ? 'Marked as read' : 'Mark as read'}
        </button>
        <div className='mt-7 flex items-center justify-center gap-5'>
          <button type='button' onClick={onPrevious} disabled={cardIndex === 0} className='inline-flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40'>
            <ChevronLeft size={16} /> Previous
          </button>
          <span className='rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700'>{cardIndex + 1} / {cardCount}</span>
          <button type='button' onClick={onNext} disabled={cardIndex === cardCount - 1} className='inline-flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40'>
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  const setCardCount = flashcardSet.cards?.length || 0;

  return (
    <article onClick={() => onOpen(flashcardSet)} className='group relative min-h-50 cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md'>
      <div className='flex items-start justify-between'>
        <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700'>
          <Brain size={24} strokeWidth={2} />
        </div>
        <button
          type='button'
          onClick={(event) => { event.stopPropagation(); onDelete(flashcardSet); }}
          aria-label={`Delete ${flashcardSet.documentId?.title || 'flashcard'} set`}
          className='flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 group-hover:opacity-100'
        >
          <Trash2 size={16} />
        </button>
      </div>

      <h3 className='mt-5 truncate text-base font-semibold text-slate-900'>
        {flashcardSet.title || flashcardSet.documentId?.title || 'Flashcard Set'}
      </h3>
      <p className='mt-1 text-xs font-medium uppercase tracking-wide text-slate-500'>
        Created {formatCreatedDate(flashcardSet.createdAt)}
      </p>

      <div className='my-4 border-t border-slate-100' />
      <span className='inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700'>
        {setCardCount} {setCardCount === 1 ? 'card' : 'cards'}
      </span>
    </article>
  );
};

const ReviewCard = ({ flashcard, onToggleStar }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    // Reset the local flip state when a different card is displayed.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFlipped(false);
  }, [flashcard._id]);

  const toggleCard = () => {
    const nextValue = !isFlipped;
    setIsFlipped(nextValue);
  };

  return (
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
      className={`flashcard-inner relative min-h-[260px] cursor-pointer rounded-2xl shadow-lg transition-transform duration-500 ease-in-out hover:-translate-y-1 hover:shadow-xl ${isFlipped ? 'is-flipped' : ''}`}
    >
      <div className='flashcard-face flashcard-front absolute inset-0 rounded-2xl border border-slate-200 bg-white p-7 text-slate-900'>
        <div className='flex items-start justify-between'>
          <span className='rounded bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500'>{flashcard.difficulty || 'medium'}</span>
          <StarButton flashcard={flashcard} onToggleStar={onToggleStar} />
        </div>
        <div className='flex min-h-[160px] flex-col items-center justify-center text-center'>
          <p className='max-w-xl text-lg font-semibold leading-relaxed'>{flashcard.question}</p>
        </div>
        <div className='flex items-center justify-center gap-2 text-xs font-medium text-slate-400'><RotateCcw size={14} /> Click to reveal answer</div>
      </div>

      <div className='flashcard-face flashcard-back absolute inset-0 rounded-2xl border border-emerald-500 bg-linear-to-br from-emerald-500 to-teal-500 p-7 text-white'>
        <div className='flex items-start justify-end'><StarButton flashcard={flashcard} onToggleStar={onToggleStar} inverted /></div>
        <div className='flex min-h-[185px] flex-col items-center justify-center text-center'><p className='max-w-xl text-lg font-semibold leading-relaxed'>{flashcard.answer}</p></div>
        <div className='flex items-center justify-center gap-2 text-xs font-medium text-white/80'><Eye size={14} /> Click to see question</div>
      </div>
    </div>
  );
};

const StarButton = ({ flashcard, onToggleStar, inverted = false }) => (
  <button
    type='button'
    onClick={(event) => { event.stopPropagation(); onToggleStar?.(flashcard._id); }}
    aria-label={flashcard.isStarred ? 'Unstar flashcard' : 'Star flashcard'}
    className={`group/star flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${inverted ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-500'}`}
  >
    <Star size={18} fill={flashcard.isStarred ? 'currentColor' : 'none'} className={flashcard.isStarred ? 'text-amber-400' : 'group-hover/star:text-amber-500'} />
  </button>
);

export default Flashcard;
