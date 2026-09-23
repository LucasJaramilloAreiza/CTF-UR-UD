'use client';

import { useState } from 'react';
import { useChallengeStore, CompetitionStatus } from '@/store/challengeStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Settings, Play, Pause, Square, Lock, KeyRound, Edit, Plus, Trash2, LogOut } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChallengeFormModal from '@/components/admin/ChallengeFormModal';
import { Challenge } from '@/types';

const ADMIN_CREDENTIALS = [
  { user: 'admin', pass: 'ieee2026' },
  { user: 'root', pass: 'cyberops' }
];

export default function AdminPage() {
  const currentUser = useChallengeStore((state) => state.currentUser);
  const loginUser = useChallengeStore((state) => state.loginUser);
  const logoutUser = useChallengeStore((state) => state.logoutUser);
  const elevateToAdmin = useChallengeStore((state) => state.elevateToAdmin);
  const competitionStatus = useChallengeStore((state) => state.competitionStatus);
  const setCompetitionStatus = useChallengeStore((state) => state.setCompetitionStatus);
  
  const challenges = useChallengeStore((state) => state.challenges);
  const deleteChallenge = useChallengeStore((state) => state.deleteChallenge);
  
  const teams = useChallengeStore((state) => state.teams);
  const deleteTeam = useChallengeStore((state) => state.deleteTeam);
  const solves = useChallengeStore((state) => state.teamSolves);
  const hints = useChallengeStore((state) => state.teamHintUnlocks);
  
  const teamsCount = teams.length;
  const solvesCount = solves.length;
  const hintsCount = hints.length;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = ADMIN_CREDENTIALS.some(cred => cred.user === username && cred.pass === password);
    
    if (isValid) {
      if (currentUser) {
        elevateToAdmin();
      } else {
        loginUser(username, '', 'admin');
      }
      setError('');
    } else {
      setError('Invalid admin credentials.');
    }
  };

  const openAddModal = () => {
    setEditingChallenge(null);
    setIsModalOpen(true);
  };

  const openEditModal = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setIsModalOpen(true);
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto bg-muted p-3 rounded-full mb-2 w-12 h-12 flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#00629B]" />
            </div>
            <CardTitle>Restricted Area</CardTitle>
            <CardDescription>Command Center is for authorized personnel only.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input required value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-[#00629B] hover:bg-[#00629B]/90 text-white">
                <KeyRound className="w-4 h-4 mr-2" /> Authenticate
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#00629B] dark:text-[#00B4D8] flex items-center gap-3">
            <Settings className="w-8 h-8" /> Command Center
          </h1>
          <p className="text-muted-foreground mt-1">Manage the competition state and challenge lifecycle.</p>
        </div>
        <Button 
          variant="destructive" 
          onClick={() => {
            logoutUser();
            window.location.href = '/';
          }}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" /> Salir de Admin
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Competition Controls */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Competition State</CardTitle>
            <CardDescription>Control the flow of the CTF.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
              <span className="font-semibold">Current Status:</span>
              {competitionStatus === 'running' && <Badge className="bg-green-500 hover:bg-green-600 text-white">Running</Badge>}
              {competitionStatus === 'paused' && <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">Paused</Badge>}
              {competitionStatus === 'not_started' && <Badge variant="secondary">Not Started</Badge>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Button 
                onClick={() => setCompetitionStatus('running')}
                disabled={competitionStatus === 'running'}
                className="bg-green-600 hover:bg-green-700 text-white h-24 flex flex-col items-center justify-center gap-2"
              >
                <Play className="w-8 h-8" />
                START / RESUME
              </Button>
              <Button 
                onClick={() => setCompetitionStatus('paused')}
                disabled={competitionStatus === 'paused' || competitionStatus === 'not_started'}
                className="bg-yellow-500 hover:bg-yellow-600 text-black h-24 flex flex-col items-center justify-center gap-2"
              >
                <Pause className="w-8 h-8" />
                PAUSE
              </Button>
              <Button 
                onClick={() => setCompetitionStatus('not_started')}
                disabled={competitionStatus === 'not_started'}
                className="bg-red-600 hover:bg-red-700 text-white h-24 flex flex-col items-center justify-center gap-2"
              >
                <Square className="w-8 h-8" />
                STOP / RESET
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Pausing or stopping the competition will immediately disable flag submissions and hint unlocks for all users.
            </p>
          </CardContent>
        </Card>

        {/* Global Statistics Summary */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Platform Statistics</CardTitle>
            <CardDescription>Real-time metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <div className="text-3xl font-bold text-[#00B4D8]">{teamsCount}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide mt-1">Teams</div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <div className="text-3xl font-bold text-[#00B4D8]">{challenges.length}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide mt-1">Challenges</div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <div className="text-3xl font-bold text-[#00B4D8]">{solvesCount}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide mt-1">Total Solves</div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <div className="text-3xl font-bold text-[#00B4D8]">{hintsCount}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide mt-1">Hints Unlocked</div>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="challenges" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="challenges">Retos</TabsTrigger>
          <TabsTrigger value="teams">Equipos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="challenges">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Challenge Database</CardTitle>
                <CardDescription>Manage all CTF challenges.</CardDescription>
              </div>
              <Button onClick={openAddModal} className="bg-[#00B4D8] text-gray-900 hover:bg-[#00B4D8]/90">
                <Plus className="h-4 w-4 mr-2" /> Add Challenge
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {challenges.map((challenge) => (
                      <TableRow key={challenge.id}>
                        <TableCell className="font-medium">{challenge.title}</TableCell>
                        <TableCell>{challenge.category}</TableCell>
                        <TableCell>
                          <Badge variant={
                            challenge.difficulty === 'Easy' ? 'default' :
                            challenge.difficulty === 'Medium' ? 'secondary' : 'destructive'
                          } className={challenge.difficulty === 'Easy' ? 'bg-green-500 text-white' : ''}>
                            {challenge.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            challenge.state === 'active' ? 'border-green-500 text-green-500' :
                            challenge.state === 'hidden' ? 'border-yellow-500 text-yellow-500' : 'border-red-500 text-red-500'
                          }>
                            {challenge.state}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(challenge)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => {
                            if (confirm('Are you sure you want to delete this challenge?')) {
                              deleteChallenge(challenge.id);
                            }
                          }} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {challenges.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                          No challenges found. Add one to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>Manage and moderate registered teams.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>Team Name</TableHead>
                      <TableHead>Invite Code</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teams.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.name}</TableCell>
                        <TableCell>
                          <span className="font-mono bg-muted px-2 py-1 rounded text-sm">{team.code}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => {
                            if (confirm(`Are you sure you want to delete team ${team.name}? This will delete all their progress and remove all members.`)) {
                              deleteTeam(team.id);
                            }
                          }} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {teams.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                          No teams registered yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ChallengeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        challengeToEdit={editingChallenge || undefined}
      />
    </div>
  );
}
