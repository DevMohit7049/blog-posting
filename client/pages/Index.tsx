import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Blog Generator</h1>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Create SEO-Optimized Blog Posts
          </h2>
          <p className="text-lg text-slate-600">
            Generate and publish blog posts directly to your Shopify store
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-3xl mb-3">✍️</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Blog Editor</h3>
            <p className="text-slate-600 mb-4">
              Create structured blog posts with sections, images, and metadata
            </p>
            <Link to="/blog/create">
              <Button className="w-full">Open Editor</Button>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">AI Generator</h3>
            <p className="text-slate-600 mb-4">
              Use AI to generate and optimize your blog content
            </p>
            <Link to="/blog/generator">
              <Button className="w-full">Generate</Button>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-3xl mb-3">🔧</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Diagnostics</h3>
            <p className="text-slate-600 mb-4">
              Check your Shopify store connection and settings
            </p>
            <Link to="/diagnostics/shopify">
              <Button className="w-full" variant="outline">
                Check Connection
              </Button>
            </Link>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">About This App</h3>
          <p className="text-blue-800">
            This blog generator helps you create SEO-optimized content and publish it directly to your Shopify store.
            Start by creating a new blog post or generating one with AI. All content is uploaded to your store automatically.
          </p>
        </div>
      </main>
    </div>
  );
}
