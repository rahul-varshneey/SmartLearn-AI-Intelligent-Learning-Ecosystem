import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import mermaid from 'mermaid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const Mindmap = () => {
  const [mindmapData, setMindmapData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const mermaidRef = useRef(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const docId = queryParams.get('docId');

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'dark' });
  }, []);

  useEffect(() => {
    if (mindmapData && mermaidRef.current) {
      renderMermaid();
    }
  }, [mindmapData]);

  const renderMermaid = async () => {
    try {
      mermaidRef.current.innerHTML = '';
      const { svg } = await mermaid.render('mindmap-svg', mindmapData);
      mermaidRef.current.innerHTML = svg;
    } catch (err) {
      console.error(err);
      setError('Failed to render mindmap. The AI generated invalid syntax.');
    }
  };

  const generateMindmap = async () => {
    setLoading(true);
    setError('');
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await axios.post('https://smartlearn-ai-backend-20cp.onrender.com/api/mindmap', 
        { documentId: docId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMindmapData(res.data.mermaid);
    } catch (error) {
      setError('Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!docId) return <div className="text-center text-white mt-20">Please select a document first.</div>;

  return (
    <div className="max-w-6xl mx-auto py-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
            Semantic Mind Map
          </h1>
          <p className="text-gray-400 mt-1">Visualize document hierarchy and core concepts.</p>
        </div>
        {!mindmapData && !loading && (
          <button 
            onClick={generateMindmap}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 px-6 py-3 rounded-xl font-medium text-white transition-all transform hover:-translate-y-1 shadow-lg shadow-teal-500/20"
          >
            <ArrowPathIcon className="h-5 w-5" /> Generate Mind Map
          </button>
        )}
      </div>

      {loading && (
        <div className="text-center mt-32 text-teal-400 animate-pulse">
          <ArrowPathIcon className="h-10 w-10 animate-spin mx-auto mb-4" />
          <p className="text-xl font-medium">Constructing knowledge graph...</p>
        </div>
      )}

      {error && <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-center">{error}</div>}

      {mindmapData && (
        <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl overflow-x-auto min-h-[60vh] flex justify-center items-center">
          <div ref={mermaidRef} className="mermaid flex justify-center items-center w-full min-w-[800px]"></div>
        </div>
      )}
    </div>
  );
};

export default Mindmap;
