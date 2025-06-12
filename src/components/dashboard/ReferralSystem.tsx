
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Users, Gift, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Referral {
  id: string;
  referral_code: string;
  referee_id: string | null;
  coins_awarded: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

const ReferralSystem = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [myReferralCode, setMyReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'parent' | 'student' | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserRole();
      fetchReferrals();
      generateOrGetReferralCode();
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

  const fetchReferrals = async () => {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateOrGetReferralCode = async () => {
    try {
      // Check if user already has a referral code
      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referrer_id', user?.id)
        .limit(1);

      if (existingReferral && existingReferral.length > 0) {
        setMyReferralCode(existingReferral[0].referral_code);
      } else {
        // Generate new referral code
        const code = `GROW${user?.id?.substring(0, 8).toUpperCase()}`;
        
        const { error } = await supabase
          .from('referrals')
          .insert({
            referrer_id: user?.id,
            referral_code: code,
            coins_awarded: 0,
            is_completed: false
          });

        if (error) throw error;
        setMyReferralCode(code);
      }
    } catch (error) {
      console.error('Error generating referral code:', error);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(myReferralCode);
    toast({ title: "Copied! 📋", description: "Referral code copied to clipboard" });
  };

  const getTotalReferralCoins = () => {
    return referrals.reduce((sum, referral) => sum + referral.coins_awarded, 0);
  };

  const getCompletedReferrals = () => {
    return referrals.filter(r => r.is_completed).length;
  };

  const getPendingReferrals = () => {
    return referrals.filter(r => !r.is_completed && r.referee_id).length;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Only show referral system to parents
  if (userRole !== 'parent') {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🎁</span>
          Referral System
        </CardTitle>
        <CardDescription>
          Invite friends and earn 300 coins when their child completes 3 activities!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Referral Code */}
        <div>
          <label className="block text-sm font-medium mb-2">Your Referral Code</label>
          <div className="flex gap-2">
            <Input
              value={myReferralCode}
              readOnly
              className="bg-white font-mono text-lg text-center"
            />
            <Button onClick={copyReferralCode} variant="outline">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Share this code with friends when they sign up for GrowWise
          </p>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{getCompletedReferrals()}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{getPendingReferrals()}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-2xl font-bold text-green-600">{getTotalReferralCoins()}</div>
            <div className="text-sm text-gray-600">Coins Earned</div>
          </div>
        </div>

        {/* Recent Referrals */}
        {referrals.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Recent Referrals</h4>
            <div className="space-y-2">
              {referrals.slice(0, 3).map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-2 bg-white rounded">
                  <div>
                    <div className="text-sm font-medium">
                      Code: {referral.referral_code}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {referral.is_completed ? (
                      <>
                        <Badge className="bg-green-100 text-green-800">
                          +{referral.coins_awarded} coins
                        </Badge>
                        <Check className="w-4 h-4 text-green-600" />
                      </>
                    ) : referral.referee_id ? (
                      <Badge variant="outline" className="bg-orange-100 text-orange-700">
                        Pending
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-600">
                        Unused
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Gift className="w-4 h-4" />
            How it works:
          </h4>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Share your referral code with friends</li>
            <li>2. They sign up and enter your code</li>
            <li>3. When their child completes 3 activities, you both get 300 coins!</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralSystem;
