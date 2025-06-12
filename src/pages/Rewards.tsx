
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Gift, Star, Download, Coins } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Reward {
  id: string;
  title: string;
  description: string | null;
  coin_cost: number;
  is_milestone: boolean;
  milestone_coins: number | null;
  is_redeemed: boolean;
  redeemed_at: string | null;
}

const Rewards = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [totalCoins, setTotalCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  const milestones = [
    {
      coins: 5000,
      title: "First Milestone! 🎉",
      description: "Basic Reward Zone",
      icon: "🏆",
      color: "from-blue-500 to-purple-600"
    },
    {
      coins: 50000,
      title: "Major Achievement! 🌟",
      description: "Major Gift Zone (parent decides)",
      icon: "💎",
      color: "from-purple-500 to-pink-600"
    }
  ];

  useEffect(() => {
    if (user) {
      fetchTotalCoins();
      fetchRewards();
    }
  }, [user]);

  const fetchTotalCoins = async () => {
    try {
      const { data, error } = await supabase
        .from('coin_transactions')
        .select('amount')
        .eq('student_id', user?.id);

      if (error) throw error;
      
      const total = data?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
      setTotalCoins(total);
    } catch (error) {
      console.error('Error fetching total coins:', error);
    }
  };

  const fetchRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('student_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMilestoneProgress = (targetCoins: number) => {
    const progress = Math.min((totalCoins / targetCoins) * 100, 100);
    const isCompleted = totalCoins >= targetCoins;
    return { progress, isCompleted };
  };

  const generateCertificate = (milestone: any) => {
    // Simple certificate generation
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 800, 600);
      
      // Border
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 10;
      ctx.strokeRect(20, 20, 760, 560);
      
      // Title
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Certificate of Achievement', 400, 100);
      
      // Content
      ctx.font = '24px Arial';
      ctx.fillText(`This certifies that you have reached`, 400, 200);
      ctx.fillText(`${milestone.coins.toLocaleString()} COINS!`, 400, 250);
      
      ctx.font = 'bold 32px Arial';
      ctx.fillStyle = '#8b5cf6';
      ctx.fillText(milestone.title, 400, 320);
      
      ctx.font = '20px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(milestone.description, 400, 360);
      
      // Date
      ctx.fillText(`Achieved on ${new Date().toLocaleDateString()}`, 400, 450);
      
      // Download
      const link = document.createElement('a');
      link.download = `growwise-certificate-${milestone.coins}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
    
    toast({ title: "Certificate Downloaded! 📜", description: "Your achievement certificate has been saved." });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🏆</span>
          <h1 className="text-3xl font-bold text-gray-900">Rewards</h1>
        </div>
        <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
          <Coins className="w-5 h-5 text-yellow-600" />
          <span className="font-bold text-yellow-800">{totalCoins.toLocaleString()} Coins</span>
        </div>
      </div>

      {/* Milestone Progress Cards */}
      <div className="grid gap-6">
        {milestones.map((milestone, index) => {
          const { progress, isCompleted } = getMilestoneProgress(milestone.coins);
          
          return (
            <Card key={index} className={`bg-gradient-to-r ${milestone.color} text-white overflow-hidden`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{milestone.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold">{milestone.title}</h3>
                      <p className="text-white/90">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {milestone.coins.toLocaleString()}
                    </div>
                    <div className="text-white/90 text-sm">coins needed</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-white/90">
                    <span>Progress</span>
                    <span>{totalCoins.toLocaleString()} / {milestone.coins.toLocaleString()}</span>
                  </div>
                  <Progress 
                    value={progress} 
                    className="h-3 bg-white/20"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/90">
                      {isCompleted ? 'Completed! 🎉' : `${(milestone.coins - totalCoins).toLocaleString()} coins to go`}
                    </span>
                    {isCompleted && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => generateCertificate(milestone)}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Certificate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Achievement History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Achievement History
          </CardTitle>
          <CardDescription>
            Your milestone achievements and rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => {
              const { isCompleted } = getMilestoneProgress(milestone.coins);
              
              if (!isCompleted) return null;
              
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{milestone.icon}</span>
                    <div>
                      <h4 className="font-semibold">{milestone.title}</h4>
                      <p className="text-sm text-gray-600">{milestone.description}</p>
                      <p className="text-xs text-gray-500">
                        Achieved: {totalCoins >= milestone.coins ? 'Recently' : 'Not yet'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">
                      {milestone.coins.toLocaleString()} Coins
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateCertificate(milestone)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Certificate
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {milestones.every(m => !getMilestoneProgress(m.coins).isCompleted) && (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No achievements yet. Keep earning coins to unlock your first milestone!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom Rewards (if any) */}
      {rewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-500" />
              Custom Rewards
            </CardTitle>
            <CardDescription>
              Special rewards set by your parents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {rewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{reward.title}</h4>
                    {reward.description && (
                      <p className="text-sm text-gray-600">{reward.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        💰 {reward.coin_cost} coins
                      </Badge>
                      {reward.is_redeemed && (
                        <Badge className="bg-green-100 text-green-800">
                          Redeemed ✓
                        </Badge>
                      )}
                    </div>
                  </div>
                  {!reward.is_redeemed && totalCoins >= reward.coin_cost && (
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Redeem Now
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Rewards;
