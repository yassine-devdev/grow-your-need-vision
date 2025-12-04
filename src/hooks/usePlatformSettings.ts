import { useState, useEffect } from 'react';
import pb from '../lib/pocketbase';

export interface PlatformConfig {
    id: string;
    key: string;
    value: any;
    description: string;
    category: string;
}

export const usePlatformSettings = (category: string) => {
    const [settings, setSettings] = useState<PlatformConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                // Try to fetch from 'platform_settings' collection
                try {
                    const records = await pb.collection('platform_settings').getList(1, 50, {
                        filter: `category = "${category}"`,
                    });
                    
                    if (records.items.length > 0) {
                        setSettings(records.items.map((item: any) => ({
                            id: item.id,
                            key: item.key,
                            value: item.value,
                            description: item.description,
                            category: item.category
                        })));
                        setLoading(false);
                        return;
                    }
                } catch (err) {
                    // Collection might not exist
                }

                // Fallback: Seed Data if empty
                const defaultSettings: Partial<PlatformConfig>[] = [
                    { key: `enable_${category.toLowerCase()}_feature_1`, value: true, description: `Enable primary ${category} feature`, category },
                    { key: `enable_${category.toLowerCase()}_feature_2`, value: false, description: `Enable beta ${category} feature`, category },
                    { key: `${category.toLowerCase()}_api_url`, value: 'https://api.growyourneed.com/v1', description: 'External API Endpoint', category },
                ];

                // Attempt to seed
                const seeded: PlatformConfig[] = [];
                try {
                    for (const setting of defaultSettings) {
                        const record = await pb.collection('platform_settings').create(setting);
                        seeded.push({
                            id: record.id,
                            key: record.key,
                            value: record.value,
                            description: record.description,
                            category: record.category
                        });
                    }
                } catch (e) {
                    console.warn("Failed to seed settings (likely permissions or schema missing), using memory-only:", e);
                }
                
                if (seeded.length > 0) {
                    setSettings(seeded);
                } else {
                     // If seeding fails, fall back to memory-only
                     setSettings(defaultSettings.map((s, i) => ({ ...s, id: `local-fallback-${i}` } as PlatformConfig)));
                }

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [category]);

    const updateSetting = async (id: string, value: any) => {
        try {
            // If it's a real record (has valid ID length usually > 5 for PB)
            if (id.length > 5) {
                await pb.collection('platform_settings').update(id, { value });
            }
            // Update local state
            setSettings(prev => prev.map(s => s.id === id ? { ...s, value } : s));
        } catch (err) {
            console.error("Failed to update setting", err);
            throw err;
        }
    };

    return { settings, loading, error, updateSetting };
};
