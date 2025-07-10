// File: app/components/FileUpload.tsx

'use client'
import { useState } from 'react'
// This now imports your REAL Supabase client
import { supabase } from '../lib/supabase'

const UploadCloudIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
);

export function FileUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      // This will now call your REAL Supabase storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('uploads')
        .upload(`raw/${Date.now()}_${file.name}`, file);

      if (uploadError) throw uploadError;

      // This will now get the REAL public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('uploads')
        .getPublicUrl(uploadData.path);

      onUploaded(publicUrl);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Drag and drop handlers remain the same
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-4">
      <label
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          group relative w-full flex flex-col items-center justify-center
          p-8 border-2 border-dashed rounded-2xl cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-400/50 hover:border-indigo-500'}
          ${uploading ? 'pointer-events-none' : ''}
        `}
      >
        <div className={`flex flex-col items-center justify-center gap-4 transition-opacity duration-300 ${uploading ? 'opacity-20' : 'opacity-100'}`}>
          <UploadCloudIcon className={`w-12 h-12 text-slate-400 transition-all duration-300 group-hover:text-indigo-500 group-hover:-translate-y-1 ${isDragging ? 'text-indigo-500' : ''}`} />
          <p className="text-lg font-semibold text-slate-300">
            <span className="text-indigo-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm text-slate-500">Supports .txt and .docx files</p>
        </div>

        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/50 rounded-2xl">
            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg font-semibold text-white">Uploading...</p>
          </div>
        )}

        <input type="file" accept=".txt,.docx" disabled={uploading} onChange={(e) => handleFileChange(e.target.files)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </label>

      {error && (
        <div className="w-full bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-lg p-3 flex items-center justify-between gap-4">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-500/20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      )}
    </div>
  );
}
