import React, { useState, useRef } from 'react';
import { Icon } from '../../components/shared/ui/CommonUI';

export const OfficeSuite: React.FC = () => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [content, setContent] = useState('<h1>Welcome to the Office Suite</h1><p>Start typing your document here...</p>');

    const execCommand = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            editorRef.current.focus();
        }
    };

    const handleInput = () => {
        if (editorRef.current) {
            setContent(editorRef.current.innerHTML);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white">
            {/* Toolbar */}
            <div className="h-12 border-b border-gray-200 dark:border-[#333] flex items-center px-4 gap-2 bg-gray-50 dark:bg-[#252526]">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mr-4">
                    <Icon name="DocumentTextIcon" className="w-5 h-5" />
                    <span>Office Suite</span>
                </div>

                <div className="h-6 w-[1px] bg-gray-300 dark:bg-[#444] mx-2"></div>

                <div className="flex items-center gap-1">
                    <button onClick={() => execCommand('bold')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#333] rounded" title="Bold">
                        <span className="font-bold">B</span>
                    </button>
                    <button onClick={() => execCommand('italic')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#333] rounded" title="Italic">
                        <span className="italic">I</span>
                    </button>
                    <button onClick={() => execCommand('underline')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#333] rounded" title="Underline">
                        <span className="underline">U</span>
                    </button>
                </div>

                <div className="h-6 w-[1px] bg-gray-300 dark:bg-[#444] mx-2"></div>

                <div className="flex items-center gap-1">
                    <button onClick={() => execCommand('justifyLeft')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#333] rounded" title="Align Left">
                        <Icon name="Bars3BottomLeft" className="w-4 h-4" />
                    </button>
                    <button onClick={() => execCommand('justifyCenter')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#333] rounded" title="Align Center">
                        <Icon name="Bars3" className="w-4 h-4" />
                    </button>
                    <button onClick={() => execCommand('justifyRight')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#333] rounded" title="Align Right">
                        <Icon name="Bars3BottomRight" className="w-4 h-4" />
                    </button>
                </div>

                <div className="h-6 w-[1px] bg-gray-300 dark:bg-[#444] mx-2"></div>

                <div className="flex items-center gap-1">
                    <button onClick={() => execCommand('insertUnorderedList')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#333] rounded" title="Bullet List">
                        <Icon name="ListBullet" className="w-4 h-4" />
                    </button>
                    <button onClick={() => execCommand('insertOrderedList')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#333] rounded" title="Numbered List">
                        <span className="font-bold text-xs">1.</span>
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-[#121212] p-8 flex justify-center">
                <div
                    ref={editorRef}
                    className="w-full max-w-[816px] min-h-[1056px] bg-white text-black p-[96px] shadow-lg outline-none"
                    contentEditable
                    onInput={handleInput}
                    dangerouslySetInnerHTML={{ __html: content }}
                    style={{
                        fontFamily: '"Times New Roman", Times, serif',
                        fontSize: '12pt',
                        lineHeight: '1.5'
                    }}
                />
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-gray-200 dark:bg-[#007acc] text-gray-600 dark:text-white text-xs flex items-center px-4 justify-between">
                <div className="flex gap-4">
                    <span>Page 1 of 1</span>
                    <span>{content.replace(/<[^>]*>/g, '').length} characters</span>
                </div>
                <div>
                    <span>English (US)</span>
                </div>
            </div>
        </div>
    );
};
