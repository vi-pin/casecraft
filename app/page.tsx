// File: app/page.tsx

'use client'

import { useRouter } from 'next/navigation'
import { FileUpload } from './components/FileUpload'
import { useState } from 'react'

export default function UploadPage() {
  const router = useRouter()
  // State for API errors
  const [error, setError] = useState<string | null>(null)
  // State for a success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  // State for the API call loading state
  const [isCreating, setIsCreating] = useState(false)

  /**
   * This function is now fully connected to the backend API and provides UI feedback.
   */
  const handleUploaded = async (url: string) => {
    setError(null)
    setSuccessMessage(null)
    setIsCreating(true)

    try {
      console.log('File uploaded. Calling /api/create-case with URL:', url)

      const res = await fetch('/api/create-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text_url: url }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create case study.')
      }

      const { id } = await res.json()
      console.log('API call successful. Case ID:', id)

      // Show success message to the user
      setSuccessMessage('Upload Successfull!')

      // Navigate to the next step after a short delay to allow the user to see the message
      setTimeout(() => {
        router.push(`/choose-template?caseId=${id}`)
      }, 1500) // 1.5-second delay

    } catch (err: any) {
      console.error('Error in handleUploaded:', err)
      setError(err.message)
      setIsCreating(false) // Reset loading state on error
    }
  };

  return (
    <main className="min-h-screen w-full bg-slate-900 text-white flex flex-col items-center justify-center p-4 antialiased">
      <div className="w-full max-w-2xl text-center">
        <p className="text-sm font-medium text-indigo-400 mb-2">
          STEP 1 OF 3
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 mb-4">
          Upload Your Transcript
        </h1>
        <p className="max-w-xl mx-auto text-lg text-slate-400 mb-10">
          Drop a customer interview, survey results, or feedback notes. Our AI will analyze the content to draft your case study.
        </p>

        {/* Disable the FileUpload component while the API call is in progress */}
        <div className={isCreating ? 'opacity-50 pointer-events-none' : ''}>
          <FileUpload onUploaded={handleUploaded} />
        </div>

        <div className="mt-4 w-full max-w-lg mx-auto h-10 flex items-center justify-center">
          {/* Display a loading message during the API call */}
          {isCreating && !successMessage && (
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Creating your case study record...</span>
            </div>
          )}

          {/* Display a success message */}
          {successMessage && (
            <div className="w-full bg-green-500/20 border border-green-500/30 text-green-300 text-sm rounded-lg p-3">
              {successMessage}
            </div>
          )}

          {/* Display any errors from the API call */}
          {error && (
            <div className="w-full bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-lg p-3">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      </div>

       <footer className="absolute bottom-5 text-center text-slate-600 text-sm">
        <p>&copy; {new Date().getFullYear()} CaseCraft. All Rights Reserved.</p>
       </footer>
    </main>
  );
}
