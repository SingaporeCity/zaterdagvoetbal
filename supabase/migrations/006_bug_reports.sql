-- Bug reports table
CREATE TABLE IF NOT EXISTS bug_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- Anyone logged in can insert
CREATE POLICY "bugs_insert" ON bug_reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can read their own bugs
CREATE POLICY "bugs_select_own" ON bug_reports FOR SELECT USING (user_id = auth.uid());
