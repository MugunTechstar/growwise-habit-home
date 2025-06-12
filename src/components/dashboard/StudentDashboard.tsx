
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Coins, 
  Trophy, 
  Calendar, 
  Target, 
  Star,
  Plus,
  CheckCircle,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  totalCoins: number;
  pendingActivities: number;
  completedToday: number;
  currentStreak: number;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalCoins: 0,
    pendingActivities: 0,
    completedToday: 0,
    currentStreak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch coin balance
      const { data: coinData } = await supabase
        .from('coin_transactions')
        .select('amount')
        .eq('student_id', user?.id);

      const totalCoins = coinData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;

      // Fetch pending activities
      const { data: pendingData } = await supabase
        .from('activities')
        .select('id')
        .eq('student_id', user?.id)
        .eq('status', 'pending');

      // Fetch today's completed activities
      const today = new Date().toISOString().split('T')[0];
      const { data: todayData } = await supabase
        .from('activities')
        .select('id')
        .eq('student_id', user?.id)
        .eq('status', 'approved')
        .gte('submitted_at', `${today}T00:00:00`)
        .lte('submitted_at', `${today}T23:59:59`);

      setStats({
        totalCoins,
        pendingActivities: pendingData?.length || 0,
        completedToday: todayData?.length || 0,
        currentStreak: 5 // TODO: Calculate actual streak
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const coinsToNextMilestone = 5000 - (stats.totalCoins % 5000);
  const milestoneProgress = ((stats.totalCoins % 5000) / 5000) * 100;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back! 🌟</h1>
        <p className="text-purple-100">Ready to grow and earn coins today?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coins</CardTitle>
            <Coins className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCoins}</div>
            <p className="text-xs text-yellow-100">
              {coinsToNextMilestone} to next milestone
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingActivities}</div>
            <p className="text-xs text-muted-foreground">
              Activities awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">
              Great progress today!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Star className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              Days in a row
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Milestone Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Milestone Progress
          </CardTitle>
          <CardDescription>
            Keep going! You're {coinsToNextMilestone} coins away from your next reward milestone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to next milestone</span>
              <span>{stats.totalCoins % 5000}/5000 coins</span>
            </div>
            <Progress value={milestoneProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5 text-green-500" />
              Log Activity
            </CardTitle>
            <CardDescription>
              Submit a completed task or activity
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-blue-500" />
              Plan My Day
            </CardTitle>
            <CardDescription>
              Set up your daily schedule
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-purple-500" />
              Play Games
            </CardTitle>
            <CardDescription>
              Earn coins through educational games
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Your latest submitted activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { task: "Brushed teeth", coins: 5, status: "approved", time: "2 hours ago" },
              { task: "Completed homework", coins: 20, status: "pending", time: "4 hours ago" },
              { task: "Helped with dishes", coins: 15, status: "approved", time: "Yesterday" }
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <p className="font-medium">{activity.task}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={activity.status === 'approved' ? 'default' : 'secondary'}>
                    {activity.status}
                  </Badge>
                  <span className="font-medium text-yellow-600">+{activity.coins} coins</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
