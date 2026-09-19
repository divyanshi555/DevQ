import React, { useEffect, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Flashcard from '../../components/flashcards/Flashcard';
import flashcardService from '../../services/FlashcardService';
import moment from 'moment';

const FlashcardListPage = () => {
  const [sets, setSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchSets = async () => {
    try {
      const response = await flashcardService.getAllFlashcardSets();
      setSets(response.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSets();
  }, []);

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);
      await fetchSets();
    } catch (error) {
      toast.error(error.message || 'Failed to update flashcard');
    }
  };

  const getSetProgress = (set) => {
    const cards = set.cards || [];
    const reviewedCards = cards.filter((card) => card.reviewCount > 0).length;
    const percentage = cards.length ? Math.round((reviewedCards / cards.length) * 100) : 0;

    return { reviewedCards, percentage };
  };

  return (
    <div className='max-w-5xl'>
      <div className='mb-8'>
        <h1 className='text-2xl font-semibold text-slate-900 tracking-tight'>All Flashcard Sets</h1>
      </div>

      {loading ? <Spinner /> : selectedSet ? (
        <div className='space-y-5'>
          <button type='button' onClick={() => setSelectedSet(null)} className='text-sm font-semibold text-emerald-600 hover:text-emerald-700'>Back to sets</button>
          <div className='flex flex-col items-center pt-3'>
            <Flashcard flashcard={selectedSet.cards[selectedCardIndex]} onToggleStar={handleToggleStar} />
            <div className='mt-5 flex items-center gap-5'>
              <button type='button' onClick={() => setSelectedCardIndex((current) => Math.max(0, current - 1))} disabled={selectedCardIndex === 0} className='inline-flex h-10 items-center gap-2 rounded-xl bg-slate-50 px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-100'>
                <ChevronLeft size={16} /> Previous
              </button>
              <span className='text-sm font-semibold text-slate-500'>{selectedCardIndex + 1} / {selectedSet.cards.length}</span>
              <button type='button' onClick={() => setSelectedCardIndex((current) => Math.min(selectedSet.cards.length - 1, current + 1))} disabled={selectedCardIndex === selectedSet.cards.length - 1} className='inline-flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-200'>
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : sets.length === 0 ? (
        <EmptyState
          title='No Flashcards Yet'
          description='Generate flashcards from your documents to start learning and reinforce your knowledge.'
        />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {sets.map((set) => (
            <article key={set._id} className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md transition-all'>
              <div className='flex items-start gap-3'>
                <span className='inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600'>
                  <BookOpen size={22} strokeWidth={2} />
                </span>
                <div className='min-w-0'>
                  <h2 className='truncate text-base font-semibold text-slate-900'>
                    {set.documentId?.title || 'Flashcard set'}
                  </h2>
                  <p className='mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500'>
                    Created {moment(set.createdAt).fromNow()}
                  </p>
                </div>
              </div>

              {(() => {
                const { reviewedCards, percentage } = getSetProgress(set);
                return (
                  <>
                    <div className='mt-6 flex items-center gap-2'>
                      <span className='rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700'>
                        {set.cards.length} Cards
                      </span>
                      <span className='inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700'>
                        <Sparkles size={13} /> {percentage}%
                      </span>
                    </div>

                    <div className='mt-5'>
                      <div className='mb-2 flex items-center justify-between text-xs font-medium text-slate-600'>
                        <span>Progress</span>
                        <span>{reviewedCards}/{set.cards.length} reviewed</span>
                      </div>
                      <div className='h-2 overflow-hidden rounded-full bg-slate-100'>
                        <div className='h-full rounded-full bg-emerald-500 transition-all' style={{ width: `${percentage}%` }} />
                      </div>
                    </div>

                    <button
                      type='button'
                      onClick={() => { setSelectedSet(set); setSelectedCardIndex(0); }}
                      className='mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100'
                    >
                      <Sparkles size={16} />
                      Study Now
                    </button>
                  </>
                );
              })()}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default FlashcardListPage
