import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Calendar, Coins, Users, Shield, Gamepad2, Star, Heart, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
const Index = () => {
  return <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center text-white mb-12">
          <h1 className="text-5xl font-bold mb-4">
            🌟 Welcome to GrowWise
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            A Positive Digital Companion for Students - Turn everyday actions into achievements that build character and earn rewards!
          </p>
          <div className="space-x-4">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white hover:bg-white text-purple-600">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-6 w-6 text-yellow-300" />
                Gamified Growth
              </CardTitle>
              <CardDescription className="text-white/80">
                Earn coins for positive behaviors like brushing teeth, homework, and helping others
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-blue-300" />
                Daily Planning
              </CardTitle>
              <CardDescription className="text-white/80">
                Smart calendar system to build routines and track daily achievements
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-300" />
                Parent-Controlled
              </CardTitle>
              <CardDescription className="text-white/80">
                Complete parental oversight with approval system and reward management
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="h-6 w-6 text-pink-300" />
                Educational Games
              </CardTitle>
              <CardDescription className="text-white/80">
                Fun learning games that replace unproductive screen time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-orange-300" />
                50,000 Coin Milestone
              </CardTitle>
              <CardDescription className="text-white/80">
                Major rewards and recognition for sustained discipline and growth
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-purple-300" />
                Family Connection
              </CardTitle>
              <CardDescription className="text-white/80">
                Referral system and family-based achievement sharing
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Core Values */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-white">
          <h2 className="text-3xl font-bold text-center mb-8">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <Heart className="h-8 w-8 mx-auto text-red-300" />
              <h3 className="font-semibold">Kindness</h3>
              <p className="text-sm text-white/80">Reward helping others and acts of compassion</p>
            </div>
            <div className="space-y-2">
              <Star className="h-8 w-8 mx-auto text-yellow-300" />
              <h3 className="font-semibold">Discipline</h3>
              <p className="text-sm text-white/80">Build daily routines and self-management skills</p>
            </div>
            <div className="space-y-2">
              <BookOpen className="h-8 w-8 mx-auto text-blue-300" />
              <h3 className="font-semibold">Learning</h3>
              <p className="text-sm text-white/80">Encourage curiosity and educational growth</p>
            </div>
            <div className="space-y-2">
              <Trophy className="h-8 w-8 mx-auto text-orange-300" />
              <h3 className="font-semibold">Achievement</h3>
              <p className="text-sm text-white/80">Celebrate progress and milestone rewards</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Child's Growth Journey?
          </h2>
          <p className="text-white/90 mb-8">
            Join thousands of families building positive digital habits together
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Create Your Family Account
            </Button>
          </Link>
        </div>
      </div>
    </div>;
};
export default Index;