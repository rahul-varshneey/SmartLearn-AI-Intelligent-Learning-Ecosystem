import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CloudArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    const token = JSON.parse(localStorage.getItem('user'))?.token;
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError('');

    try {
      const res = await axios.post((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api/document/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      // Navigate straight to document chat or dashboard
      navigate(`/chat?docId=${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
          Upload Study Material
        </h1>
        <p className="text-gray-400 text-lg">Upload your PDF or Text documents to let AI analyze and structure them.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-700/50"
      >
        <div 
          className="border-2 border-dashed border-gray-600 hover:border-blue-500 hover:bg-gray-700/30 transition-all rounded-2xl p-12 text-center cursor-pointer group"
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <CloudArrowUpIcon className="h-16 w-16 mx-auto text-gray-500 group-hover:text-blue-400 transition-colors mb-4" />
          {file ? (
            <div className="flex items-center justify-center gap-2 text-blue-400 font-semibold text-lg">
              <DocumentIcon className="h-6 w-6" /> {file.name}
            </div>
          ) : (
            <div>
              <p className="text-xl font-medium text-gray-300">Click or drag file to this area to upload</p>
              <p className="text-gray-500 mt-2 text-sm">Supported formats: PDF, TXT (Max 10MB limit for demo)</p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".pdf,.txt"
          />
        </div>

        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSubmit} 
            disabled={!file || uploading}
            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${!file || uploading ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-500/25 hover:-translate-y-0.5'}`}
          >
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Document with AI...
              </>
            ) : 'Upload and Analyze'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Upload;
