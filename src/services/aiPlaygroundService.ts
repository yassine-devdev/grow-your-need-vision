/**
 * AI Playground Service
 * Interactive testing environment for AI models
 */

import pb from '../lib/pocketbase';

export interface AIModel {
    id: string;
    name: string;
    provider: 'openai' | 'anthropic' | 'google' | 'meta';
    display_name: string;
    cost_per_1k_input: number;
    cost_per_1k_output: number;
    max_tokens: number;
}

export interface PlaygroundParams {
    temperature: number;
    max_tokens: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
}

export interface PlaygroundTest {
    id: string;
    prompt: string;
    models: {
        model: string;
        params: PlaygroundParams;
    }[];
    responses?: {
        model: string;
        response: string;
        time_ms: number;
        cost: number;
        tokens_input: number;
        tokens_output: number;
        error?: string;
    }[];
    created_by: string;
    created: string;
    updated: string;
}

export const AVAILABLE_MODELS: AIModel[] = [
    {
        id: 'gpt-3.5-turbo',
        name: 'gpt-3.5-turbo',
        provider: 'openai',
        display_name: 'GPT-3.5 Turbo',
        cost_per_1k_input: 0.0015,
        cost_per_1k_output: 0.002,
        max_tokens: 4096
    },
    {
        id: 'gpt-4',
        name: 'gpt-4',
        provider: 'openai',
        display_name: 'GPT-4',
        cost_per_1k_input: 0.03,
        cost_per_1k_output: 0.06,
        max_tokens: 8192
    },
    {
        id: 'gpt-4-turbo',
        name: 'gpt-4-turbo-preview',
        provider: 'openai',
        display_name: 'GPT-4 Turbo',
        cost_per_1k_input: 0.01,
        cost_per_1k_output: 0.03,
        max_tokens: 128000
    },
    {
        id: 'claude-3-opus',
        name: 'claude-3-opus-20240229',
        provider: 'anthropic',
        display_name: 'Claude 3 Opus',
        cost_per_1k_input: 0.015,
        cost_per_1k_output: 0.075,
        max_tokens: 4096
    },
    {
        id: 'claude-3-sonnet',
        name: 'claude-3-sonnet-20240229',
        provider: 'anthropic',
        display_name: 'Claude 3 Sonnet',
        cost_per_1k_input: 0.003,
        cost_per_1k_output: 0.015,
        max_tokens: 4096
    },
    {
        id: 'gemini-pro',
        name: 'gemini-pro',
        provider: 'google',
        display_name: 'Gemini Pro',
        cost_per_1k_input: 0.00025,
        cost_per_1k_output: 0.0005,
        max_tokens: 32000
    }
];

class AIPlaygroundService {
    private collection = 'ai_playground_tests';

    /**
     * Test a prompt with specified models
     */
    async testPrompt(
        prompt: string,
        models: string[],
        params: PlaygroundParams
    ): Promise<PlaygroundTest> {
        try {
            const startTime = Date.now();

            // TODO: Call actual AI APIs
            // For now, simulate with mock responses
            const responses = await Promise.all(
                models.map(async (modelId) => {
                    const model = AVAILABLE_MODELS.find(m => m.id === modelId);
                    if (!model) throw new Error(`Model ${modelId} not found`);

                    // Simulate API call delay
                    const delay = Math.random() * 2000 + 500;
                    await new Promise(resolve => setTimeout(resolve, delay));

                    // Mock response and token calculation
                    const tokensInput = Math.ceil(prompt.split(' ').length * 1.3);
                    const tokensOutput = Math.floor(Math.random() * 200) + 50;

                    const cost = (
                        (tokensInput / 1000) * model.cost_per_1k_input +
                        (tokensOutput / 1000) * model.cost_per_1k_output
                    );

                    return {
                        model: modelId,
                        response: `This is a simulated response from ${model.display_name}. In production, this would be the actual AI model response to: "${prompt.substring(0, 50)}..."`,
                        time_ms: delay,
                        cost: parseFloat(cost.toFixed(6)),
                        tokens_input: tokensInput,
                        tokens_output: tokensOutput
                    };
                })
            );

            // Save test to database
            const testData = {
                prompt,
                models: models.map(m => ({ model: m, params })),
                responses
            };

            const savedTest = await pb.collection(this.collection).create<PlaygroundTest>(testData);

            return savedTest;
        } catch (error) {
            console.error('Error testing prompt:', error);
            throw error;
        }
    }

    /**
     * Get test history
     */
    async getHistory(limit: number = 50): Promise<PlaygroundTest[]> {
        try {
            const tests = await pb.collection(this.collection).getList<PlaygroundTest>(1, limit, {
                sort: '-created'
            });
            return tests.items;
        } catch (error) {
            console.error('Error fetching history:', error);
            throw error;
        }
    }

    /**
     * Get a specific test by ID
     */
    async getTest(id: string): Promise<PlaygroundTest> {
        try {
            const test = await pb.collection(this.collection).getOne<PlaygroundTest>(id);
            return test;
        } catch (error) {
            console.error('Error fetching test:', error);
            throw error;
        }
    }

    /**
     * Delete a test
     */
    async deleteTest(id: string): Promise<boolean> {
        try {
            await pb.collection(this.collection).delete(id);
            return true;
        } catch (error) {
            console.error('Error deleting test:', error);
            throw error;
        }
    }

    /**
     * Calculate cost estimate for a prompt
     */
    estimateCost(prompt: string, modelId: string, expectedOutputTokens: number = 100): number {
        const model = AVAILABLE_MODELS.find(m => m.id === modelId);
        if (!model) return 0;

        const inputTokens = Math.ceil(prompt.split(' ').length * 1.3);
        const cost = (
            (inputTokens / 1000) * model.cost_per_1k_input +
            (expectedOutputTokens / 1000) * model.cost_per_1k_output
        );

        return parseFloat(cost.toFixed(6));
    }

    /**
     * Get model by ID
     */
    getModel(modelId: string): AIModel | undefined {
        return AVAILABLE_MODELS.find(m => m.id === modelId);
    }

    /**
     * Get all available models
     */
    getAvailableModels(): AIModel[] {
        return AVAILABLE_MODELS;
    }
}

export const aiPlaygroundService = new AIPlaygroundService();
