
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

-- 5. Policies for Users
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 6. Policies for Players (Simplified: Authenticated users can do everything for now)
CREATE POLICY "Authenticated users can view players" ON public.players
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Scouts can insert players" ON public.players
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update players" ON public.players
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete players" ON public.players
    FOR DELETE TO authenticated USING (true);

-- 7. Policies for Player Attributes
CREATE POLICY "Authenticated users can view attributes" ON public.player_attributes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage attributes" ON public.player_attributes
    FOR ALL TO authenticated USING (true);

-- 8. Storage Configuration (Avatars bucket)
-- Note: You need to create a bucket named 'avatars' in Supabase Storage UI manually or via SQL.
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
