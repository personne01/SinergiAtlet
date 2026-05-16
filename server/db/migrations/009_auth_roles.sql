-- Update role values: athlete → talent, org_admin → klub, add pencari_bakat
UPDATE users SET role = 'talent' WHERE role = 'athlete';
UPDATE users SET role = 'klub' WHERE role = 'org_admin';

-- Add check constraint for new roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'klub', 'pencari_bakat', 'talent'));

-- Add status column for account approval flow
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
ALTER TABLE users ADD CONSTRAINT users_status_check
  CHECK (status IN ('active', 'pending', 'suspended'));

-- Add approved_by reference
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
