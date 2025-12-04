import React, { useState, useEffect } from 'react';
import { Card, Button, Icon, Badge } from '../../components/shared/ui/CommonUI';

export const AIDevelopment: React.FC = () => {
    const [model, setModel] = useState('qwen2.5:1.5b');
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(4096);
    const [systemPrompt, setSystemPrompt] = useState("Dynamic Role-Based System Prompt (See useChat.ts)");

    return (
        <div className="space-y-6 animate-fadeIn h-full flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Model Configuration */}
                <Card className="p-6">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <Icon name="AdjustmentsHorizontalIcon" className="w-5 h-5 text-purple-500" />
                        Model Parameters
                    </h3>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Active Model</label>
                            <select 
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm"
                            >
                                <option value="qwen2.5:1.5b">Open WebUI (Qwen 2.5 1.5B)</option>
                                <option value="llama3">Open WebUI (Llama 3)</option>
                                <option value="gpt-4-turbo">OpenAI (GPT-4 Turbo)</option>
                                <option value="local">Local Intelligence (Fallback)</option>
                            </select>
                            <p className="text-[10px] text-gray-400 mt-1">
                                {model.includes('qwen') || model.includes('llama') 
                                    ? 'Running via Docker Container (Port 3000)' 
                                    : 'External API or Local Logic'}
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Temperature</label>
                                <span className="text-xs font-mono text-gray-400">{temperature}</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.1" 
                                value={temperature}
                                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                className="w-full accent-purple-500" 
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Max Tokens</label>
                                <span className="text-xs font-mono text-gray-400">{maxTokens}</span>
                            </div>
                            <input 
                                type="range" 
                                min="256" 
                                max="8192" 
                                step="256" 
                                value={maxTokens}
                                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                                className="w-full accent-purple-500" 
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">System Prompt Strategy</label>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-300">
                                <p className="mb-2"><strong>Current Strategy:</strong> Role-Based Injection</p>
                                <p>The system automatically injects context based on the user's role (Owner, Student, Teacher, etc.) and the current page.</p>
                                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <code className="text-[10px] font-mono text-purple-600 dark:text-purple-400">
                                        [PROJECT KNOWLEDGE] + [ROLE INSTRUCTIONS] + [USER QUERY]
                                    </code>
                                </div>
                            </div>
                        </div>

                        <Button variant="primary" className="w-full">Save Configuration</Button>
                    </div>
                </Card>

                {/* Fine-Tuning & Logs */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card className="flex-1 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="font-bold text-gray-800 dark:text-white">Fine-Tuning Jobs</h3>
                            <Button size="sm" variant="outline" icon="PlusIcon">New Job</Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-2">Job ID</th>
                                        <th className="px-4 py-2">Base Model</th>
                                        <th className="px-4 py-2">Status</th>
                                        <th className="px-4 py-2">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {[
                                        { id: 'ft-job-8821', model: 'qwen2.5:0.5b', status: 'Succeeded', date: '2 days ago' },
                                        { id: 'ft-job-1102', model: 'qwen2.5:1.5b', status: 'Running', date: '1 hour ago' },
                                    ].map((job, i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{job.id}</td>
                                            <td className="px-4 py-3 text-gray-800 dark:text-white">{job.model}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={job.status === 'Succeeded' ? 'success' : job.status === 'Running' ? 'warning' : 'danger'}>
                                                    {job.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">{job.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card className="h-64 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="font-bold text-gray-800 dark:text-white">Live API Logs (Open WebUI)</h3>
                            <div className="flex gap-2">
                                <span className="flex items-center gap-1 text-xs text-green-500 font-bold animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Live
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 bg-[#0d1117] font-mono text-xs">
                            {[
                                { time: '10:42:01', method: 'POST', path: '/api/chat', status: 200, latency: '450ms' },
                                { time: '10:42:05', method: 'POST', path: '/api/tags', status: 200, latency: '120ms' },
                                { time: '10:42:12', method: 'GET', path: '/api/models', status: 200, latency: '80ms' },
                            ].map((log, i) => (
                                <div key={i} className="flex gap-4 mb-1 border-b border-gray-800 pb-1 last:border-0">
                                    <span className="text-gray-500">{log.time}</span>
                                    <span className="text-purple-400 font-bold">{log.method}</span>
                                    <span className="text-gray-300 flex-1">{log.path}</span>
                                    <span className={log.status === 200 ? 'text-green-400' : 'text-red-400'}>{log.status}</span>
                                    <span className="text-gray-500">{log.latency}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
