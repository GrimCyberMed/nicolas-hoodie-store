'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

// Types
interface LoyaltyLevel {
  id: string;
  level_number: number;
  name: string;
  tier: string;
  min_spending: number;
  points_multiplier: number;
  icon: string;
  color: string;
}

interface LevelUpReward {
  id: string;
  level_number: number;
  reward_type: string;
  reward_value: number | null;
  description: string;
  is_active: boolean;
}

interface SpendingMilestone {
  id: string;
  name: string;
  description: string;
  spending_threshold: number;
  reward_type: string;
  reward_value: number | null;
  badge_icon: string;
  badge_color: string;
  is_active: boolean;
  sort_order: number;
}

type TabType = 'levels' | 'milestones' | 'rewards';

export default function LoyaltyPage() {
  const [activeTab, setActiveTab] = useState<TabType>('levels');
  const [levels, setLevels] = useState<LoyaltyLevel[]>([]);
  const [levelRewards, setLevelRewards] = useState<LevelUpReward[]>([]);
  const [milestones, setMilestones] = useState<SpendingMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<SpendingMilestone | null>(null);
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingReward, setEditingReward] = useState<LevelUpReward | null>(null);

  const [milestoneForm, setMilestoneForm] = useState({
    name: '',
    description: '',
    spending_threshold: 0,
    reward_type: 'bonus_points',
    reward_value: 0,
    badge_icon: '🎉',
    badge_color: '#10B981',
    is_active: true,
    sort_order: 0,
  });

  const [rewardForm, setRewardForm] = useState({
    level_number: 1,
    reward_type: 'bonus_points',
    reward_value: 0,
    description: '',
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch levels
      const { data: levelsData } = await supabase
        .from('loyalty_levels')
        .select('*')
        .order('level_number', { ascending: true });
      
      // Fetch level-up rewards
      const { data: rewardsData } = await supabase
        .from('level_up_rewards')
        .select('*')
        .order('level_number', { ascending: true });
      
      // Fetch milestones
      const { data: milestonesData } = await supabase
        .from('spending_milestones')
        .select('*')
        .order('sort_order', { ascending: true });

      setLevels(levelsData || []);
      setLevelRewards(rewardsData || []);
      setMilestones(milestonesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Milestone handlers
  const handleMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMilestone) {
        await supabase
          .from('spending_milestones')
          .update(milestoneForm)
          .eq('id', editingMilestone.id);
      } else {
        await supabase
          .from('spending_milestones')
          .insert([milestoneForm]);
      }
      resetMilestoneForm();
      fetchData();
    } catch (error) {
      console.error('Error saving milestone:', error);
      alert('Failed to save milestone');
    }
  };

  const handleEditMilestone = (milestone: SpendingMilestone) => {
    setEditingMilestone(milestone);
    setMilestoneForm({
      name: milestone.name,
      description: milestone.description || '',
      spending_threshold: milestone.spending_threshold,
      reward_type: milestone.reward_type,
      reward_value: milestone.reward_value || 0,
      badge_icon: milestone.badge_icon,
      badge_color: milestone.badge_color,
      is_active: milestone.is_active,
      sort_order: milestone.sort_order,
    });
    setShowMilestoneForm(true);
  };

  const handleDeleteMilestone = async (id: string) => {
    if (!confirm('Delete this milestone?')) return;
    try {
      await supabase.from('spending_milestones').delete().eq('id', id);
      fetchData();
    } catch (error) {
      console.error('Error deleting milestone:', error);
    }
  };

  const resetMilestoneForm = () => {
    setMilestoneForm({
      name: '',
      description: '',
      spending_threshold: 0,
      reward_type: 'bonus_points',
      reward_value: 0,
      badge_icon: '🎉',
      badge_color: '#10B981',
      is_active: true,
      sort_order: 0,
    });
    setEditingMilestone(null);
    setShowMilestoneForm(false);
  };

  // Level reward handlers
  const handleRewardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReward) {
        await supabase
          .from('level_up_rewards')
          .update(rewardForm)
          .eq('id', editingReward.id);
      } else {
        await supabase
          .from('level_up_rewards')
          .insert([rewardForm]);
      }
      resetRewardForm();
      fetchData();
    } catch (error) {
      console.error('Error saving reward:', error);
      alert('Failed to save reward');
    }
  };

  const handleEditReward = (reward: LevelUpReward) => {
    setEditingReward(reward);
    setRewardForm({
      level_number: reward.level_number,
      reward_type: reward.reward_type,
      reward_value: reward.reward_value || 0,
      description: reward.description,
      is_active: reward.is_active,
    });
    setShowRewardForm(true);
  };

  const handleDeleteReward = async (id: string) => {
    if (!confirm('Delete this level-up reward?')) return;
    try {
      await supabase.from('level_up_rewards').delete().eq('id', id);
      fetchData();
    } catch (error) {
      console.error('Error deleting reward:', error);
    }
  };

  const resetRewardForm = () => {
    setRewardForm({
      level_number: 1,
      reward_type: 'bonus_points',
      reward_value: 0,
      description: '',
      is_active: true,
    });
    setEditingReward(null);
    setShowRewardForm(false);
  };

  const getTierColor = (tier: string) => {
    const colors = {
      bronze: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      silver: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      platinum: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return colors[tier as keyof typeof colors] || colors.bronze;
  };

  const getRewardTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      discount_percentage: '% Off',
      discount_fixed: '$ Off',
      free_product: 'Free Product',
      free_shipping: 'Free Shipping',
      bonus_points: 'Bonus Points',
      badge: 'Badge',
      custom: 'Custom',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Loyalty Gamification</h1>
        <p className="text-muted-foreground mt-1">
          Manage levels, milestones, and rewards to engage customers
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-border">
        {(['levels', 'milestones', 'rewards'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-accent border-b-2 border-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'rewards' ? 'Level-Up Rewards' : tab}
          </button>
        ))}
      </div>

      {/* Levels Tab */}
      {activeTab === 'levels' && (
        <div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>How it works:</strong> Customers level up based on their total spending. 
              Each level has a points multiplier that increases their earning rate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {levels.map((level) => (
              <div
                key={level.id}
                className="bg-card border border-border rounded-lg p-4 text-center"
                style={{ borderTopColor: level.color, borderTopWidth: '4px' }}
              >
                <div className="text-3xl mb-2">{level.icon}</div>
                <div className="font-bold text-foreground">Level {level.level_number}</div>
                <div className="text-lg font-semibold text-foreground mb-1">{level.name}</div>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTierColor(level.tier)}`}>
                  {level.tier}
                </span>
                <div className="mt-3 text-sm text-muted-foreground">
                  <div>Min Spend: €{level.min_spending}</div>
                  <div>Multiplier: {level.points_multiplier}x</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones Tab */}
      {activeTab === 'milestones' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">
              Milestones are achievements customers unlock based on total spending
            </p>
            <Button onClick={() => setShowMilestoneForm(true)}>
              Add Milestone
            </Button>
          </div>

          {/* Milestone Form */}
          {showMilestoneForm && (
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                {editingMilestone ? 'Edit Milestone' : 'New Milestone'}
              </h3>
              <form onSubmit={handleMilestoneSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
                    <input
                      type="text"
                      value={milestoneForm.name}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, name: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Spending Threshold (€) *</label>
                    <input
                      type="number"
                      value={milestoneForm.spending_threshold}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, spending_threshold: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Reward Type *</label>
                    <select
                      value={milestoneForm.reward_type}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, reward_type: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    >
                      <option value="bonus_points">Bonus Points</option>
                      <option value="discount_percentage">Discount %</option>
                      <option value="discount_fixed">Discount $</option>
                      <option value="free_shipping">Free Shipping</option>
                      <option value="badge">Badge Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Reward Value</label>
                    <input
                      type="number"
                      value={milestoneForm.reward_value}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, reward_value: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Badge Icon</label>
                    <input
                      type="text"
                      value={milestoneForm.badge_icon}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, badge_icon: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                      placeholder="🎉"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Badge Color</label>
                    <input
                      type="color"
                      value={milestoneForm.badge_color}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, badge_color: e.target.value })}
                      className="w-full h-10 bg-background border border-border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                  <textarea
                    value={milestoneForm.description}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    rows={2}
                  />
                </div>
                <div className="flex gap-4">
                  <Button type="submit">{editingMilestone ? 'Update' : 'Create'}</Button>
                  <Button type="button" variant="outline" onClick={resetMilestoneForm}>Cancel</Button>
                </div>
              </form>
            </div>
          )}

          {/* Milestones List */}
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="bg-card border border-border rounded-lg p-4 flex items-center gap-4"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: milestone.badge_color + '20' }}
                >
                  {milestone.badge_icon}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-foreground">{milestone.name}</div>
                  <div className="text-sm text-muted-foreground">{milestone.description}</div>
                  <div className="text-sm mt-1">
                    <span className="text-accent font-medium">€{milestone.spending_threshold}</span>
                    {' • '}
                    <span>{getRewardTypeLabel(milestone.reward_type)}</span>
                    {milestone.reward_value ? `: ${milestone.reward_value}` : ''}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditMilestone(milestone)}
                    className="px-3 py-1 bg-accent text-white rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMilestone(milestone.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Level-Up Rewards Tab */}
      {activeTab === 'rewards' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">
              Rewards given when customers level up
            </p>
            <Button onClick={() => setShowRewardForm(true)}>
              Add Level Reward
            </Button>
          </div>

          {/* Reward Form */}
          {showRewardForm && (
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                {editingReward ? 'Edit Level Reward' : 'New Level Reward'}
              </h3>
              <form onSubmit={handleRewardSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Level *</label>
                    <select
                      value={rewardForm.level_number}
                      onChange={(e) => setRewardForm({ ...rewardForm, level_number: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    >
                      {levels.map((level) => (
                        <option key={level.level_number} value={level.level_number}>
                          Level {level.level_number} - {level.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Reward Type *</label>
                    <select
                      value={rewardForm.reward_type}
                      onChange={(e) => setRewardForm({ ...rewardForm, reward_type: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    >
                      <option value="bonus_points">Bonus Points</option>
                      <option value="discount_percentage">Discount %</option>
                      <option value="discount_fixed">Discount $</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Reward Value</label>
                    <input
                      type="number"
                      value={rewardForm.reward_value}
                      onChange={(e) => setRewardForm({ ...rewardForm, reward_value: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Description *</label>
                  <input
                    type="text"
                    value={rewardForm.description}
                    onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                    required
                    placeholder="e.g., 10% off your next purchase"
                  />
                </div>
                <div className="flex gap-4">
                  <Button type="submit">{editingReward ? 'Update' : 'Create'}</Button>
                  <Button type="button" variant="outline" onClick={resetRewardForm}>Cancel</Button>
                </div>
              </form>
            </div>
          )}

          {/* Level Rewards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {levels.map((level) => {
              const reward = levelRewards.find((r) => r.level_number === level.level_number);
              return (
                <div
                  key={level.level_number}
                  className="bg-card border border-border rounded-lg p-4"
                  style={{ borderLeftColor: level.color, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{level.icon}</span>
                    <span className="font-bold text-foreground">Level {level.level_number}</span>
                    <span className="text-sm text-muted-foreground">({level.name})</span>
                  </div>
                  {reward ? (
                    <div>
                      <div className="text-sm text-foreground mb-2">{reward.description}</div>
                      <div className="text-xs text-muted-foreground mb-3">
                        {getRewardTypeLabel(reward.reward_type)}
                        {reward.reward_value ? `: ${reward.reward_value}` : ''}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditReward(reward)}
                          className="px-3 py-1 bg-accent text-white rounded text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReward(reward.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      No reward set for this level
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
