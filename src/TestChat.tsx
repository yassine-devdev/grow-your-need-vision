import React from 'react';
import ConciergeAI from './apps/ConciergeAI';

const TestChat: React.FC = () => {
    return (
        <div style={{ height: '100vh', width: '100vw', padding: '20px', background: '#f0f0f0' }}>
            <h1>Debug Page</h1>
            <ConciergeAI activeTab="Test" activeSubNav="Debug" />
        </div>
    );
};

export default TestChat;
