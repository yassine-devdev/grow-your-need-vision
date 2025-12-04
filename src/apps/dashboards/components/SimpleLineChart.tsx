import React from 'react';
import { ChartDataPoint } from '../../../services/ownerService';

interface SimpleLineChartProps {
    data: ChartDataPoint[];
    color?: string;
    height?: number | string;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ data, color = '#00F0FF', height = 200 }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => Number(d.value) || 0));
    const minValue = Math.min(...data.map(d => Number(d.value) || 0));
    const range = maxValue - minValue || 1;
    
    // Calculate coordinates
    const coords = data.map((d, i) => {
        const val = Number(d.value) || 0;
        const x = data.length > 1 ? (i / (data.length - 1)) * 100 : 50;
        const y = range > 0 ? 100 - ((val - minValue) / range) * 80 - 10 : 50; // Keep some padding
        return { x, y, val, label: d.label };
    });

    // Generate smooth path (Simple Cubic Bezier)
    const generatePath = (points: {x: number, y: number}[]) => {
        if (points.length === 0) return '';
        if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
        
        let d = `M ${points[0].x},${points[0].y}`;
        
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            
            const cp1x = p0.x + (p1.x - p0.x) / 2;
            const cp1y = p0.y;
            const cp2x = p0.x + (p1.x - p0.x) / 2;
            const cp2y = p1.y;
            
            d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
        }
        return d;
    };

    const pathD = generatePath(coords);
    const areaD = `${pathD} L 100,100 L 0,100 Z`;

    return (
        <div className="w-full relative group flex flex-col" style={{ height }}>
            <div className="flex-1 min-h-0 w-full relative">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                            <stop offset="50%" stopColor={color} stopOpacity="0.1" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-200/10 dark:text-white/5" />
                        </pattern>
                    </defs>

                    {/* Background Grid */}
                    <rect width="100" height="100" fill="url(#grid)" />

                    {/* Horizontal Guides */}
                    {[20, 50, 80].map(y => (
                        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="currentColor" strokeDasharray="2,2" className="text-gray-300/20 dark:text-white/10" strokeWidth="0.2" />
                    ))}

                    {/* Area Fill */}
                    <path d={areaD} fill="url(#chartGradient)" className="transition-all duration-500 ease-in-out" />

                    {/* The Line */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke={color}
                        strokeWidth="1.5"
                        filter="url(#glow)"
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-all duration-500 ease-in-out"
                    />

                    {/* Interactive Points */}
                    {coords.map((p, i) => (
                        <g key={i} className="group/point">
                            {/* Invisible hit area */}
                            <circle cx={p.x} cy={p.y} r="4" fill="transparent" className="cursor-pointer" />
                            
                            {/* Visible Dot */}
                            <circle 
                                cx={p.x} 
                                cy={p.y} 
                                r="1.5" 
                                fill="#fff" 
                                stroke={color} 
                                strokeWidth="1" 
                                className="opacity-0 group-hover/point:opacity-100 transition-opacity duration-200 shadow-[0_0_10px_currentColor]" 
                            />
                            
                            {/* Tooltip */}
                            <foreignObject x={p.x - 15} y={p.y - 25} width="30" height="20" className="overflow-visible opacity-0 group-hover/point:opacity-100 transition-all duration-200 z-50 pointer-events-none">
                                <div className="flex flex-col items-center">
                                    <div className="bg-black/80 backdrop-blur-md border border-white/20 text-white text-[8px] px-2 py-1 rounded-md shadow-xl whitespace-nowrap font-mono">
                                        <span className="text-hud-primary font-bold">{p.val}</span>
                                    </div>
                                    <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[3px] border-t-black/80"></div>
                                </div>
                            </foreignObject>
                        </g>
                    ))}
                </svg>
            </div>
            
            {/* X-Axis Labels */}
            <div className="flex justify-between mt-2 px-1 shrink-0">
                {coords.map((d, i) => (
                    <span key={i} className="text-[10px] font-mono text-gray-400 dark:text-hud-primary/50 uppercase tracking-wider">{d.label}</span>
                ))}
            </div>
        </div>
    );
};
