import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, Target, Users, DollarSign,
  Eye, MousePointer, ShoppingCart, ArrowUpRight, Calendar, Filter,
  Download, RefreshCw, Layers, Zap, Award, PieChart
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { marketingService } from '../../services/marketingService';
import { marketingExportService } from '../../services/marketingExportService';

interface CampaignMetric {
  id: string;
  name: string;
  channel: string;
  status: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  roi: number;
  ctr: number;
  cvr: number;
  cpa: number;
  trend: 'up' | 'down' | 'stable';
}

interface FunnelStage {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface ChannelPerformance {
  channel: string;
  spend: number;
  revenue: number;
  roi: number;
  conversions: number;
  trend: number;
}

export const AdvancedCampaignAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignMetric[]>([]);
  const [channelPerformance, setChannelPerformance] = useState<ChannelPerformance[]>([]);
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalSpend: 0,
    totalRevenue: 0,
    totalConversions: 0,
    avgROI: 0,
    avgCTR: 0,
    avgCVR: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await marketingService.getCampaignAnalytics();
      setCampaigns(data.campaigns);
      setOverallStats({
        totalSpend: data.totals.totalSpend,
        totalRevenue: data.totals.totalRevenue,
        totalConversions: data.totals.totalConversions,
        avgROI: data.totals.avgROI,
        avgCTR: data.totals.avgCTR,
        avgCVR: data.totals.avgCVR,
      });
      // Add computed trend to channel performance based on ROI
      const avgROI = data.totals.avgROI;
      setChannelPerformance(data.channelPerformance.map(cp => ({
        ...cp,
        trend: Math.round((cp.roi - avgROI) / Math.max(avgROI, 1) * 100 * 10) / 10,
      })));
      
      // Build funnel from data
      const totalImpressions = data.funnelData.impressions;
      setFunnel([
        { name: 'Impressions', value: data.funnelData.impressions, percentage: 100, color: 'bg-blue-500' },
        { name: 'Clicks', value: data.funnelData.clicks, percentage: totalImpressions > 0 ? (data.funnelData.clicks / totalImpressions) * 100 : 0, color: 'bg-indigo-500' },
        { name: 'Leads', value: data.funnelData.leads, percentage: totalImpressions > 0 ? (data.funnelData.leads / totalImpressions) * 100 : 0, color: 'bg-purple-500' },
        { name: 'Conversions', value: data.funnelData.conversions, percentage: totalImpressions > 0 ? (data.funnelData.conversions / totalImpressions) * 100 : 0, color: 'bg-green-500' },
      ]);
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, dateRange]);

  const handleExport = () => {
    const exportData = campaigns.map(c => ({
      Name: c.name,
      Channel: c.channel,
      Status: c.status,
      Impressions: c.impressions,
      Clicks: c.clicks,
      Conversions: c.conversions,
      Spend: c.spend,
      Revenue: c.revenue,
      ROI: `${c.roi.toFixed(1)}%`,
      CTR: `${c.ctr.toFixed(2)}%`,
      CVR: `${c.cvr.toFixed(2)}%`,
      CPA: c.cpa.toFixed(2),
    }));
    marketingExportService.exportROIToExcel(exportData, 'Campaign Analytics', 'campaign_analytics');
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const formatNumber = (value: number) => 
    new Intl.NumberFormat('en-US').format(value);

  const getChannelColor = (channel: string) => {
    const colors: Record<string, string> = {
      'Email': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Social': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Display': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'Search': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'Google Ads': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'Facebook': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'LinkedIn': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
      'Instagram': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    };
    return colors[channel] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-500" />
            Advanced Campaign Analytics
          </h1>
          <p className="text-gray-500 mt-1">Deep performance insights across all marketing channels</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  dateRange === range
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                )}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          <button className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50">
            <Filter className="w-5 h-5 text-gray-500" />
          </button>
          <button onClick={handleExport} className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50">
            <Download className="w-5 h-5 text-gray-500" />
          </button>
          <button onClick={fetchData} className="p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600">
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Spend', value: formatCurrency(overallStats.totalSpend), icon: DollarSign, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Total Revenue', value: formatCurrency(overallStats.totalRevenue), icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Conversions', value: formatNumber(overallStats.totalConversions), icon: ShoppingCart, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Avg ROI', value: `${overallStats.avgROI}%`, icon: Award, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Avg CTR', value: `${overallStats.avgCTR}%`, icon: MousePointer, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { label: 'Avg CVR', value: `${overallStats.avgCVR}%`, icon: Target, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
        ].map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700"
          >
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", kpi.bg)}>
              <kpi.icon className={cn("w-5 h-5", kpi.color)} />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Funnel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-indigo-500" />
            Conversion Funnel
          </h2>
          <div className="space-y-4">
            {funnel.map((stage, idx) => (
              <div key={stage.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{stage.name}</span>
                  <span className="text-gray-500">{formatNumber(stage.value)}</span>
                </div>
                <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(stage.percentage, 5)}%` }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className={cn("h-full rounded-lg", stage.color)}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600 dark:text-gray-300">
                    {stage.percentage.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Channel Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-purple-500" />
            Channel Performance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {channelPerformance.map((channel, idx) => (
              <motion.div
                key={channel.channel}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
              >
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{channel.channel}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{channel.roi}%</div>
                <div className="text-xs text-gray-500 mb-2">ROI</div>
                <div className="flex items-center gap-1">
                  {channel.trend > 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={cn("text-xs font-medium", channel.trend > 0 ? "text-green-500" : "text-red-500")}>
                    {channel.trend > 0 ? '+' : ''}{channel.trend}%
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Spend</span>
                    <span className="font-medium">{formatCurrency(channel.spend)}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Revenue</span>
                    <span className="font-medium text-green-600">{formatCurrency(channel.revenue)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Campaign Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Campaign Performance Details
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Campaign</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Channel</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Impressions</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Clicks</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">CTR</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Conversions</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">CVR</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Spend</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Revenue</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">ROI</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-900 dark:text-white">{campaign.name}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getChannelColor(campaign.channel))}>
                      {campaign.channel}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-gray-600 dark:text-gray-400">{formatNumber(campaign.impressions)}</td>
                  <td className="py-4 px-4 text-right text-gray-600 dark:text-gray-400">{formatNumber(campaign.clicks)}</td>
                  <td className="py-4 px-4 text-right font-medium text-gray-900 dark:text-white">{campaign.ctr.toFixed(1)}%</td>
                  <td className="py-4 px-4 text-right text-gray-600 dark:text-gray-400">{formatNumber(campaign.conversions)}</td>
                  <td className="py-4 px-4 text-right font-medium text-gray-900 dark:text-white">{campaign.cvr.toFixed(2)}%</td>
                  <td className="py-4 px-4 text-right text-gray-600 dark:text-gray-400">{formatCurrency(campaign.spend)}</td>
                  <td className="py-4 px-4 text-right font-medium text-green-600">{formatCurrency(campaign.revenue)}</td>
                  <td className="py-4 px-4 text-right">
                    <span className={cn("font-bold", campaign.roi >= 200 ? "text-green-600" : campaign.roi >= 100 ? "text-blue-600" : "text-orange-600")}>
                      {campaign.roi.toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {campaign.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : campaign.trend === 'down' ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <span className="w-4 h-4 text-gray-400">—</span>
                      )}
                      <span className={cn("text-sm font-medium", campaign.trend === 'up' ? "text-green-500" : campaign.trend === 'down' ? "text-red-500" : "text-gray-400")}>
                        {campaign.trend}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdvancedCampaignAnalytics;
