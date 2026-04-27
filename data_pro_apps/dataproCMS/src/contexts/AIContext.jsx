// contexts/AIContext.jsx
import React, { createContext, useContext, useState } from 'react';
import dataproApi from '../services/dataproApi';

const AIContext = createContext();

export const useAI = () => useContext(AIContext);

export const AIProvider = ({ children }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const generateContent = async (prompt, type = 'blog') => {
    setIsGenerating(true);
    try {
      // AI content generation endpoint
      const response = await dataproApi.aiGenerate({ prompt, type });
      return response.content;
    } catch (error) {
      console.error('AI generation failed:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const getSEOSuggestions = async (content, title) => {
    setIsGenerating(true);
    try {
      const response = await dataproApi.aiSEO({ content, title });
      return response.suggestions;
    } catch (error) {
      console.error('SEO suggestions failed:', error);
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  const optimizeImage = async (imageUrl) => {
    setIsGenerating(true);
    try {
      const response = await dataproApi.aiImageOptimize({ imageUrl });
      return response.optimizedUrl;
    } catch (error) {
      console.error('Image optimization failed:', error);
      return imageUrl;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTags = async (content) => {
    setIsGenerating(true);
    try {
      const response = await dataproApi.aiTags({ content });
      return response.tags;
    } catch (error) {
      console.error('Tag generation failed:', error);
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AIContext.Provider value={{
      isGenerating,
      suggestions,
      generateContent,
      getSEOSuggestions,
      optimizeImage,
      generateTags
    }}>
      {children}
    </AIContext.Provider>
  );
};