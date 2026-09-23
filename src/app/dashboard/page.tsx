'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useChallengeStore } from '@/store/challengeStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Shield, Target, Trophy, Clock, History, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const CATEGORIES = ['Web', 'Pwn', 'Reverse Engineering', 'Cryptography', 'Forensics', 'Hardware / IoT', 'Misc'];

export default function TeamDashboardPage() {
  const router = useRouter();
  
  const currentTeam = useChallengeStore((state) => state.currentTeam);
  const currentUser = useChallengeStore((state) => state.currentUser);
  
  const teams = useChallengeStore((state) => state.teams);
  const allSolves = useChallengeStore((state) => state.teamSolves);
  const allHints = useChallengeStore((state) => state.teamHintUnlocks);
  const activityFeed = useChallengeStore((state) => state.activityFeed);
  
  useEffect(() => {
    if (!currentUser || !currentTeam) {
      router.push('/auth');
    }
  }, [currentUser, currentTeam, router]);

  if (!currentUser || !currentTeam) {
    return null;
  }


  // Calculate stats for current team
  const teamSolves = allSolves.filter(s => s.teamId === currentTeam.id);
  const teamHints = allHints.filter(h => h.teamId === currentTeam.id);
  const teamActivity = activityFeed.filter(a => a.teamId === currentTeam.id);
  
  const solvePoints = teamSolves.reduce((sum, s) => sum + s.points, 0);
  const hintCost = teamHints.reduce((sum, h) => sum + h.cost, 0);
  const netScore = solvePoints - hintCost;

  // Calculate radar data
  const radarData = useMemo(() => {
    return CATEGORIES.map(cat => {
      const solvesInCat = teamSolves.filter(s => {
        // Need to match the category of the challenge.
        // We have to look up the challenge from the store to get its category.
        // Since we only store challengeId in teamSolves, let's fetch challenges.
        return true; // We'll fix this below
      });
      return { subject: cat, A: 0, fullMark: 1500 }; // placeholder
    });
  }, [teamSolves]);
  
  // Real radar data with challenge lookup
  const challenges = useChallengeStore((state) => state.challenges);
  
  const realRadarData = useMemo(() => {
    const scoresByCategory: Record<string, number> = {};
    CATEGORIES.forEach(cat => scoresByCategory[cat] = 0);
    
    teamSolves.forEach(solve => {
      const chal = challenges.find(c => c.id === solve.challengeId);
      if (chal && scoresByCategory[chal.category] !== undefined) {
        scoresByCategory[chal.category] += solve.points;
      }
    });
    
    return CATEGORIES.map(cat => ({
      subject: cat,
      score: scoresByCategory[cat] || 0,
      fullMark: 1000 // roughly max points per category
    }));
  }, [teamSolves, challenges]);

  // Calculate rank
  const rank = useMemo(() => {
    const scores = teams.map(team => {
      const tSolves = allSolves.filter(s => s.teamId === team.id);
      const tHints = allHints.filter(h => h.teamId === team.id);
      const score = tSolves.reduce((sum, s) => sum + s.points, 0) - tHints.reduce((sum, h) => sum + h.cost, 0);
      const lastSolve = tSolves.length > 0 ? Math.max(...tSolves.map(s => s.timestamp)) : 0;
      return { id: team.id, score, lastSolve };
    });
    
    scores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.lastSolve - b.lastSolve;
    });
    
    const index = scores.findIndex(s => s.id === currentTeam.id);
    return index >= 0 ? index + 1 : '-';
  }, [teams, allSolves, allHints, currentTeam.id]);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#00629B] dark:text-[#00B4D8]">Squad Command Center</h1>
        <p className="text-muted-foreground mt-1">Analytics and intel for <strong className="text-foreground">{currentTeam.name}</strong></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Score</CardTitle>
            <Trophy className="h-4 w-4 text-[#00B4D8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{netScore}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {solvePoints} earned - {hintCost} penalties
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Rank</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{rank}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {teams.length} teams
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Challenges Solved</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamSolves.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Of {challenges.length} available
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Join Code</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tracking-widest">{currentTeam.code}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Share with your squad
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Combat Proficiencies</CardTitle>
            <CardDescription>Points earned across offensive and defensive categories.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              {teamSolves.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={realRadarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 200']} tick={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: '#00B4D8' }}
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#00B4D8"
                      fill="#00B4D8"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground">Solve challenges to generate your radar.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Activity Feed
            </CardTitle>
            <CardDescription>Recent actions by your squad members.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px] w-full px-6 pb-6">
              <div className="space-y-4 mt-2">
                {teamActivity.length > 0 ? (
                  teamActivity.map(activity => (
                    <div key={activity.id} className="flex flex-col gap-1 pb-4 border-b border-border/50 last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{activity.userName}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        Pwned <span className="font-mono text-[#00B4D8]">{activity.challengeTitle}</span> 
                        <Badge variant="outline" className="ml-2 bg-background/50 text-[10px] h-5">{activity.category}</Badge>
                      </div>
                      <div className="text-xs font-bold text-green-500">+{activity.points} pts</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground pt-10">
                    No activity recorded yet.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
