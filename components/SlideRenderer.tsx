import React, { useState, useRef } from 'react';
import { SlideDeck, Slide } from '../types';
import PptxGenJS from 'pptxgenjs';
import * as htmlToImage from 'html-to-image';

interface SlideRendererProps {
  deck: SlideDeck;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({ deck }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const currentSlideRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => setCurrentIndex(prev => Math.min(prev + 1, deck.slides.length - 1));
  const prevSlide = () => setCurrentIndex(prev => Math.max(prev - 1, 0));

  const currentSlide = deck.slides[currentIndex];
  const accentColor = deck.themeColor || '#1e3a8a';

  // --- Export Functions ---

  const exportToPDF = () => {
    setIsExportMenuOpen(false);
    window.print();
  };

  const exportToPPTX = async () => {
    setIsExportMenuOpen(false);
    const pres = new PptxGenJS();
    
    // Set Metadata
    pres.author = 'Smart Scholar';
    pres.title = deck.slides[0]?.title || 'Presentation';

    // Iterate and create slides
    deck.slides.forEach((slideData) => {
        const slide = pres.addSlide();
        
        // Add Speaker Notes
        if (slideData.speakerNotes) {
            slide.addNotes(slideData.speakerNotes);
        }

        // Add Layout-specific Content
        if (slideData.layout === 'title') {
            // Title Layout
            // Decorative shapes
            slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.2, fill: { color: accentColor.replace('#', '') } });
            
            slide.addText(slideData.title, {
                x: 0.5, y: 2, w: '90%', h: 1.5,
                fontSize: 36, align: 'center', bold: true, color: '1e293b', fontFace: 'Arial'
            });

            if (slideData.bullets && slideData.bullets.length > 0) {
                 slide.addText(slideData.bullets.join('\n'), {
                    x: 1, y: 3.8, w: '80%', h: 2,
                    fontSize: 18, align: 'center', color: '475569', fontFace: 'Arial'
                });
            }
        } else {
            // Content Layout
            // Decorative side bar
            slide.addShape(pres.ShapeType.rect, { x: 0, y: 0.5, w: 0.2, h: 0.8, fill: { color: accentColor.replace('#', '') } });
            
            // Title
            slide.addText(slideData.title, {
                x: 0.5, y: 0.4, w: '90%', h: 0.8,
                fontSize: 24, bold: true, color: '1e293b', fontFace: 'Arial'
            });

            // Bullets
            if (slideData.bullets && slideData.bullets.length > 0) {
                const bullets = slideData.bullets.map(b => ({ text: b, options: { fontSize: 16, bullet: true, color: '334155', breakLine: true } }));
                slide.addText(bullets, {
                    x: 0.5, y: 1.5, w: '90%', h: 4,
                    align: 'left', fontFace: 'Arial', lineSpacing: 30
                });
            }
        }

        // Footer
        slide.addText(`${slideData.footer || 'Smart Scholar'} | ${slideData.id}`, {
            x: 0.5, y: '92%', w: '90%', h: 0.3,
            fontSize: 10, color: '94a3b8'
        });
    });

    await pres.writeFile({ fileName: `SmartScholar_${new Date().toISOString().slice(0,10)}.pptx` });
  };

  const exportCurrentSlideAsImage = async () => {
    setIsExportMenuOpen(false);
    if (!currentSlideRef.current) return;

    try {
        const dataUrl = await htmlToImage.toPng(currentSlideRef.current, { quality: 0.95, backgroundColor: 'white' });
        const link = document.createElement('a');
        link.download = `Slide_${currentSlide.id}_${new Date().getTime()}.png`;
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error("Failed to export image", error);
        alert("Failed to export slide image. Please try again.");
    }
  };


  // --- Render Components ---

  const SlideView = ({ slide, isPreview = false, innerRef }: { slide: Slide; isPreview?: boolean, innerRef?: React.RefObject<HTMLDivElement | null> }) => {
    return (
      <div 
        ref={innerRef}
        className={`bg-white relative overflow-hidden flex flex-col ${isPreview ? 'p-2 text-[6px]' : 'p-12'} shadow-sm border border-gray-200 select-none`}
        style={{ 
          aspectRatio: '16/9', 
          fontFamily: deck.fontStyle || 'Inter'
        }}
      >
        {/* Decorative Element */}
        <div 
            className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-full"
            style={{ backgroundColor: accentColor }}
        />
        <div 
            className="absolute bottom-0 left-0 w-24 h-24 opacity-10 rounded-tr-full"
            style={{ backgroundColor: accentColor }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
            {/* Logo Placeholder */}
            <div className={`flex items-center gap-2 mb-6 opacity-50 ${isPreview ? 'mb-1' : ''}`}>
               <div className={`rounded-full ${isPreview ? 'w-2 h-2' : 'w-6 h-6'}`} style={{ backgroundColor: accentColor }}></div>
               <span className={`font-bold text-gray-400 ${isPreview ? 'hidden' : 'text-sm'}`}>SMART SCHOLAR</span>
            </div>

            {slide.layout === 'title' ? (
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                    <h1 className={`${isPreview ? 'text-xs' : 'text-5xl'} font-bold mb-6 text-gray-900`}>{slide.title}</h1>
                    <div className="w-24 h-1 mb-8" style={{ backgroundColor: accentColor }}></div>
                    <div className={`${isPreview ? 'text-[5px]' : 'text-xl'} text-gray-600`}>
                        {slide.bullets.map((b, i) => <p key={i}>{b}</p>)}
                    </div>
                </div>
            ) : (
                <>
                    <h2 className={`${isPreview ? 'text-[8px]' : 'text-3xl'} font-bold mb-8 text-gray-900 border-l-4 pl-4`} style={{ borderColor: accentColor }}>
                        {slide.title}
                    </h2>
                    <div className="flex-1">
                        <ul className={`list-disc list-inside space-y-3 ${isPreview ? 'space-y-1' : ''}`}>
                            {slide.bullets.map((point, idx) => (
                                <li key={idx} className={`${isPreview ? 'text-[6px]' : 'text-xl'} text-gray-700`}>
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}

            <div className={`mt-auto pt-4 border-t border-gray-100 flex justify-between items-center ${isPreview ? 'hidden' : ''} text-gray-400 text-sm`}>
                 <span>{slide.footer || "Smart Scholar Presentation"}</span>
                 <span>{slide.id} / {deck.slides.length}</span>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8">
      {/* Main Slide Viewer */}
      <div className="max-w-4xl mx-auto relative">
        <div className="mb-4 flex justify-between items-center no-print">
            <h3 className="text-xl font-bold text-gray-800">Slide Preview</h3>
            
            {/* Export Dropdown */}
            <div className="relative">
                <button 
                    onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-scholar-navy text-white rounded-lg hover:bg-blue-800 transition shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Export Options
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>

                {isExportMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden ring-1 ring-black ring-opacity-5 animate-fade-in-up">
                        <div className="py-1">
                            <button onClick={exportToPPTX} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                                <span className="bg-orange-100 text-orange-600 p-1.5 rounded-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                </span>
                                <div>
                                    <span className="block font-medium">PowerPoint (.pptx)</span>
                                    <span className="text-xs text-gray-500">Editable, for Google Slides</span>
                                </div>
                            </button>
                            <button onClick={exportCurrentSlideAsImage} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-t border-gray-50">
                                <span className="bg-purple-100 text-purple-600 p-1.5 rounded-md">
                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                    </svg>
                                </span>
                                <div>
                                    <span className="block font-medium">Current Slide (.png)</span>
                                    <span className="text-xs text-gray-500">High quality image</span>
                                </div>
                            </button>
                             <button onClick={exportToPDF} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-t border-gray-50">
                                <span className="bg-gray-100 text-gray-600 p-1.5 rounded-md">
                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 001.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                                    </svg>
                                </span>
                                <div>
                                    <span className="block font-medium">Save as PDF</span>
                                    <span className="text-xs text-gray-500">Via Print Dialog</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Click overlay to close menu */}
        {isExportMenuOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setIsExportMenuOpen(false)}></div>
        )}

        <div className="shadow-2xl rounded-xl overflow-hidden border border-gray-200 no-print">
            <SlideView slide={currentSlide} innerRef={currentSlideRef} />
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center mt-6 no-print">
            <button 
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 transition"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            
            <div className="flex gap-2 overflow-x-auto p-2 max-w-xl">
                {deck.slides.map((s, idx) => (
                    <button 
                        key={s.id} 
                        onClick={() => setCurrentIndex(idx)}
                        className={`min-w-[80px] w-20 rounded border-2 overflow-hidden transition ${idx === currentIndex ? 'border-scholar-gold ring-2 ring-scholar-gold/30' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                        <SlideView slide={s} isPreview={true} />
                    </button>
                ))}
            </div>

            <button 
                onClick={nextSlide}
                disabled={currentIndex === deck.slides.length - 1}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 transition"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>
        </div>

        {/* Speaker Notes */}
        <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-900 text-sm no-print">
            <span className="font-bold block mb-1">Speaker Notes:</span>
            {currentSlide.speakerNotes}
        </div>
      </div>

      {/* Hidden container for Printing all slides */}
      <div className="hidden print-only">
          {deck.slides.map(slide => (
              <div key={slide.id} className="slide-page">
                   <SlideView slide={slide} />
              </div>
          ))}
      </div>
    </div>
  );
};