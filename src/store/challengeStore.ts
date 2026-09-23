import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Challenge, Team, User, TeamSolve, TeamHintUnlock, ActivityLogItem } from '../types';
import { supabase } from '@/lib/supabase';

export type CompetitionStatus = 'not_started' | 'running' | 'paused';

interface CTFStore {
  challenges: Challenge[];
  
  // Auth / Current Session State
  currentUser: User | null;
  currentTeam: Team | null;
  
  // Global Entities
  teams: Team[];
  users: User[];
  teamSolves: TeamSolve[];
  teamHintUnlocks: TeamHintUnlock[];
  activityFeed: ActivityLogItem[];
  
  // Competition State
  competitionStatus: CompetitionStatus;
  
  // Initialization
  initData: () => Promise<void>;
  subscribeToRealtime: () => void;
  
  // Actions
  loginUser: (name: string, email?: string, role?: 'user' | 'admin') => Promise<void>;
  logoutUser: () => void;
  createTeam: (name: string) => Promise<string | null>; // returns team code
  joinTeam: (code: string) => Promise<{ success: boolean; error?: string }>;
  deleteTeam: (teamId: string) => Promise<void>;
  
  submitFlag: (challengeId: string, flag: string) => Promise<boolean>;
  unlockHint: (challengeId: string, hintId: string, cost: number) => Promise<boolean>;
  
  // Admin
  addChallenge: (challenge: Omit<Challenge, 'id'>) => Promise<void>;
  updateChallenge: (challenge: Challenge) => Promise<void>;
  deleteChallenge: (id: string) => Promise<void>;
  setCompetitionStatus: (status: CompetitionStatus) => Promise<void>;
  elevateToAdmin: () => Promise<void>;
}

export const useChallengeStore = create<CTFStore>()(
  persist(
    (set, get) => ({
      challenges: [],
      currentUser: null,
      currentTeam: null,
      teams: [],
      users: [],
      teamSolves: [],
      teamHintUnlocks: [],
      activityFeed: [],
      competitionStatus: 'not_started',
      
      initData: async () => {
        // Fetch all data from Supabase
        const [
          { data: challenges },
          { data: teams },
          { data: solves },
          { data: compState }
        ] = await Promise.all([
          supabase.from('challenges').select('*'),
          supabase.from('teams').select('*'),
          supabase.from('team_solves').select('*'),
          supabase.from('competition_state').select('*').limit(1)
        ]);

        if (challenges) set({ challenges: challenges as Challenge[] });
        if (teams) set({ teams: teams as Team[] });
        if (solves) set({ teamSolves: solves as TeamSolve[] });
        if (compState && compState.length > 0) {
          set({ competitionStatus: compState[0].status as CompetitionStatus });
        }
      },

      subscribeToRealtime: () => {
        // Clean up any existing channels to prevent multiple subscriptions/callbacks error
        supabase.getChannels().forEach(channel => {
          if (channel.topic === 'realtime:public:team_solves') {
            supabase.removeChannel(channel);
          }
        });

        supabase
          .channel('public:team_solves')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'team_solves' }, (payload) => {
            const newSolve = payload.new as any;
            set((state) => {
              // Ignore if we already have it locally
              if (state.teamSolves.some(s => s.teamId === newSolve.team_id && s.challengeId === newSolve.challenge_id)) {
                return state;
              }
              return {
                teamSolves: [...state.teamSolves, {
                  teamId: newSolve.team_id,
                  challengeId: newSolve.challenge_id,
                  solvedByUserId: newSolve.solved_by_user_id,
                  solvedByUserName: newSolve.solved_by_user_name,
                  points: newSolve.points,
                  timestamp: new Date(newSolve.created_at).getTime()
                }]
              };
            });
          })
          .subscribe();
      },

      loginUser: async (name, email, role = 'user') => {
        const { data, error } = await supabase
          .from('users')
          .insert([{ name, email, role }])
          .select()
          .single();
          
        if (data && !error) {
          set({ currentUser: data as User, currentTeam: null });
        }
      },
      
      logoutUser: () => {
        set({ currentUser: null, currentTeam: null });
      },
      
      createTeam: async (name) => {
        const state = get();
        if (!state.currentUser) return null;
        
        // Generate 6 char alphanumeric code
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .insert([{ name, code }])
          .select()
          .single();

        if (teamError || !teamData) return null;

        const { data: userData, error: userError } = await supabase
          .from('users')
          .update({ team_id: teamData.id })
          .eq('id', state.currentUser.id)
          .select()
          .single();

        if (!userError && userData) {
          set((prevState) => ({
            teams: [...prevState.teams, teamData as Team],
            currentUser: userData as User,
            currentTeam: teamData as Team,
          }));
          return code;
        }
        return null;
      },
      
      joinTeam: async (code) => {
        const state = get();
        if (!state.currentUser) return { success: false, error: 'Usuario no autenticado' };
        
        const cleanCode = code.trim().toUpperCase();
        
        const { data: teamData, error: findError } = await supabase
          .from('teams')
          .select('*')
          .ilike('code', cleanCode)
          .single();
        
        if (findError || !teamData) return { success: false, error: 'Código de equipo no encontrado' };
        
        const { data: userData, error: updateError } = await supabase
          .from('users')
          .update({ team_id: teamData.id })
          .eq('id', state.currentUser.id)
          .select()
          .single();
        
        if (updateError || !userData) return { success: false, error: 'Error al unirse al equipo' };
        
        set({
          currentUser: userData as User,
          currentTeam: teamData as Team,
        });
        
        return { success: true };
      },

      deleteTeam: async (teamId) => {
        const { error } = await supabase.from('teams').delete().eq('id', teamId);
        if (!error) {
          set((state) => ({
            teams: state.teams.filter(t => t.id !== teamId),
            teamSolves: state.teamSolves.filter(s => s.teamId !== teamId),
            teamHintUnlocks: state.teamHintUnlocks.filter(h => h.teamId !== teamId),
            ...(state.currentTeam?.id === teamId && { currentUser: { ...state.currentUser!, teamId: null }, currentTeam: null })
          }));
        }
      },
      
      submitFlag: async (challengeId, flag) => {
        const { challenges, currentUser, currentTeam, teamSolves, competitionStatus } = get();
        if (!currentUser || !currentTeam || competitionStatus !== 'running') return false;
        
        const challenge = challenges.find((c) => c.id === challengeId);
        if (!challenge) return false;
        
        if (teamSolves.some(s => s.teamId === currentTeam.id && s.challengeId === challengeId)) {
          return true;
        }
        
        if (challenge.flag === flag) {
          const points = challenge.difficulty === 'Easy' ? 100 : challenge.difficulty === 'Medium' ? 250 : 500;
          
          const { data, error } = await supabase
            .from('team_solves')
            .insert([{
              team_id: currentTeam.id,
              challenge_id: challengeId,
              solved_by_user_id: currentUser.id,
              solved_by_user_name: currentUser.name,
              points
            }])
            .select()
            .single();
            
          if (!error && data) {
            set((state) => ({
              teamSolves: [...state.teamSolves, {
                teamId: data.team_id,
                challengeId: data.challenge_id,
                solvedByUserId: data.solved_by_user_id,
                solvedByUserName: data.solved_by_user_name,
                points: data.points,
                timestamp: new Date(data.created_at).getTime()
              }]
            }));
            return true;
          }
        }
        
        return false;
      },
      
      unlockHint: async (challengeId, hintId, cost) => {
        return false; // To be implemented fully
      },
      
      addChallenge: async (challenge) => {
        const { hints, files, links, ...dbChallenge } = challenge;
        const { data, error } = await supabase.from('challenges').insert([dbChallenge]).select().single();
        if (data && !error) {
          set((state) => ({ challenges: [...state.challenges, { ...data, hints: [], files: [], links: [] } as Challenge] }));
        } else if (error) {
          console.error("Supabase Error (addChallenge):", error.message, error.details, error.code, error);
        }
      },
      
      updateChallenge: async (updatedChallenge) => {
        const { hints, files, links, ...dbChallenge } = updatedChallenge;
        const { data, error } = await supabase.from('challenges').update(dbChallenge).eq('id', updatedChallenge.id).select().single();
        if (data && !error) {
          set((state) => ({
            challenges: state.challenges.map((c) => (c.id === updatedChallenge.id ? { ...data, hints: c.hints, files: c.files, links: c.links } as Challenge : c)),
          }));
        } else if (error) {
          console.error("Supabase Error (updateChallenge):", error.message, error.details, error.code, error);
        }
      },
      
      deleteChallenge: async (id) => {
        const { error } = await supabase.from('challenges').delete().eq('id', id);
        if (!error) {
          set((state) => ({ challenges: state.challenges.filter((c) => c.id !== id) }));
        }
      },
      
      setCompetitionStatus: async (status) => {
        await supabase.from('competition_state').update({ status }).eq('id', 'global-or-first-row-handled-by-api');
        set({ competitionStatus: status });
      },
      
      elevateToAdmin: async () => {
        const { currentUser } = get();
        if (currentUser) {
          const { data, error } = await supabase.from('users').update({ role: 'admin' }).eq('id', currentUser.id).select().single();
          if (data && !error) set({ currentUser: data as User });
        }
      }
    }),
    {
      name: 'cyberops-storage-v3',
      partialize: (state) => ({ currentUser: state.currentUser, currentTeam: state.currentTeam }),
    }
  )
);
