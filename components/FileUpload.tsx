import React, { useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFileName?: string;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFileName, accept = ".pdf,.txt,.docx" }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-scholar-navy hover:bg-blue-50 transition-colors duration-200 group"
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => e.target.files && onFileSelect(e.target.files[0])} 
        className="hidden" 
        accept={accept}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 text-scholar-navy">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-medium text-gray-700">
            {selectedFileName ? selectedFileName : "Click or drag file to upload"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Supports PDF, TXT (Images for charts)
          </p>
        </div>
      </div>
    </div>
  );
};
