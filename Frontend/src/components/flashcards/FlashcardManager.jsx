import React, { useEffect, useState } from 'react'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Sparkles,
  Brain
} from 'lucide-react';
import toast from 'react-hot-toast';
import moment from "moment";

import flashcardService from "../../services/FlashcardService";
import aiService from '../../services/aiService';
import Spinner from '../common/Spinner';
import Modal from '../common/Modal';
import Flashcard from './Flashcard';

const FlashcardManager = (documentId) => {
  const [flashcardSets,setFlashcardSets]=useState(null);
  const [selectedSets,setSelectedSets]=useState(null);
  const [loading,setLoading]=useState(true);
  const [generating,setGenerating]=useState(null);
  const [currentCardIndex,setCurrentCardIndex]=useState(null);
  const [isDeleteModalOpen,setIsDeleteModalOpen]=useState(null);
  const [deleting,setDeleting]=useState(null);
  const [setToDelete,setSetToDelete]=useState(null);

  const fetchFlashcardSets=async () => {
    setLoading(true);
    try {
      const response = await flashcardService.getFlashcardsForDocument(documentId);
      setFlashcardSets(response.data);
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
    } catch (error) {
      toast.error(error.message || "Failed to generate flashcards");
    }finally{
      setGenerating(false);
    }
  };

  const handleNextCard=()=>{
    if(selectedSets){
      handleReview(currentCardIndex);
      setCurrentCardIndex((prevIndex)=>(prevIndex+1)%selectedSets.cards.length);
    }
  };

  const handlePrevcard=()=>{
    if(selectedSets){
      handleReview(currentCardIndex);(currentCardIndex);
      setCurrentCardIndex((prevIndex)=>(prevIndex-1 + selectedSets.cards.length)%selectedSets.cards.length);
    }
  };

  const handleReview=async (index) => {
    const currentCard = selectedSets?.cards[currentCardIndex];
    if(!currentCard)return;

    try {
      await flashcardService.reviewFlashcard(currentCard._id,index);
      toast.success("Flashcard reviewed!");
    } catch (error) {
      toast.error("Failed to review flashcard");
    }
  };

  const handleToggleStar=async(cardId)=>{

  };
  const handleDeleteRequest=async(e,set)=>{
    e.stopPropagation();
    setSetToDelete(set);
    setIsDeleteModalOpen(true);
  };
  const handleSelectSet=async(set)=>{
    setSelectedSets(set);
    setCurrentCardIndex(0);
  };

  const renderFlashcardViewer =async()=>{

  };

  const renderSetList =async()=>{

  };

  return (
    <div>
      
    </div>
  )
}

export default FlashcardManager
