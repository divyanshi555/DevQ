import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Plus, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

import flashcardService from '../../services/FlashcardService';
import aiService from '../../services/aiService';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Flashcard from '../../components/flashcards/Flashcard';

const FlashcardManager = ({ documentId }) => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);

  const fetchFlashcardSets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await flashcardService.getFlashcardsForDocument(documentId);
      setFlashcardSets(response.data || []);
    } catch {
      toast.error('Failed to fetch flashcard sets.');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (documentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchFlashcardSets();
    }
  }, [documentId, fetchFlashcardSets]);

  const handleGenerateFlashcards = async () => {
    setGenerating(true);
    try {
      await aiService.generateFlashcards(documentId);
      toast.success('Flashcards generated successfully!');
      await fetchFlashcardSets();
    } catch (error) {
      toast.error(error.message || 'Failed to generate flashcards');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!setToDelete) return;

    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(setToDelete._id);
      setFlashcardSets((currentSets) => currentSets.filter(({ _id }) => _id !== setToDelete._id));
      setSetToDelete(null);
      toast.success('Flashcard set deleted');
    } catch {
      toast.error('Failed to delete flashcard set');
    } finally {
      setDeleting(false);
    }
  };

  const updateSet = (updatedSet) => {
    setSelectedSet(updatedSet);
    setFlashcardSets((currentSets) => currentSets.map((set) => set._id === updatedSet._id ? updatedSet : set));
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

  const handleToggleStar = async (cardId) => {
    try {
      const response = await flashcardService.toggleStar(cardId);
      if (response.data) updateSet(response.data);
    } catch {
      toast.error('Failed to update card star');
    }
  };

  const generateButton = (
    <Button type='button' onClick={handleGenerateFlashcards} disabled={generating}>
      <Plus size={17} />
      {generating ? 'Generating...' : 'Generate New Set'}
    </Button>
  );

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h2 className='text-lg font-semibold text-slate-900'>Your Flashcard Sets</h2>
          {!loading && <p className='mt-1 text-sm text-slate-500'>{flashcardSets.length} {flashcardSets.length === 1 ? 'set' : 'sets'} available</p>}
        </div>
        {generateButton}
      </div>

      {loading ? <Spinner /> : selectedSet ? (
        <div className='flex flex-col items-center'>
          <button type='button' onClick={() => setSelectedSet(null)} className='mb-8 mr-auto inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900'>
            <ArrowLeft size={16} /> Back to Sets
          </button>
          <Flashcard
            flashcard={selectedSet.cards[selectedCardIndex]}
            cardIndex={selectedCardIndex}
            cardCount={selectedSet.cards.length}
            onToggleStar={handleToggleStar}
            onReview={handleReview}
            onPrevious={() => setSelectedCardIndex((current) => Math.max(0, current - 1))}
            onNext={() => setSelectedCardIndex((current) => Math.min(selectedSet.cards.length - 1, current + 1))}
          />
        </div>
      ) : flashcardSets.length === 0 ? (
        <EmptyState title='No flashcards yet' description='Generate a set from this document to start reviewing and reinforcing what you learn.'>
          <Button type='button' onClick={handleGenerateFlashcards} disabled={generating} className='mt-6'>
            <Sparkles size={16} />
            {generating ? 'Generating...' : 'Generate New Set'}
          </Button>
        </EmptyState>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {flashcardSets.map((set) => (
            <Flashcard key={set._id} flashcardSet={set} onDelete={setSetToDelete} onOpen={(selected) => { setSelectedSet(selected); setSelectedCardIndex(0); }} />
          ))}
        </div>
      )}

      <Modal isOpen={Boolean(setToDelete)} onClose={() => !deleting && setSetToDelete(null)} title='Delete flashcard set?'>
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
};

export default FlashcardManager;
