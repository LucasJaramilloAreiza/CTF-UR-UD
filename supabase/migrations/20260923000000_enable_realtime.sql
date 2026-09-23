-- Enable Realtime for the tables we need to sync live across clients
alter publication supabase_realtime add table team_solves;
alter publication supabase_realtime add table competition_state;
