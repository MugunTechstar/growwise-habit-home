
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Plus, CheckCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  category: string;
  color_tag: string;
  is_completed: boolean;
  coin_reward: number;
}

const Calendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const categories = [
    { name: 'Study', color: '#3b82f6', emoji: '📚' },
    { name: 'Exam', color: '#ef4444', emoji: '📝' },
    { name: 'Prayer', color: '#8b5cf6', emoji: '🤲' },
    { name: 'Screen-Free', color: '#10b981', emoji: '🌿' },
    { name: 'Exercise', color: '#f59e0b', emoji: '🏃' },
    { name: 'Family Time', color: '#ec4899', emoji: '👨‍👩‍👧‍👦' },
    { name: 'Chores', color: '#6b7280', emoji: '🧹' },
    { name: 'Reading', color: '#14b8a6', emoji: '📖' }
  ];

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('student_id', user?.id)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !eventDate) {
      toast({ title: "Error", description: "Please fill in all required fields" });
      return;
    }

    try {
      const categoryData = categories.find(c => c.name === category);
      const { error } = await supabase
        .from('calendar_events')
        .insert({
          student_id: user?.id,
          title,
          event_date: eventDate,
          start_time: startTime || null,
          end_time: endTime || null,
          category,
          color_tag: categoryData?.color || '#3b82f6',
          coin_reward: 5
        });

      if (error) throw error;

      toast({ title: "Success! 📅", description: "Event added to your calendar!" });
      setTitle('');
      setCategory('');
      setEventDate('');
      setStartTime('');
      setEndTime('');
      setShowAddDialog(false);
      fetchEvents();
    } catch (error) {
      console.error('Error adding event:', error);
      toast({ title: "Error", description: "Failed to add event" });
    }
  };

  const markAsCompleted = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      const { error } = await supabase
        .from('calendar_events')
        .update({ is_completed: true })
        .eq('id', eventId);

      if (error) throw error;

      // Add coin transaction
      await supabase
        .from('coin_transactions')
        .insert({
          student_id: user?.id,
          amount: event.coin_reward,
          transaction_type: 'calendar',
          description: `Completed: ${event.title}`
        });

      toast({ title: "Completed! 🎉", description: `You earned ${event.coin_reward} coins!` });
      fetchEvents();
    } catch (error) {
      console.error('Error marking event as completed:', error);
      toast({ title: "Error", description: "Failed to mark event as completed" });
    }
  };

  const getWeekEvents = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    return weekDays.map(day => ({
      date: day,
      events: events.filter(e => new Date(e.event_date).toDateString() === day.toDateString())
    }));
  };

  const getTotalStreak = () => {
    const completedEvents = events.filter(e => e.is_completed);
    return completedEvents.length;
  };

  const getStreakProgress = () => {
    const streak = getTotalStreak();
    const nextMilestone = Math.ceil(streak / 10) * 10;
    return {
      current: streak,
      target: nextMilestone,
      percentage: (streak / nextMilestone) * 100
    };
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

  const weekEvents = getWeekEvents();
  const streakProgress = getStreakProgress();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">📅</span>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Event Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's happening?"
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
                      <SelectItem key={cat.name} value={cat.name}>
                        {cat.emoji} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date *</label>
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Time</label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Time</label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                Add Event 🚀
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Streak Progress */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                Activity Streak
              </h3>
              <p className="text-gray-600">Keep completing your calendar events!</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{streakProgress.current}</div>
              <div className="text-sm text-gray-500">completed events</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress to {streakProgress.target}</span>
              <span>{streakProgress.current}/{streakProgress.target}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(streakProgress.percentage, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <Button 
          variant={viewMode === 'week' ? 'default' : 'outline'}
          onClick={() => setViewMode('week')}
        >
          Week View
        </Button>
        <Button 
          variant={viewMode === 'month' ? 'default' : 'outline'}
          onClick={() => setViewMode('month')}
        >
          Month View
        </Button>
      </div>

      {/* Calendar Grid */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-7 gap-4">
          {weekEvents.map(({ date, events: dayEvents }, index) => (
            <Card key={index} className="min-h-[200px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-center">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </CardTitle>
                <div className="text-lg font-bold text-center">
                  {date.getDate()}
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {dayEvents.map((event) => {
                  const categoryData = categories.find(c => c.name === event.category);
                  return (
                    <div
                      key={event.id}
                      className="p-2 rounded text-xs cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: `${event.color_tag}20`, border: `1px solid ${event.color_tag}` }}
                      onClick={() => !event.is_completed && markAsCompleted(event.id)}
                    >
                      <div className="flex items-center gap-1">
                        <span>{categoryData?.emoji}</span>
                        <span className="font-medium truncate">{event.title}</span>
                      </div>
                      {event.start_time && (
                        <div className="text-gray-600">{event.start_time}</div>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs">💰{event.coin_reward}</span>
                        {event.is_completed ? (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events
              .filter(e => new Date(e.event_date) >= new Date() && !e.is_completed)
              .slice(0, 5)
              .map((event) => {
                const categoryData = categories.find(c => c.name === event.category);
                return (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{categoryData?.emoji}</span>
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(event.event_date).toLocaleDateString()}
                          {event.start_time && ` at ${event.start_time}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">💰 {event.coin_reward} coins</Badge>
                      <Button 
                        size="sm" 
                        onClick={() => markAsCompleted(event.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mark Done ✓
                      </Button>
                    </div>
                  </div>
                );
              })}
            {events.filter(e => new Date(e.event_date) >= new Date() && !e.is_completed).length === 0 && (
              <p className="text-gray-500 text-center py-4">No upcoming events</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Calendar;
