import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Challenge, Team, User, TeamSolve, TeamHintUnlock, ActivityLogItem } from '../types';
import { initialChallenges } from '../data/initialChallenges';

// Mock teams and initial state for demo
const MOCK_TEAMS: Team[] = [
  { id: 't1', name: 'AETERNA UD', code: 'AET123' },
  { id: 't2', name: 'Rosario CyberHackers', code: 'RCH456' },
  { id: 't3', name: 'PwnStars UR', code: 'PWN789' },
  { id: 't4', name: 'ByteBusters UD', code: 'BYT012' },
  { id: 't5', name: 'NullPointer Team', code: 'NUL345' }
];

const MOCK_SOLVES: TeamSolve[] = [
  { teamId: 't1', challengeId: 'web-easy-1', solvedByUserId: 'sys', solvedByUserName: 'System', timestamp: Date.now() - 10000000, points: 100 },
  { teamId: 't1', challengeId: 'pwn-easy-1', solvedByUserId: 'sys', solvedByUserName: 'System', timestamp: Date.now() - 9000000, points: 100 },
  { teamId: 't2', challengeId: 'web-easy-1', solvedByUserId: 'sys', solvedByUserName: 'System', timestamp: Date.now() - 9500000, points: 100 },
  { teamId: 't3', challengeId: 'crypto-easy-1', solvedByUserId: 'sys', solvedByUserName: 'System', timestamp: Date.now() - 8000000, points: 100 },
  { teamId: 't4', challengeId: 're-easy-1', solvedByUserId: 'sys', solvedByUserName: 'System', timestamp: Date.now() - 7000000, points: 100 },
];

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
  
  // Actions
  loginUser: (name: string, email?: string, role?: 'user' | 'admin') => void;
  logoutUser: () => void;
  createTeam: (name: string) => string | null; // returns team code
  joinTeam: (code: string) => { success: boolean; error?: string };
  deleteTeam: (teamId: string) => void;
  
  submitFlag: (challengeId: string, flag: string) => boolean;
  unlockHint: (challengeId: string, hintId: string, cost: number) => boolean;
  
  // Admin
  addChallenge: (challenge: Challenge) => void;
  updateChallenge: (challenge: Challenge) => void;
  deleteChallenge: (id: string) => void;
  setChallenges: (challenges: Challenge[]) => void;
  setCompetitionStatus: (status: CompetitionStatus) => void;
  elevateToAdmin: () => void;
}

export const useChallengeStore = create<CTFStore>()(
  persist(
    (set, get) => ({
      challenges: initialChallenges,
      
      currentUser: null,
      currentTeam: null,
      
      teams: MOCK_TEAMS,
      users: [],
      teamSolves: MOCK_SOLVES,
      teamHintUnlocks: [],
      activityFeed: [],
      
      competitionStatus: 'not_started',
      
      loginUser: (name, email, role = 'user') => {
        const id = `u_${Date.now()}`;
        const newUser: User = { id, name, email, teamId: null, role };
        set((state) => ({
          users: [...state.users, newUser],
          currentUser: newUser,
          currentTeam: null
        }));
      },
      
      logoutUser: () => {
        set({ currentUser: null, currentTeam: null });
      },
      
      createTeam: (name) => {
        const state = get();
        if (!state.currentUser) return null;
        
        // Generate 6 char alphanumeric code
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        const newTeam: Team = {
          id: `team_${Date.now()}`,
          name,
          code
        };
        
        const updatedUser = { ...state.currentUser, teamId: newTeam.id };
        
        set((prevState) => ({
          teams: [...prevState.teams, newTeam],
          currentUser: updatedUser,
          currentTeam: newTeam,
          users: prevState.users.map(u => u.id === state.currentUser!.id ? updatedUser : u)
        }));
        
        return code;
      },
      
      joinTeam: (code) => {
        const state = get();
        if (!state.currentUser) return { success: false, error: 'Usuario no autenticado' };
        
        const cleanCode = code.trim().toUpperCase();
        const team = state.teams.find(t => t.code.toUpperCase() === cleanCode);
        
        if (!team) return { success: false, error: 'Código de equipo no encontrado' };
        
        const updatedUser = { ...state.currentUser, teamId: team.id };
        
        set((prevState) => ({
          currentUser: updatedUser,
          currentTeam: team,
          users: prevState.users.map(u => u.id === state.currentUser!.id ? updatedUser : u)
        }));
        
        return { success: true };
      },

      deleteTeam: (teamId) => {
        set((state) => ({
          teams: state.teams.filter(t => t.id !== teamId),
          users: state.users.filter(u => u.teamId !== teamId),
          teamSolves: state.teamSolves.filter(s => s.teamId !== teamId),
          teamHintUnlocks: state.teamHintUnlocks.filter(h => h.teamId !== teamId),
          // Clean current user session if admin deleted their own team (unlikely, but safe)
          ...(state.currentTeam?.id === teamId && { currentUser: null, currentTeam: null })
        }));
      },
      
      submitFlag: (challengeId, flag) => {
        const { challenges, currentUser, currentTeam, teamSolves, competitionStatus } = get();
        if (!currentUser || !currentTeam || competitionStatus !== 'running') return false;
        
        const challenge = challenges.find((c) => c.id === challengeId);
        if (!challenge) return false;
        
        // Check if team already solved it
        if (teamSolves.some(s => s.teamId === currentTeam.id && s.challengeId === challengeId)) {
          return true;
        }
        
        if (challenge.flag === flag) {
          const points = challenge.difficulty === 'Easy' ? 100 : challenge.difficulty === 'Medium' ? 250 : 500;
          
          const newSolve: TeamSolve = {
            teamId: currentTeam.id,
            challengeId,
            solvedByUserId: currentUser.id,
            solvedByUserName: currentUser.name,
            timestamp: Date.now(),
            points
          };
          
          const newLog: ActivityLogItem = {
            id: `log_${Date.now()}`,
            teamId: currentTeam.id,
            userName: currentUser.name,
            challengeTitle: challenge.title,
            category: challenge.category,
            points,
            timestamp: Date.now()
          };
          
          set((state) => ({
            teamSolves: [...state.teamSolves, newSolve],
            activityFeed: [newLog, ...state.activityFeed]
          }));
          return true;
        }
        
        return false;
      },
      
      unlockHint: (challengeId, hintId, cost) => {
        const { currentTeam, teamHintUnlocks, competitionStatus } = get();
        if (!currentTeam || competitionStatus !== 'running') return false;
        
        if (teamHintUnlocks.some(h => h.teamId === currentTeam.id && h.hintId === hintId)) return true;
        
        const newUnlock: TeamHintUnlock = {
          teamId: currentTeam.id,
          challengeId,
          hintId,
          cost,
          timestamp: Date.now()
        };
        
        set((state) => ({
          teamHintUnlocks: [...state.teamHintUnlocks, newUnlock]
        }));
        
        return true;
      },
      
      addChallenge: (challenge) => {
        set((state) => ({ challenges: [...state.challenges, challenge] }));
      },
      updateChallenge: (updatedChallenge) => {
        set((state) => ({
          challenges: state.challenges.map((c) => (c.id === updatedChallenge.id ? updatedChallenge : c)),
        }));
      },
      deleteChallenge: (id) => {
        set((state) => ({ challenges: state.challenges.filter((c) => c.id !== id) }));
      },
      setChallenges: (challenges) => {
        set({ challenges });
      },
      setCompetitionStatus: (status) => {
        set({ competitionStatus: status });
      },
      elevateToAdmin: () => {
        const { currentUser } = get();
        if (currentUser) {
          set({ currentUser: { ...currentUser, role: 'admin' } });
        }
      }
    }),
    {
      name: 'cyberops-storage-v2', // keep name to retain previous auth but add new fields
    }
  )
);
