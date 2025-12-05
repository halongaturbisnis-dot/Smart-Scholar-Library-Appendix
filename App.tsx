
import React, { useState } from 'react';
import { AppMode, SummaryResult, SlideDeck, AppLanguage } from './types';
import { FileUpload } from './components/FileUpload';
import { Visualizer } from './components/Visualizer';
import { SlideRenderer } from './components/SlideRenderer';
import { generateSmartSummary, generateVisualData, generateSlideDeck } from './services/geminiService';
import { PdfCustomizeModal } from './components/PdfCustomizeModal';
import { MarkdownRenderer } from './components/MarkdownRenderer';

// Owl Logo SVG Component based on the "Scholar" theme
const ScholarLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-scholar-navy">
     <circle cx="20" cy="20" r="20" fill="url(#paint0_linear)" />
     <path d="M20 10C14.4772 10 10 14.4772 10 20C10 25.5228 14.4772 30 20 30C25.5228 30 30 25.5228 30 20C30 14.4772 25.5228 10 20 10ZM20 28C15.5817 28 12 24.4183 12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28Z" fill="white" fillOpacity="0.2"/>
     <path d="M27 16C27 16 25 19 20 19C15 19 13 16 13 16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
     <circle cx="16" cy="22" r="2" fill="#FBBF24"/>
     <circle cx="24" cy="22" r="2" fill="#FBBF24"/>
     <path d="M20 24V26" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"/>
     <defs>
        <linearGradient id="paint0_linear" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F472B6"/>
            <stop offset="1" stopColor="#FF8C42"/>
        </linearGradient>
     </defs>
  </svg>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.SUMMARY);
  const [language, setLanguage] = useState<AppLanguage>('ID');
  const [file, setFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [visualLoading, setVisualLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Summary State
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);

  // Slide State
  const [slideInstructions, setSlideInstructions] = useState('');
  const [slideDeck, setSlideDeck] = useState<SlideDeck | null>(null);

  // PDF Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const reset = () => {
    setFile(null);
    setSummaryResult(null);
    setSlideDeck(null);
    setError(null);
    setUrlInput('');
  };

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    reset();
  };

  const handleLanguageChange = (lang: AppLanguage) => {
    setLanguage(lang);
  };

  const handleProcess = async () => {
    if (!file && !urlInput && !slideInstructions) {
      setError("Please provide a file, URL, or instructions.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSummaryResult(null);
    setSlideDeck(null);

    try {
      if (mode === AppMode.SUMMARY) {
        // 1. Generate Text Summary ONLY first
        const summary = await generateSmartSummary(urlInput, file, language);
        setSummaryResult({ markdownText: summary, language: language });

      } else {
        // Slide Maker (Generates everything at once)
        const deck = await generateSlideDeck(urlInput, file, slideInstructions, language);
        setSlideDeck(deck);
      }
    } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
  };

  const handleCreateVisualization = async () => {
    if (!summaryResult) return;
    
    setVisualLoading(true);
    try {
        const visual = await generateVisualData(summaryResult.markdownText, language);
        setSummaryResult(prev => prev ? { ...prev, visualData: visual } : null);
    } catch (e) {
        console.error(e);
        setError("Failed to generate visualization. Please try again.");
    } finally {
        setVisualLoading(false);
    }
  };

  const saveToDrive = () => {
      if (!summaryResult) return;
      const element = document.createElement("a");
      const file = new Blob([summaryResult.markdownText], {type: 'text/markdown'});
      element.href = URL.createObjectURL(file);
      element.download = `SmartScholar_Summary_${new Date().toISOString().slice(0,10)}.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-3 cursor-pointer" onClick={reset}>
              <ScholarLogo />
              <div className="flex flex-col">
                 <span className="font-serif font-bold text-2xl text-gray-900 tracking-tight">Smart Scholar</span>
                 <span className="text-xs text-scholar-navy font-medium tracking-widest uppercase">Library</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleModeChange(AppMode.SUMMARY)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  mode === AppMode.SUMMARY 
                    ? 'bg-scholar-navy text-white shadow-md' 
                    : 'text-gray-500 hover:text-scholar-navy hover:bg-blue-50'
                }`}
              >
                File Summary
              </button>
              <button
                onClick={() => handleModeChange(AppMode.SLIDE_MAKER)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  mode === AppMode.SLIDE_MAKER 
                    ? 'bg-scholar-navy text-white shadow-md' 
                    : 'text-gray-500 hover:text-scholar-navy hover:bg-blue-50'
                }`}
              >
                Slide Maker
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Input Section */}
        {!summaryResult && !slideDeck && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-10 no-print animate-fade-in-up">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">
                            {mode === AppMode.SUMMARY ? "Analyze & Summarize" : "Generate Presentations"}
                        </h2>
                        <p className="text-gray-500">
                            {mode === AppMode.SUMMARY 
                                ? "Upload a document to get a comprehensive summary in your preferred language." 
                                : "Generate professional slides automatically from your documents."}
                        </p>
                    </div>

                    <div className="flex justify-center mb-6">
                        <div className="inline-flex bg-gray-100 p-1 rounded-lg">
                            <button 
                                onClick={() => handleLanguageChange('ID')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${language === 'ID' ? 'bg-white text-scholar-navy shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                🇮🇩 Bahasa Indonesia
                            </button>
                            <button 
                                onClick={() => handleLanguageChange('EN')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${language === 'EN' ? 'bg-white text-scholar-navy shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                🇺🇸 English
                            </button>
                        </div>
                    </div>

                    <FileUpload 
                        onFileSelect={(f) => setFile(f)} 
                        selectedFileName={file?.name} 
                        accept={mode === AppMode.SUMMARY ? ".pdf,.txt" : ".pdf,.txt,.docx"}
                    />

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">🔗</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Or paste a URL or text content here..."
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-scholar-gold focus:border-scholar-gold sm:text-sm transition shadow-sm"
                        />
                    </div>

                    {mode === AppMode.SLIDE_MAKER && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Instructions (Design, Tone, etc.)</label>
                            <textarea
                                rows={3}
                                className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-scholar-gold focus:border-scholar-gold sm:text-sm shadow-sm"
                                placeholder="e.g., 'Use a modern minimalist style, focus on the financial statistics.'"
                                value={slideInstructions}
                                onChange={(e) => setSlideInstructions(e.target.value)}
                            />
                        </div>
                    )}

                    <button
                        onClick={handleProcess}
                        disabled={loading}
                        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-lg font-medium text-white bg-gradient-to-r from-scholar-navy to-blue-700 hover:from-blue-800 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-scholar-navy disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {language === 'ID' ? 'Sedang Menganalisa...' : 'Analyzing...'}
                            </span>
                        ) : (
                            mode === AppMode.SUMMARY 
                                ? (language === 'ID' ? "Buat Ringkasan" : "Generate Summary") 
                                : (language === 'ID' ? "Buat Slide" : "Create Slides")
                        )}
                    </button>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Results Area */}
        {(summaryResult || slideDeck) && (
            <div className="animate-fade-in-up">
                
                {mode === AppMode.SUMMARY && summaryResult && (
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-6 flex justify-between items-center no-print">
                            <button onClick={reset} className="text-gray-500 hover:text-scholar-navy flex items-center gap-2 text-sm font-medium">
                                ← {language === 'ID' ? 'Kembali' : 'Back'}
                            </button>
                            <div className="flex gap-2">
                                {/* Open PDF Modal instead of immediate print */}
                                <button 
                                    onClick={() => setIsPdfModalOpen(true)} 
                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm flex items-center gap-2 shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 001.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                                    </svg>
                                    Download PDF
                                </button>
                                <button 
                                    onClick={saveToDrive} 
                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm flex items-center gap-2 shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-600">
                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm-1-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fillOpacity="0" />
                                      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.81 4.43l.59 1.61 1.72.11C21.32 12.24 22 13.03 22 14c0 1.66-1.34 3-3 3z" />
                                      <path d="M12 16l4-4h-3V9h-2v3H8l4 4z" />
                                    </svg>
                                    {language === 'ID' ? 'Simpan ke Drive (File)' : 'Save for Drive'}
                                </button>
                            </div>
                        </div>

                        {/* Text Summary Paper */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12 mb-8 print:shadow-none print:border-none print:p-0">
                            <div className="border-b-2 border-scholar-gold mb-8 pb-4 flex justify-between items-end">
                                <div>
                                    <h3 className="text-3xl font-serif font-bold text-gray-900 leading-tight">
                                        {language === 'ID' ? 'Ringkasan Dokumen' : 'Document Summary'}
                                    </h3>
                                    <p className="text-gray-500 text-sm mt-1">Generated by Smart Scholar AI</p>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <span className="text-xs text-gray-400 block">{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            {/* Replaced with reusable component */}
                            <MarkdownRenderer content={summaryResult.markdownText} />
                        </div>

                        {/* Workflow Next Step: Visualizer */}
                        
                        {/* 1. Call to Action / Loading (Hidden on Print) */}
                        <div className="no-print">
                            {!summaryResult.visualData && !visualLoading && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center mt-8">
                                    <h4 className="text-xl font-bold text-scholar-navy mb-2">
                                        {language === 'ID' ? 'Ingin visualisasi lebih dalam?' : 'Want deeper insights?'}
                                    </h4>
                                    <p className="text-gray-600 mb-6">
                                        {language === 'ID' 
                                            ? 'AI dapat mengubah ringkasan di atas menjadi diagram alur atau grafik untuk mempermudah pemahaman.' 
                                            : 'AI can transform the summary above into a flowchart or chart for better understanding.'}
                                    </p>
                                    <button 
                                        onClick={handleCreateVisualization}
                                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-scholar-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-transform transform hover:scale-105"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                                        </svg>
                                        {language === 'ID' ? 'Visualisasikan Intisari' : 'Visualize Insights'}
                                    </button>
                                </div>
                            )}

                            {visualLoading && (
                                <div className="text-center py-12 mt-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scholar-navy mx-auto mb-4"></div>
                                    <p className="text-gray-500">
                                        {language === 'ID' ? 'Sedang membuat diagram...' : 'Creating visualization...'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 2. Visualization Result (Main View) */}
                        {summaryResult.visualData && (
                            <div className="mt-8 animate-fade-in-up">
                                <div className="bg-gradient-to-r from-gray-900 to-scholar-navy rounded-t-xl p-4 text-white flex justify-between items-center print:hidden">
                                    <h4 className="font-bold text-lg">
                                        {language === 'ID' ? 'Visualisasi Data' : 'Data Visualization'}
                                    </h4>
                                </div>
                                <Visualizer data={summaryResult.visualData} />
                            </div>
                        )}
                        
                        {/* PDF Customization Modal */}
                        <PdfCustomizeModal 
                            isOpen={isPdfModalOpen} 
                            onClose={() => setIsPdfModalOpen(false)} 
                            summaryResult={summaryResult} 
                        />
                    </div>
                )}

                {mode === AppMode.SLIDE_MAKER && slideDeck && (
                     <div className="max-w-5xl mx-auto">
                        <div className="mb-6 no-print">
                             <button onClick={reset} className="text-gray-500 hover:text-scholar-navy flex items-center gap-2 text-sm font-medium">
                                ← {language === 'ID' ? 'Kembali' : 'Back'}
                            </button>
                        </div>
                        <SlideRenderer deck={slideDeck} />
                    </div>
                )}
            </div>
        )}

      </main>

      <footer className="bg-white border-t border-gray-200 mt-20 py-8 no-print">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Smart Scholar Library. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
