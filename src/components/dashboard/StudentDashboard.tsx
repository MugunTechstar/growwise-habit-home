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
  Clock,
  Activity,
  Gamepad2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  totalCoins: number;
  pendingActivities: number;
  completedToday: number;
  currentStreak: number;
  totalActivities: number;
  approvedActivities: number;
  calendarEvents: number;
  gamesPlayed: number;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalCoins: 0,
    pendingActivities: 0,
    completedToday: 0,
    currentStreak: 0,
    totalActivities: 0,
    approvedActivities: 0,
    calendarEvents: 0,
    gamesPlayed: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

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
        currentStreak: 5, // TODO: Calculate actual streak
        totalActivities: 100, // TODO: Fetch actual total activities
        approvedActivities: 50, // TODO: Fetch actual approved activities
        calendarEvents: 20, // TODO: Fetch actual calendar events
        gamesPlayed: 15 // TODO: Fetch actual games played
      });

      // Fetch recent activities
      const { data: recentActivityData } = await supabase
        .from('activities')
        .select('*')
        .eq('student_id', user?.id)
        .order('submitted_at', { ascending: false })
        .limit(10);

      setRecentActivities(recentActivityData || []);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back! 🌟</h1>
          <p className="text-gray-600">Keep growing and earning coins!</p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
          <Coins className="w-5 h-5 text-yellow-600" />
          <span className="font-bold text-yellow-800">{totalCoins} Coins</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-blue-100">Total Activities</p>
                <p className="text-3xl font-bold">{stats.totalActivities}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-green-100">Approved</p>
                <p className="text-3xl font-bold">{stats.approvedActivities}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-orange-100">Calendar Events</p>
                <p className="text-3xl font-bold">{stats.calendarEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-purple-100">Games Played</p>
                <p className="text-3xl font-bold">{stats.gamesPlayed}</p>
              </div>
              <Gamepad2 className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      activity.status === 'approved' ? 'default' : 
                      activity.status === 'pending' ? 'secondary' : 'destructive'
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <p className="text-gray-500 text-center py-4">No activities yet. Start by submitting your first activity!</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Submit New Activity
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Add Calendar Event
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Play Games
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Trophy className="w-4 h-4 mr-2" />
              View Rewards
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Include Referral System for parents */}
      <ReferralSystem />
    </div>
  );
};

export default StudentDashboard;
