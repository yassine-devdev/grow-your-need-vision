import React, { useState, useEffect } from 'react';
import { Card, Button, Icon, Badge } from '../../components/shared/ui/CommonUI';
import { marketingService, Campaign } from '../../services/marketingService';
import { CreateCampaignModal } from '../../components/marketing/CreateCampaignModal';
import { AssetLibrary } from '../../components/marketing/AssetLibrary';
import { EmailTemplateManager } from '../../components/marketing/EmailTemplateManager';
import { AudienceManager } from '../../components/marketing/AudienceManager';
import { AICampaignGenerator } from '../../components/marketing/AICampaignGenerator';
import { JourneyBuilder } from '../../components/marketing/JourneyBuilder';
import { MarketingPlaceholder } from '../../components/marketing/MarketingPlaceholder';
import { PersonalizationEngine } from '../../components/marketing/PersonalizationEngine';
import { ABTesting } from '../../components/marketing/ABTesting';
import { CDP } from '../../components/marketing/CDP';
import { PredictiveScoring } from '../../components/marketing/PredictiveScoring';
import { SocialScheduler } from '../../components/marketing/SocialScheduler';
import { CreativeStudio } from '../../components/marketing/CreativeStudio';
import { AttributionAnalyzer } from '../../components/marketing/AttributionAnalyzer';
import { ExperimentationLab } from '../../components/marketing/ExperimentationLab';

interface MarketingDashboardProps {
    activeSubNav?: string;
}

export const MarketingDashboard: React.FC<MarketingDashboardProps> = ({ activeSubNav = 'Campaigns' }) => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchCampaigns = async () => {
        setLoading(true);
        const data = await marketingService.getCampaigns();
        setCampaigns(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleCreateCampaign = async (data: Partial<Campaign>) => {
        await marketingService.createCampaign(data);
        await fetchCampaigns();
    };

    // Campaigns View Component
    const CampaignsView = () => (
        <div className="space-y-6">
            {/* Marketing Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                        <Icon name="MegaphoneIcon" className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-800 dark:text-white">{campaigns.filter(c => c.status === 'Active').length}</div>
                        <div className="text-xs text-gray-500 uppercase font-bold">Active Campaigns</div>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                        <Icon name="CurrencyDollarIcon" className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-800 dark:text-white">
                            ${campaigns.reduce((acc, c) => acc + (c.spent || 0), 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 uppercase font-bold">Total Spend</div>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <Icon name="ArrowTrendingUpIcon" className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-800 dark:text-white">
                            {(campaigns.length > 0 ? campaigns.reduce((acc, c) => acc + (c.performance_score || 0), 0) / campaigns.length : 0).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500 uppercase font-bold">Avg Performance</div>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                        <Icon name="UserGroupIcon" className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-800 dark:text-white">
                            {campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 uppercase font-bold">Total Reach</div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-3 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                        <h3 className="font-bold text-gray-800 dark:text-white">Recent Campaigns</h3>
                        <Button size="sm" variant="primary" icon="PlusCircle" onClick={() => setIsModalOpen(true)} className="bg-[#002366] hover:bg-[#001a4d] text-white border-none shadow-md">New Campaign</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3">Campaign Name</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Budget</th>
                                    <th className="px-6 py-3">Spent</th>
                                    <th className="px-6 py-3">Performance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-4 text-center text-gray-500">Loading campaigns...</td></tr>
                                ) : campaigns.length === 0 ? (
                                    <tr><td colSpan={5} className="p-4 text-center text-gray-500">No campaigns found. Create one to get started.</td></tr>
                                ) : campaigns.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">{c.name}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={c.status === 'Active' ? 'success' : c.status === 'Scheduled' ? 'warning' : 'default'}>
                                                {c.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">${c.budget.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">${c.spent.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${c.performance_score > 80 ? 'bg-green-500' : c.performance_score > 50 ? 'bg-yellow-500' : 'bg-gray-400'}`} style={{ width: `${c.performance_score}%` }}></div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-500">{c.performance_score}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <CreateCampaignModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleCreateCampaign}
            />
        </div>
    );

    const renderContent = () => {
        switch (activeSubNav) {
            case 'Campaigns': return <CampaignsView />;
            case 'Assets': return <Card className="p-4"><AssetLibrary /></Card>;
            case 'Templates': return <EmailTemplateManager />;
            case 'Audience': return <AudienceManager />;
            case 'AI Generator': return <AICampaignGenerator />;
            case 'Journey Builder': return <JourneyBuilder />;

            // Unimplemented features - use placeholder
            case 'Personalization': return <PersonalizationEngine />;
            case 'A/B Testing': return <ABTesting />;
            case 'CDP': return <CDP />;
            case 'Scoring': return <PredictiveScoring />;
            case 'Social Scheduler': return <SocialScheduler />;
            case 'Creative Studio': return <CreativeStudio />;
            case 'Attribution': return <AttributionAnalyzer />;
            case 'Experiments': return <ExperimentationLab />;

            default: return <CampaignsView />;
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {renderContent()}
        </div>
    );
};
