import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function BlogGenerator() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!topic) return;
    
    setLoading(true);
    try {
      // Generate blog content (placeholder)
      const content = `# ${topic}\n\nThis is AI-generated content about ${topic}.\n\nYour actual AI generation logic would go here.`;
      setGeneratedContent(content);
    } catch (error) {
      console.error('Failed to generate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      // Publish logic would go here
      console.log('Publishing generated blog post');
      navigate('/');
    } catch (error) {
      console.error('Failed to publish:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">AI Blog Generator</h1>
          <Button onClick={() => navigate('/')} variant="outline">
            Back
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Blog Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic for your blog post..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={loading || !topic}
              className="w-full"
            >
              {loading ? 'Generating...' : 'Generate Content'}
            </Button>

            {generatedContent && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Generated Content
                </label>
                <div className="bg-slate-100 p-4 rounded-lg max-h-96 overflow-auto">
                  <p className="text-slate-800 whitespace-pre-wrap">{generatedContent}</p>
                </div>
              </div>
            )}

            {generatedContent && (
              <div className="flex gap-4">
                <Button onClick={handlePublish} disabled={loading}>
                  {loading ? 'Publishing...' : 'Publish to Shopify'}
                </Button>
                <Button onClick={() => navigate('/')} variant="outline">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
