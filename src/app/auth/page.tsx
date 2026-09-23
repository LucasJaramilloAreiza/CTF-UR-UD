'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChallengeStore } from '@/store/challengeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const router = useRouter();
  
  const loginUser = useChallengeStore((state) => state.loginUser);
  const createTeam = useChallengeStore((state) => state.createTeam);
  const joinTeam = useChallengeStore((state) => state.joinTeam);
  
  const currentUser = useChallengeStore((state) => state.currentUser);
  const currentTeam = useChallengeStore((state) => state.currentTeam);
  const logoutUser = useChallengeStore((state) => state.logoutUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');

  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await loginUser(name, email);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    const code = await createTeam(teamName);
    if (code) {
      router.push('/dashboard');
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamCode.trim()) return;
    const response = await joinTeam(teamCode);
    if (response.success) {
      router.push('/dashboard');
    } else {
      setError(response.error || 'Invalid Team Code');
    }
  };

  if (currentUser && currentTeam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-md border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-[#00B4D8]">Already in a Team</CardTitle>
            <CardDescription>You are playing as part of {currentTeam.name}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-center">
            <p><strong>User:</strong> {currentUser.name}</p>
            <p><strong>Team Code:</strong> <span className="font-mono bg-muted px-2 py-1 rounded">{currentTeam.code}</span></p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full bg-[#00629B] hover:bg-[#00629B]/90 text-white" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
            <Button variant="outline" className="w-full" onClick={logoutUser}>
              Logout / Switch User
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#00629B] dark:text-[#00B4D8] mb-2">Operation Enlistment</h1>
          <p className="text-muted-foreground">Register your operator profile and join a squad.</p>
        </div>

        {!currentUser ? (
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Operator Registration</CardTitle>
              <CardDescription>Enter your details to begin.</CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Handle / Nickname</label>
                  <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="0xHacker" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email (Optional)</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hacker@example.com" />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-[#00629B] hover:bg-[#00629B]/90 text-white dark:bg-[#00B4D8] dark:hover:bg-[#00B4D8]/90 dark:text-gray-900">
                  <LogIn className="w-4 h-4 mr-2" /> Initialize Profile
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Welcome, {currentUser.name}</CardTitle>
              <CardDescription>You need to join or create a team to compete.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="join" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="join"><Users className="w-4 h-4 mr-2"/> Join Team</TabsTrigger>
                  <TabsTrigger value="create"><UserPlus className="w-4 h-4 mr-2"/> Create Team</TabsTrigger>
                </TabsList>
                
                <TabsContent value="join">
                  <form onSubmit={handleJoinTeam} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">6-Character Team Code</label>
                      <Input 
                        required 
                        maxLength={6}
                        className="font-mono uppercase text-center tracking-widest text-lg"
                        value={teamCode} 
                        onChange={(e) => setTeamCode(e.target.value.toUpperCase())} 
                        placeholder="AET123" 
                      />
                    </div>
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <Button type="submit" className="w-full bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-gray-900">
                      Join Squad
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="create">
                  <form onSubmit={handleCreateTeam} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Team Name</label>
                      <Input 
                        required 
                        value={teamName} 
                        onChange={(e) => setTeamName(e.target.value)} 
                        placeholder="e.g. Null Pointers" 
                      />
                    </div>
                    <Button type="submit" className="w-full bg-[#00629B] hover:bg-[#00629B]/90 text-white">
                      Form New Squad
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
