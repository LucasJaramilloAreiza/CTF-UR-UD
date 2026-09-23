-- Enable UUID extension (kept for compatibility)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Table: teams
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    role TEXT DEFAULT 'user'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: challenges
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT NOT NULL,
    flag TEXT NOT NULL,
    state TEXT DEFAULT 'hidden'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: challenge_hints
CREATE TABLE challenge_hints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    cost INTEGER NOT NULL,
    content TEXT NOT NULL
);

-- Table: challenge_files
CREATE TABLE challenge_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    size TEXT NOT NULL
);

-- Table: challenge_links
CREATE TABLE challenge_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    url TEXT NOT NULL
);

-- Table: team_solves
CREATE TABLE team_solves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    solved_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    solved_by_user_name TEXT NOT NULL,
    points INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(team_id, challenge_id) -- Un equipo solo puede resolver un reto una vez
);

-- Table: team_hint_unlocks
CREATE TABLE team_hint_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    hint_id UUID NOT NULL REFERENCES challenge_hints(id) ON DELETE CASCADE,
    cost INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(team_id, hint_id)
);

-- Table: competition_state
CREATE TABLE competition_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT NOT NULL DEFAULT 'not_started'::text,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert initial competition state
INSERT INTO competition_state (status) VALUES ('not_started');

-- Set up Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_solves ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_hint_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_state ENABLE ROW LEVEL SECURITY;

-- Allow all reads for everyone (since this is a simplified CTF where UI decides what to show)
-- For a strict production environment, RLS would restrict flags and hints.
-- To keep it simple and match the local storage behavior:

CREATE POLICY "Allow public read access" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access" ON teams FOR DELETE USING (true); -- Only admin should do this ideally

CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON users FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON challenges FOR SELECT USING (true);
CREATE POLICY "Allow admin full access" ON challenges FOR ALL USING (true); -- Simplify for now

CREATE POLICY "Allow public read access" ON challenge_hints FOR SELECT USING (true);
CREATE POLICY "Allow admin full access" ON challenge_hints FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON challenge_files FOR SELECT USING (true);
CREATE POLICY "Allow admin full access" ON challenge_files FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON challenge_links FOR SELECT USING (true);
CREATE POLICY "Allow admin full access" ON challenge_links FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON team_solves FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON team_solves FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON team_hint_unlocks FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON team_hint_unlocks FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON competition_state FOR SELECT USING (true);
CREATE POLICY "Allow admin full access" ON competition_state FOR ALL USING (true);
