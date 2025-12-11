import React, { Suspense, lazy } from 'react';
import { Spinner } from './components/shared/ui/Spinner';

const ConciergeAI = lazy(() => import('./apps/ConciergeAI'));

const TestChat: React.FC = () => {
    return (
        <div style={{ height: '100vh', width: '100vw', padding: '20px', background: '#f0f0f0' }}>
            <h1>Debug Page</h1>
            <Suspense fallback={<Spinner />}>
                <ConciergeAI activeTab="Test" activeSubNav="Debug" />
            </Suspense>
        </div>
    );
};

export default TestChat;
