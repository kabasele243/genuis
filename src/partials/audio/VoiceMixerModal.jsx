import React, { useState, useEffect, useRef } from 'react';

function VoiceMixerModal({ isOpen, onClose, onSaveMix, availableVoices }) {
  const [mixName, setMixName] = useState('');
  const [selectedVoices, setSelectedVoices] = useState([]);
  const [voiceWeights, setVoiceWeights] = useState({});
  const [mixSettings, setMixSettings] = useState({
    blend: 'parallel',
    crossfade: 0,
    harmony: 0,
    spatialSeparation: 0,
    dynamicRange: 'normal'
  });
  const [effects, setEffects] = useState({
    reverb: 0,
    echo: 0,
    chorus: 0,
    pitch: 0,
    tempo: 1.0
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewText, setPreviewText] = useState('This is a preview of your mixed voice configuration.');
  const audioRef = useRef(null);

  const blendModes = [
    { id: 'parallel', name: 'Parallel', description: 'Voices play simultaneously at equal volume' },
    { id: 'weighted', name: 'Weighted', description: 'Custom volume levels for each voice' },
    { id: 'alternating', name: 'Alternating', description: 'Voices alternate words or sentences' },
    { id: 'layered', name: 'Layered', description: 'Voices with slight delay for depth' },
    { id: 'harmonized', name: 'Harmonized', description: 'Pitch-shifted harmony effect' }
  ];

  const presets = [
    {
      name: 'Podcast Duo',
      voices: 2,
      settings: { blend: 'alternating', crossfade: 20, spatialSeparation: 80 },
      effects: { reverb: 10, echo: 0, chorus: 0 }
    },
    {
      name: 'Choir Effect',
      voices: 3,
      settings: { blend: 'harmonized', harmony: 60, spatialSeparation: 40 },
      effects: { reverb: 30, chorus: 40 }
    },
    {
      name: 'Radio Drama',
      voices: 2,
      settings: { blend: 'weighted', spatialSeparation: 100 },
      effects: { reverb: 20, echo: 15 }
    },
    {
      name: 'Narrator + Character',
      voices: 2,
      settings: { blend: 'alternating', crossfade: 10, dynamicRange: 'wide' },
      effects: { reverb: 5 }
    },
    {
      name: 'Ethereal Voice',
      voices: 3,
      settings: { blend: 'layered', harmony: 30 },
      effects: { reverb: 50, echo: 30, chorus: 20 }
    }
  ];

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setMixName('');
    setSelectedVoices([]);
    setVoiceWeights({});
    setMixSettings({
      blend: 'parallel',
      crossfade: 0,
      harmony: 0,
      spatialSeparation: 0,
      dynamicRange: 'normal'
    });
    setEffects({
      reverb: 0,
      echo: 0,
      chorus: 0,
      pitch: 0,
      tempo: 1.0
    });
  };

  const toggleVoice = (voiceId) => {
    setSelectedVoices(prev => {
      const newSelection = prev.includes(voiceId)
        ? prev.filter(id => id !== voiceId)
        : [...prev, voiceId];
      
      if (newSelection.includes(voiceId) && !voiceWeights[voiceId]) {
        setVoiceWeights(prev => ({ ...prev, [voiceId]: 100 }));
      }
      
      return newSelection;
    });
  };

  const updateVoiceWeight = (voiceId, weight) => {
    setVoiceWeights(prev => ({ ...prev, [voiceId]: weight }));
  };

  const applyPreset = (preset) => {
    setMixSettings(prev => ({ ...prev, ...preset.settings }));
    setEffects(prev => ({ ...prev, ...preset.effects }));
  };

  const generateMixId = () => {
    const voiceIds = selectedVoices.sort().join('+');
    const settingsHash = btoa(JSON.stringify({ mixSettings, effects, voiceWeights }))
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 8);
    return `${voiceIds}_${settingsHash}`;
  };

  const handlePreview = async () => {
    if (selectedVoices.length < 2) {
      alert('Please select at least 2 voices to preview');
      return;
    }

    setIsPlaying(true);
    try {
      const mixConfig = {
        voices: selectedVoices,
        weights: voiceWeights,
        settings: mixSettings,
        effects: effects,
        text: previewText
      };

      const response = await fetch('http://localhost:8880/v1/audio/speech/mix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mixConfig)
      });

      if (!response.ok) {
        const fallbackResponse = await fetch('http://localhost:8880/v1/audio/speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: previewText,
            voice: selectedVoices.join('+'),
            response_format: 'mp3',
            stream: false
          })
        });
        
        if (!fallbackResponse.ok) throw new Error('Preview generation failed');
        
        const audioBlob = await fallbackResponse.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          await audioRef.current.play();
        }
      } else {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          await audioRef.current.play();
        }
      }
    } catch (error) {
      console.error('Preview failed:', error);
      alert('Failed to generate preview. Please try again.');
    } finally {
      setIsPlaying(false);
    }
  };

  const handleSave = () => {
    if (!mixName.trim()) {
      alert('Please enter a name for your voice mix');
      return;
    }
    
    if (selectedVoices.length < 2) {
      alert('Please select at least 2 voices');
      return;
    }

    const mixConfig = {
      id: generateMixId(),
      name: mixName,
      voices: selectedVoices,
      weights: voiceWeights,
      settings: mixSettings,
      effects: effects,
      createdAt: new Date().toISOString()
    };

    onSaveMix(mixConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Voice Mixer</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create custom voice combinations with effects</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Mix Name
                </label>
                <input
                  type="text"
                  value={mixName}
                  onChange={(e) => setMixName(e.target.value)}
                  placeholder="Enter a name for your voice mix"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Select Voices ({selectedVoices.length} selected)
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {availableVoices?.map(voice => (
                    <button
                      key={voice.id}
                      onClick={() => toggleVoice(voice.id)}
                      className={`p-2 text-xs rounded-lg transition-all ${
                        selectedVoices.includes(voice.id)
                          ? 'bg-blue-500 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="font-medium">{voice.name}</div>
                      <div className="text-[10px] opacity-75">{voice.gender}</div>
                    </button>
                  ))}
                </div>
              </div>

              {mixSettings.blend === 'weighted' && selectedVoices.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Voice Weights
                  </label>
                  <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {selectedVoices.map(voiceId => {
                      const voice = availableVoices?.find(v => v.id === voiceId);
                      return (
                        <div key={voiceId} className="flex items-center space-x-3">
                          <span className="text-sm text-gray-700 dark:text-gray-300 w-24">
                            {voice?.name}
                          </span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={voiceWeights[voiceId] || 100}
                            onChange={(e) => updateVoiceWeight(voiceId, parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                            {voiceWeights[voiceId] || 100}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Blend Mode
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {blendModes.map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => setMixSettings(prev => ({ ...prev, blend: mode.id }))}
                      className={`p-3 text-left rounded-lg border-2 transition-all ${
                        mixSettings.blend === mode.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-900 dark:text-white">{mode.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{mode.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Mix Parameters
                </label>
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {mixSettings.blend === 'alternating' && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Crossfade</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{mixSettings.crossfade}ms</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={mixSettings.crossfade}
                        onChange={(e) => setMixSettings(prev => ({ ...prev, crossfade: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  {mixSettings.blend === 'harmonized' && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Harmony Depth</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{mixSettings.harmony}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={mixSettings.harmony}
                        onChange={(e) => setMixSettings(prev => ({ ...prev, harmony: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Spatial Separation</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{mixSettings.spatialSeparation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={mixSettings.spatialSeparation}
                      onChange={(e) => setMixSettings(prev => ({ ...prev, spatialSeparation: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Dynamic Range</span>
                    </div>
                    <select
                      value={mixSettings.dynamicRange}
                      onChange={(e) => setMixSettings(prev => ({ ...prev, dynamicRange: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      <option value="compressed">Compressed</option>
                      <option value="normal">Normal</option>
                      <option value="wide">Wide</option>
                      <option value="cinematic">Cinematic</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Audio Effects
                </label>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Reverb</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{effects.reverb}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={effects.reverb}
                      onChange={(e) => setEffects(prev => ({ ...prev, reverb: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Echo</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{effects.echo}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={effects.echo}
                      onChange={(e) => setEffects(prev => ({ ...prev, echo: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Chorus</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{effects.chorus}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={effects.chorus}
                      onChange={(e) => setEffects(prev => ({ ...prev, chorus: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Pitch Shift</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{effects.pitch > 0 ? '+' : ''}{effects.pitch}</span>
                    </div>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      value={effects.pitch}
                      onChange={(e) => setEffects(prev => ({ ...prev, pitch: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div className="col-span-2">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Tempo</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{effects.tempo.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={effects.tempo}
                      onChange={(e) => setEffects(prev => ({ ...prev, tempo: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Quick Presets
                </label>
                <div className="space-y-2">
                  {presets.map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="w-full p-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-sm text-gray-900 dark:text-white">{preset.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {preset.voices} voices • {Object.keys(preset.effects).filter(k => preset.effects[k] > 0).join(', ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Preview Text
                </label>
                <textarea
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter text to preview..."
                />
                <button
                  onClick={handlePreview}
                  disabled={selectedVoices.length < 2 || isPlaying}
                  className={`w-full mt-3 py-2 px-4 rounded-lg font-medium transition-colors ${
                    selectedVoices.length < 2 || isPlaying
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isPlaying ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    'Preview Mix'
                  )}
                </button>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Mix Summary</h4>
                <div className="space-y-1 text-xs text-blue-700 dark:text-blue-400">
                  <div>Voices: {selectedVoices.length}</div>
                  <div>Blend: {mixSettings.blend}</div>
                  <div>Effects: {Object.entries(effects).filter(([k, v]) => v > 0 && k !== 'tempo').map(([k]) => k).join(', ') || 'None'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!mixName.trim() || selectedVoices.length < 2}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              !mixName.trim() || selectedVoices.length < 2
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
            }`}
          >
            Save Mix
          </button>
        </div>

        <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
      </div>
    </div>
  );
}

export default VoiceMixerModal;