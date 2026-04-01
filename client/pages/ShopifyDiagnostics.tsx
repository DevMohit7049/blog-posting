import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DiagnosticResult {
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: string;
}

export default function ShopifyDiagnostics() {
  const [results, setResults] = useState<Record<string, DiagnosticResult>>({
    envCheck: { status: 'pending', message: 'Checking environment variables...' },
    validation: { status: 'pending', message: 'Validating Shopify connection...' },
    products: { status: 'pending', message: 'Fetching products...' },
    blogs: { status: 'pending', message: 'Fetching blogs...' },
  });

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    // Check env variables
    try {
      const envResponse = await fetch('/api/env-check');
      const envData = await envResponse.json();
      setResults((prev) => ({
        ...prev,
        envCheck: {
          status: 'success',
          message: 'Environment variables loaded',
          details: JSON.stringify(envData, null, 2),
        },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        envCheck: {
          status: 'error',
          message: 'Failed to check environment variables',
          details: error instanceof Error ? error.message : String(error),
        },
      }));
    }

    // Validate Shopify connection
    try {
      const valResponse = await fetch('/api/validate-shopify');
      const valData = await valResponse.json();

      if (valResponse.ok) {
        setResults((prev) => ({
          ...prev,
          validation: {
            status: 'success',
            message: '✅ Connected to Shopify successfully',
            details: JSON.stringify(valData, null, 2),
          },
        }));

        // Only continue if validation passed
        // Fetch products
        try {
          const prodResponse = await fetch('/api/products?limit=10');
          const prodData = await prodResponse.json();

          if (!prodResponse.ok || !Array.isArray(prodData)) {
            setResults((prev) => ({
              ...prev,
              products: {
                status: 'error',
                message: 'Failed to fetch products',
                details: typeof prodData === 'object' ? JSON.stringify(prodData, null, 2) : String(prodData),
              },
            }));
          } else {
            setResults((prev) => ({
              ...prev,
              products: {
                status: 'success',
                message: `Found ${prodData.length || 0} products`,
                details: prodData.length > 0
                  ? `Sample products: ${prodData.slice(0, 3).map((p: any) => p.title).join(', ')}`
                  : 'No products found in store',
              },
            }));
          }
        } catch (error) {
          setResults((prev) => ({
            ...prev,
            products: {
              status: 'error',
              message: 'Failed to fetch products',
              details: error instanceof Error ? error.message : String(error),
            },
          }));
        }
      } else {
        setResults((prev) => ({
          ...prev,
          validation: {
            status: 'error',
            message: 'Failed to validate Shopify connection',
            details: JSON.stringify(valData, null, 2),
          },
        }));
      }
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        validation: {
          status: 'error',
          message: 'Error validating Shopify',
          details: error instanceof Error ? error.message : String(error),
        },
      }));
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-slate-900">Shopify Diagnostics</h1>
        <p className="text-slate-600 mb-8">Check if your app is connected to your Shopify store</p>

        <div className="space-y-4">
          {Object.entries(results).map(([key, result]) => (
            <Card key={key} className="p-6 border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <span>{statusIcon(result.status)}</span>
                  {key === 'envCheck' && 'Environment Variables'}
                  {key === 'validation' && 'Shopify Connection'}
                  {key === 'products' && 'Products'}
                  {key === 'blogs' && 'Blogs'}
                </h3>
              </div>
              <p className="text-slate-700 mb-3">{result.message}</p>
              {result.details && (
                <pre className="bg-slate-100 p-4 rounded text-sm overflow-auto max-h-48 text-slate-800">
                  {result.details}
                </pre>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <Button onClick={runDiagnostics} className="bg-blue-600 hover:bg-blue-700">
            Re-run Diagnostics
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-slate-300"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
