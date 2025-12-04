
import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Icon } from '../components/shared/ui/CommonUI';
import { useChat } from '../hooks/useChat';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { aiService } from '../services/aiService';
import { AIOperations } from './concierge_ai/AIOperations';
import { AIDevelopment } from './concierge_ai/AIDevelopment';
import { AIAnalytics } from './concierge_ai/AIAnalytics';
import { AIStrategy } from './concierge_ai/AIStrategy';
import { AISettings } from './concierge_ai/AISettings';

interface ConciergeAIProps {
  activeTab: string;
  activeSubNav: string;
}

interface SystemStats {
    latency: string;
    error_rate: string;
    load: string;
    tokens_total: string;
    tokens_input: string;
    tokens_output: string;
    provider?: string;
}

const ConciergeAI: React.FC<ConciergeAIProps> = ({ activeTab, activeSubNav }) => {
  const { messages, sendMessage, isLoading } = useChat(`User is currently viewing ${activeTab} > ${activeSubNav}`);
  const [input, setInput] = useState('');
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition();
  const { speak, cancel, speaking } = useSpeechSynthesis();
  
  const [stats, setStats] = useState<SystemStats>({
      latency: '--', error_rate: '--', load: '--', 
      tokens_total: '0', tokens_input: '0', tokens_output: '0',
      provider: 'Loading...'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (transcript) {
        setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
      const fetchStats = async () => {
          try {
              const data = await aiService.getSystemStats();
              setStats({
                  latency: data.latency || '24ms',
                  error_rate: data.error_rate || '0.0%',
                  load: data.load || 'Low',
                  tokens_total: data.tokens_total || '0',
                  tokens_input: data.tokens_input || '0',
                  tokens_output: data.tokens_output || '0',
                  provider: data.provider || 'OpenAI'
              });
          } catch (err) {
              console.error("Failed to fetch AI stats:", err);
              setStats(prev => ({ ...prev, provider: 'OFFLINE' }));
          }
      };
      fetchStats();
  }, []);

  const handleSendMessage = async () => {
      if (!input.trim()) return;
      await sendMessage(input);
      setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
      }
  };

  return (
    <div className="w-full h-full flex flex-col text-gray-800 dark:text-white">
       {/* Holographic Header Card */}
       <div className="bg-[#050510] dark:bg-black relative rounded-2xl p-8 mb-6 shadow-2xl overflow-hidden border border-white/10 group">
           {/* Animated Background Mesh */}
           <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600 rounded-full mix-blend-screen filter blur-[80px] opacity-20"></div>
           </div>
           
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
               <div>
                   <h1 className="text-4xl font-black mb-2 flex items-center gap-3 text-white tracking-tight">
                       <Icon name="Sparkles" className="w-10 h-10 text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-orange-500" />
                       <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-400">Concierge AI</span>
                   </h1>
                   <p className="text-gray-400 max-w-xl text-sm font-medium">
                       Central intelligence hub. Configure models, monitor performance, and train the platform assistant.
                   </p>
               </div>
               <div className="flex items-center gap-6">
                   <div className="text-right hidden md:block border-r border-white/10 pr-6">
                       <div className="text-[10px] font-mono text-purple-400 mb-1 uppercase tracking-widest">Active Provider</div>
                       <div className="font-bold text-xl text-white font-machina uppercase">{stats.provider || 'OFFLINE'}</div>
                   </div>
                   <div className="text-center">
                       <div className="w-16 h-16 rounded-full border-2 border-purple-500/30 flex items-center justify-center relative">
                           <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping"></div>
                           <Icon name="CpuChipIcon" className="w-8 h-8 text-purple-400" />
                       </div>
                   </div>
               </div>
           </div>
       </div>

       {activeSubNav === 'Operations' ? (
           <AIOperations />
       ) : activeSubNav === 'Development' ? (
           <AIDevelopment />
       ) : activeSubNav === 'Analytics' ? (
           <AIAnalytics />
       ) : activeSubNav === 'Strategy' ? (
           <AIStrategy />
       ) : activeSubNav === 'Settings' ? (
           <AISettings />
       ) : (
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
           {/* Left Panel: Console */}
           <Card className="lg:col-span-2 flex flex-col overflow-hidden relative p-0">
                <div className="p-4 border-b border-gray-200/50 dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-white/80 to-transparent dark:from-slate-800/80">
                    <h3 className="font-bold text-gyn-blue-dark dark:text-blue-400 flex items-center gap-2">
                        <Icon name="CommandLineIcon" className="w-4 h-4 text-gray-400" />
                        {activeTab} - {activeSubNav || 'Console'}
                    </h3>
                    <span className="px-3 py-1 bg-green-100/50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full shadow-sm">
                        System Operational
                    </span>
                </div>
                
                {/* Chat Interface */}
                <div className="flex-1 bg-gradient-to-b from-gray-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-800/50 p-6 overflow-y-auto space-y-6">
                    {/* Context Banner */}
                    {activeSubNav && activeSubNav !== 'Assistant' && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-4">
                            <Icon name="InformationCircle" className="w-4 h-4" />
                            <span>Context set to <strong>{activeSubNav}</strong>. AI responses will be tailored to this domain.</span>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 group ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg ${
                                msg.role === 'user' 
                                ? 'bg-gradient-to-br from-gyn-blue-dark to-black dark:from-blue-600 dark:to-blue-900' 
                                : 'bg-gradient-to-br from-purple-600 to-indigo-600 shadow-purple-500/20'
                            }`}>
                                {msg.role === 'user' ? (
                                    <span className="text-xs font-bold font-mono">ADM</span>
                                ) : (
                                    <Icon name="Sparkles" className="w-5 h-5" />
                                )}
                            </div>
                            <div className={`p-4 rounded-2xl shadow-md max-w-lg text-sm leading-relaxed ${
                                msg.role === 'user'
                                ? 'bg-gyn-blue-dark text-white rounded-tr-none border border-blue-900 dark:bg-blue-700 dark:border-blue-600'
                                : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-tl-none border border-gray-100 dark:border-slate-600 shadow-neu-flat'
                            }`}>
                                {msg.content}
                                {msg.role !== 'user' && (
                                    <div className="mt-2 flex justify-end border-t border-gray-100 dark:border-slate-600 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => speak(msg.content)}
                                            className="p-1 text-gray-400 hover:text-purple-600 transition-colors rounded-full hover:bg-purple-50 dark:hover:bg-slate-600"
                                            title="Read aloud"
                                        >
                                            <Icon name="SpeakerWaveIcon" className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/20">
                                <Icon name="Sparkles" className="w-5 h-5 animate-pulse" />
                            </div>
                            <div className="bg-white dark:bg-slate-700 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-slate-600 shadow-neu-flat text-sm text-gray-500 dark:text-slate-400 italic">
                                Processing...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white/80 dark:bg-slate-800/80 border-t border-gray-200/50 dark:border-slate-700 backdrop-blur-sm">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isListening ? "Listening..." : "Type a command or query..."}
                            className={`w-full pl-5 pr-24 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-0 relative z-10 shadow-inner font-medium text-gray-700 dark:text-slate-200 placeholder-gray-400 ${isListening ? 'animate-pulse border-red-400' : ''}`}
                            disabled={isLoading}
                        />
                        <div className="absolute right-2 top-2 bottom-2 flex gap-2 z-20">
                            {isSupported && (
                                <button
                                    onClick={isListening ? stopListening : startListening}
                                    className={`aspect-square rounded-lg transition-colors flex items-center justify-center shadow-md ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
                                    title="Voice Input"
                                >
                                    <Icon name="MicrophoneIcon" className="w-5 h-5" />
                                </button>
                            )}
                            <button 
                                onClick={handleSendMessage}
                                disabled={isLoading}
                                className="aspect-square bg-gyn-blue-dark dark:bg-blue-600 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Icon name="ArrowRightIcon" className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
           </Card>

           {/* Right Panel: Stats - Glass Panels */}
           <div className="flex flex-col gap-6">
               <Card className="p-6 flex-1">
                    <h3 className="font-bold text-gyn-blue-dark dark:text-blue-400 mb-4 text-sm uppercase tracking-wider">Token Usage</h3>
                    <div className="h-40 bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-xl border border-gray-200/50 dark:border-slate-600 shadow-inner flex items-center justify-center relative overflow-hidden">
                        <svg className="absolute inset-0 w-full h-full text-purple-100 dark:text-purple-900/20" viewBox="0 0 100 100" preserveAspectRatio="none">
                             <path d="M0 80 C 20 70, 40 90, 60 50 S 80 20, 100 40 L 100 100 L 0 100 Z" fill="currentColor"/>
                        </svg>
                        <div className="relative z-10 text-center">
                            <span className="text-3xl font-black text-gyn-blue-dark dark:text-white">{stats.tokens_total}</span>
                            <div className="text-[10px] font-bold text-gray-400 uppercase mt-1">Total Tokens</div>
                        </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-3">
                         <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 rounded-lg text-center">
                             <div className="text-[9px] font-bold text-blue-400 uppercase">Input</div>
                             <div className="text-sm font-bold text-blue-700 dark:text-blue-300">{stats.tokens_input}</div>
                         </div>
                         <div className="bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-3 rounded-lg text-center">
                             <div className="text-[9px] font-bold text-purple-400 uppercase">Output</div>
                             <div className="text-sm font-bold text-purple-700 dark:text-purple-300">{stats.tokens_output}</div>
                         </div>
                    </div>
               </Card>
               
               <Card className="p-6">
                    <h3 className="font-bold text-gyn-blue-dark dark:text-blue-400 mb-4 text-sm uppercase tracking-wider">System Health</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Latency', val: stats.latency, color: 'bg-green-500' },
                            { label: 'Error Rate', val: stats.error_rate, color: 'bg-blue-500' },
                            { label: 'Load', val: stats.load, color: 'bg-yellow-500' }
                        ].map(m => (
                            <div key={m.label} className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-slate-400">
                                    <span>{m.label}</span>
                                    <span>{m.val}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                                    <div className={`h-full rounded-full ${m.color} shadow-[0_0_10px_rgba(0,0,0,0.2)]`} style={{width: '70%'}}></div>
                                </div>
                            </div>
                        ))}
                    </div>
               </Card>
           </div>
       </div>
       )}
    </div>
  );
};

export default ConciergeAI;
