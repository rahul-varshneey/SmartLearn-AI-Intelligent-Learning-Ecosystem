import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { DocumentTextIcon, PlusCircleIcon, SparklesIcon, ShareIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await axios.get('https://smartlearn-ai-backend-20cp.onrender.com/api/document', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(res.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Library</h1>
          <p className="text-gray-400">View and analyze your uploaded study materials.</p>
        </div>
        <Link 
          to="/upload" 
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1"
        >
          <PlusCircleIcon className="h-5 w-5" />
          Upload New Document
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/50 rounded-3xl border border-gray-700/50 border-dashed">
          <DocumentTextIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300">No documents yet</h3>
          <p className="text-gray-500 mt-2">Upload a PDF or TXT file to start generating AI study materials.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc, idx) => (
            <motion.div 
              key={doc._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-colors group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <DocumentTextIcon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-900 px-3 py-1 rounded-full">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-100 mb-2 truncate" title={doc.filename}>{doc.filename}</h3>
              <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                {doc.summary?.short || 'Processed successfully. Ready for AI interactions.'}
              </p>
              
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <Link to={`/chat?docId=${doc._id}`} className="py-2 text-center bg-gray-900 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors border border-gray-700 flex justify-center items-center gap-1">
                  <SparklesIcon className="h-4 w-4" /> Chat
                </Link>
                <Link to={`/flashcards?docId=${doc._id}`} className="py-2 text-center bg-gray-900 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors border border-gray-700">
                  Flashcards
                </Link>
                <Link to={`/quiz?docId=${doc._id}`} className="py-2 text-center bg-gray-900 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors border border-gray-700">
                  Quiz
                </Link>
                <Link to={`/mindmap?docId=${doc._id}`} className="py-2 text-center bg-gray-900 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors border border-gray-700">
                  Mindmap
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
