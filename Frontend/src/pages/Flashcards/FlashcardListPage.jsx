import React, { useEffect, useState } from 'react';
import { Brain, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import Flashcard from '../../components/flashcards/Flashcard';
import flashcardService from '../../services/FlashcardService';

const FlashcardListPage = () => {
  const [sets, setSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
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

  return (
    <div className='max-w-6xl'>
      <div className='mb-6'>
        <h1 className='text-2xl font-medium text-slate-900 tracking-tight mb-2'>Flashcards</h1>
        <p className='text-sm text-slate-500'>Review the concepts you have generated from your documents.</p>
      </div>

      {loading ? <Spinner /> : selectedSet ? (
        <div className='space-y-5'>
          <button type='button' onClick={() => setSelectedSet(null)} className='text-sm font-semibold text-emerald-600 hover:text-emerald-700'>Back to sets</button>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
            {selectedSet.cards.map((card) => <Flashcard key={card._id} flashcard={card} onToggleStar={handleToggleStar} />)}
          </div>
        </div>
      ) : sets.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-12 text-center'>
          <Brain className='mx-auto mb-3 text-slate-400' size={32} />
          <p className='text-sm text-slate-600'>No flashcard sets yet.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
          {sets.map((set) => (
            <button type='button' key={set._id} onClick={() => setSelectedSet(set)} className='text-left rounded-2xl border border-slate-200/70 bg-white p-6 shadow-lg shadow-slate-200/30 hover:-translate-y-0.5 hover:border-emerald-300 transition-all'>
              <div className='flex items-center justify-between mb-5'>
                <span className='inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600'><Brain size={20} /></span>
                <span className='text-xs font-semibold text-slate-500'>{set.cards.length} cards</span>
              </div>
              <h2 className='font-semibold text-slate-900 truncate'>{set.documentId?.title || 'Flashcard set'}</h2>
              <div className='flex items-center gap-1.5 mt-2 text-xs text-slate-500'><Star size={14} /> Open to review</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default FlashcardListPage
