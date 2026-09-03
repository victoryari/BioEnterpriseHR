USE bioenterprise_hr;
ALTER TABLE empleados ADD COLUMN acceso_entrada_principal TINYINT(1) NOT NULL DEFAULT 1 AFTER sueldo_base;
ALTER TABLE empleados ADD COLUMN acceso_centro_datos TINYINT(1) NOT NULL DEFAULT 0 AFTER acceso_entrada_principal;
ALTER TABLE empleados ADD COLUMN acceso_almacen TINYINT(1) NOT NULL DEFAULT 0 AFTER acceso_centro_datos;
ALTER TABLE empleados ADD COLUMN empresa VARCHAR(100) NULL AFTER sede_id;
