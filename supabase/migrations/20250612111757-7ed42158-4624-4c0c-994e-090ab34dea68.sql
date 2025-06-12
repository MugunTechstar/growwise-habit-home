
-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('parent', 'student');
CREATE TYPE task_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE activity_type AS ENUM ('task', 'calendar', 'game', 'bonus', 'referral');

-- Users/Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  parent_id UUID REFERENCES public.profiles(id),
  age INTEGER,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Task templates library
CREATE TABLE public.task_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  coin_value INTEGER NOT NULL DEFAULT 10,
  age_min INTEGER DEFAULT 4,
  age_max INTEGER DEFAULT 15,
  category TEXT NOT NULL,
  is_default BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Student activities/submissions
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  parent_id UUID NOT NULL REFERENCES public.profiles(id),
  task_template_id UUID REFERENCES public.task_templates(id),
  title TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  audio_url TEXT,
  coin_value INTEGER NOT NULL DEFAULT 0,
  status task_status NOT NULL DEFAULT 'pending',
  activity_type activity_type NOT NULL DEFAULT 'task',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id)
);

-- Coin transactions ledger
CREATE TABLE public.coin_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  activity_id UUID REFERENCES public.activities(id),
  amount INTEGER NOT NULL,
  transaction_type activity_type NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Calendar events and planning
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  category TEXT NOT NULL,
  color_tag TEXT DEFAULT '#3b82f6',
  is_completed BOOLEAN DEFAULT false,
  coin_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rewards and milestones
CREATE TABLE public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  parent_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  coin_cost INTEGER NOT NULL,
  is_milestone BOOLEAN DEFAULT false,
  milestone_coins INTEGER,
  is_redeemed BOOLEAN DEFAULT false,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Referral tracking
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id),
  referee_id UUID REFERENCES public.profiles(id),
  referral_code TEXT NOT NULL UNIQUE,
  coins_awarded INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Game scores and progress
CREATE TABLE public.game_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  game_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  coins_earned INTEGER NOT NULL DEFAULT 0,
  time_taken INTEGER, -- in seconds
  accuracy DECIMAL(5,2),
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile and their children's profiles" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id OR auth.uid() = parent_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Parents can create child profiles" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = parent_id OR (auth.uid() = id AND parent_id IS NULL));

-- RLS Policies for activities
CREATE POLICY "Users can view activities they're involved in" 
  ON public.activities FOR SELECT 
  USING (auth.uid() = student_id OR auth.uid() = parent_id);

CREATE POLICY "Students can create their own activities" 
  ON public.activities FOR INSERT 
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Parents can update activities for their children" 
  ON public.activities FOR UPDATE 
  USING (auth.uid() = parent_id);

-- RLS Policies for coin transactions
CREATE POLICY "Users can view their own coin transactions" 
  ON public.coin_transactions FOR SELECT 
  USING (
    auth.uid() = student_id OR 
    auth.uid() IN (SELECT parent_id FROM public.profiles WHERE id = student_id)
  );

-- RLS Policies for calendar events
CREATE POLICY "Students and parents can manage calendar events" 
  ON public.calendar_events FOR ALL 
  USING (
    auth.uid() = student_id OR 
    auth.uid() IN (SELECT parent_id FROM public.profiles WHERE id = student_id)
  );

-- RLS Policies for other tables (similar pattern)
CREATE POLICY "Family access for task templates" 
  ON public.task_templates FOR ALL 
  USING (parent_id IS NULL OR auth.uid() = parent_id);

CREATE POLICY "Family access for rewards" 
  ON public.rewards FOR ALL 
  USING (auth.uid() = student_id OR auth.uid() = parent_id);

CREATE POLICY "Family access for referrals" 
  ON public.referrals FOR ALL 
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Students can manage their game scores" 
  ON public.game_scores FOR ALL 
  USING (
    auth.uid() = student_id OR 
    auth.uid() IN (SELECT parent_id FROM public.profiles WHERE id = student_id)
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.email,
    'parent', -- Default to parent, can be changed later
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update coin balance when transactions are added
CREATE OR REPLACE FUNCTION public.update_coin_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- This is a trigger function that could be used to maintain coin balance
  -- For now, we'll calculate balance on-the-fly in queries
  RETURN NEW;
END;
$$;

-- Insert default task templates
INSERT INTO public.task_templates (title, description, coin_value, category, age_min, age_max) VALUES
('Brush Teeth', 'Brush your teeth morning and evening', 5, 'hygiene', 4, 15),
('Complete Homework', 'Finish all assigned homework', 20, 'education', 6, 15),
('Help with Chores', 'Help family with household tasks', 15, 'responsibility', 5, 15),
('Read for 30 minutes', 'Read books, articles, or educational content', 25, 'education', 5, 15),
('Exercise or Sports', 'Physical activity for at least 30 minutes', 20, 'health', 4, 15),
('Practice Musical Instrument', 'Practice piano, guitar, or any instrument', 30, 'creativity', 6, 15),
('Meditation or Quiet Time', 'Mindfulness practice for 10-15 minutes', 15, 'wellness', 8, 15),
('Help Someone', 'Do something kind for family or friends', 25, 'kindness', 4, 15),
('Organize Room', 'Clean and organize personal space', 15, 'responsibility', 5, 15),
('Learn Something New', 'Explore a new topic or skill', 30, 'learning', 6, 15);
