import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Quiz = () => {
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const docId = queryParams.get('docId');

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await axios.post((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api/quiz/generate', 
        { documentId: docId, numQuestions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuiz(res.data);
      setCurrentQ(0);
      setIsSubmitted(false);
      setScore(0);
      setSelectedOption(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (option) => {
    if (isSubmitted) return;
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (selectedOption === quiz.questions[currentQ].correctAnswer) {
      setScore(score + 1);
    }
    
    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedOption(null);
    } else {
      setIsSubmitted(true);
      submitFinalScore();
    }
  };

  const submitFinalScore = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      let finalScore = score;
      if (selectedOption === quiz.questions[currentQ].correctAnswer) {
        finalScore += 1;
      }
      setScore(finalScore);
      
      await axios.post((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api/quiz/submit', 
        { quizId: quiz._id, score: finalScore },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (!docId) return <div className="text-center text-white mt-20">Please select a document first.</div>;

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white">Knowledge Quiz</h1>
          <p className="text-gray-400 mt-1">AI-generated multi-choice evaluation.</p>
        </div>
        {!quiz && !loading && (
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <label className="text-gray-400 text-sm font-medium mb-1">Number of Questions</label>
              <input 
                type="number" 
                min="1" 
                max="20" 
                value={numQuestions} 
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 w-24 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button 
              onClick={generateQuiz}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-medium text-white transition-colors mt-6"
            >
              <ArrowPathIcon className="h-5 w-5" /> Generate Quiz
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center mt-20 text-blue-400 animate-pulse">
          <ArrowPathIcon className="h-10 w-10 animate-spin mx-auto mb-4" />
          <p className="text-xl">Generating cognitive evaluation...</p>
        </div>
      )}

      {quiz && !isSubmitted && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          key={currentQ}
          className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-xl"
        >
          <div className="mb-6 flex justify-between items-center text-sm font-medium text-gray-400">
            <span>Question {currentQ + 1} of {quiz.questions.length}</span>
            <div className="flex gap-1">
              {quiz.questions.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${currentQ === i ? 'bg-blue-500' : currentQ > i ? 'bg-blue-900' : 'bg-gray-700'}`} />
              ))}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-8 leading-tight">
            {quiz.questions[currentQ].questionText}
          </h2>

          <div className="space-y-4">
            {quiz.questions[currentQ].options.map((opt, idx) => (
              <div 
                key={idx}
                onClick={() => handleSelect(opt)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${selectedOption === opt ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-gray-700 bg-gray-900/50 text-gray-300 hover:bg-gray-700'}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedOption === opt ? 'border-blue-500' : 'border-gray-500'}`}>
                  {selectedOption === opt && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                </div>
                <span className="text-lg">{opt}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleNext}
              disabled={!selectedOption}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-8 py-3 rounded-xl font-bold transition-colors"
            >
              {currentQ === quiz.questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
            </button>
          </div>
        </motion.div>
      )}

      {isSubmitted && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 p-10 rounded-3xl border border-gray-700 shadow-xl text-center"
        >
          <div className="inline-flex justify-center items-center w-24 h-24 rounded-full bg-blue-500/20 text-blue-400 mb-6 border border-blue-500/30">
            <span className="text-4xl font-black">{score}/{quiz.questions.length}</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h2>
          <p className="text-gray-400 mb-8">
            {score === quiz.questions.length ? 'Perfect score! You mastered this topic.' : 'Keep reviewing to improve your score.'}
          </p>

          <div className="space-y-4 text-left mb-8">
            {quiz.questions.map((q, i) => (
              <div key={i} className="p-4 bg-gray-900 rounded-xl border border-gray-700">
                <p className="font-medium text-white mb-2">{i+1}. {q.questionText}</p>
                <div className="text-sm flex flex-col gap-1">
                  <span className="text-green-400 flex items-center gap-1"><CheckCircleIcon className="h-4 w-4"/> Correct: {q.correctAnswer}</span>
                  {q.explanation && <span className="text-gray-500 block pl-5 text-xs mt-1 border-l border-gray-700 ml-1">Explanation: {q.explanation}</span>}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={generateQuiz}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Take Another Quiz
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Quiz;
