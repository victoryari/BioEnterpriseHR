USE bioenterprise_hr;
ALTER TABLE dispositivos MODIFY COLUMN protocolo VARCHAR(50) NOT NULL DEFAULT 'Autónomo';
