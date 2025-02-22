-- Migration pour ajouter les colonnes de suivi utilisateur
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS browser_info jsonb,
ADD COLUMN IF NOT EXISTS current_page text,
ADD COLUMN IF NOT EXISTS last_active timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS ip_address text;

-- Créer un index sur last_active pour optimiser les requêtes de suivi
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active);

-- Créer une fonction pour mettre à jour last_active automatiquement
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS trigger AS $$
BEGIN
    NEW.last_active = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer un trigger pour mettre à jour last_active automatiquement
DROP TRIGGER IF EXISTS update_profiles_last_active ON profiles;
CREATE TRIGGER update_profiles_last_active
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION update_last_active();

-- Ajouter des commentaires pour la documentation
COMMENT ON COLUMN profiles.browser_info IS 'Informations sur le navigateur et le système d''exploitation de l''utilisateur';
COMMENT ON COLUMN profiles.current_page IS 'Page actuelle sur laquelle se trouve l''utilisateur';
COMMENT ON COLUMN profiles.last_active IS 'Dernière activité de l''utilisateur';
COMMENT ON COLUMN profiles.ip_address IS 'Adresse IP de l''utilisateur';
