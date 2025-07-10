// File: app/edit/[caseId]/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Define the type for our case study draft content
type DraftContent = {
  headline: string;
  customer: { name: string; description: string; };
  challenge: string;
  solution: string;
  results: { metric: string; description: string; }[];
  quote: string;
}

// Helper component for editable text fields
const EditableField = ({ value, onSave }: { value: string; onSave: (newValue: string) => void }) => {
  const [text, setText] = useState(value);
  const handleBlur = () => {
    if (text !== value) {
      onSave(text);
    }
  };
  return (
    <span
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onInput={(e) => setText(e.currentTarget.textContent || '')}
      className="outline-none focus:bg-slate-700/50 focus:shadow-inner rounded-md px-1 -mx-1"
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
};


export default function EditPage({ params }: { params: { caseId: string } }) {
  const [draft, setDraft] = useState<DraftContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Create a Supabase client for this component
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchDraft = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('cases')
        .select('draft_content')
        .eq('id', params.caseId)
        .single();

      if (error || !data || !data.draft_content) {
        setError('Failed to fetch case study draft. Please try again.');
        console.error(error);
      } else {
        setDraft(data.draft_content as DraftContent);
      }
      setLoading(false);
    };

    fetchDraft();
  }, [params.caseId]);

  const handleFieldSave = (field: keyof DraftContent | string, value: string) => {
    if (!draft) return;
    
    // Create a deep copy to avoid direct state mutation
    const updatedDraft = JSON.parse(JSON.stringify(draft));
    
    // Handle nested properties
    const keys = field.split('.');
    let current = updatedDraft;
    for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    setDraft(updatedDraft);
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: params.caseId, draftContent: draft }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to export PDF.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `case-study-${params.caseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading your case study...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-400">{error}</div>;
  }

  if (!draft) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">No draft content found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Case Study Editor</h1>
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-500 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Exporting...
              </>
            ) : (
              'Export to PDF'
            )}
          </button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg">{error}</div>}

        {/* The Case Study Template */}
        <div id="case-study-content" className="bg-white text-slate-800 p-12 rounded-lg shadow-2xl font-serif">
          <p className="text-indigo-600 font-bold uppercase tracking-wider text-sm mb-4">
            <EditableField value={draft.customer.name} onSave={(v) => handleFieldSave('customer.name', v)} />
          </p>
          <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
            <EditableField value={draft.headline} onSave={(v) => handleFieldSave('headline', v)} />
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            <EditableField value={draft.customer.description} onSave={(v) => handleFieldSave('customer.description', v)} />
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Challenge</h3>
              <p className="text-slate-600">
                <EditableField value={draft.challenge} onSave={(v) => handleFieldSave('challenge', v)} />
              </p>
              <h3 className="font-bold text-slate-900 mt-8 mb-2">Solution</h3>
              <p className="text-slate-600">
                <EditableField value={draft.solution} onSave={(v) => handleFieldSave('solution', v)} />
              </p>
            </div>
            <div className="bg-slate-50 p-8 rounded-lg">
              <h3 className="font-bold text-slate-900 mb-4">Results</h3>
              <div className="space-y-4">
                {draft.results.map((result, i) => (
                  <div key={i}>
                    <p className="text-3xl font-bold text-indigo-600">
                      <EditableField value={result.metric} onSave={(v) => handleFieldSave(`results.${i}.metric`, v)} />
                    </p>
                    <p className="text-slate-600">
                      <EditableField value={result.description} onSave={(v) => handleFieldSave(`results.${i}.description`, v)} />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 border-l-4 border-indigo-500 pl-6">
            <p className="text-2xl font-style: italic text-slate-700 leading-relaxed">
              &ldquo;<EditableField value={draft.quote} onSave={(v) => handleFieldSave('quote', v)} />&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
