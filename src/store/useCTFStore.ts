import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Team, Challenge, Hint, TeamSolve, TeamHintUnlock } from '../types';
import { mockChallenges, mockHints } from '../data/mockData';

interface CTFState {
  currentUser: User | null;
  users: User[];
  teams: Team[];
  challenges: Challenge[];
  hints: Hint[];
  solves: TeamSolve[];
  hintUnlocks: TeamHintUnlock[];
  
  // Actions
  login: (email: string) => void;
  logout: () => void;
  createTeam: (name: string, affiliation: Team['affiliation']) => void;
  joinTeam: (inviteCode: string) => void;
  submitFlag: (challengeId: string, flag: string) => { success: boolean; message: string };
  unlockHint: (challengeId: string, hintId: string) => void;
  
  // Admin actions
  createChallenge: (challenge: Omit<Challenge, 'id'>) => void;
  updateChallenge: (id: string, data: Partial<Challenge>) => void;
  
  // Getters
  getTeamScore: (teamId: string) => number;
  getTeamSolves: (teamId: string) => TeamSolve[];
  getTeamUnlockedHints: (teamId: string) => TeamHintUnlock[];
}

// Helper to generate random 6-char invite code
const generateInviteCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const useCTFStore = create<CTFState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [
        { id: 'u1', name: 'Admin', email: 'admin@ctf.org', teamId: null, role: 'admin' }
      ],
      teams: [],
      challenges: mockChallenges,
      hints: mockHints,
      solves: [],
      hintUnlocks: [],

      login: (email: string) => {
        const user = get().users.find((u) => u.email === email);
        if (user) {
          set({ currentUser: user });
        } else {
          // Auto-register mock logic
          const newUser: User = {
            id: `u-${Date.now()}`,
            name: email.split('@')[0],
            email,
            teamId: null,
            role: 'member',
          };
          set((state) => ({ users: [...state.users, newUser], currentUser: newUser }));
        }
      },

      logout: () => set({ currentUser: null }),

      createTeam: (name, affiliation) => {
        const { currentUser } = get();
        if (!currentUser) return;
        
        const newTeam: Team = {
          id: `t-${Date.now()}`,
          name,
          affiliation,
          inviteCode: generateInviteCode(),
          score: 0,
        };

        const updatedUser = { ...currentUser, teamId: newTeam.id, role: 'leader' as const };

        set((state) => ({
          teams: [...state.teams, newTeam],
          currentUser: updatedUser,
          users: state.users.map((u) => (u.id === currentUser.id ? updatedUser : u)),
        }));
      },

      joinTeam: (inviteCode) => {
        const { currentUser, teams } = get();
        if (!currentUser) return;

        const team = teams.find((t) => t.inviteCode === inviteCode);
        if (!team) return; // In a real app, handle error

        const updatedUser = { ...currentUser, teamId: team.id };

        set((state) => ({
          currentUser: updatedUser,
          users: state.users.map((u) => (u.id === currentUser.id ? updatedUser : u)),
        }));
      },

      submitFlag: (challengeId, flag) => {
        const { currentUser, challenges, solves } = get();
        if (!currentUser || !currentUser.teamId) {
          return { success: false, message: 'Not in a team' };
        }

        const challenge = challenges.find((c) => c.id === challengeId);
        if (!challenge) {
          return { success: false, message: 'Challenge not found' };
        }

        // Case Sensitive validation
        if (challenge.flag === flag) {
          // Check if already solved by team
          const alreadySolved = solves.some(
            (s) => s.teamId === currentUser.teamId && s.challengeId === challengeId
          );

          if (alreadySolved) {
            return { success: true, message: 'Flag already submitted by your team!' };
          }

          const newSolve: TeamSolve = {
            teamId: currentUser.teamId,
            challengeId,
            userId: currentUser.id,
            timestamp: Date.now(),
          };

          set((state) => ({ solves: [...state.solves, newSolve] }));
          return { success: true, message: 'Flag correct!' };
        }

        return { success: false, message: 'Incorrect flag' };
      },

      unlockHint: (challengeId, hintId) => {
        const { currentUser, hintUnlocks } = get();
        if (!currentUser || !currentUser.teamId) return;

        const alreadyUnlocked = hintUnlocks.some(
          (hu) => hu.teamId === currentUser.teamId && hu.hintId === hintId
        );

        if (!alreadyUnlocked) {
          const newUnlock: TeamHintUnlock = {
            teamId: currentUser.teamId,
            hintId,
            timestamp: Date.now(),
          };
          set((state) => ({ hintUnlocks: [...state.hintUnlocks, newUnlock] }));
        }
      },

      createChallenge: (challengeData) => {
        const newChallenge: Challenge = {
          ...challengeData,
          id: `c-${Date.now()}`,
        };
        set((state) => ({ challenges: [...state.challenges, newChallenge] }));
      },

      updateChallenge: (id, data) => {
        set((state) => ({
          challenges: state.challenges.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));
      },

      getTeamScore: (teamId: string) => {
        const { solves, challenges, hintUnlocks, hints } = get();
        
        let score = 0;
        
        // Add points for solves
        const teamSolves = solves.filter(s => s.teamId === teamId);
        teamSolves.forEach(solve => {
          const challenge = challenges.find(c => c.id === solve.challengeId);
          if (challenge) score += challenge.basePoints;
        });

        // Subtract points for hints
        const teamHints = hintUnlocks.filter(hu => hu.teamId === teamId);
        teamHints.forEach(unlock => {
          const hint = hints.find(h => h.id === unlock.hintId);
          if (hint) score -= hint.pointCost;
        });

        return score;
      },
      
      getTeamSolves: (teamId: string) => {
        return get().solves.filter(s => s.teamId === teamId);
      },
      
      getTeamUnlockedHints: (teamId: string) => {
        return get().hintUnlocks.filter(hu => hu.teamId === teamId);
      }
    }),
    {
      name: 'ctf-storage',
    }
  )
);
