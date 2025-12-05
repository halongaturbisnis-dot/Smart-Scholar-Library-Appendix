
import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div 
        className={`prose prose-blue max-w-none text-gray-700 leading-relaxed ${className}`}
        dangerouslySetInnerHTML={{ 
            // Basic markdown-to-html conversion for bolding and headers
            __html: content
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold bg-yellow-50 px-1 rounded border-b border-yellow-200" style="color: inherit; border-color: currentColor; background-color: rgba(255,255,0,0.1);">$1</strong>')
                .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 text-gray-900 border-b pb-2">$1</h1>')
                .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-8 mb-4 uppercase tracking-wide" style="color: var(--tw-prose-headings);">$1</h2>')
                .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-6 mb-2 text-gray-800">$1</h3>')
                .replace(/\n/g, '<br />')
                .replace(/- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
        }} 
    />
  );
};
