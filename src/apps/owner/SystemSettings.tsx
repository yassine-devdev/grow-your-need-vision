import React, { useEffect, useState } from 'react';
import { ownerService, SystemSetting, JsonValue } from '../../services/ownerService';
import { Button, Card, Icon } from '../../components/shared/ui/CommonUI';
import { LoadingScreen } from '../../components/shared/LoadingScreen';

type JsonObject = { [key: string]: JsonValue };

export const SystemSettings: React.FC = () => {
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await ownerService.getSystemSettings();
            setSettings(data);
        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (setting: SystemSetting, key: string) => {
        if (typeof setting.value !== 'object' || setting.value === null || Array.isArray(setting.value)) {
            return;
        }

        const currentValue = setting.value as JsonObject;
        const newValue = { ...currentValue, [key]: !currentValue[key] };
        try {
            await ownerService.updateSystemSetting(setting.id, newValue);
            setSettings(settings.map(s => s.id === setting.id ? { ...s, value: newValue } : s));
        } catch (error) {
            console.error("Failed to update setting", error);
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">System Configuration</h2>
            </div>

            {settings.map(setting => (
                <Card key={setting.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{setting.key.replace('_', ' ')}</h3>
                            <p className="text-sm text-gray-500">{setting.description}</p>
                        </div>
                        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500">{setting.category}</span>
                    </div>

                    <div className="space-y-4">
                        {(typeof setting.value === 'object' && setting.value !== null && !Array.isArray(setting.value)) && 
                            Object.entries(setting.value as JsonObject).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{key.replace('_', ' ')}</span>
                                {typeof val === 'boolean' ? (
                                    <button
                                        onClick={() => handleToggle(setting, key)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${val ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${val ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                ) : (
                                    <span className="text-sm text-gray-500">{String(val)}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            ))}
        </div>
    );
};
