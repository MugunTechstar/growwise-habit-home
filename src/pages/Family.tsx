
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Download, Eye, Calendar, Coins, Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface FamilyMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'parent' | 'student';
  age: number | null;
  created_at: string;
}

interface ActivityLog {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  coin_value: number;
  submitted_at: string;
  student_name: string;
}

interface CoinTransaction {
  id: string;
  amount: number;
  description: string;
  created_at: string;
  student_name: string;
}

const Family = () => {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [coinTransactions, setCoinTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'parent' | 'student' | null>(null);
  const [showAddChild, setShowAddChild] = useState(false);
  
  // Form state for adding child
  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName, setChildLastName] = useState('');
  const [childEmail, setChildEmail] = useState('');
  const [childAge, setChildAge] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserRole();
      fetchFamilyMembers();
      fetchActivityLogs();
      fetchCoinTransactions();
    }
  }, [user]);

  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setUserRole(data.role);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      let query = supabase.from('profiles').select('*');
      
      if (userRole === 'parent') {
        // Parents can see themselves and their children
        query = query.or(`id.eq.${user?.id},parent_id.eq.${user?.id}`);
      } else {
        // Students can see their family members
        const { data: profile } = await supabase
          .from('profiles')
          .select('parent_id')
          .eq('id', user?.id)
          .single();
        
        if (profile?.parent_id) {
          query = query.or(`id.eq.${profile.parent_id},parent_id.eq.${profile.parent_id}`);
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) throw error;
      setFamilyMembers(data || []);
    } catch (error) {
      console.error('Error fetching family members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          id,
          title,
          status,
          coin_value,
          submitted_at,
          profiles!activities_student_id_fkey(first_name, last_name)
        `)
        .order('submitted_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const logs = data?.map(activity => ({
        ...activity,
        student_name: `${activity.profiles?.first_name} ${activity.profiles?.last_name}`
      })) || [];
      
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  const fetchCoinTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('coin_transactions')
        .select(`
          id,
          amount,
          description,
          created_at,
          profiles!coin_transactions_student_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const transactions = data?.map(transaction => ({
        ...transaction,
        student_name: `${transaction.profiles?.first_name} ${transaction.profiles?.last_name}`
      })) || [];
      
      setCoinTransactions(transactions);
    } catch (error) {
      console.error('Error fetching coin transactions:', error);
    }
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childFirstName || !childLastName || !childEmail) {
      toast({ title: "Error", description: "Please fill in all required fields" });
      return;
    }

    try {
      // In a real app, you'd create the child account properly
      // For now, we'll just add them to the profiles table
      const { error } = await supabase
        .from('profiles')
        .insert({
          first_name: childFirstName,
          last_name: childLastName,
          email: childEmail,
          role: 'student',
          parent_id: user?.id,
          age: childAge ? parseInt(childAge) : null
        });

      if (error) throw error;

      toast({ title: "Success! 👨‍👩‍👧‍👦", description: `${childFirstName} has been added to your family!` });
      setChildFirstName('');
      setChildLastName('');
      setChildEmail('');
      setChildAge('');
      setShowAddChild(false);
      fetchFamilyMembers();
    } catch (error) {
      console.error('Error adding child:', error);
      toast({ title: "Error", description: "Failed to add child" });
    }
  };

  const generateMonthlyReport = () => {
    const now = new Date();
    const month = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const report = {
      month,
      familyMembers: familyMembers.length,
      totalActivities: activityLogs.length,
      totalCoins: coinTransactions.reduce((sum, t) => sum + t.amount, 0),
      activities: activityLogs,
      transactions: coinTransactions
    };

    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([`GrowWise Family Report - ${month}\n\n${dataStr}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `growwise-family-report-${now.getFullYear()}-${now.getMonth() + 1}.txt`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast({ title: "Report Downloaded! 📊", description: "Your monthly family report has been saved." });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const students = familyMembers.filter(member => member.role === 'student');
  const parents = familyMembers.filter(member => member.role === 'parent');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">👨‍👩‍👧‍👦</span>
          <h1 className="text-3xl font-bold text-gray-900">Family</h1>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={generateMonthlyReport}
            className="bg-blue-50 hover:bg-blue-100"
          >
            <Download className="w-4 h-4 mr-2" />
            Monthly Report
          </Button>
          
          {userRole === 'parent' && (
            <Dialog open={showAddChild} onOpenChange={setShowAddChild}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Child
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Child to Family</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddChild} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name *</label>
                      <Input
                        value={childFirstName}
                        onChange={(e) => setChildFirstName(e.target.value)}
                        placeholder="Child's first name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name *</label>
                      <Input
                        value={childLastName}
                        onChange={(e) => setChildLastName(e.target.value)}
                        placeholder="Child's last name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <Input
                      type="email"
                      value={childEmail}
                      onChange={(e) => setChildEmail(e.target.value)}
                      placeholder="child@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Age</label>
                    <Input
                      type="number"
                      value={childAge}
                      onChange={(e) => setChildAge(e.target.value)}
                      placeholder="Age"
                      min="1"
                      max="18"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                    Add Child 👶
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Family Members */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Family Members ({familyMembers.length})
            </CardTitle>
            <CardDescription>
              Your family members and their progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">
                        {member.role === 'parent' ? '👨‍👩' : '👧'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{member.first_name} {member.last_name}</h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={member.role === 'parent' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                        {member.age && (
                          <Badge variant="outline">Age {member.age}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      Joined {new Date(member.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity Logs
            </CardTitle>
            <CardDescription>
              Recent activities from family members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">{log.title}</h4>
                    <p className="text-sm text-gray-600">by {log.student_name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">💰 {log.coin_value}</Badge>
                    <Badge 
                      variant={
                        log.status === 'approved' ? 'default' : 
                        log.status === 'pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {log.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {activityLogs.length === 0 && (
                <p className="text-gray-500 text-center py-4">No recent activities</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Coin Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              Recent Coin Transactions
            </CardTitle>
            <CardDescription>
              Coin earnings and rewards across the family
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {coinTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">{transaction.description}</h4>
                    <p className="text-sm text-gray-600">for {transaction.student_name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    +{transaction.amount} coins
                  </Badge>
                </div>
              ))}
              {coinTransactions.length === 0 && (
                <p className="text-gray-500 text-center py-4">No recent transactions</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Family;
