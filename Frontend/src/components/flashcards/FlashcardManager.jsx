import React, { useEffect, useState } from 'react';
import { Brain, ChevronLeft, ChevronRight, Sparkles, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import flashcardService from "../../services/FlashcardService";
import aiService from '../../services/aiService';
import Spinner from '../common/Spinner';
import EmptyState from '../common/EmptyState';
import Flashcard from './Flashcard';

const FlashcardManager = ({ documentId }) => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchFlashcardSets=async () => {
    setLoading(true);
    try {
      const response = await flashcardService.getFlashcardsForDocument(documentId);
      setFlashcardSets(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch flashcard sets.")
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{
    if(documentId){
      fetchFlashcardSets();
    }
  },[documentId]);

  const handleGenerateFlashcards=async () => {
    setGenerating(true);
    try {
      await aiService.generateFlashcards(documentId);
      toast.success("Flashcards generated successfully!");
      await fetchFlashcardSets();
    } catch (error) {
      toast.error(error.message || "Failed to generate flashcards");
    }finally{
      setGenerating(false);
    }
  };

  const handleReview = async (cardId) => {
    try {
      await flashcardService.reviewFlashcard(cardId, 0);
      toast.success("Flashcard reviewed!");
    } catch (error) {
      toast.error("Failed to review flashcard");
    }
  };

  const handleToggleStar = async (cardId) => {
    try {
      const response = await flashcardService.toggleStar(cardId);
      setSelectedSet(response.data);
    } catch (error) {
      toast.error('Failed to update star');
    }
  };
  const handleDelete = async () => {
    if (!selectedSet || !window.confirm('Delete this flashcard set?')) return;
    try {
      await flashcardService.deleteFlashcardSet(selectedSet._id);
      setSelectedSet(null);
      await fetchFlashcardSets();
      toast.success('Flashcard set deleted');
    } catch (error) {
      toast.error('Failed to delete flashcard set');
    }
  };

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h3 className='text-lg font-semibold text-slate-900'>Flashcards</h3>
          <p className='text-sm text-slate-500'>Review this document at your own pace.</p>
        </div>
        <button type='button' onClick={handleGenerateFlashcards} disabled={generating} className='inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold disabled:opacity-50'>
          <Sparkles size={16} />
          {generating ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {loading ? <Spinner /> : flashcardSets.length === 0 ? (
        <EmptyState
          title='No Flashcards Yet'
          description='Generate flashcards from your document to start learning and reinforce your knowledge.'
        >
          <button type='button' onClick={handleGenerateFlashcards} disabled={generating} className='mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50'>
            <Sparkles size={16} />
            {generating ? 'Generating...' : 'Generate Flashcards'}
          </button>
        </EmptyState>
      ) : selectedSet ? (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <button type='button' onClick={() => setSelectedSet(null)} className='text-sm font-semibold text-emerald-600 hover:text-emerald-700'>Back to sets</button>
            <button type='button' onClick={handleDelete} className='inline-flex items-center gap-2 text-sm font-semibold text-rose-600 hover:text-rose-700'><Trash2 size={16} /> Delete set</button>
          </div>
          <div className='flex flex-col items-center pt-3'>
            <Flashcard flashcard={selectedSet.cards[selectedCardIndex]} onToggleStar={handleToggleStar} onReview={handleReview} />
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
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {flashcardSets.map((set) => (
            <button type='button' key={set._id} onClick={() => { setSelectedSet(set); setSelectedCardIndex(0); }} className='text-left rounded-2xl border border-slate-200/70 bg-white p-5 shadow-lg shadow-slate-200/30 hover:-translate-y-0.5 hover:border-emerald-300 transition-all'>
              <div className='flex items-center justify-between mb-4'><Brain className='text-emerald-600' size={22} /><span className='text-xs font-semibold text-slate-500'>{set.cards.length} cards</span></div>
              <h4 className='font-semibold text-slate-900'>{set.documentId?.title || 'Flashcard set'}</h4>
              <p className='text-sm text-slate-500 mt-1'>Open set to start reviewing</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default FlashcardManager
