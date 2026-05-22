import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { PaperAirplaneIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [docDetails, setDocDetails] = useState(null);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const docId = queryParams.get('docId');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (docId) fetchDocDetails();
    // Welcome message
    setMessages([{ role: 'ai', text: "Hello! I've analyzed your document. What would you like to know about it?" }]);
  }, [docId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchDocDetails = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await axios.get(`http://localhost:5000/api/document/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocDetails(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !docId) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await axios.post('http://localhost:5000/api/chat', 
        { documentId: docId, question: userMsg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages(prev => [...prev, { role: 'ai', text: res.data.answer, citations: res.data.citations }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I encountered an error communicating with the server." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[85vh] flex gap-6">
      {/* Sidebar for Doc Info */}
      <div className="w-1/3 bg-gray-800 rounded-3xl p-6 border border-gray-700/50 shadow-xl hidden md:flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
            <DocumentTextIcon className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold truncate">{docDetails?.filename || 'Document Info'}</h2>
        </div>
        
        {docDetails?.summary && (
          <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Short Summary</h3>
              <p className="text-gray-200 bg-gray-900/50 p-4 rounded-xl text-sm leading-relaxed border border-gray-700/50">
                {docDetails.summary.short}
              </p>
            </div>
            
            {docDetails.summary.keyConcepts && docDetails.summary.keyConcepts.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Key Concepts</h3>
                <ul className="space-y-2">
                  {docDetails.summary.keyConcepts.map((concept, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircleIcon className="h-5 w-5 text-green-400 shrink-0" />
                      <span>{concept}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-gray-800 rounded-3xl border border-gray-700/50 shadow-xl flex flex-col overflow-hidden relative">
        <div className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700/50 p-4 absolute top-0 w-full z-10">
          <h3 className="font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            SmartLearn AI Assistant
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 pt-20 space-y-6 custom-scrollbar bg-gray-900/50">
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl p-5 shadow-lg ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-none' : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-bl-none'}`}>
                {msg.role === 'ai' ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.text}</p>
                )}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-400 font-semibold mb-2">Sources:</p>
                    <div className="space-y-2">
                      {msg.citations.map((cite, i) => (
                        <div key={i} className="text-xs text-gray-500 bg-gray-900 p-2 rounded line-clamp-2" title={cite}>
                          "...{cite}..."
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 rounded-bl-none flex gap-2 items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-gray-800 border-t border-gray-700/50">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about the document..."
              className="w-full bg-gray-900 border border-gray-700 rounded-2xl py-4 pl-6 pr-14 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-500"
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              <PaperAirplaneIcon className="h-6 w-6 transform -rotate-45 ml-1 mb-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
