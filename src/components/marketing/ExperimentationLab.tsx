import React from 'react';
import { Card, Button, Icon, Badge } from '../shared/ui/CommonUI';

export const ExperimentationLab: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 h-64 flex items-center justify-center text-center p-8 group">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-900 via-gray-900 to-blue-900 opacity-90"></div>
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/50 mb-4">
                        <Icon name="BeakerIcon" className="w-3 h-3 mr-2" />
                        BETA FEATURE
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4">Experimentation Lab</h2>
                    <p className="text-gray-300 text-lg">
                        Sandboxed environment for testing massive changes without affecting live traffic.
                        Simulate traffic, test multi-variate flows, and validate hypotheses safely.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 border-l-4 border-l-purple-500">
                    <h3 className="font-bold text-lg mb-2">Simulations</h3>
                    <p className="text-gray-500 text-sm mb-6">Run Monte Carlo simulations on your funnel to predict outcomes of price changes or flow adjustments.</p>
                    <div className="flex gap-2">
                        <Button variant="secondary" icon="PlayIcon">New Sim</Button>
                        <Button variant="ghost">View History</Button>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-blue-500">
                    <h3 className="font-bold text-lg mb-2">Feature Flags</h3>
                    <p className="text-gray-500 text-sm mb-6">Manage progressive delivery of new features. Rollout to 1%, 5%, or specific user cohorts.</p>
                    <div className="flex gap-2">
                        <Button variant="secondary" icon="AdjustmentsHorizontalIcon">Manage Flags</Button>
                    </div>
                </Card>
            </div>

            <div className="pt-8">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4">Active Lab Projects</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <Icon name={i === 1 ? 'ShoppingCartIcon' : i === 2 ? 'CurrencyDollarIcon' : 'PaintBrushIcon'} className="w-8 h-8 mb-2" />
                            <span className="font-bold">{i === 1 ? 'New Checkout Flow' : i === 2 ? 'Dynamic Pricing V2' : 'Dark Mode Default'}</span>
                            <span className="text-xs mt-1">Status: In Design</span>
                        </div>
                    ))}
                    <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer text-blue-500 hover:text-blue-600">
                        <Icon name="PlusIcon" className="w-8 h-8 mb-2" />
                        <span className="font-bold">Create Project</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
