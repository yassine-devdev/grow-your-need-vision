import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Icon, Modal, EmptyState } from '../../components/shared/ui/CommonUI';
import { marketplaceService, MarketplaceApp } from '../../services/marketplaceService';
import pb from '../../lib/pocketbase';
import { useToast } from '../../hooks/useToast';

export const DeveloperPortal: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { addToast } = useToast();
    const [myApps, setMyApps] = useState<MarketplaceApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitOpen, setIsSubmitOpen] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Marketing');
    const [price, setPrice] = useState('Free');
    const [iconName, setIconName] = useState('CubeIcon');

    const fetchMyApps = async () => {
        setLoading(true);
        try {
            const userId = pb.authStore.model?.id;
            if (userId) {
                const apps = await marketplaceService.getMyApps(userId);
                setMyApps(apps);
            }
        } catch (error) {
            console.error("Failed to fetch my apps", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyApps();
    }, []);

    const handleSubmit = async () => {
        try {
            const userId = pb.authStore.model?.id;
            if (!userId) return;

            await marketplaceService.submitApp({
                name,
                description,
                category,
                price,
                icon: iconName,
                provider: userId,
                rating: 0,
                installs: 0,
                verified: false
            });

            addToast('App submitted for review!', 'success');
            setIsSubmitOpen(false);
            setName('');
            setDescription('');
            fetchMyApps();
        } catch (error) {
            addToast('Failed to submit app', 'error');
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onBack} icon="ArrowLeftIcon">Back to Marketplace</Button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Developer Console</h2>
                        <p className="text-gray-500">Manage your published applications.</p>
                    </div>
                </div>
                <Button variant="primary" icon="PlusCircle" onClick={() => setIsSubmitOpen(true)} className="bg-[#002366] hover:bg-[#001a4d] text-white border-none shadow-md">
                    Submit New App
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                    <div className="text-blue-600 dark:text-blue-400 font-bold mb-1">Total Installs</div>
                    <div className="text-3xl font-black text-gray-800 dark:text-white">
                        {myApps.reduce((acc, app) => acc + (app.installs || 0), 0)}
                    </div>
                </Card>
                <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800">
                    <div className="text-green-600 dark:text-green-400 font-bold mb-1">Active Apps</div>
                    <div className="text-3xl font-black text-gray-800 dark:text-white">
                        {myApps.filter(a => a.verified).length}
                    </div>
                </Card>
                <Card className="p-6 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800">
                    <div className="text-purple-600 dark:text-purple-400 font-bold mb-1">Pending Review</div>
                    <div className="text-3xl font-black text-gray-800 dark:text-white">
                        {myApps.filter(a => !a.verified).length}
                    </div>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 font-bold text-gray-700 dark:text-slate-200">
                    My Applications
                </div>
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : myApps.length === 0 ? (
                    <EmptyState
                        title="No Apps Published"
                        description="You haven't submitted any apps yet. Create one to get started!"
                        icon="CodeBracketIcon"
                        className="py-12"
                    />
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-slate-700">
                        {myApps.map(app => (
                            <div key={app.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                        <Icon name={app.icon as any} className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 dark:text-white">{app.name}</h4>
                                        <div className="text-xs text-gray-500">{app.category} • {app.price}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right mr-4">
                                        <div className="text-sm font-bold text-gray-800 dark:text-white">{app.installs}</div>
                                        <div className="text-xs text-gray-500">Installs</div>
                                    </div>
                                    <Badge variant={app.verified ? 'success' : 'warning'}>
                                        {app.verified ? 'Live' : 'In Review'}
                                    </Badge>
                                    <Button variant="ghost" size="sm" icon="PencilIcon">Edit</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Modal
                isOpen={isSubmitOpen}
                onClose={() => setIsSubmitOpen(false)}
                title="Submit New Application"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">App Name</label>
                        <input 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
                            placeholder="e.g. Analytics Pro"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white min-h-[100px]"
                            placeholder="Describe your application..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                            <select 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
                            >
                                <option>Marketing</option>
                                <option>Finance</option>
                                <option>Productivity</option>
                                <option>Utilities</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Price</label>
                            <select 
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
                            >
                                <option>Free</option>
                                <option>$4.99/mo</option>
                                <option>$9.99/mo</option>
                                <option>$19.99/mo</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Icon Name (HeroIcons)</label>
                        <input 
                            type="text"
                            value={iconName}
                            onChange={(e) => setIconName(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
                            placeholder="e.g. CubeIcon"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setIsSubmitOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleSubmit}>Submit for Review</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
