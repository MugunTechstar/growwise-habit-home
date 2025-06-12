
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gamepad2, Trophy, Clock, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface GameScore {
  id: string;
  game_type: string;
  score: number;
  coins_earned: number;
  time_taken: number | null;
  accuracy: number | null;
  played_at: string;
}

interface Game {
  id: string;
  title: string;
  description: string;
  emoji: string;
  maxCoinsPerDay: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
}

const Games = () => {
  const { user } = useAuth();
  const [gameScores, setGameScores] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentGameData, setCurrentGameData] = useState<any>(null);

  const availableGames: Game[] = [
    {
      id: 'flag-quiz',
      title: 'Flag Quiz',
      description: 'Test your knowledge of world flags and countries',
      emoji: '🌍',
      maxCoinsPerDay: 3,
      difficulty: 'Medium',
      category: 'Geography'
    },
    {
      id: 'vocabulary-builder',
      title: 'Vocabulary Builder',
      description: 'Learn new words and expand your vocabulary',
      emoji: '📖',
      maxCoinsPerDay: 3,
      difficulty: 'Easy',
      category: 'Language'
    },
    {
      id: 'typing-practice',
      title: 'Typing Practice',
      description: 'Improve your typing speed and accuracy',
      emoji: '⌨️',
      maxCoinsPerDay: 2,
      difficulty: 'Easy',
      category: 'Skills'
    },
    {
      id: 'memory-match',
      title: 'Memory Match',
      description: 'Challenge your memory with card matching games',
      emoji: '🧠',
      maxCoinsPerDay: 3,
      difficulty: 'Medium',
      category: 'Memory'
    }
  ];

  useEffect(() => {
    if (user) {
      fetchGameScores();
    }
  }, [user]);

  const fetchGameScores = async () => {
    try {
      const { data, error } = await supabase
        .from('game_scores')
        .select('*')
        .eq('student_id', user?.id)
        .order('played_at', { ascending: false });

      if (error) throw error;
      setGameScores(data || []);
    } catch (error) {
      console.error('Error fetching game scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCoinsEarnedToday = (gameType: string) => {
    const today = new Date().toDateString();
    const todayScores = gameScores.filter(
      score => score.game_type === gameType && 
      new Date(score.played_at).toDateString() === today
    );
    return todayScores.reduce((sum, score) => sum + score.coins_earned, 0);
  };

  const canEarnMoreCoins = (game: Game) => {
    const earnedToday = getCoinsEarnedToday(game.id);
    return earnedToday < game.maxCoinsPerDay;
  };

  const playGame = async (game: Game) => {
    if (!canEarnMoreCoins(game)) {
      toast({ 
        title: "Daily Limit Reached! 📊", 
        description: `You've already earned ${game.maxCoinsPerDay} coins today from ${game.title}. Come back tomorrow!` 
      });
      return;
    }

    setSelectedGame(game);
    setIsPlaying(true);
    
    // Simulate game play based on game type
    switch (game.id) {
      case 'flag-quiz':
        await playFlagQuiz(game);
        break;
      case 'vocabulary-builder':
        await playVocabularyBuilder(game);
        break;
      case 'typing-practice':
        await playTypingPractice(game);
        break;
      case 'memory-match':
        await playMemoryMatch(game);
        break;
    }
  };

  const playFlagQuiz = async (game: Game) => {
    const countries = ['USA', 'Canada', 'Brazil', 'France', 'Germany', 'Japan', 'Australia', 'India'];
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    
    setCurrentGameData({
      question: `What country does this flag belong to? 🇺🇸`,
      options: [randomCountry, 'Wrong1', 'Wrong2', 'Wrong3'].sort(() => Math.random() - 0.5),
      correct: randomCountry,
      timeLimit: 30
    });
    
    // Simulate game completion after 5 seconds
    setTimeout(() => {
      completeGame(game, Math.floor(Math.random() * 100) + 50, 85, 25);
    }, 5000);
  };

  const playVocabularyBuilder = async (game: Game) => {
    const words = ['Magnificent', 'Extraordinary', 'Phenomenal', 'Remarkable'];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    
    setCurrentGameData({
      word: randomWord,
      definition: 'Choose the correct definition',
      options: ['Very impressive', 'Small', 'Colorful', 'Fast'],
      correct: 'Very impressive'
    });
    
    setTimeout(() => {
      completeGame(game, Math.floor(Math.random() * 100) + 60, 90, 20);
    }, 4000);
  };

  const playTypingPractice = async (game: Game) => {
    setCurrentGameData({
      text: 'The quick brown fox jumps over the lazy dog',
      wpm: 0,
      accuracy: 0
    });
    
    setTimeout(() => {
      const wpm = Math.floor(Math.random() * 40) + 20;
      completeGame(game, wpm, Math.floor(Math.random() * 20) + 80, 30);
    }, 6000);
  };

  const playMemoryMatch = async (game: Game) => {
    setCurrentGameData({
      cards: ['🎃', '🎄', '🎯', '🎨', '🎪', '🎭'],
      matches: 0,
      moves: 0
    });
    
    setTimeout(() => {
      const moves = Math.floor(Math.random() * 20) + 15;
      const score = Math.max(100 - moves * 2, 50);
      completeGame(game, score, null, 45);
    }, 7000);
  };

  const completeGame = async (game: Game, score: number, accuracy: number | null, timeTaken: number) => {
    try {
      const coinsEarned = Math.min(Math.floor(score / 25), 3);
      
      const { error } = await supabase
        .from('game_scores')
        .insert({
          student_id: user?.id,
          game_type: game.id,
          score,
          coins_earned: coinsEarned,
          time_taken: timeTaken,
          accuracy
        });

      if (error) throw error;

      // Add coin transaction
      await supabase
        .from('coin_transactions')
        .insert({
          student_id: user?.id,
          amount: coinsEarned,
          transaction_type: 'game',
          description: `${game.title} - Score: ${score}`
        });

      toast({ 
        title: "Game Complete! 🎉", 
        description: `You scored ${score} points and earned ${coinsEarned} coins!` 
      });

      fetchGameScores();
    } catch (error) {
      console.error('Error saving game score:', error);
      toast({ title: "Error", description: "Failed to save game score" });
    } finally {
      setIsPlaying(false);
      setSelectedGame(null);
      setCurrentGameData(null);
    }
  };

  const getBestScore = (gameType: string) => {
    const scores = gameScores.filter(score => score.game_type === gameType);
    return scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;
  };

  const getTotalGamesPlayed = () => {
    return gameScores.length;
  };

  const getTotalCoinsFromGames = () => {
    return gameScores.reduce((sum, score) => sum + score.coins_earned, 0);
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-3xl">🎮</span>
        <h1 className="text-3xl font-bold text-gray-900">Games</h1>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Gamepad2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{getTotalGamesPlayed()}</div>
                <div className="text-sm text-gray-600">Games Played</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{getTotalCoinsFromGames()}</div>
                <div className="text-sm text-gray-600">Coins Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {gameScores.filter(s => new Date(s.played_at).toDateString() === new Date().toDateString()).length}
                </div>
                <div className="text-sm text-gray-600">Today's Games</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Games */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableGames.map((game) => {
            const earnedToday = getCoinsEarnedToday(game.id);
            const canPlay = canEarnMoreCoins(game);
            const bestScore = getBestScore(game.id);

            return (
              <Card key={game.id} className={`${canPlay ? 'hover:shadow-lg transition-shadow cursor-pointer' : 'opacity-60'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{game.emoji}</span>
                      <span>{game.title}</span>
                    </div>
                    <Badge variant="outline">{game.difficulty}</Badge>
                  </CardTitle>
                  <CardDescription>{game.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Daily Coins Progress:</span>
                      <span>{earnedToday}/{game.maxCoinsPerDay}</span>
                    </div>
                    <Progress value={(earnedToday / game.maxCoinsPerDay) * 100} className="h-2" />
                    
                    {bestScore > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Best Score:</span>
                        <span className="font-medium">{bestScore}</span>
                      </div>
                    )}

                    <Button 
                      className="w-full mt-4"
                      onClick={() => playGame(game)}
                      disabled={!canPlay || isPlaying}
                      variant={canPlay ? "default" : "secondary"}
                    >
                      {!canPlay ? 'Daily Limit Reached' : isPlaying ? 'Playing...' : 'Play Game 🎮'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Games */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gameScores.slice(0, 5).map((score) => {
              const game = availableGames.find(g => g.id === score.game_type);
              return (
                <div key={score.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{game?.emoji}</span>
                    <div>
                      <div className="font-medium">{game?.title}</div>
                      <div className="text-sm text-gray-600">
                        Score: {score.score} • {new Date(score.played_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    +{score.coins_earned} coins
                  </Badge>
                </div>
              );
            })}
            {gameScores.length === 0 && (
              <p className="text-gray-500 text-center py-4">No games played yet. Start playing to earn coins!</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Game Dialog */}
      <Dialog open={isPlaying} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedGame?.emoji}</span>
              {selectedGame?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Playing game...</p>
            <p className="text-sm text-gray-500 mt-2">This is a demo. Real games would be implemented here!</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Games;
