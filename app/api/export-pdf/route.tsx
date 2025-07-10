// File: app/api/export-pdf/route.tsx
import React from 'react' 
import { type NextRequest, NextResponse } from 'next/server';
import ReactDOMServer from 'react-dom/server';
import { CaseStudyTemplate } from './caseStudyTemplate'; // Import the compone

export async function POST(req: NextRequest) {
  try {
    const { draftContent } = await req.json();

    if (!draftContent) {
      return NextResponse.json({ error: 'Missing draft content.' }, { status: 400 });
    }

    // Convert the imported React component to an HTML string
    const html = ReactDOMServer.renderToString(<CaseStudyTemplate draft={draftContent} />);

    // Call the PDFMonkey API
    const response = await fetch('https://api.pdfmonkey.io/v1/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PDFMONKEY_PRIVATE_KEY}`
      },
      body: JSON.stringify({
        document: {
          document_template_id: null,
          html: html,
          status: 'draft',
          _options: {
            pdf_options: {
              print_background: true,
              format: 'A4',
              margin: { top: '0cm', bottom: '0cm', left: '0cm', right: '0cm' }
            }
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("PDFMonkey Error:", errorData);
      throw new Error('Failed to generate PDF document.');
    }

    const pdfMonkeyDoc = await response.json();
    const downloadUrl = pdfMonkeyDoc.document.download_url;

    // Fetch the generated PDF file from PDFMonkey's URL
    const pdfResponse = await fetch(downloadUrl);
    if (!pdfResponse.ok) {
      throw new Error('Failed to download the generated PDF.');
    }

    const pdfBlob = await pdfResponse.blob();

    // Return the PDF file directly to the browser
    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="case-study.pdf"',
      },
    });

  } catch (err: any) {
    console.error('Export API Error:', err);
    return NextResponse.json({ error: err.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
