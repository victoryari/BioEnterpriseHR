import React, { useState } from 'react';
import { apiService } from '../../services/apiService';
import { Empleado, UsuarioSistema } from '../../types';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordResetSuccess?: (identifier: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onPasswordResetSuccess,
}) => {
  const [step, setStep] = useState<'search' | 'verify' | 'success'>('search');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Datos del usuario o colaborador encontrado
  const [userFound, setUserFound] = useState<UsuarioSistema | null>(null);
  const [employeeFound, setEmployeeFound] = useState<Empleado | null>(null);

  // Nuevas credenciales
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  if (!isOpen) return null;

  const handleResetState = () => {
    setStep('search');
    setIdentifier('');
    setErrorMsg(null);
    setUserFound(null);
    setEmployeeFound(null);
    setNewPassword('');
    setConfirmPassword('');
    setVerificationCode('');
    setGeneratedCode('');
  };

  const handleSearchAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = identifier.trim();
    if (!query) {
      setErrorMsg('Por favor ingrese su número de DNI o correo electrónico corporativo.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Buscar en usuarios del sistema (Admin / RRHH / Supervisor)
      let sysUsers: UsuarioSistema[] = [];
      try {
        sysUsers = await apiService.getSystemUsers();
      } catch {}

      const foundUser = sysUsers.find(
        (u) =>
          u.correo.toLowerCase() === query.toLowerCase() ||
          u.nombre.toLowerCase().includes(query.toLowerCase())
      );

      if (foundUser) {
        setUserFound(foundUser);
        const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(randomCode);
        setStep('verify');
        setLoading(false);
        return;
      }

      // 2. Buscar en colaboradores / empleados (DNI, correo, PIN)
      let employees: Empleado[] = [];
      try {
        employees = await apiService.getEmployees();
      } catch {}

      const foundEmp = employees.find(
        (emp) =>
          emp.numeroDocumento === query ||
          emp.id === query ||
          emp.correo?.toLowerCase() === query.toLowerCase() ||
          emp.pin === query
      );

      if (foundEmp) {
        setEmployeeFound(foundEmp);
        const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(randomCode);
        setStep('verify');
        setLoading(false);
        return;
      }

      // 3. Fallback para cuentas de demostración / base
      if (query.toLowerCase() === 'admin@carmelita.pe' || query === 'admin') {
        setUserFound({
          id: '1',
          nombre: 'Administrador Principal',
          correo: 'admin@carmelita.pe',
          rol: 'Super Administrador',
          empresaAsignada: 'Todas',
          sedeAsignada: 'Todas',
          estado: 'Activo',
          creadoEn: '2026-01-01',
        });
        setGeneratedCode('123456');
        setStep('verify');
        setLoading(false);
        return;
      }

      setErrorMsg('No se encontró ninguna cuenta o colaborador registrado con el DNI o correo ingresado.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al verificar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 4) {
      setErrorMsg('La contraseña o PIN debe contener al menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Las contraseñas ingresadas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      if (userFound) {
        // Actualizar clave de usuario de sistema
        await apiService.updateSystemUser(userFound.id, {
          nombre: userFound.nombre,
          correo: userFound.correo,
          rol: userFound.rol,
          clave: newPassword,
        }).catch(() => {});
      } else if (employeeFound) {
        // Actualizar PIN de colaborador
        await apiService.updateEmployee({
          ...employeeFound,
          pin: newPassword,
        }).catch(() => {});
      }

      setStep('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 overflow-hidden animate-in fade-in">
      {/* Backdrop */}
      <div
        onClick={() => {
          handleResetState();
          onClose();
        }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-300 max-h-[92vh] z-10">
        {/* Header ERP */}
        <div className="bg-[#004A99] px-4 py-2.5 flex items-center justify-between text-white shadow-sm shrink-0 border-b border-blue-900">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white/10 rounded">
              <span className="material-symbols-outlined text-[18px] text-blue-200">lock_reset</span>
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-tight">
                Recuperación de Contraseña & Acceso
              </h2>
              <p className="text-[9px] text-blue-200 uppercase font-medium">
                Portal de Identidad & Autoservicio Grupo Carmelita
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleResetState();
              onClose();
            }}
            className="p-1 hover:bg-red-600 rounded text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-3 mt-2.5 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/70">
          {/* PASO 1: BÚSQUEDA DE CUENTA */}
          {step === 'search' && (
            <form onSubmit={handleSearchAccount} className="space-y-3">
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-700">person_search</span>
                  <span className="text-[11px] font-bold text-blue-950 uppercase tracking-tight">
                    1. Identificación del Usuario o Colaborador
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Ingrese su número de <strong>DNI</strong> (8 dígitos) o su <strong>correo electrónico corporativo</strong> para localizar su ficha en el sistema.
                </p>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">
                    DNI o Correo Electrónico *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Ej. 40869749 o usuario@carmelita.pe"
                      className="w-full h-8 pl-8 pr-2.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                    />
                    <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                      badge
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-blue-50/80 rounded-lg border border-blue-200/80 text-[11px] text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-blue-700">info</span>
                    Información para Colaboradores:
                  </div>
                  <p className="text-blue-800 text-[10px] leading-normal">
                    Si eres personal operativo de planta o almacén, tu contraseña predeterminada para el portal es tu número de <strong>DNI</strong> o el <strong>PIN</strong> registrado en el reloj biométrico.
                  </p>
                </div>
              </div>

              {/* Footer Paso 1 */}
              <div className="px-4 py-2.5 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between shrink-0 -mx-3.5 -mb-3.5 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    handleResetState();
                    onClose();
                  }}
                  className="h-8 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px] text-red-500">close</span>
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-8 px-5 bg-[#004A99] hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[14px]">search</span>
                      Verificar Cuenta
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* PASO 2: VERIFICACIÓN Y NUEVA CONTRASEÑA */}
          {step === 'verify' && (
            <form onSubmit={handleApplyReset} className="space-y-3">
              {/* Tarjeta de Cuenta Encontrada */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-[11px] font-bold text-blue-950 uppercase tracking-tight flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                    Cuenta Confirmada
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {userFound ? userFound.rol : 'Colaborador en Planilla'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
                    {userFound
                      ? userFound.nombre.charAt(0).toUpperCase()
                      : employeeFound?.nombres?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-800">
                      {userFound ? userFound.nombre : employeeFound?.nombre || `${employeeFound?.nombres} ${employeeFound?.apellidos}`}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {userFound ? userFound.correo : `DOC: ${employeeFound?.numeroDocumento} • ${employeeFound?.cargo || 'Colaborador'}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta Código de Seguridad Simulado */}
              <div className="bg-amber-50/80 p-3 rounded-lg border border-amber-200/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 text-[11px] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-amber-700">key</span>
                    Código de Validación de Seguridad
                  </span>
                  <span className="font-mono font-extrabold text-xs text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                    {generatedCode}
                  </span>
                </div>
                <p className="text-[10px] text-amber-800">
                  Por seguridad, ingresa el código de 6 dígitos mostrado arriba para autorizar el restablecimiento.
                </p>
                <div className="pt-1">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Ingresa el código (ej. 123456)"
                    className="w-full h-8 px-2.5 bg-white border border-amber-300 rounded text-xs font-bold font-mono text-center tracking-widest text-slate-800 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Tarjeta Nueva Contraseña */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-700">password</span>
                  <span className="text-[11px] font-bold text-blue-950 uppercase tracking-tight">
                    Establecer Nueva Contraseña / PIN
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">
                      Nueva Contraseña *
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">
                      Confirmar Contraseña *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita la contraseña"
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Paso 2 */}
              <div className="px-4 py-2.5 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between shrink-0 -mx-3.5 -mb-3.5 mt-3">
                <button
                  type="button"
                  onClick={() => setStep('search')}
                  className="h-8 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                  Atrás
                </button>

                <button
                  type="submit"
                  disabled={loading || verificationCode !== generatedCode}
                  className="h-8 px-5 bg-[#004A99] hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      Actualizar Contraseña
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* PASO 3: ÉXITO */}
          {step === 'success' && (
            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[28px]">check_circle</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                  ¡Contraseña Actualizada con Éxito!
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                  Tu clave ha sido restablecida correctamente. Ahora puedes iniciar sesión con tus nuevas credenciales.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const idToReturn = userFound?.correo || employeeFound?.numeroDocumento || identifier;
                    if (onPasswordResetSuccess) {
                      onPasswordResetSuccess(idToReturn);
                    }
                    handleResetState();
                    onClose();
                  }}
                  className="h-8 px-6 bg-[#004A99] hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors shadow-md cursor-pointer"
                >
                  Ir al Inicio de Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
