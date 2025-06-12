
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Camera, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Activity {
  id: string;
  title: string;
  description: string;
  photo_url: string | null;
  coin_value: number;
  status: 'pending' | 'approved' | 'rejected';
  activity_type: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

const Activities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'parent' | 'student' | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Daily Habit',
    'Kindness',
    'Creative',
    'Learning',
    'Exercise',
    'Helping Others',
    'Reading',
    'Chores'
  ];

  useEffect(() => {
    if (user) {
      fetchUserRole();
      fetchActivities();
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

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category) {
      toast({ title: "Error", description: "Please fill in all required fields" });
      return;
    }

    setSubmitting(true);
    try {
      // Get parent ID for the student
      const { data: profile } = await supabase
        .from('profiles')
        .select('parent_id')
        .eq('id', user?.id)
        .single();

      const parentId = profile?.parent_id || user?.id;

      const { error } = await supabase
        .from('activities')
        .insert({
          student_id: user?.id,
          parent_id: parentId,
          title,
          description,
          activity_type: 'task',
          coin_value: 15, // Default coin value
          status: 'pending'
        });

      if (error) throw error;

      toast({ title: "Success! 🎉", description: "Activity submitted for review!" });
      setTitle('');
      setDescription('');
      setCategory('');
      setPhotoFile(null);
      fetchActivities();
    } catch (error) {
      console.error('Error submitting activity:', error);
      toast({ title: "Error", description: "Failed to submit activity" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveReject = async (activityId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('activities')
        .update({ 
          status, 
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id 
        })
        .eq('id', activityId);

      if (error) throw error;

      // If approved, create coin transaction
      if (status === 'approved') {
        const activity = activities.find(a => a.id === activityId);
        if (activity) {
          await supabase
            .from('coin_transactions')
            .insert({
              student_id: activity.id,
              activity_id: activityId,
              amount: activity.coin_value,
              transaction_type: 'task',
              description: `Reward for: ${activity.title}`
            });
        }
      }

      toast({ 
        title: status === 'approved' ? "Approved! ✅" : "Rejected", 
        description: `Activity has been ${status}` 
      });
      fetchActivities();
    } catch (error) {
      console.error('Error updating activity:', error);
      toast({ title: "Error", description: "Failed to update activity" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
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

  const pendingActivities = activities.filter(a => a.status === 'pending');
  const approvedActivities = activities.filter(a => a.status === 'approved');
  const rejectedActivities = activities.filter(a => a.status === 'rejected');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-3xl">📋</span>
        <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
      </div>

      {userRole === 'student' && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              Submit New Activity
            </CardTitle>
            <CardDescription>
              Share what awesome thing you did today and earn coins!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Activity Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What did you do?"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us more about what you did..."
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-purple-600 hover:bg-purple-700">
                {submitting ? 'Submitting...' : 'Submit Activity 🚀'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pending Activities */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-600" />
          Pending Review ({pendingActivities.length})
        </h2>
        <div className="grid gap-4">
          {pendingActivities.map((activity) => (
            <Card key={activity.id} className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{activity.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>💰 {activity.coin_value} coins</span>
                      <span>📅 {new Date(activity.submitted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(activity.status)}
                    {userRole === 'parent' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-green-100 hover:bg-green-200 text-green-700"
                          onClick={() => handleApproveReject(activity.id, 'approved')}
                        >
                          Approve ✅
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-red-100 hover:bg-red-200 text-red-700"
                          onClick={() => handleApproveReject(activity.id, 'rejected')}
                        >
                          Reject ❌
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {pendingActivities.length === 0 && (
            <p className="text-gray-500 text-center py-8">No pending activities</p>
          )}
        </div>
      </div>

      {/* Approved Activities */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Approved Activities ({approvedActivities.length})
        </h2>
        <div className="grid gap-4">
          {approvedActivities.slice(0, 5).map((activity) => (
            <Card key={activity.id} className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{activity.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>💰 {activity.coin_value} coins earned!</span>
                      <span>📅 {new Date(activity.submitted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {getStatusBadge(activity.status)}
                </div>
              </CardContent>
            </Card>
          ))}
          {approvedActivities.length === 0 && (
            <p className="text-gray-500 text-center py-8">No approved activities yet</p>
          )}
        </div>
      </div>

      {/* Rejected Activities */}
      {rejectedActivities.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            Rejected Activities ({rejectedActivities.length})
          </h2>
          <div className="grid gap-4">
            {rejectedActivities.slice(0, 3).map((activity) => (
              <Card key={activity.id} className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{activity.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>📅 {new Date(activity.submitted_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {getStatusBadge(activity.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
