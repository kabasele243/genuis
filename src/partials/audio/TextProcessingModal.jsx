import React, { useState, useEffect } from 'react';
import OpenAI from 'openai';

function TextProcessingModal({ isOpen, onClose, file, onUpdateFile, settings }) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  // Use settings or default prompt
  const defaultPrompt = settings?.textProcessing?.prompt || 
    `You are a text enhancement assistant. Your task is to improve the clarity, grammar, and structure of transcribed text while preserving the original meaning and intent. Remove filler words, fix grammar issues, and make the text more readable and professional.`;

  useEffect(() => {
    if (isOpen && file) {
      const promptToUse = settings?.textProcessing?.prompt 
        ? `${settings.textProcessing.prompt}${settings.textProcessing.instructions ? `\n\nAdditional Instructions: ${settings.textProcessing.instructions}` : ''}`
        : defaultPrompt;
      setCustomPrompt(promptToUse);
      setProcessedText(file.processedText || '');
      setError(null);
    }
  }, [isOpen, file, settings]);

  const processText = async () => {
    if (!file?.transcription || !customPrompt.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: customPrompt
          },
          {
            role: "user",
            content: `Please process this transcribed text:\n\n${file.transcription}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      setProcessedText(completion.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      setError(error.message || 'Text processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdate = () => {
    if (processedText.trim()) {
      onUpdateFile(file.id, {
        processedText: processedText.trim(),
        status: 'processing',
        error: null
      });
      onClose();
    }
  };

  const handleRegenerateAndUpdate = async () => {
    await processText();
    // The processedText will be updated in the state, user can then click Update
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                Process Text - {file?.name}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Original transcription */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Original Transcription
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {file?.transcription || 'No transcription available'}
                </p>
              </div>
            </div>

            {/* Custom prompt */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Processing Instructions
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={4}
                placeholder="Enter custom instructions for text processing..."
              />
            </div>

            {/* Process button */}
            <div className="mb-6">
              <button
                onClick={processText}
                disabled={isProcessing || !customPrompt.trim()}
                className="w-full btn bg-violet-500 text-white hover:bg-violet-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Process Text'
                )}
              </button>
            </div>

            {/* Error display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Error: {error}
                </p>
              </div>
            )}

            {/* Processed text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Processed Text
              </label>
              <textarea
                value={processedText}
                onChange={(e) => setProcessedText(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={8}
                placeholder="Processed text will appear here..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              onClick={handleUpdate}
              disabled={!processedText.trim()}
              className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
            >
              Update
            </button>
            <button
              onClick={handleRegenerateAndUpdate}
              disabled={isProcessing || !customPrompt.trim()}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 disabled:bg-gray-300 disabled:cursor-not-allowed sm:mt-0 sm:w-auto"
            >
              Regenerate
            </button>
            <button
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-600 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 sm:mt-0 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextProcessingModal;