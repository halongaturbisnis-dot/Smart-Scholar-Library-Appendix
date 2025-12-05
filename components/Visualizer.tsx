
import React from 'react';
import { VisualData, VisualType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface VisualizerProps {
  data: VisualData;
  themeColor?: string;
}

export const Visualizer: React.FC<VisualizerProps> = ({ data, themeColor = '#1e3a8a' }) => {
  if (data.type === VisualType.NONE) return null;

  // Derive secondary color (gold/yellow usually, but adaptable if we wanted)
  const secondaryColor = '#fbbf24'; 

  return (
    <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-100 print:break-inside-avoid print:shadow-none print:border-2 print:mt-4 print:p-0 print:border-none">
      <div className="flex justify-between items-center mb-6 border-b pb-2" style={{ borderColor: themeColor }}>
        <h3 className="text-xl font-bold" style={{ color: themeColor }}>
          {data.title || "Visual Framework"}
        </h3>
        <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded print:hidden">
            Generated Diagram
        </div>
      </div>

      {data.type === VisualType.CHART && data.chartData && (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="value" name={data.chartLabel || "Value"} radius={[4, 4, 0, 0]}>
                 {data.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? themeColor : secondaryColor} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Improved Flowchart/Process Design */}
      {data.type === VisualType.PROCESS && data.steps && (
        <div className="relative py-4">
            {/* Connecting Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-100 -ml-0.5 hidden md:block print:block"></div>
            
            <div className="space-y-8 relative">
                {data.steps.map((step, idx) => (
                    <div key={idx} className={`flex items-center w-full ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse md:flex-row-reverse print:flex-row-reverse'}`}>
                        {/* Content Box */}
                        <div className="w-full md:w-5/12 print:w-5/12">
                             <div 
                                className={`p-5 bg-white rounded-xl border-t-4 shadow-md print:shadow-none print:border hover:shadow-lg transition-shadow duration-300 relative ${idx % 2 === 0 ? 'text-right' : 'text-left'}`}
                                style={{ borderColor: idx % 2 === 0 ? themeColor : secondaryColor }}
                             >
                                <h4 className="text-lg font-bold text-gray-900">{step.title}</h4>
                                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{step.description}</p>
                                {/* Arrow pointer */}
                                <div 
                                    className={`absolute top-1/2 -mt-2 w-4 h-4 bg-white rotate-45 border-t border-r hidden md:block print:block ${idx % 2 === 0 ? '-right-2' : '-left-2'}`}
                                    style={{ borderColor: idx % 2 === 0 ? themeColor : secondaryColor }}
                                ></div>
                             </div>
                        </div>

                        {/* Center Circle */}
                        <div className="w-2/12 flex justify-center hidden md:flex print:flex relative z-10">
                            <div 
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-sm ring-4 ring-white`}
                                style={{ backgroundColor: idx % 2 === 0 ? themeColor : secondaryColor }}
                            >
                                {step.step}
                            </div>
                        </div>

                        {/* Spacer for alternating layout */}
                        <div className="w-5/12 hidden md:block print:block"></div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};
