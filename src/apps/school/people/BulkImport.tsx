import React, { useState, useRef } from 'react';
import { Modal } from '../../../components/shared/ui/CommonUI';
import { Button } from '../../../components/shared/ui/Button';
import pb from '../../../lib/pocketbase';

interface BulkImportProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    role: string;
}

export const BulkImport: React.FC<BulkImportProps> = ({ isOpen, onClose, onSuccess, role }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };

    const parseCSV = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            
            const data = lines.slice(1).filter(l => l.trim()).map(line => {
                const values = line.split(',');
                const obj: any = {};
                headers.forEach((h, i) => {
                    obj[h] = values[i]?.trim();
                });
                return obj;
            });
            setPreview(data);
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (!preview.length) return;
        setUploading(true);
        setLogs([]);

        let successCount = 0;
        let failCount = 0;

        for (const row of preview) {
            try {
                // Basic validation
                if (!row.email || !row.name) {
                    setLogs(prev => [...prev, `Skipped: Missing email or name for row`]);
                    failCount++;
                    continue;
                }

                // Create user
                await pb.collection('users').create({
                    email: row.email,
                    name: row.name,
                    password: 'password123', // Default password
                    passwordConfirm: 'password123',
                    role: role,
                    emailVisibility: true,
                    verified: true
                });
                
                setLogs(prev => [...prev, `✅ Created: ${row.email}`]);
                successCount++;
            } catch (err: any) {
                setLogs(prev => [...prev, `❌ Failed: ${row.email} - ${err.message}`]);
                failCount++;
            }
        }

        setUploading(false);
        if (successCount > 0) {
            onSuccess();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Bulk Import ${role}s`} size="lg">
            <div className="space-y-4">
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".csv" 
                        onChange={handleFileChange} 
                    />
                    <div className="space-y-2">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="text-sm text-gray-600">
                            {file ? (
                                <span className="font-semibold text-indigo-600">{file.name}</span>
                            ) : (
                                <span>Click to upload CSV</span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">CSV format: name, email</p>
                    </div>
                </div>

                {preview.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {Object.keys(preview[0]).map(h => (
                                        <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {preview.slice(0, 5).map((row, i) => (
                                    <tr key={i}>
                                        {Object.values(row).map((v: any, j) => (
                                            <td key={j} className="px-3 py-2 text-sm text-gray-900">{v}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {preview.length > 5 && <div className="p-2 text-center text-xs text-gray-500">...and {preview.length - 5} more rows</div>}
                    </div>
                )}

                {logs.length > 0 && (
                    <div className="bg-gray-900 text-green-400 p-3 rounded-md text-xs font-mono max-h-40 overflow-y-auto">
                        {logs.map((log, i) => <div key={i}>{log}</div>)}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button 
                        variant="primary" 
                        onClick={handleImport} 
                        disabled={!file || uploading}
                        isLoading={uploading}
                    >
                        Import {preview.length} Users
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
