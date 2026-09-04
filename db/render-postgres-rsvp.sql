-- Safe to run in pgAdmin after the four RSVP tables have been created.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS invitations_set_updated_at ON invitations;
CREATE TRIGGER invitations_set_updated_at BEFORE UPDATE ON invitations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS guests_set_updated_at ON guests;
CREATE TRIGGER guests_set_updated_at BEFORE UPDATE ON guests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS rsvps_set_updated_at ON rsvps;
CREATE TRIGGER rsvps_set_updated_at BEFORE UPDATE ON rsvps
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS plus_ones_set_updated_at ON plus_ones;
CREATE TRIGGER plus_ones_set_updated_at BEFORE UPDATE ON plus_ones
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
