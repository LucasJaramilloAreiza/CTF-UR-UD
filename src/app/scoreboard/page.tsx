'use client';

import { useMemo } from 'react';
import { useChallengeStore } from '@/store/challengeStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Trophy, Medal, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScoreboardPage() {
  const teams = useChallengeStore((state) => state.teams);
  const solves = useChallengeStore((state) => state.teamSolves);
  const hints = useChallengeStore((state) => state.teamHintUnlocks);

  // Calculate team scores and ranks
  const leaderboard = useMemo(() => {
    const scores = teams.map(team => {
      const teamSolves = solves.filter(s => s.teamId === team.id);
      const teamHints = hints.filter(h => h.teamId === team.id);
      
      const solvePoints = teamSolves.reduce((sum, s) => sum + s.points, 0);
      const hintCost = teamHints.reduce((sum, h) => sum + h.cost, 0);
      const netScore = solvePoints - hintCost;
      
      const lastSolve = teamSolves.length > 0 
        ? Math.max(...teamSolves.map(s => s.timestamp)) 
        : 0;
        
      return {
        ...team,
        netScore,
        solveCount: teamSolves.length,
        lastSolve
      };
    });

    return scores.sort((a, b) => {
      if (b.netScore !== a.netScore) {
        return b.netScore - a.netScore; // Descending by score
      }
      return a.lastSolve - b.lastSolve; // Ascending by timestamp (older is better)
    });
  }, [teams, solves, hints]);

  // Prepare data for the timeline chart
  const timelineData = useMemo(() => {
    const topTeams = leaderboard.slice(0, 5);
    if (topTeams.length === 0) return [];

    const topTeamIds = new Set(topTeams.map(t => t.id));
    const relevantSolves = solves.filter(s => topTeamIds.has(s.teamId));
    const relevantHints = hints.filter(h => topTeamIds.has(h.teamId));
    
    const events = [
      ...relevantSolves.map(s => ({ teamId: s.teamId, time: s.timestamp, diff: s.points })),
      ...relevantHints.map(h => ({ teamId: h.teamId, time: h.timestamp, diff: -h.cost }))
    ].sort((a, b) => a.time - b.time);

    let currentScores: Record<string, number> = {};
    topTeams.forEach(t => currentScores[t.name] = 0);

    const data: any[] = [];
    data.push({ time: events.length > 0 ? events[0].time - 1000 : Date.now(), ...currentScores });

    events.forEach(ev => {
      const team = topTeams.find(t => t.id === ev.teamId);
      if (team) {
        currentScores[team.name] += ev.diff;
        data.push({
          time: ev.time,
          ...JSON.parse(JSON.stringify(currentScores))
        });
      }
    });

    if (data.length > 0) {
      data.push({ time: Date.now(), ...currentScores });
    }

    return data;
  }, [leaderboard, solves, hints]);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground font-mono">{index + 1}</span>;
  };

  const colors = ['#00B4D8', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#00629B] dark:text-[#00B4D8]">Global Leaderboard</h1>
        <p className="text-muted-foreground mt-1">Live rankings and score progression of the top squads.</p>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Top 5 Progression</CardTitle>
          <CardDescription>Net score over time for the leading teams.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={formatTime} 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickMargin={10}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickMargin={10}
                  />
                  <Tooltip 
                    labelFormatter={(label) => new Date(label as number).toLocaleTimeString()}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  {leaderboard.slice(0, 5).map((team, index) => (
                    <Line 
                      key={team.id}
                      type="stepAfter"
                      dataKey={team.name}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No score data available yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur mt-8 overflow-hidden">
        <div className="w-full">
          <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground bg-muted/30 border-b border-border/50">
            <div className="col-span-2 md:col-span-1 text-center">Rank</div>
            <div className="col-span-4 md:col-span-5">Team</div>
            <div className="col-span-2 text-center hidden md:block">Solves</div>
            <div className="col-span-3 text-right hidden sm:block">Last Solve</div>
            <div className="col-span-3 md:col-span-2 text-right">Net Score</div>
          </div>
          
          <div className="flex flex-col">
            {leaderboard.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No teams registered yet.</div>
            ) : (
              <AnimatePresence>
                {leaderboard.map((team, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30
                    }}
                    key={team.id}
                    className={`grid grid-cols-12 gap-4 p-4 items-center border-b border-border/20 ${index < 3 ? 'bg-muted/10' : ''}`}
                  >
                    <div className="col-span-2 md:col-span-1 flex justify-center">
                      {getRankIcon(index)}
                    </div>
                    <div className="col-span-4 md:col-span-5 flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                      <span className="font-bold text-foreground truncate">{team.name}</span>
                      {index === 0 && <Badge variant="default" className="hidden sm:inline-flex bg-yellow-500 hover:bg-yellow-600 text-black">1st</Badge>}
                    </div>
                    <div className="col-span-2 text-center font-mono hidden md:block">{team.solveCount}</div>
                    <div className="col-span-3 text-right text-muted-foreground text-sm hidden sm:block">
                      {team.lastSolve > 0 ? new Date(team.lastSolve).toLocaleTimeString() : '--:--:--'}
                    </div>
                    <div className="col-span-3 md:col-span-2 text-right font-mono font-bold text-[#00B4D8] text-lg">
                      {team.netScore}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
