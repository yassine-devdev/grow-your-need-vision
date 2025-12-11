import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-dark.css'; // or any other theme
import { Icon } from '../../components/shared/ui/CommonUI';

export const CodeEditor: React.FC = () => {
    const [code, setCode] = useState(`// Welcome to the Creative Studio Code Editor
function greeting(name) {
  return "Hello, " + name + "!";
}

console.log(greeting("World"));
`);

    const [language, setLanguage] = useState('javascript');

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e] text-white">
            {/* Toolbar */}
            <div className="h-12 border-b border-[#333] flex items-center px-4 justify-between bg-[#252526]">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-blue-400 font-bold">
                        <Icon name="CodeBracketIcon" className="w-5 h-5" />
                        <span>Code Editor</span>
                    </div>
                    <div className="h-4 w-[1px] bg-[#333]"></div>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-[#333] text-white text-xs rounded px-2 py-1 border border-[#444] focus:outline-none focus:border-blue-500"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-[#333] rounded text-gray-400 hover:text-white" title="Run Code">
                        <Icon name="PlayIcon" className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-[#333] rounded text-gray-400 hover:text-white" title="Settings">
                        <Icon name="CogIcon" className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-auto relative font-mono text-sm">
                <Editor
                    value={code}
                    onValueChange={code => setCode(code)}
                    highlight={code => highlight(code, languages.js, 'javascript')}
                    padding={20}
                    style={{
                        fontFamily: '"Fira Code", "Fira Mono", monospace',
                        fontSize: 14,
                        backgroundColor: '#1e1e1e',
                        minHeight: '100%'
                    }}
                    className="min-h-full"
                />
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-[#007acc] text-white text-xs flex items-center px-4 justify-between">
                <div className="flex gap-4">
                    <span>Ln {code.substring(0, code.length).split('\n').length}, Col 1</span>
                    <span>UTF-8</span>
                </div>
                <div>
                    <span>JavaScript</span>
                </div>
            </div>
        </div>
    );
};
