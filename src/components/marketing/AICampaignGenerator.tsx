import React from 'react';
import { Card, Button, Icon, Badge } from '../shared/ui/CommonUI';

export const AICampaignGenerator: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-black mb-4">AI Campaign Generator</h2>
                    <p className="text-blue-100 max-w-2xl mb-8 text-lg">
                        Describe your campaign goal, and let our advanced AI generate a complete multi-channel strategy, including copy, assets, and targeting rules.
                    </p>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 flex gap-2 max-w-3xl border border-white/20">
                        <input
                            type="text"
                            placeholder="e.g., Launching a new summer collection for Gen Z with a focus on sustainability..."
                            className="flex-1 bg-transparent border-none text-white placeholder-blue-200 focus:ring-0 text-lg px-4"
                        />
                        <Button variant="secondary" className="bg-white text-purple-600 hover:bg-blue-50 border-none">
                            <Icon name="Sparkles" className="w-5 h-5 mr-2" />
                            Generate Magic
                        </Button>
                    </div>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-purple-500">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                            <Icon name="DocumentTextIcon" className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg">Content Strategy</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">AI generates blog posts, social captions, and email newsletters tailored to your voice.</p>
                    <div className="flex items-center text-xs font-bold text-gray-400">
                        <Icon name="CheckCircleIcon" className="w-4 h-4 mr-1 text-green-500" /> Auto-Tone Matching
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-blue-500">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                            <Icon name="PhotoIcon" className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg">Visual Assets</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Generates image prompts and selects stock assets that match your campaign theme.</p>
                    <div className="flex items-center text-xs font-bold text-gray-400">
                        <Icon name="CheckCircleIcon" className="w-4 h-4 mr-1 text-green-500" /> DALL-E 3 Integrated
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-pink-500">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-600">
                            <Icon name="UserGroupIcon" className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg">Targeting Rules</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Suggests audience segments and lookalike audiences based on campaign goals.</p>
                    <div className="flex items-center text-xs font-bold text-gray-400">
                        <Icon name="CheckCircleIcon" className="w-4 h-4 mr-1 text-green-500" /> Predictive Scoring
                    </div>
                </Card>
            </div>

            <div className="text-center text-sm text-gray-400 pt-8">
                Powered by GPT-4 and Enterprise Marketing Knowledge Graph
            </div>
        </div>
    );
};
