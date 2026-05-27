
-- 1. Create Users (Profiles) table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'scout',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Players table
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    telefono TEXT,
    contacto_tipo TEXT,
    equipo_actual TEXT,
    dorsal TEXT,
    posicion TEXT NOT NULL,
    lateralidad TEXT,
    anio_nacimiento INTEGER,
    foto_url TEXT,
    observaciones TEXT,
    motivos_rechazo TEXT,
    fecha_seguimiento DATE,
    potencial INTEGER DEFAULT 1,
    estado TEXT NOT NULL DEFAULT 'Observado',
    observador TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2b. Create Observers table
CREATE TABLE IF NOT EXISTS public.observers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2c. Create Needs table
CREATE TABLE IF NOT EXISTS public.needs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipo TEXT NOT NULL,
    posicion TEXT NOT NULL,
    solicitante TEXT NOT NULL,
    observaciones TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2d. Create Coaches table
CREATE TABLE IF NOT EXISTS public.coaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    club TEXT NOT NULL,
    equipo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    edad INTEGER,
    observaciones TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Player Attributes table
CREATE TABLE IF NOT EXISTS public.player_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    atributo TEXT NOT NULL,
    valor INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(player_id, atributo)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

-- 4b. Policies for Observers
DROP POLICY IF EXISTS "Anyone can view observers" ON public.observers;
CREATE POLICY "Anyone can view observers" ON public.observers
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert observers" ON public.observers;
CREATE POLICY "Authenticated users can insert observers" ON public.observers
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete observers" ON public.observers;
CREATE POLICY "Authenticated users can delete observers" ON public.observers
    FOR DELETE TO authenticated USING (true);

-- 4c. Policies for Needs
DROP POLICY IF EXISTS "Anyone can view needs" ON public.needs;
CREATE POLICY "Anyone can view needs" ON public.needs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert needs" ON public.needs;
CREATE POLICY "Authenticated users can insert needs" ON public.needs
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update needs" ON public.needs;
CREATE POLICY "Authenticated users can update needs" ON public.needs
    FOR UPDATE TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete needs" ON public.needs;
CREATE POLICY "Authenticated users can delete needs" ON public.needs
    FOR DELETE TO authenticated USING (true);

-- 4d. Policies for Coaches
DROP POLICY IF EXISTS "Anyone can view coaches" ON public.coaches;
CREATE POLICY "Anyone can view coaches" ON public.coaches
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert coaches" ON public.coaches;
CREATE POLICY "Authenticated users can insert coaches" ON public.coaches
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update coaches" ON public.coaches;
CREATE POLICY "Authenticated users can update coaches" ON public.coaches
    FOR UPDATE TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete coaches" ON public.coaches;
CREATE POLICY "Authenticated users can delete coaches" ON public.coaches
    FOR DELETE TO authenticated USING (true);

-- 5. Policies for Users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 6. Policies for Players (Only admins can edit or delete, anyone logged in can view and register)
DROP POLICY IF EXISTS "Authenticated users can view players" ON public.players;
CREATE POLICY "Authenticated users can view players" ON public.players
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert players" ON public.players;
CREATE POLICY "Authenticated users can insert players" ON public.players
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can update players" ON public.players;
CREATE POLICY "Only admins can update players" ON public.players
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Only admins can delete players" ON public.players;
CREATE POLICY "Only admins can delete players" ON public.players
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- 7. Policies for Player Attributes
DROP POLICY IF EXISTS "Authenticated users can view attributes" ON public.player_attributes;
CREATE POLICY "Authenticated users can view attributes" ON public.player_attributes
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert attributes" ON public.player_attributes;
CREATE POLICY "Authenticated users can insert attributes" ON public.player_attributes
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can update attributes" ON public.player_attributes;
CREATE POLICY "Only admins can update attributes" ON public.player_attributes
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Only admins can delete attributes" ON public.player_attributes;
CREATE POLICY "Only admins can delete attributes" ON public.player_attributes
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- 8. Storage Configuration (Avatars bucket)
-- Note: You need to create a bucket named 'avatars' in Supabase Storage UI manually or via SQL.
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- 9. Create Tactics (Campograma state) table
CREATE TABLE IF NOT EXISTS public.tactics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season TEXT NOT NULL,
    team TEXT NOT NULL,
    roster JSONB NOT NULL DEFAULT '[]'::jsonb,
    lineup JSONB NOT NULL DEFAULT '{}'::jsonb,
    formation TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    UNIQUE(season, team)
);

-- Enable RLS for tactics
ALTER TABLE public.tactics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view tactics" ON public.tactics;
CREATE POLICY "Anyone can view tactics" ON public.tactics
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert/update tactics" ON public.tactics;
CREATE POLICY "Authenticated users can insert/update tactics" ON public.tactics
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

