import { useEffect, useState } from 'react';
import { BookOpen, Sparkles, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import Flashcard from '../../components/flashcards/Flashcard';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import flashcardService from '../../services/FlashcardService';
import moment from 'moment';

const FlashcardListPage = () => {
  const [sets, setSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [setToDelete, setSetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
    // Load the user's sets when the listing page opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSets();
  }, []);

  const handleToggleStar = async (cardId) => {
    try {
      const response = await flashcardService.toggleStar(cardId);
      if (response.data) updateSet(response.data);
    } catch {
      toast.error('Failed to update flashcard');
    }
  };

  const handleReview = async (cardId) => {
    try {
      const response = await flashcardService.reviewFlashcard(cardId, selectedCardIndex);
      if (response.data) updateSet(response.data);
      toast.success('Card reviewed');
    } catch {
      toast.error('Failed to review card');
    }
  };

  const updateSet = (updatedSet) => {
    setSelectedSet(updatedSet);
    setSets((currentSets) => currentSets.map((set) => set._id === updatedSet._id ? updatedSet : set));
  };

  const handleDelete = async () => {
    if (!setToDelete) return;

    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(setToDelete._id);
      setSets((currentSets) => currentSets.filter(({ _id }) => _id !== setToDelete._id));
      setSetToDelete(null);
      toast.success('Flashcard set deleted');
    } catch (error) {
      toast.error(error.message || 'Failed to delete flashcard set');
    } finally {
      setDeleting(false);
    }
  };

  const getSetProgress = (set) => {
    const cards = set.cards || [];
    const reviewedCards = cards.filter((card) => card.reviewCount > 0).length;
    const percentage = cards.length ? Math.round((reviewedCards / cards.length) * 100) : 0;

    return { reviewedCards, percentage };
  };

  return (
    <div className='relative min-h-full'>
      <div className='mb-8'>
        <h1 className='mb-2 text-2xl font-medium tracking-tight text-slate-900'>All Flashcard Sets</h1>
      </div>

      {loading ? <Spinner /> : selectedSet ? (
        <div className='space-y-5'>
          <button type='button' onClick={() => setSelectedSet(null)} className='text-sm font-semibold text-emerald-600 hover:text-emerald-700'>Back to sets</button>
          <div className='flex flex-col items-center pt-3'>
            <Flashcard
              key={selectedSet.cards[selectedCardIndex]._id}
              flashcard={selectedSet.cards[selectedCardIndex]}
              cardIndex={selectedCardIndex}
              cardCount={selectedSet.cards.length}
              onToggleStar={handleToggleStar}
              onReview={handleReview}
              onPrevious={() => setSelectedCardIndex((current) => Math.max(0, current - 1))}
              onNext={() => setSelectedCardIndex((current) => Math.min(selectedSet.cards.length - 1, current + 1))}
            />
          </div>
        </div>
      ) : sets.length === 0 ? (
        <div className='flex min-h-[calc(100vh-14rem)] items-center justify-center'>
          <div className='max-w-md text-center'>
            <div className='mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 shadow-lg shadow-slate-200/50'>
              <BookOpen className='h-10 w-10 text-slate-400' strokeWidth={1.5} />
            </div>
            <h3 className='mb-2 text-xl font-medium text-slate-900'>No Flashcards Yet</h3>
            <p className='mb-6 text-sm text-slate-500'>Generate flashcards from your documents to start learning and reinforce your knowledge.</p>
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {sets.map((set) => (
            <article key={set._id} className='group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md transition-all'>
              <div className='flex items-start gap-3'>
                <span className='inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600'>
                  <BookOpen size={22} strokeWidth={2} />
                </span>
                <div className='min-w-0 flex-1'>
                  <h2 className='truncate text-base font-semibold text-slate-900'>
                    {set.title || set.documentId?.title || 'Flashcard set'}
                  </h2>
                  <p className='mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500'>
                    Created {moment(set.createdAt).fromNow()}
                  </p>
                </div>
                <button
                  type='button'
                  onClick={() => setSetToDelete(set)}
                  aria-label={`Delete ${set.title || set.documentId?.title || 'flashcard'} set`}
                  title='Delete set'
                  className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 group-hover:opacity-100'
                >
                  <Trash2 size={15} />
                </button>
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

      <Modal
        isOpen={Boolean(setToDelete)}
        onClose={() => !deleting && setSetToDelete(null)}
        title='Delete flashcard set?'
      >
        <p className='text-sm leading-6 text-slate-500'>This will permanently delete this set and all of its cards.</p>
        <div className='mt-6 flex justify-end gap-3'>
          <Button type='button' variant='secondary' onClick={() => setSetToDelete(null)} disabled={deleting}>Cancel</Button>
          <Button type='button' onClick={handleDelete} disabled={deleting} className='bg-rose-600 shadow-rose-200 hover:bg-rose-700 hover:shadow-rose-200'>
            {deleting ? 'Deleting...' : 'Delete set'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default FlashcardListPage
