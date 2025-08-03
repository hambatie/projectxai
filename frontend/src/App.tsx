import React, { useState } from 'react';

const RUNPOD_ENDPOINT = import.meta.env.VITE_RUNPOD_ENDPOINT_ID;
const RUNPOD_API_KEY = import.meta.env.VITE_RUNPOD_API_KEY;


type RunpodResponse = {
  output?: {
    transcript?: string;
    summary?: string;
  };
  error?: string;
};

const App: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleTranscribe = async () => {
    if (!audioFile) return alert('Upload eerst een audio bestand.');

    setLoading(true);
    try {
      const base64Audio = await toBase64(audioFile);
      const response = await fetch(RUNPOD_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RUNPOD_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: {
            action: 'transcribe',
            audio_path: base64Audio
          }
        })
      });

      const data: RunpodResponse = await response.json();
      if (data.output?.transcript) {
        setTranscript(data.output.transcript);
      } else {
        alert('Transcriptie mislukt.');
        console.error(data.error || data);
      }
    } catch (err) {
      console.error(err);
      alert('Fout bij transcriberen.');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!transcript) return alert('Transcript ontbreekt.');

    setLoading(true);
    try {
      const response = await fetch(RUNPOD_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RUNPOD_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: {
            action: 'summarize',
            transcript_text: transcript
          }
        })
      });

      const data: RunpodResponse = await response.json();
      if (data.output?.summary) {
        setSummary(data.output.summary);
      } else {
        alert('Samenvatting mislukt.');
        console.error(data.error || data);
      }
    } catch (err) {
      console.error(err);
      alert('Fout bij samenvatten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>📝 Transcriptie & Samenvatting</h1>

      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
        style={{ marginBottom: '1rem' }}
      />

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={handleTranscribe} disabled={loading || !audioFile}>
          🎙️ Transcribeer
        </button>
        <button onClick={handleSummarize} disabled={loading || !transcript} style={{ marginLeft: '1rem' }}>
          🧠 Samenvatten
        </button>
      </div>

      {transcript && (
        <div style={{ marginTop: '2rem' }}>
          <h2>📄 Transcript:</h2>
          <pre style={{ background: '#f4f4f4', padding: '1rem' }}>{transcript}</pre>
        </div>
      )}

      {summary && (
        <div style={{ marginTop: '2rem' }}>
          <h2>🧾 Samenvatting:</h2>
          <pre style={{ background: '#e4f7e4', padding: '1rem' }}>{summary}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
