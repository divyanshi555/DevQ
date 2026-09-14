import React, { useEffect, useState } from 'react';
import { Brain, Sparkles, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import flashcardService from "../../services/FlashcardService";
import aiService from '../../services/aiService';
import Spinner from '../common/Spinner';
import Flashcard from './Flashcard';

const FlashcardManager = ({ documentId }) => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
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
        <div className='min-h-96 rounded-2xl border border-slate-200/70 bg-white shadow-lg shadow-slate-200/30 p-10 flex flex-col items-center justify-center text-center'>
          <div className='w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4'>
            <Brain size={30} />
          </div>
          <h4 className='text-lg font-semibold text-slate-900'>No Flashcards Yet</h4>
          <p className='max-w-sm text-sm text-slate-500 mt-2'>Generate flashcards from your document to start learning and reinforce your knowledge.</p>
          <button type='button' onClick={handleGenerateFlashcards} disabled={generating} className='inline-flex items-center gap-2 h-11 px-5 mt-6 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 disabled:opacity-50'>
            <Sparkles size={16} />
            {generating ? 'Generating...' : 'Generate Flashcards'}
          </button>
        </div>
      ) : selectedSet ? (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <button type='button' onClick={() => setSelectedSet(null)} className='text-sm font-semibold text-emerald-600 hover:text-emerald-700'>Back to sets</button>
            <button type='button' onClick={handleDelete} className='inline-flex items-center gap-2 text-sm font-semibold text-rose-600 hover:text-rose-700'><Trash2 size={16} /> Delete set</button>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {selectedSet.cards.map((card) => <Flashcard key={card._id} flashcard={card} onToggleStar={handleToggleStar} onReview={handleReview} />)}
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {flashcardSets.map((set) => (
            <button type='button' key={set._id} onClick={() => setSelectedSet(set)} className='text-left rounded-2xl border border-slate-200/70 bg-white p-5 shadow-lg shadow-slate-200/30 hover:-translate-y-0.5 hover:border-emerald-300 transition-all'>
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
