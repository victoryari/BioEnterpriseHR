USE bioenterprise_hr;
ALTER TABLE empleados ADD COLUMN direccion VARCHAR(255) NULL AFTER telefono;
ALTER TABLE empleados ADD COLUMN fecha_nacimiento DATE NULL AFTER fecha_cese;
