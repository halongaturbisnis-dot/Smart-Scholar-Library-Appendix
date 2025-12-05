
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { SummaryResult, PdfConfig } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Visualizer } from './Visualizer';

// Declare html2pdf on window
declare const html2pdf: any;

interface PdfCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaryResult: SummaryResult;
}

export const PdfCustomizeModal: React.FC<PdfCustomizeModalProps> = ({ isOpen, onClose, summaryResult }) => {
  const [config, setConfig] = useState<PdfConfig>({
    fontStyle: 'serif',
    themeColor: '#1e3a8a', // Default Navy
    density: 'comfortable',
    includeVisual: true
  });
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    const element = document.getElementById('custom-print-container');
    if (!element) return;

    setIsDownloading(true);

    const opt = {
      margin:       [10, 10, 10, 10], // mm
      filename:     `SmartScholar_Summary_${new Date().toISOString().slice(0,10)}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Use html2pdf library
    if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(element).save().then(() => {
            setIsDownloading(false);
        }).catch((err: any) => {
            console.error("PDF generation failed:", err);
            setIsDownloading(false);
            alert("Failed to generate PDF. Please try again.");
        });
    } else {
        alert("PDF generator library not loaded.");
        setIsDownloading(false);
    }
  };

  const colors = [
    { name: 'Navy', hex: '#1e3a8a' },
    { name: 'Maroon', hex: '#7f1d1d' },
    { name: 'Forest', hex: '#14532d' },
    { name: 'Black', hex: '#111827' },
    { name: 'Purple', hex: '#581c87' },
  ];

  // We use a Portal to render this at the document.body level 
  // ensuring it sits above everything and isn't affected by potential overflow clipping
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex overflow-hidden animate-fade-in-up">
        
        {/* Left Sidebar: Controls */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 flex flex-col shrink-0 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6">PDF Configuration</h2>
            
            <div className="space-y-6 flex-1">
                {/* Theme Color */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Accent Color</label>
                    <div className="flex flex-wrap gap-3">
                        {colors.map(c => (
                            <button 
                                key={c.name}
                                onClick={() => setConfig({...config, themeColor: c.hex})}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${config.themeColor === c.hex ? 'border-gray-900 ring-2 ring-gray-200' : 'border-transparent'}`}
                                style={{ backgroundColor: c.hex }}
                                title={c.name}
                            />
                        ))}
                    </div>
                </div>

                {/* Typography */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Typography</label>
                    <div className="flex gap-2">
                         <button 
                             onClick={() => setConfig({...config, fontStyle: 'serif'})}
                             className={`flex-1 py-2 px-3 border rounded-lg text-sm font-serif ${config.fontStyle === 'serif' ? 'bg-white border-scholar-navy text-scholar-navy shadow-sm' : 'bg-gray-100 border-transparent text-gray-600'}`}
                         >
                            Serif
                         </button>
                         <button 
                             onClick={() => setConfig({...config, fontStyle: 'sans'})}
                             className={`flex-1 py-2 px-3 border rounded-lg text-sm font-sans ${config.fontStyle === 'sans' ? 'bg-white border-scholar-navy text-scholar-navy shadow-sm' : 'bg-gray-100 border-transparent text-gray-600'}`}
                         >
                            Sans
                         </button>
                    </div>
                </div>

                {/* Density */}
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-3">Layout Density</label>
                     <div className="flex gap-2 bg-gray-200 p-1 rounded-lg">
                        <button 
                             onClick={() => setConfig({...config, density: 'comfortable'})}
                             className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition ${config.density === 'comfortable' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                           Comfortable
                        </button>
                        <button 
                             onClick={() => setConfig({...config, density: 'compact'})}
                             className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition ${config.density === 'compact' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                           Compact
                        </button>
                     </div>
                </div>

                {/* Content Toggle */}
                {summaryResult.visualData && (
                     <div>
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Include Visualization</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={config.includeVisual}
                                    onChange={(e) => setConfig({...config, includeVisual: e.target.checked})}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-scholar-navy"></div>
                            </div>
                        </label>
                    </div>
                )}
            </div>

            <div className="pt-6 border-t border-gray-200 mt-auto flex flex-col gap-3">
                 <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full py-3 bg-scholar-navy text-white rounded-xl font-medium shadow-md hover:bg-blue-800 transition flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isDownloading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Download PDF
                        </>
                    )}
                </button>
                <button 
                    onClick={onClose}
                    className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                    Cancel
                </button>
            </div>
        </div>

        {/* Right Area: Live Preview */}
        <div className="flex-1 bg-gray-200 p-8 overflow-y-auto flex justify-center relative">
            
            {/* The Actual Content to be PDF'd */}
            <div 
                id="custom-print-container"
                className={`bg-white shadow-xl max-w-[210mm] w-full min-h-[297mm] mx-auto transition-all duration-300
                    ${config.fontStyle === 'serif' ? 'font-serif' : 'font-sans'}
                    ${config.density === 'compact' ? 'p-8' : 'p-12'}
                `}
                style={{
                    // Pass CSS variables for the Markdown renderer
                    '--tw-prose-headings': config.themeColor,
                    '--tw-prose-links': config.themeColor,
                } as React.CSSProperties}
            >
                {/* PDF Header */}
                <div className="border-b-4 mb-8 pb-6 flex justify-between items-end" style={{ borderColor: config.themeColor }}>
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: config.themeColor }}>
                            S
                         </div>
                         <div>
                             <h1 className="text-2xl font-bold text-gray-900 leading-none">Smart Scholar</h1>
                             <span className="text-xs uppercase tracking-widest text-gray-500">Summary Report</span>
                         </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Generated on</p>
                        <p className="font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Content */}
                <div className={`space-y-8 ${config.density === 'compact' ? 'text-sm' : 'text-base'}`}>
                    
                    {/* Summary Section */}
                    <section>
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600 mb-2">
                                Executive Summary
                            </span>
                        </div>
                        <MarkdownRenderer content={summaryResult.markdownText} className={config.density === 'compact' ? 'prose-sm' : ''} />
                    </section>

                    {/* Visual Section */}
                    {config.includeVisual && summaryResult.visualData && (
                        <section className="break-inside-avoid pt-4">
                             <div className="mb-6 border-t pt-6 border-gray-100">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 text-white" style={{ backgroundColor: config.themeColor }}>
                                    Visualization
                                </span>
                                <Visualizer data={summaryResult.visualData} themeColor={config.themeColor} />
                             </div>
                        </section>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
                    <p>Generated by Smart Scholar Library AI Assistant</p>
                </div>

            </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
