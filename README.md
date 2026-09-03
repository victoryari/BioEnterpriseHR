# 🏢 BioEnterpriseHR - Sistema Integral de Gestión de RRHH & Control Biométrico Perú

[![React](https://img.shields.io/badge/Frontend-React_19_%2B_TypeScript-61DAFB?logo=react)](https://react.dev/)
[![Laravel](https://img.shields.io/badge/Backend-Laravel_PHP-FF2D20?logo=laravel)](https://laravel.com/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql)](https://www.mysql.com/)
[![Vite](https://img.shields.io/badge/Build_Tool-Vite-646CFF?logo=vite)](https://vitejs.dev/)
[![Normativa](https://img.shields.io/badge/Normativa-D.L._728_%2F_SUNAT_PLAME-blue)](https://www.sunat.gob.pe/)

**BioEnterpriseHR** es una plataforma empresarial integral de Gestión de Recursos Humanos, Control de Asistencia Biométrica y Liquidación de Nóminas adaptada a la **legislación laboral peruana (Decreto Legislativo 728)**.

El sistema conecta en tiempo real marcaciones de terminales biométricos **ZKTeco (ADMS/Push SDK)** con el cálculo dinámico de planillas, retenciones de pensiones (AFPs / ONP), Horas Extras, Tardanzas y generación de estructuras oficializadas por **SUNAT (PDT 0601 PLAME)**.

---

## 🚀 Características y Módulos Principales

### 👨‍💼 1. Módulo de Personal & Ficha Laboral
- Registro unificado con documentos peruanos (**DNI, CE, Pasaporte**).
- Gestión de biometría: **Huella digital, Rostro y Tarjeta RFID**.
- Clasificación multi-empresa corporativa (**Grupo Carmelita**, Importaciones Carmelita, Grupo Chemmer Perú, León Plast).
- Inactivación de personal mediante **Soft Delete** (Cese D.L. 728), preservando el historial legal.

### 🕒 2. Control de Asistencia Biométrica ZKTeco (ADMS)
- Integración directa con relojes marcadores por IP/Push SDK.
- Tolerancia configurable de tardanzas (10-15 min).
- Recargo nocturno (35%) y sobretasas de **Horas Extras (25% primeras 2h / 35% restantes)**.
- Bitácora auditable de marcaciones y corrección manual controlada.

### 💸 3. Nóminas & Boletas de Pago (D.L. 728)
- Cálculo dinámico de sueldo bruto, **Asignación Familiar (10% RMV = S/ 102.50)**.
- Descuentos de ley automáticos:
  - **AFPs**: Habitat, Integra, Prima, Profuturo (Aporte obligatorio, comisión y prima de seguro).
  - **ONP**: 13.00%.
  - **IR 5ta Categoría**: Proyección anual según UIT vigente (S/ 5,350.00).
- Aporte Patronal: **EsSalud (9%)**.
- Emisión e impresión de **Boletas de Pago en PDF** formalizadas con código de seguridad.

### 📁 4. Generador de Estructuras PLAME / SUNAT (PDT 0601)
Exportación directa de archivos planos delimitados por palotes (`|`) según la **Tabla 22 de SUNAT**:
- 📄 **`0601YYYYMMRUC.rem` (Estructura 01)**: Remuneración Básica (`0121`), Asig. Familiar (`0201`), Horas Extras 25%/35% (`0105`/`0106`), AFP/ONP (`0687`), Tardanzas (`0704`), IR 5ta (`0601`) y EsSalud (`0804`).
- 📄 **`0601YYYYMMRUC.jor` (Estructura 02)**: Jornada ordinaria (240h) y tiempo acumulado de sobretiempo.

### 💰 5. Beneficios Sociales Legales en Perú
- **CTS (D.S. 001-97-TR)**: Depósitos semestrales (Mayo y Noviembre) computando sueldo + Asig. Fam. + 1/6 de Gratificación.
- **Gratificaciones (Ley 27735 / Ley 29351)**: Fiestas Patrias (Julio) y Navidad (Diciembre) con Bonificación Extraordinaria del 9% (EsSalud).
- **Reparto de Utilidades (D.L. 892)**: Distribución legal (50% Días laborados + 50% Remuneraciones) con tope de 18 sueldos.
- **Liquidaciones por Cese (LBS)**: Emisión automática de Hoja de LBS, Boletas Truncas y Carta de Liberación de CTS.

---

## 🛠️ Arquitectura del Sistema

```text
BioEnterpriseHR/
├── src/                      # Frontend React 19 + TypeScript + Vite
│   ├── components/
│   │   ├── modals/           # Modales (Edición, LBS, Boletas, Usuarios, Horarios)
│   │   └── views/            # Vistas principales (PersonnelView, PayrollView, HardwareView, etc.)
│   ├── services/
│   │   └── apiService.ts     # Cliente HTTP hacia la API REST
│   └── types.ts              # Definición de interfaces TypeScript
├── backend_api/              # Backend API REST en Laravel PHP
│   ├── app/
│   │   ├── Http/Controllers/ # Controladores auditados (EmpleadoController, PayrollController, etc.)
│   │   └── Models/           # Modelos Eloquent
│   ├── database/             # Migraciones y Seeder
│   └── routes/api.php        # 79 Rutas API REST
└── database/
    └── bioenterprise_hr.sql  # Script de estructura e inicialización MySQL
```

---

## 💻 Requisitos del Sistema

- **Node.js**: v18.0 o superior
- **PHP**: v8.1 o superior (con extensiones `pdo_mysql`, `curl`, `mbstring`, `openssl`)
- **Base de Datos**: MySQL 8.0+ / MariaDB 10.4+ (ej. Laragon / XAMPP)
- **Composer**: v2.0+

---

## 🔧 Pasos para la Replicación y Puesta en Funcionamiento

Sigue estos pasos detallados para instalar y ejecutar el proyecto desde cero en tu entorno local:

### 1️⃣ Clonar el Repositorio
```bash
git clone https://github.com/victoryari/BioEnterpriseHR.git
cd BioEnterpriseHR
```

### 2️⃣ Configurar la Base de Datos MySQL
1. Abre tu gestor de base de datos (Laragon / phpMyAdmin / DBeaver) y crea la base de datos:
   ```sql
   CREATE DATABASE bioenterprise_hr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Importa el archivo SQL base ubicado en la carpeta `database`:
   ```bash
   mysql -u root -p bioenterprise_hr < database/bioenterprise_hr.sql
   ```

### 3️⃣ Configurar y Levantar el Backend API (Laravel)
1. Navega a la carpeta del servidor backend:
   ```bash
   cd backend_api
   ```
2. Instala las dependencias PHP mediante Composer:
   ```bash
   composer install
   ```
3. Configura el archivo de variables de entorno `.env`:
   ```bash
   cp .env.example .env
   ```
4. Edita el archivo `.env` para enlazar tu base de datos MySQL:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=bioenterprise_hr
   DB_USERNAME=root
   DB_PASSWORD=
   ```
5. Inicia el servidor del Backend en el puerto `8002`:
   ```bash
   php artisan serve --port=8002
   ```

### 4️⃣ Configurar y Levantar el Frontend (React + Vite)
1. Abre una nueva terminal en la carpeta raíz del proyecto (`BioEnterpriseHR`):
   ```bash
   npm install
   ```
2. Inicia el servidor de desarrollo del Frontend:
   ```bash
   npm run dev
   ```
3. Abre tu navegador web e ingresa a:
   ```text
   http://localhost:3000
   ```

---

## 🔑 Credenciales de Acceso por Defecto

| Rol | Correo / Usuario | Contraseña / PIN |
| :--- | :--- | :--- |
| **Super Administrador** | `admin@carmelita.pe` | `admin123` |
| **Gestor de RRHH** | `rrhh@carmelita.pe` | `rrhh123` |
| **Colaborador / Self-Service** | DNI Colaborador (ej. `40869749`) | PIN Biométrico |

---

## 📄 Licencia

Desarrollado para el **Grupo Carmelita (Perú)**. Reservados todos los derechos.
