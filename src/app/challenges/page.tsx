'use client';

import { useState, useMemo } from 'react';
import { useChallengeStore } from '@/store/challengeStore';
import { Challenge, ChallengeCategory, ChallengeDifficulty } from '@/types';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ChallengeCard from '@/components/challenges/ChallengeCard';
import ChallengeModal from '@/components/challenges/ChallengeModal';

const CATEGORIES: ('All' | ChallengeCategory)[] = [
  'All',
  'Web',
  'Pwn',
  'Reverse Engineering',
  'Cryptography',
  'Forensics',
  'Hardware / IoT',
  'Misc',
];

export default function ChallengesPage() {
  const challenges = useChallengeStore((state) => state.challenges).filter((c) => c.state === 'active');
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | ChallengeCategory>('All');
  const [difficulty, setDifficulty] = useState<'All' | ChallengeDifficulty>('All');
  const [status, setStatus] = useState<'All' | 'Solved' | 'Pending'>('All');
  
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const currentTeam = useChallengeStore((state) => state.currentTeam);
  const teamSolves = useChallengeStore((state) => state.teamSolves);

  const solvedChallengeIds = useMemo(() => {
    if (!currentTeam) return [];
    return teamSolves.filter(s => s.teamId === currentTeam.id).map(s => s.challengeId);
  }, [teamSolves, currentTeam]);

  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                            c.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || c.category === category;
      const matchesDifficulty = difficulty === 'All' || c.difficulty === difficulty;
      
      const isSolved = solvedChallengeIds.includes(c.id);
      const matchesStatus = status === 'All' || 
                            (status === 'Solved' && isSolved) || 
                            (status === 'Pending' && !isSolved);
                            
      return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    });
  }, [challenges, search, category, difficulty, status, solvedChallengeIds]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-[#00629B] dark:text-[#00B4D8]">
          Challenge Dashboard
        </h1>
      </div>

      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center gap-4 bg-card p-4 rounded-lg border border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search challenges..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Select value={difficulty} onValueChange={(val: any) => setDifficulty(val)}>
          <SelectTrigger className="w-full md:w-[140px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Difficulties</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(val: any) => setStatus(val)}>
          <SelectTrigger className="w-full md:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Solved">Solved</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="All" className="w-full" onValueChange={(val: any) => setCategory(val)}>
        <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-start">
          {CATEGORIES.map((cat) => (
            <TabsTrigger 
              key={cat} 
              value={cat}
              className="data-[state=active]:bg-[#00629B] data-[state=active]:text-white dark:data-[state=active]:bg-[#00B4D8] dark:data-[state=active]:text-[#030712]"
            >
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filteredChallenges.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No challenges found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard 
              key={challenge.id} 
              challenge={challenge} 
              isSolved={solvedChallengeIds.includes(challenge.id)}
              onClick={() => setSelectedChallenge(challenge)} 
            />
          ))}
        </div>
      )}

      {selectedChallenge && (
        <ChallengeModal 
          challenge={selectedChallenge} 
          isOpen={!!selectedChallenge} 
          onClose={() => setSelectedChallenge(null)} 
        />
      )}
    </div>
  );
}
