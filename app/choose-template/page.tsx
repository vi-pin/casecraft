// File: app/choose-template/page.tsx

'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'

// Define the structure for a template option
type Template = {
  id: string
  name: string
  description: string
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element
}

// Define the type for our case study draft content
type DraftContent = {
  headline: string;
  customer: { name: string; description: string; };
  challenge: string;
  solution: string;
  results: { metric: string; description: string; }[];
  quote: string;
}

// --- Icons for the template cards ---
const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
)
const SquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
)
const PresentationIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/></svg>
)

// --- Template Data ---
const templates: Template[] = [
  { id: 'single_page_pdf', name: 'Single-Page PDF', description: 'A classic, professional layout perfect for printing or emailing.', icon: FileTextIcon },
  { id: 'web_embed_card', name: 'Web Embed Card', description: 'A compact, modern card ideal for embedding on your website.', icon: SquareIcon },
  { id: 'presentation_slide', name: 'Presentation Slide', description: 'A clean, bold format designed for use in slide decks.', icon: PresentationIcon },
]

function ChooseTemplateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get('caseId')

  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [draftContent, setDraftContent] = useState<DraftContent | null>(null)

  const handleTemplateSelect = async (templateId: string) => {
    if (!caseId) {
      setError('No case study ID found. Please go back and upload a file again.')
      return
    }
    setLoadingTemplate(templateId)
    setError(null)
    setDraftContent(null)

    try {
      const res = await fetch('/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, templateId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate draft.')
      }
      
      setDraftContent(data.draftContent)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingTemplate(null)
    }
  }

  const handleDownloadJson = () => {
    if (!draftContent) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(draftContent, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `case-study-${caseId}.json`;
    link.click();
  };

  return (
    <main className="min-h-screen w-full bg-slate-900 text-white flex flex-col items-center justify-center p-4 antialiased">
      <div className="w-full max-w-4xl text-center">
        <p className="text-sm font-medium text-indigo-400 mb-2">
          STEP 2 OF 3
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 mb-4">
          Choose a Template
        </h1>
        <p className="max-w-xl mx-auto text-lg text-slate-400 mb-10">
          Select a layout for your case study. The AI will generate the content draft.
        </p>

        {!draftContent && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                disabled={!!loadingTemplate}
                className="group p-6 bg-slate-800/50 border border-slate-700 rounded-xl text-left flex flex-col items-start transition-all duration-300 hover:border-indigo-500 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center mb-4 border border-slate-600 transition-colors group-hover:bg-indigo-500/20 group-hover:border-indigo-500">
                  <template.icon className="w-6 h-6 text-slate-400 transition-colors group-hover:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-200 mb-2">{template.name}</h3>
                <p className="text-slate-400 flex-grow">{template.description}</p>
                
                {loadingTemplate === template.id && (
                  <div className="mt-4 flex items-center gap-2 text-indigo-400">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Generating...</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
        
        {error && <p className="mt-6 text-red-400">{error}</p>}

        {draftContent && (
          <div className="mt-8 text-left max-w-2xl mx-auto bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-slate-200 mb-4">Draft Generated Successfully!</h2>
            <pre className="bg-slate-900 p-4 rounded-lg text-sm text-slate-300 overflow-x-auto">
              {JSON.stringify(draftContent, null, 2)}
            </pre>
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleDownloadJson}
                className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-500 transition-colors"
              >
                Download JSON
              </button>
              <button
                onClick={() => router.push(`/edit/${caseId}`)}
                className="bg-slate-700 text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Continue to Editor &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

// Using Suspense is a best practice when using useSearchParams
export default function ChooseTemplatePage() {
  return (
    <Suspense fallback={<div className="bg-slate-900 min-h-screen flex items-center justify-center text-white">Loading...</div>}>
      <ChooseTemplateContent />
    </Suspense>
  )
}
