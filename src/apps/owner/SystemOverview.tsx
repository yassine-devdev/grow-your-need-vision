import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Server, Database, Clock, Activity, Shield, Globe,
  CheckCircle, AlertTriangle, XCircle, RefreshCw,
  Cpu, HardDrive, MemoryStick, Wifi
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latency?: number;
  uptime?: number;
  lastCheck: Date;
}

interface SystemMetric {
  name: string;
  current: number;
  max: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

const SystemOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock service statuses (would come from real monitoring in production)
  const [services] = useState<ServiceStatus[]>([
    { name: 'API Server', status: 'operational', latency: 45, uptime: 99.98, lastCheck: new Date() },
    { name: 'Database', status: 'operational', latency: 12, uptime: 99.99, lastCheck: new Date() },
    { name: 'Authentication', status: 'operational', latency: 28, uptime: 99.95, lastCheck: new Date() },
    { name: 'Storage', status: 'operational', latency: 85, uptime: 99.92, lastCheck: new Date() },
    { name: 'AI Service', status: 'operational', latency: 150, uptime: 99.85, lastCheck: new Date() },
    { name: 'Email Service', status: 'operational', latency: 220, uptime: 99.90, lastCheck: new Date() },
  ]);

  const [metrics] = useState<SystemMetric[]>([
    { name: 'CPU Usage', current: 42, max: 100, unit: '%', status: 'good' },
    { name: 'Memory', current: 6.2, max: 16, unit: 'GB', status: 'good' },
    { name: 'Storage', current: 245, max: 500, unit: 'GB', status: 'good' },
    { name: 'Bandwidth', current: 2.4, max: 10, unit: 'TB', status: 'good' },
  ]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
    }
  };

  const getMetricIcon = (name: string) => {
    switch (name) {
      case 'CPU Usage':
        return <Cpu className="w-5 h-5" />;
      case 'Memory':
        return <MemoryStick className="w-5 h-5" />;
      case 'Storage':
        return <HardDrive className="w-5 h-5" />;
      case 'Bandwidth':
        return <Wifi className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getMetricColor = (status: SystemMetric['status']) => {
    switch (status) {
      case 'good':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
    }
  };

  const getMetricBg = (status: SystemMetric['status']) => {
    switch (status) {
      case 'good':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
    }
  };

  const overallStatus = services.every(s => s.status === 'operational') 
    ? 'All Systems Operational' 
    : services.some(s => s.status === 'down')
    ? 'System Outage Detected'
    : 'Partial Service Degradation';

  const overallStatusColor = services.every(s => s.status === 'operational')
    ? 'text-green-500'
    : services.some(s => s.status === 'down')
    ? 'text-red-500'
    : 'text-yellow-500';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500">Loading system status...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Server className="w-8 h-8 text-indigo-500" />
              System Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time platform health monitoring
            </p>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                "p-2 rounded-lg border transition-colors",
                autoRefresh 
                  ? "bg-indigo-100 border-indigo-300 text-indigo-600" 
                  : "bg-white border-gray-200 text-gray-500"
              )}
            >
              <RefreshCw className={cn("w-5 h-5", autoRefresh && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Overall Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-xl p-4 mb-8 flex items-center gap-4",
            services.every(s => s.status === 'operational')
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : services.some(s => s.status === 'down')
              ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
          )}
        >
          {services.every(s => s.status === 'operational') ? (
            <CheckCircle className="w-8 h-8 text-green-500" />
          ) : services.some(s => s.status === 'down') ? (
            <XCircle className="w-8 h-8 text-red-500" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          )}
          <div>
            <div className={cn("text-lg font-bold", overallStatusColor)}>{overallStatus}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {services.filter(s => s.status === 'operational').length} of {services.length} services running normally
            </div>
          </div>
        </motion.div>

        {/* System Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, idx) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("p-2 rounded-lg bg-gray-100 dark:bg-gray-700", getMetricColor(metric.status))}>
                  {getMetricIcon(metric.name)}
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">{metric.name}</span>
              </div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.current}
                </span>
                <span className="text-sm text-gray-500">
                  / {metric.max} {metric.unit}
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(metric.current / metric.max) * 100}%` }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className={cn("h-full rounded-full", getMetricBg(metric.status))}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Services Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-indigo-500" />
            Service Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, idx) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900 dark:text-white">{service.name}</span>
                  {getStatusIcon(service.status)}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={cn(
                      "font-medium capitalize",
                      service.status === 'operational' ? 'text-green-500' :
                      service.status === 'degraded' ? 'text-yellow-500' : 'text-red-500'
                    )}>
                      {service.status}
                    </span>
                  </div>
                  
                  {service.latency !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Latency</span>
                      <span className={cn(
                        "font-medium",
                        service.latency < 100 ? 'text-green-500' :
                        service.latency < 200 ? 'text-yellow-500' : 'text-red-500'
                      )}>
                        {service.latency}ms
                      </span>
                    </div>
                  )}
                  
                  {service.uptime !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Uptime (30d)</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {service.uptime}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex-1 h-2 rounded",
                        getStatusColor(service.status)
                      )}
                      style={{ opacity: 0.3 + (i * 0.1) }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Database</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Connections</span>
                <span className="font-medium text-gray-900 dark:text-white">142 / 500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Queries/sec</span>
                <span className="font-medium text-gray-900 dark:text-white">2,847</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Size</span>
                <span className="font-medium text-gray-900 dark:text-white">12.4 GB</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Traffic</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Active Users</span>
                <span className="font-medium text-gray-900 dark:text-white">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Requests/min</span>
                <span className="font-medium text-gray-900 dark:text-white">8,432</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Avg Response</span>
                <span className="font-medium text-gray-900 dark:text-white">124ms</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Security</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Blocked Attacks</span>
                <span className="font-medium text-gray-900 dark:text-white">2,847</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">SSL Status</span>
                <span className="font-medium text-green-500">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Scan</span>
                <span className="font-medium text-gray-900 dark:text-white">2h ago</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SystemOverview;
