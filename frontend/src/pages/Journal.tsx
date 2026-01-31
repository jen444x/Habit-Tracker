import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

interface ExtractedData {
  emotions: string[];
  wins: string[];
  struggles: string[];
  energy_level: string;
  error?: string;
}

interface JournalEntry {
  id: number;
  content: string;
  extracted_data: ExtractedData;
  created_at: string;
}

export default function Journal() {
  const [content, setContent] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/journal', {
        credentials: 'include',
      });
      const data = await response.json();
      setEntries(data.entries);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setExtracting(true);
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setContent('');
        await fetchEntries();
      }
    } catch (error) {
      console.error('Failed to create entry:', error);
    } finally {
      setExtracting(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Journal</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your journal entry..."
          className="w-full h-32 p-3 border rounded-lg resize-none"
          disabled={extracting}
        />
        <button
          type="submit"
          disabled={extracting || !content.trim()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {extracting ? 'Analyzing...' : 'Save Entry'}
        </button>
      </form>

      <div className="space-y-6">
        {entries.map((entry) => (
          <div key={entry.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <p className="text-sm text-gray-500 mb-2">
              {new Date(entry.created_at).toLocaleDateString()}
            </p>
            <p className="whitespace-pre-wrap">{entry.content}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
