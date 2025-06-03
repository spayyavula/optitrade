import React, { useState } from 'react';
import { Trophy, Book, Target, TrendingUp, ArrowRight, CheckCircle2, Medal, Users, Clock, DollarSign } from 'lucide-react';
import PriceChart from '../components/common/PriceChart';
import { mockAAPLData } from '../data/mockData';

interface Lesson {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  points: number;
  duration: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  completed: boolean;
}

interface Tournament {
  id: string;
  title: string;
  sponsor: string;
  prize: string;
  participants: number;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  description: string;
  requirements: string[];
  status: 'upcoming' | 'active' | 'completed';
}

const Learn: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'challenges' | 'simulator' | 'tournaments'>('tournaments');
  const [selectedPrice, setSelectedPrice] = useState<number>(175);
  const [userAnswer, setUserAnswer] = useState<'call' | 'put' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const tournaments: Tournament[] = [
    {
      id: '1',
      title: 'Goldman Sachs Options Trading Championship',
      sponsor: 'Goldman Sachs',
      prize: '$25,000',
      participants: 2456,
      maxParticipants: 5000,
      startDate: '2025-03-15',
      endDate: '2025-04-15',
      description: 'Compete against the best traders in a month-long options trading competition. Trade virtual capital across multiple market conditions.',
      requirements: ['Complete Options Basics course', 'Minimum Level 5', '100 simulated trades'],
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'JPMorgan Market Maker Challenge',
      sponsor: 'JPMorgan Chase',
      prize: '$15,000',
      participants: 1823,
      maxParticipants: 2000,
      startDate: '2025-03-01',
      endDate: '2025-03-31',
      description: 'Test your market making skills by providing liquidity in volatile market conditions. Special focus on risk management.',
      requirements: ['Complete Advanced Strategies course', 'Minimum Level 8', '250 simulated trades'],
      status: 'active'
    },
    {
      id: '3',
      title: 'Morgan Stanley Volatility Masters',
      sponsor: 'Morgan Stanley',
      prize: '$10,000',
      participants: 1500,
      maxParticipants: 1500,
      startDate: '2025-02-01',
      endDate: '2025-02-28',
      description: 'Master volatility trading strategies in this intensive competition. Trade VIX options and volatility-based strategies.',
      requirements: ['Complete Greeks Explained course', 'Minimum Level 7'],
      status: 'completed'
    }
  ];

  const lessons: Lesson[] = [
    {
      id: '1',
      title: 'Options Basics',
      description: 'Learn the fundamental concepts of options trading',
      completed: true,
      points: 100,
      duration: '15 min'
    },
    {
      id: '2',
      title: 'Calls & Puts',
      description: 'Understanding call and put options',
      completed: true,
      points: 150,
      duration: '20 min'
    },
    {
      id: '3',
      title: 'Greeks Explained',
      description: 'Master Delta, Gamma, Theta, and Vega',
      completed: false,
      points: 200,
      duration: '25 min'
    },
    {
      id: '4',
      title: 'Advanced Strategies',
      description: 'Learn complex options trading strategies',
      completed: false,
      points: 250,
      duration: '30 min'
    }
  ];

  const challenges: Challenge[] = [
    {
      id: '1',
      title: 'Market Direction',
      description: 'Predict market movement and select the right option type',
      reward: 100,
      difficulty: 'Beginner',
      completed: false
    },
    {
      id: '2',
      title: 'Volatility Play',
      description: 'Choose the best strategy based on volatility conditions',
      reward: 200,
      difficulty: 'Intermediate',
      completed: false
    },
    {
      id: '3',
      title: 'Risk Management',
      description: 'Create a balanced options portfolio within risk limits',
      reward: 300,
      difficulty: 'Advanced',
      completed: false
    }
  ];

  const checkAnswer = () => {
    if (!userAnswer) return;
    
    const correctAnswer = selectedPrice > 175 ? 'call' : 'put';
    const isCorrect = userAnswer === correctAnswer;
    
    setShowFeedback(true);
    
    setTimeout(() => {
      setShowFeedback(false);
      setUserAnswer(null);
      setSelectedPrice(Math.random() * 50 + 150);
    }, 2000);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Learn Options Trading</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card bg-gradient-to-br from-primary-900 to-primary-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Trophy className="text-primary-400 mr-2" size={24} />
                <h3 className="text-lg font-semibold">Your Progress</h3>
              </div>
              <span className="text-2xl font-bold text-primary-400">450</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Level 3</span>
                  <span>750 XP needed</span>
                </div>
                <div className="h-2 bg-primary-700 rounded-full">
                  <div className="h-full w-3/5 bg-primary-400 rounded-full"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-400">Lessons Completed</p>
                  <p className="font-medium">2/4</p>
                </div>
                <div>
                  <p className="text-neutral-400">Challenges Won</p>
                  <p className="font-medium">3/5</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-success-900 to-success-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Target className="text-success-400 mr-2" size={24} />
                <h3 className="text-lg font-semibold">Daily Challenge</h3>
              </div>
              <span className="text-sm font-medium px-2 py-1 bg-success-800 rounded-full">+100 XP</span>
            </div>
            <p className="text-sm mb-3">Complete 3 market prediction challenges</p>
            <div className="h-2 bg-success-700 rounded-full">
              <div className="h-full w-2/3 bg-success-400 rounded-full"></div>
            </div>
            <p className="text-sm mt-2 text-success-400">2/3 completed</p>
          </div>

          <div className="card bg-gradient-to-br from-secondary-900 to-secondary-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Medal className="text-secondary-400 mr-2" size={24} />
                <h3 className="text-lg font-semibold">Tournament Status</h3>
              </div>
            </div>
            <p className="text-sm mb-3">JPMorgan Market Maker Challenge</p>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-secondary-400">Current Rank:</span>
              <span className="font-medium">#156 of 1823</span>
            </div>
            <div className="h-2 bg-secondary-700 rounded-full mb-2">
              <div className="h-full w-4/5 bg-secondary-400 rounded-full"></div>
            </div>
            <p className="text-xs text-secondary-400">Top 10% - Keep going!</p>
          </div>
        </div>

        <div className="card">
          <div className="flex space-x-1 bg-neutral-700 p-1 rounded-lg mb-6">
            <button 
              onClick={() => setActiveTab('tournaments')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'tournaments' 
                  ? 'bg-neutral-600 text-white' 
                  : 'text-neutral-400 hover:bg-neutral-600/50'
              }`}
            >
              Tournaments
            </button>
            <button 
              onClick={() => setActiveTab('lessons')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'lessons' 
                  ? 'bg-neutral-600 text-white' 
                  : 'text-neutral-400 hover:bg-neutral-600/50'
              }`}
            >
              Lessons
            </button>
            <button 
              onClick={() => setActiveTab('challenges')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'challenges' 
                  ? 'bg-neutral-600 text-white' 
                  : 'text-neutral-400 hover:bg-neutral-600/50'
              }`}
            >
              Challenges
            </button>
            <button 
              onClick={() => setActiveTab('simulator')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'simulator' 
                  ? 'bg-neutral-600 text-white' 
                  : 'text-neutral-400 hover:bg-neutral-600/50'
              }`}
            >
              Market Simulator
            </button>
          </div>

          {activeTab === 'tournaments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Company Sponsored Tournaments</h3>
                <div className="flex gap-2">
                  <button className="btn-ghost text-sm py-1.5 px-3">Rules</button>
                  <button className="btn-ghost text-sm py-1.5 px-3">Leaderboard</button>
                  <button className="btn-primary text-sm py-1.5 px-3">My Tournaments</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tournaments.map((tournament) => (
                  <div 
                    key={tournament.id}
                    className={`bg-neutral-750 p-4 rounded-lg border-2 ${
                      tournament.status === 'active' 
                        ? 'border-primary-500/30' 
                        : tournament.status === 'upcoming'
                          ? 'border-secondary-500/30'
                          : 'border-neutral-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium mb-1">{tournament.title}</h4>
                        <p className="text-sm text-neutral-400">Sponsored by {tournament.sponsor}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        tournament.status === 'active'
                          ? 'bg-primary-900 text-primary-400'
                          : tournament.status === 'upcoming'
                            ? 'bg-secondary-900 text-secondary-400'
                            : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-sm mb-4">{tournament.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center">
                        <DollarSign size={16} className="text-success-400 mr-2" />
                        <div>
                          <p className="text-neutral-400">Prize Pool</p>
                          <p className="font-medium">{tournament.prize}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users size={16} className="text-primary-400 mr-2" />
                        <div>
                          <p className="text-neutral-400">Participants</p>
                          <p className="font-medium">{tournament.participants}/{tournament.maxParticipants}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock size={16} className="text-secondary-400 mr-2" />
                        <div>
                          <p className="text-neutral-400">Start Date</p>
                          <p className="font-medium">{new Date(tournament.startDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock size={16} className="text-secondary-400 mr-2" />
                        <div>
                          <p className="text-neutral-400">End Date</p>
                          <p className="font-medium">{new Date(tournament.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium">Requirements:</p>
                      <ul className="text-sm space-y-1">
                        {tournament.requirements.map((req, index) => (
                          <li key={index} className="flex items-center text-neutral-400">
                            <span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      {tournament.status === 'upcoming' && (
                        <button className="btn-primary flex-1 py-1.5">Register Now</button>
                      )}
                      {tournament.status === 'active' && (
                        <button className="btn-success flex-1 py-1.5">Enter Tournament</button>
                      )}
                      {tournament.status === 'completed' && (
                        <button className="btn-ghost flex-1 py-1.5">View Results</button>
                      )}
                      <button className="btn-ghost flex-1 py-1.5">Learn More</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-neutral-750 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Tournament Rules & Guidelines</h4>
                <ul className="text-sm space-y-2 text-neutral-400">
                  <li>• All trading is done with virtual capital provided by the platform</li>
                  <li>• Participants must meet all listed requirements before registering</li>
                  <li>• Trading is restricted to specified instruments during tournament hours</li>
                  <li>• Winners are determined based on total return and risk-adjusted metrics</li>
                  <li>• Prizes are awarded within 14 days of tournament completion</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'lessons' && (
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <div 
                  key={lesson.id}
                  className="flex items-center bg-neutral-750 p-4 rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h3 className="font-medium mr-2">{lesson.title}</h3>
                      {lesson.completed && (
                        <CheckCircle2 size={16} className="text-success-400" />
                      )}
                    </div>
                    <p className="text-sm text-neutral-400">{lesson.description}</p>
                    <div className="flex items-center mt-2 text-sm">
                      <span className="text-primary-400 mr-4">{lesson.points} XP</span>
                      <span className="text-neutral-500">{lesson.duration}</span>
                    </div>
                  </div>
                  <button className="btn-ghost p-2 rounded-full">
                    <ArrowRight size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'challenges' && (
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <div 
                  key={challenge.id}
                  className="bg-neutral-750 p-4 rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{challenge.title}</h3>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      challenge.difficulty === 'Beginner' 
                        ? 'bg-success-900 text-success-400'
                        : challenge.difficulty === 'Intermediate'
                          ? 'bg-warning-900 text-warning-400'
                          : 'bg-error-900 text-error-400'
                    }`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400 mb-3">{challenge.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-400">+{challenge.reward} XP</span>
                    <button className="btn-primary text-sm">Start Challenge</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'simulator' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Market Direction Challenge</h3>
                <p className="text-sm text-neutral-400 mb-4">
                  Based on the stock price movement, choose whether you would buy a call or put option.
                  The stock's initial price is $175.
                </p>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-neutral-400">Stock Price: ${selectedPrice.toFixed(2)}</span>
                    <span className={`text-sm ${selectedPrice > 175 ? 'text-success-400' : 'text-error-400'}`}>
                      {selectedPrice > 175 ? '↑' : '↓'} ${Math.abs(selectedPrice - 175).toFixed(2)}
                    </span>
                  </div>
                  <PriceChart data={mockAAPLData} />
                </div>
                
                <div className="flex gap-4">
                  <button 
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      userAnswer === 'call'
                        ? 'bg-success-600 text-white'
                        : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                    }`}
                    onClick={() => setUserAnswer('call')}
                  >
                    Buy Call Option
                  </button>
                  <button 
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      userAnswer === 'put'
                        ? 'bg-error-600 text-white'
                        : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                    }`}
                    onClick={() => setUserAnswer('put')}
                  >
                    Buy Put Option
                  </button>
                </div>
                
                {userAnswer && (
                  <button 
                    className="w-full btn-primary mt-4"
                    onClick={checkAnswer}
                  >
                    Submit Answer
                  </button>
                )}
                
                {showFeedback && (
                  <div className={`mt-4 p-3 rounded-lg text-center ${
                    userAnswer === (selectedPrice > 175 ? 'call' : 'put')
                      ? 'bg-success-900 text-success-400'
                      : 'bg-error-900 text-error-400'
                  }`}>
                    {userAnswer === (selectedPrice > 175 ? 'call' : 'put')
                      ? 'Correct! +50 XP'
                      : 'Try again! The stock price increased, so a call option would profit.'}
                  </div>
                )}
              </div>
              
              <div className="bg-neutral-750 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Trading Tips</h4>
                <ul className="text-sm space-y-2 text-neutral-400">
                  <li>• Buy call options when you expect the stock price to rise</li>
                  <li>• Buy put options when you expect the stock price to fall</li>
                  <li>• Consider implied volatility before making your decision</li>
                  <li>• Always check option liquidity and bid-ask spreads</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Learn;