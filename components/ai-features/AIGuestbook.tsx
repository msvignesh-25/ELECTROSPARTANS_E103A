'use client';

import React, { useState, useRef } from 'react';
import { generateVoiceArtDescription } from '@/services/aiServices';

interface ShopData {
  shopName: string;
  businessType: string;
  daysAvailable: string[];
  monthlyBudget: number;
  numberOfWorkers: number;
  processes: string[];
}

interface AIGuestbookProps {
  shopData: ShopData;
}

interface ArtEntry {
  id: string;
  voiceMessage: string;
  artPrompt: string;
  timestamp: Date;
}

export default function AIGuestbook({ shopData }: AIGuestbookProps) {
  const [voiceMessage, setVoiceMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [artEntries, setArtEntries] = useState<ArtEntry[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // In production, this would transcribe the audio using speech-to-text API
        // For now, we'll use the text input
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Microphone access denied. Please use text input instead.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleGenerateArt = async () => {
    if (!voiceMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    setIsGenerating(true);
    try {
      const artPrompt = await generateVoiceArtDescription(voiceMessage, shopData);
      
      const newEntry: ArtEntry = {
        id: Date.now().toString(),
        voiceMessage,
        artPrompt,
        timestamp: new Date(),
      };

      setArtEntries([...artEntries, newEntry]);
      setVoiceMessage('');
    } catch (error) {
      console.error('Error generating art:', error);
      alert('Failed to generate art. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        🎤 AI Guestbook (Voice-to-Visual)
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Customers speak their mood or message, and AI instantly creates digital art displayed on your Community Wall!
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Message / Mood
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={voiceMessage}
              onChange={(e) => setVoiceMessage(e.target.value)}
              placeholder="e.g., I'm feeling cozy and happy today"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
            >
              {isRecording ? '⏹️ Stop' : '🎤 Record'}
            </button>
          </div>
          {isRecording && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              🔴 Recording... (Note: In production, this would transcribe to text automatically)
            </p>
          )}
        </div>

        <button
          onClick={handleGenerateArt}
          disabled={isGenerating || !voiceMessage.trim()}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Creating Art...' : '✨ Generate Art from Message'}
        </button>

        {/* Community Wall Display */}
        {artEntries.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🖼️ Community Wall
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {artEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4"
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {entry.timestamp.toLocaleTimeString()}
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                    "{entry.voiceMessage}"
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded p-3 mt-2">
                    <p className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 mb-1">
                      Art Prompt:
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {entry.artPrompt}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                    💡 Use this prompt with an AI image generator to create the visual art
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
