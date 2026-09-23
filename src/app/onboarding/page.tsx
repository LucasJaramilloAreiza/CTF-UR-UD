'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChallengeStore } from '@/store/challengeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const router = useRouter();
  const currentUser = useChallengeStore(state => state.currentUser);
  const createTeam = useChallengeStore(state => state.createTeam);
  const joinTeam = useChallengeStore(state => state.joinTeam);
  
  const [teamName, setTeamName] = useState('');
  const [affiliation, setAffiliation] = useState<'IEEE UD' | 'IEEE Rosario' | 'Otro'>('IEEE UD');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth');
    } else if (currentUser.teamId || currentUser.role === 'admin') {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.teamId || currentUser.role === 'admin') {
    return null; // or loading spinner
  }

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.length < 3) {
      toast.error('El nombre del equipo debe tener al menos 3 caracteres');
      return;
    }
    const code = createTeam(teamName);
    if (code) {
      toast.success('Equipo creado con éxito. ¡Bienvenido líder!');
      router.push('/dashboard');
    }
  };

  const handleJoinTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.length !== 6) {
      toast.error('El código de invitación debe tener 6 caracteres');
      return;
    }
    const response = joinTeam(inviteCode);
    if (response.success) {
      toast.success('Te has unido al equipo correctamente');
      router.push('/dashboard');
    } else {
      toast.error(response.error || 'Código de equipo inválido');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-lg border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Bienvenido, {currentUser.name}</CardTitle>
          <CardDescription>Para participar en el CTF debes pertenecer a un equipo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-background/50">
              <TabsTrigger value="create">Crear Equipo</TabsTrigger>
              <TabsTrigger value="join">Unirse a Equipo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre del Equipo</label>
                  <Input 
                    placeholder="Hackers Anonimos" 
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Afiliación Institucional</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={affiliation}
                    onChange={e => setAffiliation(e.target.value as any)}
                  >
                    <option value="IEEE UD">IEEE Universidad Distrital</option>
                    <option value="IEEE Rosario">IEEE Universidad del Rosario</option>
                    <option value="Otro">Otro / Invitado</option>
                  </select>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-secondary">
                  Crear Equipo
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="join">
              <form onSubmit={handleJoinTeam} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Código de Invitación (6 caracteres)</label>
                  <Input 
                    placeholder="XXXXXX" 
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="uppercase"
                  />
                </div>
                <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground">
                  Unirse al Equipo
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
