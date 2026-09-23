export type ChallengeCategory = 
  | 'Web'
  | 'Pwn'
  | 'Reverse Engineering'
  | 'Cryptography'
  | 'Forensics'
  | 'Hardware / IoT'
  | 'Misc';

export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard';

export type ChallengeState = 'active' | 'hidden' | 'archived';

export interface ChallengeHint {
  id: string;
  cost: number;
  content: string;
}

export interface ChallengeFile {
  name: string;
  url: string;
  size: string;
}

export interface ChallengeLink {
  label: string;
  url: string;
}

export interface Challenge {
  id: string;
  title: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  author: string;
  description: string;
  hints: ChallengeHint[];
  files: ChallengeFile[];
  links: ChallengeLink[];
  flag: string;
  state: ChallengeState;
}

export const DIFFICULTY_POINTS: Record<ChallengeDifficulty, number> = {
  Easy: 100,
  Medium: 250,
  Hard: 500,
};

// --- MULTIPLAYER COMPETITIVE LOGIC ---

export interface User {
  id: string;
  name: string;
  email?: string;
  teamId: string | null;
  role?: 'user' | 'admin';
}

export interface Team {
  id: string;
  name: string;
  code: string; // 6-char alphanumeric join code
}

export interface TeamSolve {
  teamId: string;
  challengeId: string;
  solvedByUserId: string;
  solvedByUserName: string;
  timestamp: number; // Unix timestamp
  points: number;
}

export interface TeamHintUnlock {
  teamId: string;
  challengeId: string;
  hintId: string;
  cost: number;
  timestamp: number;
}

export interface ActivityLogItem {
  id: string;
  teamId: string;
  userName: string;
  challengeTitle: string;
  category: ChallengeCategory;
  points: number;
  timestamp: number;
}
