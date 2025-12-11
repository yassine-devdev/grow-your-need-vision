import React, { useState, useEffect } from 'react';
import { Icon, Button, Card } from '../components/shared/ui/CommonUI';
import { AIContentGeneratorModal } from '../components/shared/modals/AIContentGeneratorModal';
import { useGamification } from '../hooks/useGamification';
import { useAuth } from '../context/AuthContext';
import { gamificationService, Achievement, LeaderboardEntry, Reward } from '../services/gamificationService';
import { LoadingScreen } from '../components/shared/LoadingScreen';
import { motion } from 'framer-motion';

interface GamificationAppProps {
  activeTab: string;
  activeSubNav: string;
}

const GamificationApp: React.FC<GamificationAppProps> = ({ activeTab, activeSubNav }) => {
  const { user } = useAuth();
  const { progress, levelProgress, addXP } = useGamification();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userRewards, setUserRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  const level = progress?.level || 1;
  const xp = progress?.total_xp || 0;
  const progressPercent = levelProgress();
  const nextLevel = level + 1;

  useEffect(() => {
    loadData();
  }, [activeTab, user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      if (activeTab === 'Achievements') {
        const [allAchievements, userAch] = await Promise.all([
          gamificationService.getAllAchievements(),
          gamificationService.getUserAchievements(user.id)
        ]);
        setAchievements(allAchievements);
        setUserAchievements(userAch);
      } else if (activeTab === 'Leaderboards') {
        const [leaderboardData, rank] = await Promise.all([
          gamificationService.getGlobalLeaderboard(50),
          gamificationService.getUserRank(user.id)
        ]);
        setLeaderboard(leaderboardData);
        setUserRank(rank);
      } else if (activeTab === 'Rewards') {
        const [allRewards, userRew] = await Promise.all([
          gamificationService.getAllRewards(),
          gamificationService.getUserRewards(user.id)
        ]);
        setRewards(allRewards);
        setUserRewards(userRew);
      }
    } catch (error) {
      console.error('Failed to load gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseReward = async (reward: Reward) => {
    if (!user || xp < reward.cost_xp) {
      alert(`Insufficient XP! You need ${reward.cost_xp} XP but only have ${xp} XP.`);
      return;
    }

    try {
      await gamificationService.purchaseReward(user.id, reward.id, reward.cost_xp);
      alert(`Successfully purchased ${reward.name}!`);
      loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to purchase reward');
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'from-yellow-400 to-orange-500';
      case 'Epic': return 'from-purple-400 to-pink-500';
      case 'Rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-300 to-gray-400';
    }
  };

  const getRarityBorderColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'border-yellow-400 shadow-yellow-400/50';
      case 'Epic': return 'border-purple-400 shadow-purple-400/50';
      case 'Rare': return 'border-blue-400 shadow-blue-400/50';
      default: return 'border-gray-300';
    }
  };

  const isAchievementUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement === achievementId && ua.completed);
  };

  const renderAchievements = () => {
    if (loading) return <LoadingScreen />;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {achievements.map((achievement, index) => {
          const unlocked = isAchievementUnlocked(achievement.id);

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white dark:bg-gray-800 rounded-xl p-6 flex flex-col items-center text-center transition-all relative overflow-hidden
                ${unlocked
                  ? `border-2 ${getRarityBorderColor(achievement.rarity)} shadow-lg`
                  : 'border border-gray-200 dark:border-gray-700 opacity-60 grayscale'}`}
            >
              {unlocked && (
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getRarityColor(achievement.rarity)}`} />
              )}

              <div className={`w-20 h-20 mb-4 rounded-full flex items-center justify-center text-4xl
                ${unlocked ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} shadow-lg` : 'bg-gray-100 dark:bg-gray-700'}`}>
                {achievement.icon || '🏆'}
              </div>

              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{achievement.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{achievement.description}</p>

              <div className="flex gap-2 items-center mb-3">
                <span className={`text-xs font-bold px-2 py-1 rounded ${achievement.rarity === 'Legendary' ? 'bg-yellow-100 text-yellow-700' :
                    achievement.rarity === 'Epic' ? 'bg-purple-100 text-purple-700' :
                      achievement.rarity === 'Rare' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                  }`}>
                  {achievement.rarity}
                </span>
                <span className="text-xs font-bold text-green-600">+{achievement.xp_reward} XP</span>
              </div>

              <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${unlocked
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                {unlocked ? '✓ Unlocked' : 'Locked'}
              </span>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderLeaderboard = () => {
    if (loading) return <LoadingScreen />;

    return (
      <div className="max-w-4xl mx-auto">
        {/* User's Rank Card */}
        {userRank && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-black text-2xl">
                  #{userRank}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Your Rank</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Level {level} • {xp.toLocaleString()} XP</p>
                </div>
              </div>
              <Icon name="TrophyIcon" className="w-12 h-12 text-yellow-500" />
            </div>
          </Card>
        )}

        {/* Leaderboard Table */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Icon name="ChartBarIcon" className="w-6 h-6 text-purple-600" />
            Global Leaderboard
          </h2>

          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`flex items-center justify-between p-4 rounded-lg transition-all
                  ${entry.user === user?.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-400'
                    : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-10 h-10 flex items-center justify-center font-black text-lg
                    ${index < 3 ? 'text-yellow-600' : 'text-gray-400'}`}>
                    {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${entry.rank}`}
                  </div>

                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-200">
                    {entry.username.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white">{entry.username}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Level {entry.level} • {entry.achievements_count} achievements
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-xl text-gray-900 dark:text-white">
                    {entry.total_xp.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">XP</div>
                </div>
              </motion.div>
            ))}
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Icon name="InformationCircleIcon" className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No leaderboard data available</p>
            </div>
          )}
        </Card>
      </div>
    );
  };

  const renderRewards = () => {
    if (loading) return <LoadingScreen />;

    const purchasedRewardIds = userRewards.map(ur => ur.reward);

    return (
      <div>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Rewards Store</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You have <span className="font-bold text-purple-600">{xp.toLocaleString()} XP</span> to spend
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rewards.map((reward, index) => {
            const canAfford = xp >= reward.cost_xp;
            const alreadyOwned = purchasedRewardIds.includes(reward.id);

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`relative ${alreadyOwned ? 'opacity-75' : ''}`}>
                  {alreadyOwned && (
                    <div className="absolute top-2 right-2 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                      Owned
                    </div>
                  )}

                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-4xl">
                      {reward.icon || '🎁'}
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{reward.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{reward.description}</p>

                    <div className="mb-4">
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                        {reward.category}
                      </span>
                    </div>

                    <Button
                      variant={canAfford ? "primary" : "ghost"}
                      disabled={!canAfford || alreadyOwned}
                      onClick={() => handlePurchaseReward(reward)}
                      className="w-full"
                    >
                      {alreadyOwned ? 'Owned' : `${reward.cost_xp.toLocaleString()} XP`}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {rewards.length === 0 && (
          <Card className="text-center py-12">
            <Icon name="GiftIcon" className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">No Rewards Available</h3>
            <p className="text-gray-600 dark:text-gray-400">Check back later for new rewards!</p>
          </Card>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Leaderboards':
        return renderLeaderboard();
      case 'Rewards':
        return renderRewards();
      case 'Achievements':
      default:
        return renderAchievements();
    }
  };

  return (
    <div className="max-w-6xl mx-auto min-h-full">
      {/* Header */}
      <div className="text-center mb-10 py-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800 relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <Button
            variant="outline"
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            <Icon name="Sparkles" className="w-4 h-4" />
            New Challenge
          </Button>
        </div>

        <div className="inline-block p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-white mb-4 shadow-xl">
          <Icon name="TrophyIcon" className="w-12 h-12" />
        </div>

        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
          Level {level}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          {xp.toLocaleString()} XP • {userAchievements.filter(ua => ua.completed).length} Achievements Unlocked
        </p>

        <div className="max-w-md mx-auto mt-6">
          <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress to Level {nextLevel}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {renderContent()}

      {/* AI Modal */}
      <AIContentGeneratorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onSuccess={(content) => {
          console.log("New Challenge:", content);
          setIsAIModalOpen(false);
          alert("New Challenge Generated! (Check console)");
        }}
        title="Generate Daily Challenge"
        promptTemplate={`Create a fun and engaging daily challenge for a user at Level ${level}.
        
        Include:
        - Challenge Name
        - Description (what to do)
        - XP Reward (${level * 50}-${level * 100} XP)
        - Completion Criteria
        - Tips for success`}
        contextData={{ level, xp, username: user?.name }}
      />
    </div>
  );
};

export default GamificationApp;