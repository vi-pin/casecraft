// File: app/api/export-pdf/CaseStudyTemplate.tsx

// This component is designed to be rendered on the server into an HTML string.
// It contains the full structure and styling for the PDF.

// Define the type for the draft content
type DraftContent = {
  headline: string;
  customer: { name: string; description: string; };
  challenge: string;
  solution: string;
  results: { metric: string; description: string; }[];
  quote: string;
}

export const CaseStudyTemplate = ({ draft }: { draft: DraftContent }) => (
  <html>
    <head>
      <meta charSet="UTF-8" />
      <script src="https://cdn.tailwindcss.com"></script>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            body { font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif; }
          `,
        }}
      />
    </head>
    <body>
      <div className="bg-white text-slate-800 p-12">
        <p className="text-indigo-600 font-bold uppercase tracking-wider text-sm mb-4">{draft.customer.name}</p>
        <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">{draft.headline}</h2>
        <p className="text-lg text-slate-600 mb-8">{draft.customer.description}</p>
        <div className="grid grid-cols-2 gap-12">
          <div>
            <h3 className="font-bold text-slate-900 mb-2">Challenge</h3>
            <p className="text-slate-600">{draft.challenge}</p>
            <h3 className="font-bold text-slate-900 mt-8 mb-2">Solution</h3>
            <p className="text-slate-600">{draft.solution}</p>
          </div>
          <div className="bg-slate-50 p-8 rounded-lg">
            <h3 className="font-bold text-slate-900 mb-4">Results</h3>
            <div className="space-y-4">
              {draft.results.map((result, i) => (
                <div key={i}>
                  <p className="text-3xl font-bold text-indigo-600">{result.metric}</p>
                  <p className="text-slate-600">{result.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 border-l-4 border-indigo-500 pl-6">
          <p className="text-2xl italic text-slate-700 leading-relaxed">&ldquo;{draft.quote}&rdquo;</p>
        </div>
      </div>
    </body>
  </html>
);
