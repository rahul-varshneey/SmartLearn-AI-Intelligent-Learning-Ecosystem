import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowPathIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Flashcards = () => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const docId = queryParams.get('docId');

  useEffect(() => {
    if (docId) fetchCards();
  }, [docId]);

  const fetchCards = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await axios.get(`https://smartlearn-ai-backend-20cp.onrender.com/api/flashcards/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCards(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const generateCards = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await axios.post('https://smartlearn-ai-backend-20cp.onrender.com/api/flashcards/generate', 
        { documentId: docId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCards(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150); // slight delay to allow flip animation to reset
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  const markDifficulty = async (difficulty) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const cardId = cards[currentIndex]._id;
      await axios.put(`https://smartlearn-ai-backend-20cp.onrender.com/api/flashcards/update/${cardId}`, { difficulty }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optionally update local state
      nextCard();
    } catch (error) {
      console.error('Failed to update difficulty');
    }
  };

  if (!docId) return <div className="text-center text-white mt-20">Please select a document first.</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 flex flex-col items-center">
      <div className="text-center mb-10 w-full flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-500">
            Interactive Flashcards
          </h1>
          <p className="text-gray-400 mt-2">Test your knowledge with spaced repetition.</p>
        </div>
        
        {cards.length === 0 && !loading && (
          <button 
            onClick={generateCards}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 hover:opacity-90 px-6 py-3 rounded-xl font-medium text-white shadow-lg transition-transform hover:-translate-y-1"
          >
            <ArrowPathIcon className="h-5 w-5" /> Generate Flashcards
          </button>
        )}
      </div>

      {loading && (
        <div className="text-center mt-20 text-blue-400 animate-pulse flex flex-col items-center gap-4">
          <ArrowPathIcon className="h-10 w-10 animate-spin" />
          <p className="text-xl">AI is extracting flashcards...</p>
        </div>
      )}

      {cards.length > 0 && (
        <div className="w-full max-w-2xl perspective-1000">
          <div className="mb-4 flex justify-between text-gray-400 text-sm font-medium px-2">
            <span>Card {currentIndex + 1} of {cards.length}</span>
            <span>Click card to flip</span>
          </div>

          <motion.div
            className="relative w-full h-[400px] cursor-pointer transform-style-3d transition-all duration-500"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            onClick={() => setIsFlipped(!isFlipped)}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
          >
            {/* Front of card */}
            <div className="absolute w-full h-full backface-hidden bg-gray-800 rounded-3xl p-10 flex flex-col justify-center items-center text-center shadow-2xl border border-gray-700">
              <h3 className="text-xl text-gray-400 mb-6 uppercase tracking-widest font-semibold">Question</h3>
              <p className="text-3xl font-bold text-white leading-tight">
                {cards[currentIndex].question}
              </p>
            </div>

            {/* Back of card (Flipped) */}
            <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-10 flex flex-col justify-center items-center text-center shadow-2xl border border-blue-500/30" style={{ transform: "rotateY(180deg)" }}>
              <h3 className="text-xl text-blue-400 mb-6 uppercase tracking-widest font-semibold">Answer</h3>
              <p className="text-2xl text-gray-200 leading-relaxed font-medium">
                {cards[currentIndex].answer}
              </p>
            </div>
          </motion.div>

          <div className="mt-12 flex justify-between items-center bg-gray-800 p-4 rounded-2xl border border-gray-700">
            <button onClick={prevCard} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors">
              Previous
            </button>
            
            {/* If flipped, show difficulty buttons instead of Next */}
            <AnimatePresence mode="popLayout">
              {isFlipped ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex gap-3"
                >
                  <button onClick={(e) => { e.stopPropagation(); markDifficulty('easy'); }} className="flex items-center gap-1 px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50 rounded-lg transition-colors">
                    <CheckIcon className="h-5 w-5" /> Easy
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); markDifficulty('hard'); }} className="flex items-center gap-1 px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-colors">
                    <XMarkIcon className="h-5 w-5" /> Hard
                  </button>
                </motion.div>
              ) : (
                <button onClick={nextCard} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors">
                  Next Card
                </button>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
