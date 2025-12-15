import pb from '../lib/pocketbase';

export interface HealthMetric {
    id: string;
    service_name: string;
    status: 'healthy' | 'degraded' | 'down';
    uptime_percentage: number;
    response_time_ms?: number;
    last_check: string;
    created: string;
    updated: string;
}

class SystemHealthService {
    private collection = 'system_health_metrics';

    async getAllMetrics(): Promise<HealthMetric[]> {
        try {
            const records = await pb.collection(this.collection).getFullList({
                sort: 'service_name',
            });
            return records as unknown as HealthMetric[];
        } catch (error) {
            console.error('Failed to fetch health metrics:', error);
            throw new Error('Failed to load health metrics');
        }
    }

    async getLatestMetrics(): Promise<HealthMetric[]> {
        try {
            // Get the most recent metric for each service
            const allMetrics = await this.getAllMetrics();
            const latestByService = new Map<string, HealthMetric>();

            allMetrics.forEach(metric => {
                const existing = latestByService.get(metric.service_name);
                if (!existing || new Date(metric.last_check) > new Date(existing.last_check)) {
                    latestByService.set(metric.service_name, metric);
                }
            });

            return Array.from(latestByService.values());
        } catch (error) {
            console.error('Failed to fetch latest metrics:', error);
            throw new Error('Failed to load latest metrics');
        }
    }

    async getByService(serviceName: string): Promise<HealthMetric[]> {
        try {
            const records = await pb.collection(this.collection).getFullList({
                filter: `service_name = "${serviceName}"`,
                sort: '-last_check',
            });
            return records as unknown as HealthMetric[];
        } catch (error) {
            console.error(`Failed to fetch metrics for ${serviceName}:`, error);
            throw new Error('Failed to load service metrics');
        }
    }

    async recordMetric(data: Omit<HealthMetric, 'id' | 'created' | 'updated'>): Promise<HealthMetric> {
        try {
            const record = await pb.collection(this.collection).create(data);
            return record as unknown as HealthMetric;
        } catch (error) {
            console.error('Failed to record health metric:', error);
            throw new Error('Failed to record health metric');
        }
    }

    async checkService(serviceName: string, endpoint: string): Promise<HealthMetric> {
        try {
            const startTime = Date.now();
            let status: HealthMetric['status'] = 'healthy';
            let responseTime: number | undefined;

            try {
                // TODO: Implement actual health check ping
                await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
                responseTime = Date.now() - startTime;

                if (responseTime > 1000) status = 'degraded';
            } catch (error) {
                status = 'down';
            }

            return await this.recordMetric({
                service_name: serviceName,
                status,
                uptime_percentage: status === 'healthy' ? 99.9 : status === 'degraded' ? 95.0 : 0,
                response_time_ms: responseTime,
                last_check: new Date().toISOString()
            });
        } catch (error) {
            console.error(`Failed to check service ${serviceName}:`, error);
            throw new Error('Failed to check service');
        }
    }

    async getOverallHealth(): Promise<{
        status: 'healthy' | 'degraded' | 'down';
        healthy_count: number;
        total_count: number;
        message: string
    }> {
        try {
            const metrics = await this.getLatestMetrics();
            const healthyCount = metrics.filter(m => m.status === 'healthy').length;
            const degradedCount = metrics.filter(m => m.status === 'degraded').length;
            const downCount = metrics.filter(m => m.status === 'down').length;
            const totalCount = metrics.length;

            let status: 'healthy' | 'degraded' | 'down' = 'healthy';
            let message = 'All Systems Operational';

            if (downCount > 0) {
                status = 'down';
                message = `${downCount} Service(s) Down`;
            } else if (degradedCount > 0) {
                status = 'degraded';
                message = `${degradedCount} Service(s) Degraded`;
            }

            return {
                status,
                healthy_count: healthyCount,
                total_count: totalCount,
                message
            };
        } catch (error) {
            console.error('Failed to get overall health:', error);
            return {
                status: 'down',
                healthy_count: 0,
                total_count: 0,
                message: 'Unable to determine system health'
            };
        }
    }
}

export const systemHealthService = new SystemHealthService();
