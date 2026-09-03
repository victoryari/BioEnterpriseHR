import React, { useState, useEffect } from 'react';
import {
  ModoVista,
  Empleado,
  Dispositivo,
  MarcacionAsistencia,
  SolicitudPermiso,
  DiaFestivo,
  MensajeNotificacion,
  HorarioTrabajo,
  Turno,
  AsignacionTurno,
  ReglasAsistencia,
  Sede,
  Departamento,
  UsuarioSistema,
} from './types';
import { storageService } from './services/storageService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { ToastContainer } from './components/Toast';

import { LoginView } from './components/views/LoginView';
import { OverviewView } from './components/views/OverviewView';
import { HardwareView } from './components/views/HardwareView';
import { PersonnelView } from './components/views/PersonnelView';
import { InsightsView } from './components/views/InsightsView';
import { AttendanceView } from './components/views/AttendanceView';
import { SelfServiceView } from './components/views/SelfServiceView';
import { ShiftsRulesView } from './components/views/ShiftsRulesView';
import { PayrollView } from './components/views/PayrollView';
import { UsersRolesView } from './components/views/UsersRolesView';
import { MasterTablesView } from './components/views/MasterTablesView';

// Modales Existentes
import { SyncModal } from './components/modals/SyncModal';
import { AddEmployeeModal } from './components/modals/AddEmployeeModal';
import { HolidayModal } from './components/modals/HolidayModal';
import { ExportPayrollModal } from './components/modals/ExportPayrollModal';
import { RawLogsModal } from './components/modals/RawLogsModal';
import { DeactivationHistoryModal } from './components/modals/DeactivationHistoryModal';
import { AddDeviceModal } from './components/modals/AddDeviceModal';

// Modales CRUD Personal, Hardware, Sedes y Permisos
import { EditEmployeeModal } from './components/modals/EditEmployeeModal';
import { EditDeviceModal } from './components/modals/EditDeviceModal';
import { ConfirmDeleteModal } from './components/modals/ConfirmDeleteModal';
import { LeaveRequestsAdminModal } from './components/modals/LeaveRequestsAdminModal';
import { ManageHolidaysModal } from './components/modals/ManageHolidaysModal';
import { ManageOrgsModal } from './components/modals/ManageOrgsModal';
import { ManualPunchModal } from './components/modals/ManualPunchModal';
import { ManageSystemUsersModal } from './components/modals/ManageSystemUsersModal';
import { apiService } from './services/apiService';

// Modales CRUD Turnos y Horarios
import { AddEditTimetableModal } from './components/modals/AddEditTimetableModal';
import { AddEditShiftModal } from './components/modals/AddEditShiftModal';
import { AssignShiftModal } from './components/modals/AssignShiftModal';

export default function App() {
  const [currentView, setCurrentView] = useState<ModoVista>('overview');
  const [userRole, setUserRole] = useState<'admin' | 'employee'>('admin');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados del Dominio con Persistencia (localStorage)
  const [devices, setDevices] = useState<Dispositivo[]>(() => storageService.getDevices());
  const [employees, setEmployees] = useState<Empleado[]>(() => storageService.getEmployees());
  const [punchLogs, setPunchLogs] = useState<MarcacionAsistencia[]>(() => storageService.getPunchLogs());
  const [leaveRequests, setLeaveRequests] = useState<SolicitudPermiso[]>(() => storageService.getLeaveRequests());
  const [holidays, setHolidays] = useState<DiaFestivo[]>(() => storageService.getHolidays());
  const [selectedEmployee, setSelectedEmployee] = useState<Empleado | null>(() => {
    const list = storageService.getEmployees();
    return list.length > 0 ? list[0] : null;
  });

  // Estados de Horarios, Turnos y Reglas Laborales
  const [timetables, setTimetables] = useState<HorarioTrabajo[]>(() => storageService.getTimetables());
  const [shifts, setShifts] = useState<Turno[]>(() => storageService.getShifts());
  const [shiftAssignments, setShiftAssignments] = useState<AsignacionTurno[]>(() => storageService.getShiftAssignments());
  const [attendanceRules, setAttendanceRules] = useState<ReglasAsistencia>(() => storageService.getAttendanceRules());

  // Estados de Sedes y Departamentos Organizacionales
  const [sedes, setSedes] = useState<Sede[]>(() => storageService.getSedes());
  const [departamentos, setDepartamentos] = useState<Departamento[]>(() => storageService.getDepartamentos());
  const [isManageOrgsModalOpen, setIsManageOrgsModalOpen] = useState(false);

  // Usuarios del Sistema y Roles (RBAC)
  const [systemUsers, setSystemUsers] = useState<UsuarioSistema[]>(() => storageService.getSystemUsers());
  const [isManageSystemUsersModalOpen, setIsManageSystemUsersModalOpen] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState<string>(() => storageService.getCurrentAdminId());
  const [initialEditUserId, setInitialEditUserId] = useState<string | null>(null);

  const currentAdminUser =
    systemUsers.find((u) => u.id === currentAdminId) ||
    systemUsers.find((u) => u.correo === 'admin@bioenterprise.pe') ||
    systemUsers[0] ||
    null;

  // Modales Existentes
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isExportPayrollModalOpen, setIsExportPayrollModalOpen] = useState(false);
  const [isRawLogsModalOpen, setIsRawLogsModalOpen] = useState(false);
  const [isDeactivationHistoryModalOpen, setIsDeactivationHistoryModalOpen] = useState(false);
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
  const [isManualPunchModalOpen, setIsManualPunchModalOpen] = useState(false);

  // Modales CRUD Personal, Hardware y Aprobaciones
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Empleado | null>(null);

  const [isEditDeviceModalOpen, setIsEditDeviceModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Dispositivo | null>(null);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'employee' | 'device';
    id: string;
    name: string;
  } | null>(null);

  const [isLeaveRequestsAdminModalOpen, setIsLeaveRequestsAdminModalOpen] = useState(false);
  const [isManageHolidaysModalOpen, setIsManageHolidaysModalOpen] = useState(false);

  // Modales Turnos y Horarios
  const [isAddEditTimetableModalOpen, setIsAddEditTimetableModalOpen] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState<HorarioTrabajo | null>(null);

  const [isAddEditShiftModalOpen, setIsAddEditShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Turno | null>(null);

  const [isAssignShiftModalOpen, setIsAssignShiftModalOpen] = useState(false);

  // Notificaciones Toast
  const [toasts, setToasts] = useState<MensajeNotificacion[]>([]);

  const addToast = (
    titulo: string,
    descripcion?: string,
    tipo: 'success' | 'info' | 'warning' | 'error' = 'success'
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, titulo, descripcion, tipo }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Gestión de Usuarios y Roles (RBAC) sincronizados con MySQL (bioenterprise_hr)
  useEffect(() => {
    apiService
      .getSystemUsers()
      .then((dbUsers) => {
        if (dbUsers && dbUsers.length > 0) {
          setSystemUsers(dbUsers);
          storageService.saveSystemUsers(dbUsers);
        }
      })
      .catch((err) => {
        console.warn('API Laravel no accesible al iniciar, usando almacenamiento local:', err);
      });
  }, []);

  // Cargar Colaboradores / Empleados desde la API MySQL al iniciar
  useEffect(() => {
    if (sedes.length === 0 || departamentos.length === 0) return;
    apiService
      .getEmployees(sedes, departamentos)
      .then((dbEmployees) => {
        if (dbEmployees && dbEmployees.length > 0) {
          setEmployees(dbEmployees);
          storageService.saveEmployees(dbEmployees);
          if (!selectedEmployee) {
            setSelectedEmployee(dbEmployees[0]);
          }
        }
      })
      .catch((err) => {
        console.warn('API Laravel no respondió al consultar empleados, usando almacenamiento local:', err);
      });
  }, [sedes, departamentos]);

  // Cargar Sedes y Departamentos desde MySQL al iniciar
  useEffect(() => {
    apiService.getSedes().then((dbSedes) => {
      if (dbSedes && dbSedes.length > 0) {
        setSedes(dbSedes);
        storageService.saveSedes(dbSedes);
      }
    }).catch((e) => console.warn('Error al cargar sedes de MySQL:', e));

    apiService.getDepartamentos().then((dbDeptos) => {
      if (dbDeptos && dbDeptos.length > 0) {
        setDepartamentos(dbDeptos);
        storageService.saveDepartamentos(dbDeptos);
      }
    }).catch((e) => console.warn('Error al cargar departamentos de MySQL:', e));
  }, []);

  // Cargar Dispositivos, Marcaciones, Permisos, Horarios, Turnos, Asignaciones, Feriados y Reglas desde MySQL
  useEffect(() => {
    apiService.getDevices().then((dbDevs) => {
      if (dbDevs && dbDevs.length > 0) {
        setDevices(dbDevs);
        storageService.saveDevices(dbDevs);
      }
    }).catch((e) => console.warn('Error al cargar dispositivos de MySQL:', e));

    const fetchLogs = () => {
      apiService.getPunchLogs().then((dbLogs) => {
        if (dbLogs) {
          setPunchLogs(dbLogs);
          storageService.savePunchLogs(dbLogs);
        }
      }).catch((e) => console.warn('Error al cargar marcaciones de MySQL:', e));
    };

    fetchLogs();

    // Polling automático de marcaciones cada 10 segundos para "Marcaciones en Vivo"
    const pollInterval = setInterval(fetchLogs, 10000);

    apiService.getAttendanceRules().then((dbRules) => {
      if (dbRules) {
        setAttendanceRules(dbRules);
        storageService.saveAttendanceRules(dbRules);
      }
    }).catch((e) => console.warn('Error al cargar reglas de asistencia de MySQL:', e));

    return () => clearInterval(pollInterval);
  }, []);

  const handleSaveSystemUser = async (updatedUser: UsuarioSistema, clave?: string) => {
    // 1. Actualización optimista inmediata en interfaz y caché
    setSystemUsers((prev) => {
      const exists = prev.some((u) => u.id === updatedUser.id);
      const next = exists
        ? prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        : [updatedUser, ...prev];
      storageService.saveSystemUsers(next);
      return next;
    });

    // 2. Persistencia en base de datos MySQL mediante API Laravel
    try {
      const exists = systemUsers.some((u) => u.id === updatedUser.id);
      if (exists) {
        await apiService.updateSystemUser(updatedUser.id, {
          nombre: updatedUser.nombre,
          correo: updatedUser.correo,
          rol: updatedUser.rol,
          estado: updatedUser.estado,
          foto: updatedUser.foto,
          clave,
        });
        addToast(
          'Guardado en MySQL',
          `Usuario ${updatedUser.nombre} actualizado en la base de datos bioenterprise_hr.`,
          'success'
        );
      } else {
        const res = await apiService.createSystemUser({
          nombre: updatedUser.nombre,
          correo: updatedUser.correo,
          rol: updatedUser.rol,
          estado: updatedUser.estado,
          foto: updatedUser.foto,
          clave: clave || 'Carmelita2026!',
        });
        if (res.data) {
          setSystemUsers((prev) => {
            const next = prev.map((u) => (u.id === updatedUser.id ? res.data! : u));
            storageService.saveSystemUsers(next);
            return next;
          });
        }
        addToast(
          'Guardado en MySQL',
          `Usuario ${updatedUser.nombre} insertado en la base de datos bioenterprise_hr.`,
          'success'
        );
      }
    } catch (err: any) {
      console.error('Error al sincronizar con base de datos MySQL:', err);
      addToast(
        'Guardado Localmente',
        `Los cambios se guardaron en la app. (Aviso BD: ${err.message || 'API no respondió'})`,
        'warning'
      );
    }
  };

  const handleDeleteSystemUser = async (userId: string) => {
    setSystemUsers((prev) => {
      const next = prev.filter((u) => u.id !== userId);
      storageService.saveSystemUsers(next);
      return next;
    });

    try {
      await apiService.deleteSystemUser(userId);
      addToast('Eliminado de MySQL', 'La cuenta fue removida de la base de datos bioenterprise_hr.', 'info');
    } catch (err: any) {
      console.warn('Error al eliminar en MySQL:', err);
      addToast('Usuario eliminado', 'La cuenta fue eliminada del almacenamiento local.', 'info');
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    const target = systemUsers.find((u) => u.id === userId);
    if (!target) return;

    const nextStatus = target.estado === 'Activo' ? 'Inactivo' : 'Activo';
    const updated = { ...target, estado: nextStatus as 'Activo' | 'Inactivo' };

    setSystemUsers((prev) => {
      const next = prev.map((u) => (u.id === userId ? updated : u));
      storageService.saveSystemUsers(next);
      return next;
    });

    try {
      await apiService.updateSystemUser(userId, {
        nombre: updated.nombre,
        correo: updated.correo,
        rol: updated.rol,
        estado: updated.estado,
        foto: updated.foto,
      });
      addToast(
        `Estado actualizado en MySQL`,
        `La cuenta ${target.nombre} ahora está ${nextStatus.toLowerCase()} en base de datos.`,
        nextStatus === 'Activo' ? 'success' : 'warning'
      );
    } catch (err: any) {
      console.warn('Error al cambiar estado en MySQL:', err);
      addToast(
        `Usuario ${nextStatus}`,
        `La cuenta ${target.nombre} ahora está ${nextStatus.toLowerCase()} (local).`,
        nextStatus === 'Activo' ? 'success' : 'warning'
      );
    }
  };

  const handleOpenEditProfile = () => {
    setInitialEditUserId(currentAdminUser?.id || '1');
    setIsManageSystemUsersModalOpen(true);
  };



  // Protección estricta de rutas por Rol (El colaborador solo puede estar en autoservicio)
  useEffect(() => {
    if (userRole === 'employee' && currentView !== 'self-service' && currentView !== 'login') {
      setCurrentView('self-service');
    }
  }, [userRole, currentView]);

  // Manejadores de Autenticación
  const handleLogin = (role: 'admin' | 'employee', identifier?: string) => {
    setUserRole(role);
    if (role === 'admin') {
      setCurrentView('overview');
      addToast('Sesión Iniciada', 'Bienvenido a BioEnterprise HR Perú (Admin)', 'success');
    } else {
      if (identifier) {
        const clean = identifier.trim().toLowerCase();
        const words = clean.split(/\s+/).filter(Boolean);
        const found = employees.find((e) => {
          const empMail = e.correo.toLowerCase();
          const empDoc = (e.numeroDocumento || '').toLowerCase();
          const empPin = (e.pin || '').toLowerCase();
          const empName = e.nombre.toLowerCase();

          if (empMail === clean || empDoc === clean || empPin === clean) return true;
          if (empName.includes(clean)) return true;
          if (words.length > 1 && words.every((w) => empName.includes(w))) return true;
          return words.some((w) => w.length >= 4 && empName.includes(w));
        });
        if (found) {
          setSelectedEmployee(found);
          addToast('Sesión Iniciada', `Bienvenido(a), ${found.nombre}`, 'info');
        } else {
          // Si el colaborador ingresa con un nombre o correo corporativo
          // y no estaba previamente en la lista, se registra de forma inmediata
          const isRenato = clean.includes('renato') || clean.includes('monteza');
          const isLegal = clean.includes('legal') || isRenato;
          const newColab: Empleado = {
            id: `emp-carmelita-${Date.now()}`,
            tipoDocumento: 'DNI',
            numeroDocumento: '46892105',
            pin: '7721',
            biometriaHuella: true,
            biometriaRostro: true,
            tipoMarcadoPredilecto: 'Huella',
            nombre: isRenato ? 'Renato Monteza' : isLegal ? 'Dr. Fernando Salazar (Legal)' : clean.split('@')[0].toUpperCase(),
            correo: clean.includes('@') ? clean : 'renato.monteza@grupocarmelita.com',
            cargo: isRenato ? 'Jefe Legal' : isLegal ? 'Asesor Jurídico & Laboral' : 'Colaborador',
            departamento: isLegal ? 'Legal' : (departamentos[0]?.nombre || 'Operaciones'),
            sede: sedes[0]?.nombre || 'Sede Principal San Borja',
            estado: 'Activo',
            foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            conteoHuellas: 2,
            rostroActualizado: 'Actualizado hoy',
            accesoPuertas: { entradaPrincipal: true, centroDatos: false, almacen: false },
            telefono: '+51 984 521 693',
            fechaIngreso: '01/01/2023',
            sueldoBase: isRenato ? 6500.0 : isLegal ? 4800.0 : 2500.0,
          };
          const updated = [...employees, newColab];
          setEmployees(updated);
          storageService.saveEmployees(updated);
          setSelectedEmployee(newColab);
          addToast('Sesión Iniciada', `Bienvenido(a), ${newColab.nombre} (${newColab.cargo})`, 'info');
        }
      } else {
        addToast('Sesión Iniciada', 'Bienvenido al Portal de Autoservicio', 'info');
      }
      setCurrentView('self-service');
    }
  };

  const handleLogout = () => {
    setCurrentView('login');
    addToast('Sesión Finalizada', 'Has cerrado sesión correctamente', 'info');
  };

  const handleToggleRole = () => {
    const nextRole = userRole === 'admin' ? 'employee' : 'admin';
    setUserRole(nextRole);
    if (nextRole === 'employee') {
      setCurrentView('self-service');
      addToast('Modo Colaborador', 'Vista restringida exclusivamente al Portal de Autoservicio', 'info');
    } else {
      setCurrentView('overview');
      addToast('Modo Administrador', 'Vista cambiada al Panel de Control', 'info');
    }
  };

  // =========================================================================
  // CONTROL DE INACTIVIDAD DE SESIÓN (AUTO-LOGOUT EN 30 MINUTOS)
  // =========================================================================
  const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 Minutos

  useEffect(() => {
    if (currentView === 'login') return;

    let timeoutId: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setCurrentView('login');
        addToast(
          'Sesión Expirada por Inactividad',
          'Su sesión ha sido cerrada automáticamente tras 30 minutos de inactividad por seguridad.',
          'warning'
        );
      }, INACTIVITY_TIMEOUT_MS);
    };

    const activityEvents = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];
    let lastActivityTime = Date.now();

    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastActivityTime > 2000) {
        lastActivityTime = now;
        resetInactivityTimer();
      }
    };

    resetInactivityTimer();

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [currentView]);

  // ==========================================
  // CRUD Personal / Colaboradores
  // ==========================================
  const handleAddEmployee = async (emp: Empleado) => {
    const updated = [emp, ...employees];
    setEmployees(updated);
    storageService.saveEmployees(updated);
    setSelectedEmployee(emp);
    try {
      await apiService.createEmployee(emp, sedes, departamentos);
      addToast(
        'Guardado en MySQL',
        `${emp.nombre} fue registrado en la base de datos bioenterprise_hr`,
        'success'
      );
    } catch (err: any) {
      console.warn('Error al guardar empleado en MySQL:', err);
      addToast(
        'Colaborador Registrado',
        `${emp.nombre} guardado en el navegador (MySQL no disponible)`,
        'warning'
      );
    }
  };

  const handleOpenEditEmployee = (emp: Empleado) => {
    setEditingEmployee(emp);
    setIsEditEmployeeModalOpen(true);
  };

  const handleSaveEmployee = async (emp: Empleado) => {
    const updated = employees.map((e) => (e.id === emp.id ? emp : e));
    setEmployees(updated);
    storageService.saveEmployees(updated);
    if (selectedEmployee?.id === emp.id) {
      setSelectedEmployee(emp);
    }
    try {
      await apiService.updateEmployee(emp, sedes, departamentos);
      addToast(
        'Actualizado en MySQL',
        `Los datos de ${emp.nombre} fueron guardados en la base de datos bioenterprise_hr`,
        'success'
      );
    } catch (err: any) {
      console.warn('Error al actualizar en MySQL:', err);
      addToast(
        'Colaborador Actualizado',
        `Los datos de ${emp.nombre} fueron guardados en almacenamiento local`,
        'warning'
      );
    }
  };

  const handleOpenDeleteEmployee = (emp: Empleado) => {
    setDeleteTarget({
      type: 'employee',
      id: emp.id,
      name: `${emp.nombre} (${emp.tipoDocumento || 'DNI'}: ${emp.numeroDocumento || emp.pin})`,
    });
    setIsConfirmDeleteOpen(true);
  };

  const handleToggleDoorAccess = (
    employeeId: string,
    door: 'entradaPrincipal' | 'centroDatos' | 'almacen'
  ) => {
    let modifiedEmp: Empleado | null = null;
    const updated = employees.map((emp) => {
      if (emp.id === employeeId) {
        const mod = {
          ...emp,
          accesoPuertas: {
            ...emp.accesoPuertas,
            [door]: !emp.accesoPuertas[door],
          },
        };
        modifiedEmp = mod;
        if (selectedEmployee?.id === employeeId) {
          setSelectedEmployee(mod);
        }
        return mod;
      }
      return emp;
    });
    setEmployees(updated);
    storageService.saveEmployees(updated);

    if (modifiedEmp) {
      apiService.updateEmployee(modifiedEmp, sedes, departamentos).catch((e) => console.warn('Error syncing door access:', e));
    }
    addToast('Permiso Actualizado', 'Reglas de acceso modificadas y enviadas a la base de datos', 'info');
  };

  const handleToggleEmployeeStatus = (employeeId: string) => {
    let modifiedEmp: Empleado | null = null;
    let nextStatus: 'Activo' | 'Inactivo' = 'Activo';

    const updated = employees.map((emp) => {
      if (emp.id === employeeId) {
        nextStatus = emp.estado === 'Activo' ? 'Inactivo' : 'Activo';
        const mod = {
          ...emp,
          estado: nextStatus as 'Activo' | 'Inactivo',
          accesoPuertas:
            nextStatus === 'Inactivo'
              ? { entradaPrincipal: false, centroDatos: false, almacen: false }
              : { entradaPrincipal: true, centroDatos: false, almacen: false },
        };
        modifiedEmp = mod;
        if (selectedEmployee?.id === employeeId) {
          setSelectedEmployee(mod);
        }
        return mod;
      }
      return emp;
    });
    setEmployees(updated);
    storageService.saveEmployees(updated);

    if (modifiedEmp) {
      apiService.updateEmployee(modifiedEmp, sedes, departamentos).catch((e) => console.warn('Error syncing employee status:', e));
    }

    const isInactive = (nextStatus as string) === 'Inactivo';
    addToast(
      isInactive ? 'Colaborador Dado de Baja' : 'Colaborador Reactivado',
      isInactive
        ? `Credenciales biométricas revocadas y estado actualizado en MySQL`
        : `Acceso restaurado en base de datos MySQL`,
      isInactive ? 'warning' : 'success'
    );
  };

  const handleReEnrollBiometric = (employeeId: string, type: 'huella' | 'rostro') => {
    let modifiedEmp: Empleado | null = null;

    const updated = employees.map((emp) => {
      if (emp.id === employeeId) {
        const mod = {
          ...emp,
          biometriaHuella: type === 'huella' ? true : emp.biometriaHuella,
          biometriaRostro: type === 'rostro' ? true : emp.biometriaRostro,
          conteoHuellas: type === 'huella' ? 2 : emp.conteoHuellas,
          rostroActualizado: type === 'rostro' ? 'Actualizado hoy' : emp.rostroActualizado,
        };
        modifiedEmp = mod;
        if (selectedEmployee?.id === employeeId) {
          setSelectedEmployee(mod);
        }
        return mod;
      }
      return emp;
    });
    setEmployees(updated);
    storageService.saveEmployees(updated);

    if (modifiedEmp) {
      apiService.updateEmployee(modifiedEmp, sedes, departamentos).catch((e) => console.warn('Error syncing biometric data:', e));
    }

    addToast(
      'Biometría Capturada',
      `Plantilla de ${type === 'huella' ? 'huella' : 'rostro 3D'} guardada y sincronizada en MySQL`,
      'success'
    );
  };

  const handleSyncEmployee = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    addToast(
      'Sincronización Individual',
      `Plantillas de ${emp?.nombre} enviadas a los terminales en Perú`,
      'success'
    );
  };

  // ==========================================
  // CRUD Terminales / Hardware
  // ==========================================
  const handleAddDevice = async (newDevice: Dispositivo) => {
    const updated = [newDevice, ...devices];
    setDevices(updated);
    storageService.saveDevices(updated);
    try {
      await apiService.createDevice(newDevice);
      addToast('Guardado en MySQL', `${newDevice.nombre} (${newDevice.ip}) registrado en base de datos`, 'success');
    } catch (err) {
      addToast('Terminal Añadido', `${newDevice.nombre} (${newDevice.ip}) guardado localmente`, 'warning');
    }
  };

  const handleOpenEditDevice = (dev: Dispositivo) => {
    setEditingDevice(dev);
    setIsEditDeviceModalOpen(true);
  };

  const handleSaveDevice = async (dev: Dispositivo) => {
    const updated = devices.map((d) => (d.id === dev.id ? dev : d));
    setDevices(updated);
    storageService.saveDevices(updated);
    try {
      await apiService.updateDevice(dev);
      addToast('Actualizado en MySQL', `${dev.nombre} (${dev.ip}) guardado en base de datos`, 'success');
    } catch (err) {
      addToast('Terminal Actualizado', `${dev.nombre} (${dev.ip}) actualizado localmente`, 'warning');
    }
  };

  const handleOpenDeleteDevice = (dev: Dispositivo) => {
    setDeleteTarget({
      type: 'device',
      id: dev.id,
      name: `${dev.nombre} [IP: ${dev.ip}]`,
    });
    setIsConfirmDeleteOpen(true);
  };

  const handleSyncSingleDevice = async (deviceId: string) => {
    const dev = devices.find((d) => d.id === deviceId);
    addToast('Sincronizando Hardware', `Comprobando estado de red de ${dev?.nombre || 'Terminal'} (${dev?.ip || ''})...`, 'info');
    try {
      const res = await apiService.syncDevice(deviceId);
      if (res.success) {
        addToast('Sincronización Exitosa', `${res.message} (${res.logs_synced || 0} marcaciones procesadas)`, 'success');
        const freshDevs = await apiService.getDevices();
        setDevices(freshDevs);
        const freshLogs = await apiService.getPunchLogs();
        setPunchLogs(freshLogs);
      } else {
        const updated = devices.map((d) => (d.id === deviceId ? { ...d, estado: 'offline' as const } : d));
        setDevices(updated);
        storageService.saveDevices(updated);
        addToast('Terminal Fuera de Línea', res.message || `El equipo ${dev?.nombre} no respondió a la comprobación de red.`, 'warning');
      }
    } catch (err: any) {
      const updated = devices.map((d) => (d.id === deviceId ? { ...d, estado: 'offline' as const } : d));
      setDevices(updated);
      storageService.saveDevices(updated);
      addToast(
        'Terminal Fuera de Línea',
        `No se pudo establecer conexión con ${dev?.nombre} (${dev?.ip}). El equipo está apagado o desconectado.`,
        'error'
      );
    }
  };

  const handleRestartDevice = (deviceId: string) => {
    const dev = devices.find((d) => d.id === deviceId);
    addToast('Comando Enviado', `Reiniciando terminal ${dev?.nombre}...`, 'info');
  };

  // ==========================================
  // Ejecución de Eliminación (Confirmada)
  // ==========================================
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'employee') {
      const targetId = deleteTarget.id;
      const updated = employees.filter((e) => e.id !== targetId);
      setEmployees(updated);
      storageService.saveEmployees(updated);
      if (selectedEmployee?.id === targetId) {
        setSelectedEmployee(updated[0] || null);
      }
      apiService
        .deleteEmployee(targetId)
        .then(() => {
          addToast('Eliminado de MySQL', 'El colaborador fue removido de la base de datos', 'info');
        })
        .catch((err) => {
          console.warn('Error eliminando de MySQL:', err);
          addToast('Colaborador Eliminado', 'El colaborador fue removido localmente', 'info');
        });
    } else if (deleteTarget.type === 'device') {
      const targetId = deleteTarget.id;
      const updated = devices.filter((d) => d.id !== targetId);
      setDevices(updated);
      storageService.saveDevices(updated);
      apiService
        .deleteDevice(targetId)
        .then(() => {
          addToast('Eliminado de MySQL', 'El terminal fue removido de la base de datos', 'info');
        })
        .catch((err) => {
          console.warn('Error eliminando dispositivo de MySQL:', err);
          addToast('Terminal Desvinculado', 'El terminal fue removido localmente', 'info');
        });
    }

    setDeleteTarget(null);
  };

  // ==========================================
  // CRUD Días Festivos
  // ==========================================
  const handleAddHoliday = async (holiday: { name: string; date: string; isRecurring: boolean }) => {
    try {
      const saved = await apiService.saveHoliday(holiday);
      const updated = [...holidays, saved];
      setHolidays(updated);
      storageService.saveHolidays(updated);
      addToast('Guardado en MySQL', `${holiday.name} registrado en base de datos`, 'success');
    } catch (err) {
      const newH: DiaFestivo = {
        id: Date.now(),
        nombre: holiday.name,
        fecha: holiday.date,
        esRecurrente: holiday.isRecurring,
      };
      const updated = [...holidays, newH];
      setHolidays(updated);
      storageService.saveHolidays(updated);
      addToast('Día Festivo Registrado', `${holiday.name} guardado localmente`, 'warning');
    }
  };

  const handleUpdateHoliday = async (h: DiaFestivo) => {
    try {
      await apiService.saveHoliday({ name: h.nombre, date: h.fecha, isRecurring: h.esRecurrente });
      const updated = holidays.map((item) =>
        (item.id && item.id === h.id) || item.fecha === h.fecha ? h : item
      );
      setHolidays(updated);
      storageService.saveHolidays(updated);
      addToast('Actualizado en MySQL', `${h.nombre} actualizado en base de datos`, 'success');
    } catch (err) {
      const updated = holidays.map((item) =>
        (item.id && item.id === h.id) || item.fecha === h.fecha ? h : item
      );
      setHolidays(updated);
      storageService.saveHolidays(updated);
      addToast('Festivo Actualizado', `${h.nombre} fue actualizado`, 'warning');
    }
  };

  const handleDeleteHoliday = async (idOrDate: number | string) => {
    const updated = holidays.filter((h) => h.id !== idOrDate && h.fecha !== idOrDate);
    setHolidays(updated);
    storageService.saveHolidays(updated);
    try {
      await apiService.deleteHoliday(idOrDate);
      addToast('Eliminado de MySQL', 'El feriado fue removido de la base de datos', 'info');
    } catch (err) {
      addToast('Festivo Removido', 'El feriado fue eliminado localmente', 'info');
    }
  };

  const handleExportPayroll = (format: string, period: string) => {
    addToast(
      'Reporte Generado',
      `Descargando reporte de nómina de ${period} en moneda Soles (S/.) formato ${format}`,
      'success'
    );
  };

  // ==========================================
  // CRUD Solicitudes de Permisos / Vacaciones
  // ==========================================
  const handleSubmitLeaveRequest = async (req: SolicitudPermiso) => {
    const updated = [req, ...leaveRequests];
    setLeaveRequests(updated);
    storageService.saveLeaveRequests(updated);
    try {
      await apiService.createLeaveRequest(req);
      addToast('Guardado en MySQL', `Pedido de ${req.tipo} enviado a la base de datos`, 'success');
    } catch (err) {
      addToast('Solicitud Enviada', `Tu pedido de ${req.tipo} fue guardado localmente`, 'warning');
    }
  };

  const handleUpdateLeaveRequestStatus = async (id: string, newStatus: 'Aprobado' | 'Rechazado') => {
    const updated = leaveRequests.map((r) => (r.id === id ? { ...r, estado: newStatus } : r));
    setLeaveRequests(updated);
    storageService.saveLeaveRequests(updated);
    try {
      await apiService.updateLeaveRequestStatus(id, newStatus);
      addToast('Actualizado en MySQL', `La solicitud ha sido ${newStatus === 'Aprobado' ? 'aprobada' : 'rechazada'}`, 'success');
    } catch (err) {
      addToast('Solicitud Atendida', `La solicitud ha sido ${newStatus === 'Aprobado' ? 'aprobada' : 'rechazada'} (local)`, 'warning');
    }
  };

  const handleDeleteLeaveRequest = async (id: string) => {
    const updated = leaveRequests.filter((r) => r.id !== id);
    setLeaveRequests(updated);
    storageService.saveLeaveRequests(updated);
    try {
      await apiService.deleteLeaveRequest(id);
      addToast('Eliminado de MySQL', 'La solicitud fue removida de la base de datos', 'info');
    } catch (err) {
      addToast('Solicitud Removida', 'La solicitud fue eliminada del registro', 'info');
    }
  };

  // ==========================================
  // CRUD Horarios de Trabajo (Timetables)
  // ==========================================
  const handleSaveTimetable = async (timetable: HorarioTrabajo) => {
    const exists = timetables.some((t) => t.id === timetable.id);
    let updated: HorarioTrabajo[];
    if (exists) {
      updated = timetables.map((t) => (t.id === timetable.id ? timetable : t));
    } else {
      updated = [...timetables, timetable];
    }
    setTimetables(updated);
    storageService.saveTimetables(updated);
    try {
      await apiService.saveTimetable(timetable);
      addToast('Guardado en MySQL', `${timetable.nombre} guardado en base de datos`, 'success');
    } catch (err) {
      addToast('Horario Guardado', `${timetable.nombre} guardado localmente`, 'warning');
    }
  };

  const handleDeleteTimetable = async (id: string) => {
    const updated = timetables.filter((t) => t.id !== id);
    setTimetables(updated);
    storageService.saveTimetables(updated);
    try {
      await apiService.deleteTimetable(id);
      addToast('Eliminado de MySQL', 'El horario fue removido de la base de datos', 'info');
    } catch (err) {
      addToast('Horario Eliminado', 'El horario fue removido del catálogo', 'info');
    }
  };

  // ==========================================
  // CRUD Turnos (Shifts)
  // ==========================================
  const handleSaveShift = async (shift: Turno) => {
    const exists = shifts.some((s) => s.id === shift.id);
    let updated: Turno[];
    if (exists) {
      updated = shifts.map((s) => (s.id === shift.id ? shift : s));
    } else {
      updated = [...shifts, shift];
    }
    setShifts(updated);
    storageService.saveShifts(updated);
    try {
      await apiService.saveShift(shift);
      addToast('Guardado en MySQL', `${shift.nombre} guardado en base de datos`, 'success');
    } catch (err) {
      addToast('Turno Guardado', `${shift.nombre} guardado localmente`, 'warning');
    }
  };

  const handleDeleteShift = async (id: string) => {
    const updated = shifts.filter((s) => s.id !== id);
    setShifts(updated);
    storageService.saveShifts(updated);
    try {
      await apiService.deleteShift(id);
      addToast('Eliminado de MySQL', 'El turno fue removido de la base de datos', 'info');
    } catch (err) {
      addToast('Turno Eliminado', 'El turno fue removido localmente', 'info');
    }
  };

  // ==========================================
  // CRUD Asignaciones de Turnos a Personal
  // ==========================================
  const handleAssignShift = async (newAssignments: AsignacionTurno[]) => {
    const targetEmpIds = new Set(newAssignments.map((a) => a.empleadoId));
    const filteredOld = shiftAssignments.filter((a) => !targetEmpIds.has(a.empleadoId));
    const updated = [...newAssignments, ...filteredOld];
    setShiftAssignments(updated);
    storageService.saveShiftAssignments(updated);
    try {
      await apiService.saveShiftAssignments(newAssignments);
      addToast('Guardado en MySQL', `Turno asignado a ${newAssignments.length} colaborador(es)`, 'success');
    } catch (err) {
      addToast('Turno Asignado', `Turno asignado localmente`, 'warning');
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    const updated = shiftAssignments.filter((a) => a.id !== id);
    setShiftAssignments(updated);
    storageService.saveShiftAssignments(updated);
    try {
      await apiService.deleteShiftAssignment(id);
      addToast('Eliminado de MySQL', 'El turno fue desvinculado en la base de datos', 'info');
    } catch (err) {
      addToast('Asignación Removida', 'El turno fue desvinculado localmente', 'info');
    }
  };

  // ==========================================
  // Guardado de Políticas Laborales Perú
  // ==========================================
  const handleSaveRules = async (rules: ReglasAsistencia) => {
    setAttendanceRules(rules);
    storageService.saveAttendanceRules(rules);
    try {
      await apiService.saveAttendanceRules(rules);
      addToast('Guardado en MySQL', 'Políticas laborales guardadas en base de datos', 'success');
    } catch (err) {
      addToast('Políticas Guardadas', 'Las reglas fueron actualizadas localmente', 'warning');
    }
  };

  // ==========================================
  // Sincronización y Reconciliación de Sedes/Departamentos en Empleados
  // ==========================================
  useEffect(() => {
    if (sedes.length === 0 || employees.length === 0) return;

    const sedeMapById: Record<string, string> = {
      'Sede Principal San Borja': sedes.find((s) => s.id === 'sed-1')?.nombre || sedes[0].nombre,
      'Sede Norte Los Olivos': sedes.find((s) => s.id === 'sed-2')?.nombre || sedes[0].nombre,
      'Sede Sur Arequipa': sedes.find((s) => s.id === 'sed-3')?.nombre || sedes[0].nombre,
      'Planta Industrial Trujillo': sedes.find((s) => s.id === 'sed-4')?.nombre || sedes[0].nombre,
    };

    const validSedeNames = new Set(sedes.map((s) => s.nombre));
    let hasChanges = false;

    const reconciled = employees.map((emp) => {
      if (!validSedeNames.has(emp.sede)) {
        hasChanges = true;
        const newSede = sedeMapById[emp.sede] || sedes[0].nombre;
        return { ...emp, sede: newSede };
      }
      return emp;
    });

    if (hasChanges) {
      setEmployees(reconciled);
      storageService.saveEmployees(reconciled);
      if (selectedEmployee && !validSedeNames.has(selectedEmployee.sede)) {
        const fallback = sedeMapById[selectedEmployee.sede] || sedes[0].nombre;
        setSelectedEmployee({ ...selectedEmployee, sede: fallback });
      }
    }
  }, [sedes]);

  useEffect(() => {
    if (departamentos.length === 0 || employees.length === 0) return;
    const validDeptNames = new Set(departamentos.map((d) => d.nombre));
    let hasChanges = false;

    const reconciled = employees.map((emp) => {
      if (!validDeptNames.has(emp.departamento)) {
        hasChanges = true;
        return { ...emp, departamento: departamentos[0].nombre };
      }
      return emp;
    });

    if (hasChanges) {
      setEmployees(reconciled);
      storageService.saveEmployees(reconciled);
      if (selectedEmployee && !validDeptNames.has(selectedEmployee.departamento)) {
        setSelectedEmployee({ ...selectedEmployee, departamento: departamentos[0].nombre });
      }
    }
  }, [departamentos]);

  // ==========================================
  // CRUD Sedes y Departamentos Organizacionales (con cascada)
  // ==========================================
  const handleSaveSede = async (sede: Sede) => {
    const oldSede = sedes.find((s) => s.id === sede.id);
    const exists = !!oldSede;
    let updated: Sede[];
    if (exists) {
      updated = sedes.map((s) => (s.id === sede.id ? sede : s));
      if (oldSede && oldSede.nombre !== sede.nombre) {
        const updatedEmployees = employees.map((emp) =>
          emp.sede === oldSede.nombre ? { ...emp, sede: sede.nombre } : emp
        );
        setEmployees(updatedEmployees);
        storageService.saveEmployees(updatedEmployees);
        if (selectedEmployee && selectedEmployee.sede === oldSede.nombre) {
          setSelectedEmployee({ ...selectedEmployee, sede: sede.nombre });
        }
      }
    } else {
      updated = [...sedes, sede];
    }
    setSedes(updated);
    storageService.saveSedes(updated);

    try {
      await apiService.saveSede(sede);
      addToast('Guardado en MySQL', `Sede ${sede.nombre} guardada en base de datos`, 'success');
    } catch (err) {
      addToast('Sede Guardada', `${sede.nombre} guardada localmente`, 'warning');
    }
  };

  const handleDeleteSede = async (id: string) => {
    const deleted = sedes.find((s) => s.id === id);
    const updated = sedes.filter((s) => s.id !== id);
    setSedes(updated);
    storageService.saveSedes(updated);

    if (deleted && updated.length > 0) {
      const fallbackSede = updated[0].nombre;
      const updatedEmployees = employees.map((emp) =>
        emp.sede === deleted.nombre ? { ...emp, sede: fallbackSede } : emp
      );
      setEmployees(updatedEmployees);
      storageService.saveEmployees(updatedEmployees);
      if (selectedEmployee && selectedEmployee.sede === deleted.nombre) {
        setSelectedEmployee({ ...selectedEmployee, sede: fallbackSede });
      }
    }

    try {
      await apiService.deleteSede(id);
      addToast('Eliminado de MySQL', 'La sede fue removida de la base de datos', 'info');
    } catch (err) {
      addToast('Sede Eliminada', 'La sede fue removida localmente', 'info');
    }
  };

  const handleSaveDepartamento = async (dept: Departamento) => {
    const oldDept = departamentos.find((d) => d.id === dept.id);
    const exists = !!oldDept;
    let updated: Departamento[];
    if (exists) {
      updated = departamentos.map((d) => (d.id === dept.id ? dept : d));
      if (oldDept && oldDept.nombre !== dept.nombre) {
        const updatedEmployees = employees.map((emp) =>
          emp.departamento === oldDept.nombre ? { ...emp, departamento: dept.nombre } : emp
        );
        setEmployees(updatedEmployees);
        storageService.saveEmployees(updatedEmployees);
        if (selectedEmployee && selectedEmployee.departamento === oldDept.nombre) {
          setSelectedEmployee({ ...selectedEmployee, departamento: dept.nombre });
        }
      }
    } else {
      updated = [...departamentos, dept];
    }
    setDepartamentos(updated);
    storageService.saveDepartamentos(updated);

    try {
      await apiService.saveDepartamento(dept);
      addToast('Guardado en MySQL', `Área ${dept.nombre} guardada en base de datos`, 'success');
    } catch (err) {
      addToast('Área Guardada', `${dept.nombre} guardada localmente`, 'warning');
    }
  };

  const handleDeleteDepartamento = async (id: string) => {
    const deleted = departamentos.find((d) => d.id === id);
    const updated = departamentos.filter((d) => d.id !== id);
    setDepartamentos(updated);
    storageService.saveDepartamentos(updated);

    if (deleted && updated.length > 0) {
      const fallbackDept = updated[0].nombre;
      const updatedEmployees = employees.map((emp) =>
        emp.departamento === deleted.nombre ? { ...emp, departamento: fallbackDept } : emp
      );
      setEmployees(updatedEmployees);
      storageService.saveEmployees(updatedEmployees);
      if (selectedEmployee && selectedEmployee.departamento === deleted.nombre) {
        setSelectedEmployee({ ...selectedEmployee, departamento: fallbackDept });
      }
    }

    try {
      await apiService.deleteDepartamento(id);
      addToast('Eliminado de MySQL', 'El área fue removida de la base de datos', 'info');
    } catch (err) {
      addToast('Área Eliminada', 'El área fue removida localmente', 'info');
    }
  };

  const handleAddManualPunch = async (newPunch: MarcacionAsistencia) => {
    try {
      await apiService.createPunchLog(newPunch);
      const dbLogs = await apiService.getPunchLogs();
      setPunchLogs(dbLogs);
      storageService.savePunchLogs(dbLogs);
      addToast('Guardado en MySQL', `Marcación de ${newPunch.nombreEmpleado} registrada exitosamente en base de datos`, 'success');
    } catch (err) {
      console.warn('Error al guardar marcación manual en MySQL:', err);
      const updated = [newPunch, ...punchLogs];
      setPunchLogs(updated);
      storageService.savePunchLogs(updated);
      addToast('Marcación Registrada', `${newPunch.tipo} manual registrada localmente`, 'warning');
    }
  };

  const handleUpdatePunchLog = async (updatedPunch: MarcacionAsistencia) => {
    try {
      const result = await apiService.updatePunchLog(updatedPunch);
      const updated = punchLogs.map((log) => (log.id === updatedPunch.id ? result : log));
      setPunchLogs(updated);
      storageService.savePunchLogs(updated);
      addToast('Marcación Actualizada', `Cambios de ${updatedPunch.nombreEmpleado} guardados correctamente`, 'success');
    } catch (err) {
      console.warn('Error al actualizar marcación:', err);
      const updated = punchLogs.map((log) => (log.id === updatedPunch.id ? updatedPunch : log));
      setPunchLogs(updated);
      storageService.savePunchLogs(updated);
      addToast('Marcación Actualizada', `Cambios guardados localmente`, 'warning');
    }
  };

  const handleDeletePunchLog = async (punchId: string) => {
    const updated = punchLogs.filter((log) => log.id !== punchId);
    setPunchLogs(updated);
    storageService.savePunchLogs(updated);

    try {
      await apiService.deletePunchLog(punchId);
      addToast('Marcación Eliminada', 'El registro fue removido exitosamente', 'info');
    } catch (err) {
      console.warn('Error al eliminar marcación de MySQL:', err);
      addToast('Marcación Eliminada', 'La marcación fue removida localmente', 'warning');
    }
  };

  if (currentView === 'login') {
    return <LoginView onLogin={handleLogin} />;
  }

  const pendingRequestsCount = leaveRequests.filter((r) => r.estado === 'Pendiente').length;

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#1E293B] overflow-hidden">
      {/* Barra de Navegación Lateral */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onLogout={handleLogout}
        userRole={userRole}
        onToggleRole={handleToggleRole}
      />

      {/* Área de Contenido Principal */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          currentView={currentView}
          onNavigate={setCurrentView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onLogout={handleLogout}
          devices={devices}
          leaveRequests={leaveRequests}
          punchLogs={punchLogs}
          userRole={userRole}
          currentEmployee={selectedEmployee}
          currentAdminUser={currentAdminUser}
          onOpenManageUsers={() => {
            setInitialEditUserId(null);
            setIsManageSystemUsersModalOpen(true);
          }}
          onOpenEditProfile={handleOpenEditProfile}
        />

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
          {currentView === 'overview' && (
            <OverviewView
              devices={devices}
              punchLogs={punchLogs}
              employees={employees}
              sedes={sedes}
              onOpenSyncModal={() => setIsSyncModalOpen(true)}
              onOpenExportModal={() => setIsExportPayrollModalOpen(true)}
              onOpenRawLogsModal={() => setIsRawLogsModalOpen(true)}
              onOpenLeaveRequestsModal={() => setIsLeaveRequestsAdminModalOpen(true)}
              pendingLeaveRequestsCount={pendingRequestsCount}
            />
          )}

          {currentView === 'hardware' && (
            <HardwareView
              devices={devices}
              onOpenAddDeviceModal={() => setIsAddDeviceModalOpen(true)}
              onOpenEditDeviceModal={handleOpenEditDevice}
              onOpenDeleteDeviceModal={handleOpenDeleteDevice}
              onOpenSyncModal={() => setIsSyncModalOpen(true)}
              onSyncSingleDevice={handleSyncSingleDevice}
              onRestartDevice={handleRestartDevice}
            />
          )}

          {currentView === 'personnel' && (
            <PersonnelView
              employees={employees}
              sedes={sedes}
              departamentos={departamentos}
              selectedEmployee={selectedEmployee}
              onSelectEmployee={setSelectedEmployee}
              onOpenAddModal={() => setIsAddEmployeeModalOpen(true)}
              onOpenEditModal={handleOpenEditEmployee}
              onOpenDeleteModal={handleOpenDeleteEmployee}
              onOpenDeactivationHistory={() => setIsDeactivationHistoryModalOpen(true)}
              onOpenManageOrgsModal={() => setIsManageOrgsModalOpen(true)}
              onToggleAccess={handleToggleDoorAccess}
              onToggleStatus={handleToggleEmployeeStatus}
              onReEnrollBiometric={handleReEnrollBiometric}
              onSyncEmployee={handleSyncEmployee}
              onNavigateToSelfService={() => setCurrentView('self-service')}
            />
          )}

          {currentView === 'users-roles' && (
            <UsersRolesView
              users={systemUsers}
              sedes={sedes}
              onSaveUser={handleSaveSystemUser}
              onToggleUserStatus={handleToggleUserStatus}
              onDeleteUser={handleDeleteSystemUser}
            />
          )}

          {currentView === 'master-tables' && <MasterTablesView />}

          {currentView === 'insights' && (
            <InsightsView
              employees={employees}
              departamentos={departamentos}
              onOpenExportModal={() => setIsExportPayrollModalOpen(true)}
            />
          )}

          {currentView === 'attendance' && (
            <AttendanceView
              punchLogs={punchLogs}
              employees={employees}
              sedes={sedes}
              holidays={holidays}
              timetables={timetables}
              shifts={shifts}
              shiftAssignments={shiftAssignments}
              attendanceRules={attendanceRules}
              onOpenHolidayModal={() => setIsHolidayModalOpen(true)}
              onOpenManageHolidaysModal={() => setIsManageHolidaysModalOpen(true)}
              onOpenExportModal={() => setIsExportPayrollModalOpen(true)}
              onOpenRawLogsModal={() => setIsRawLogsModalOpen(true)}
              onOpenManualPunchModal={() => setIsManualPunchModalOpen(true)}
              onUpdatePunchLog={handleUpdatePunchLog}
              onDeletePunchLog={handleDeletePunchLog}
            />
          )}

          {currentView === 'shifts-rules' && (
            <ShiftsRulesView
              timetables={timetables}
              shifts={shifts}
              shiftAssignments={shiftAssignments}
              attendanceRules={attendanceRules}
              employees={employees}
              onOpenAddTimetable={() => {
                setEditingTimetable(null);
                setIsAddEditTimetableModalOpen(true);
              }}
              onOpenEditTimetable={(t) => {
                setEditingTimetable(t);
                setIsAddEditTimetableModalOpen(true);
              }}
              onDeleteTimetable={handleDeleteTimetable}
              onOpenAddShift={() => {
                setEditingShift(null);
                setIsAddEditShiftModalOpen(true);
              }}
              onOpenEditShift={(s) => {
                setEditingShift(s);
                setIsAddEditShiftModalOpen(true);
              }}
              onDeleteShift={handleDeleteShift}
              onOpenAssignShift={() => setIsAssignShiftModalOpen(true)}
              onDeleteAssignment={handleDeleteAssignment}
              onSaveRules={handleSaveRules}
            />
          )}

          {currentView === 'payroll' && <PayrollView punchLogs={punchLogs} employees={employees} />}

          {currentView === 'self-service' && (
            <SelfServiceView
              requests={leaveRequests}
              currentEmployee={selectedEmployee || employees[0]}
              employees={employees}
              onSelectEmployee={setSelectedEmployee}
              onSubmitRequest={handleSubmitLeaveRequest}
              userRole={userRole}
            />
          )}
        </main>
      </div>

      {/* Navegación Móvil */}
      <MobileNav currentView={currentView} onNavigate={setCurrentView} userRole={userRole} />

      {/* Notificaciones Flotantes */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Modales de la Aplicación */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        devices={devices}
        onSyncComplete={async () => {
          try {
            const freshDevs = await apiService.getDevices();
            setDevices(freshDevs);
            const freshLogs = await apiService.getPunchLogs();
            setPunchLogs(freshLogs);
          } catch (e) {
            console.warn('Error al refrescar datos pos-sincronización:', e);
          }
          addToast(
            'Sincronización Exitosa',
            'Todos los terminales biométricos de sedes Perú han sido sincronizados en vivo',
            'success'
          );
        }}
      />

      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
        sedes={sedes}
        departamentos={departamentos}
        onAddEmployee={handleAddEmployee}
      />

      <EditEmployeeModal
        isOpen={isEditEmployeeModalOpen}
        onClose={() => {
          setIsEditEmployeeModalOpen(false);
          setEditingEmployee(null);
        }}
        employee={editingEmployee}
        sedes={sedes}
        departamentos={departamentos}
        onSaveEmployee={handleSaveEmployee}
      />

      <ManageOrgsModal
        isOpen={isManageOrgsModalOpen}
        onClose={() => setIsManageOrgsModalOpen(false)}
        sedes={sedes}
        departamentos={departamentos}
        employees={employees}
        onSaveSede={handleSaveSede}
        onDeleteSede={handleDeleteSede}
        onSaveDepartamento={handleSaveDepartamento}
        onDeleteDepartamento={handleDeleteDepartamento}
      />

      <AddDeviceModal
        isOpen={isAddDeviceModalOpen}
        onClose={() => setIsAddDeviceModalOpen(false)}
        sedes={sedes}
        onAddDevice={handleAddDevice}
      />

      <EditDeviceModal
        isOpen={isEditDeviceModalOpen}
        onClose={() => {
          setIsEditDeviceModalOpen(false);
          setEditingDevice(null);
        }}
        device={editingDevice}
        sedes={sedes}
        onSaveDevice={handleSaveDevice}
      />

      <ConfirmDeleteModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title={
          deleteTarget?.type === 'employee'
            ? '¿Eliminar colaborador del sistema?'
            : '¿Desvincular terminal biométrico?'
        }
        message={
          deleteTarget?.type === 'employee'
            ? 'Esta acción eliminará de forma permanente la ficha personal, PIN y credenciales biométricas asociadas.'
            : 'Esta acción removerá el terminal biométrico y detendrá la sincronización de registros en red.'
        }
        itemName={deleteTarget?.name}
        confirmText={
          deleteTarget?.type === 'employee'
            ? 'Sí, Eliminar Colaborador'
            : 'Sí, Desvincular Terminal'
        }
      />

      <LeaveRequestsAdminModal
        isOpen={isLeaveRequestsAdminModalOpen}
        onClose={() => setIsLeaveRequestsAdminModalOpen(false)}
        requests={leaveRequests}
        onUpdateStatus={handleUpdateLeaveRequestStatus}
        onDeleteRequest={handleDeleteLeaveRequest}
      />

      <HolidayModal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        onAddHoliday={handleAddHoliday}
      />

      <ManageHolidaysModal
        isOpen={isManageHolidaysModalOpen}
        onClose={() => setIsManageHolidaysModalOpen(false)}
        holidays={holidays}
        onAddHoliday={handleAddHoliday}
        onUpdateHoliday={handleUpdateHoliday}
        onDeleteHoliday={handleDeleteHoliday}
      />

      {/* Modales Turnos y Horarios */}
      <AddEditTimetableModal
        isOpen={isAddEditTimetableModalOpen}
        onClose={() => {
          setIsAddEditTimetableModalOpen(false);
          setEditingTimetable(null);
        }}
        timetable={editingTimetable}
        onSave={handleSaveTimetable}
      />

      <AddEditShiftModal
        isOpen={isAddEditShiftModalOpen}
        onClose={() => {
          setIsAddEditShiftModalOpen(false);
          setEditingShift(null);
        }}
        shift={editingShift}
        timetables={timetables}
        onSave={handleSaveShift}
      />

      <AssignShiftModal
        isOpen={isAssignShiftModalOpen}
        onClose={() => setIsAssignShiftModalOpen(false)}
        shifts={shifts}
        employees={employees}
        sedes={sedes}
        departamentos={departamentos}
        onAssign={handleAssignShift}
      />

      <ExportPayrollModal
        isOpen={isExportPayrollModalOpen}
        onClose={() => setIsExportPayrollModalOpen(false)}
        departamentos={departamentos}
        onExport={handleExportPayroll}
      />

      <RawLogsModal
        isOpen={isRawLogsModalOpen}
        onClose={() => setIsRawLogsModalOpen(false)}
        logs={punchLogs}
      />

      <ManualPunchModal
        isOpen={isManualPunchModalOpen}
        onClose={() => setIsManualPunchModalOpen(false)}
        employees={employees}
        devices={devices}
        onAddPunch={handleAddManualPunch}
      />

      <DeactivationHistoryModal
        isOpen={isDeactivationHistoryModalOpen}
        onClose={() => setIsDeactivationHistoryModalOpen(false)}
        inactiveEmployees={employees.filter((e) => e.estado === 'Inactivo')}
        onReactivateEmployee={handleToggleEmployeeStatus}
      />

      {/* Modal de Gestión de Usuarios y Roles de Acceso (RBAC) */}
      <ManageSystemUsersModal
        isOpen={isManageSystemUsersModalOpen}
        onClose={() => {
          setIsManageSystemUsersModalOpen(false);
          setInitialEditUserId(null);
        }}
        users={systemUsers}
        sedes={sedes}
        initialEditUserId={initialEditUserId}
        onSaveUser={handleSaveSystemUser}
        onDeleteUser={handleDeleteSystemUser}
        onToggleUserStatus={handleToggleUserStatus}
      />
    </div>
  );
}
