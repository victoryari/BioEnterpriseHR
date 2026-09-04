import React, { useState, useEffect, useRef } from 'react';
import { Empleado, Sede, Departamento, EMPRESAS_GRUPO_CARMELITA } from '../../types';

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Empleado | null;
  sedes: Sede[];
  departamentos: Departamento[];
  onSaveEmployee: (employee: Empleado) => void;
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
  sedes = [],
  departamentos = [],
  onSaveEmployee,
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'laboral' | 'biometria' | 'payroll'>('personal');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Tab 1: Personal
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [direccion, setDireccion] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState<'DNI' | 'CE' | 'Pasaporte'>('DNI');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [foto, setFoto] = useState(employee?.foto || '');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Tab 2: Laboral
  const [cargo, setCargo] = useState('');
  const [departamento, setDepartamento] = useState((departamentos && departamentos[0])?.nombre || '');
  const [sede, setSede] = useState((sedes && sedes[0])?.nombre || '');
  const [empresa, setEmpresa] = useState<string>(EMPRESAS_GRUPO_CARMELITA?.[0] || 'Importaciones Carmelita del Norte S.A.C.');
  const [estado, setEstado] = useState<'Activo' | 'Inactivo'>('Activo');
  const todayStr = new Date().toISOString().split('T')[0];
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [fechaCese, setFechaCese] = useState('');

  // Tab 3: Biometría & Credenciales
  const [pin, setPin] = useState('');
  const [tarjetaRfid, setTarjetaRfid] = useState(false);
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [tipoMarcadoPredilecto, setTipoMarcadoPredilecto] = useState<
    'Huella' | 'Tarjeta RFID' | 'PIN' | 'Rostro'
  >('Huella');
  const [biometriaHuella, setBiometriaHuella] = useState(true);
  const [biometriaRostro, setBiometriaRostro] = useState(false);

  // Tab 4: Nómina & CTS
  const [sueldoBase, setSueldoBase] = useState('2500.00');
  const [regimenPrevisional, setRegimenPrevisional] = useState('AFP Integra');
  const [tipoComisionAfp, setTipoComisionAfp] = useState<'Flujo' | 'Mixta'>('Flujo');
  const [cuspp, setCuspp] = useState('');
  const [tieneAsignacionFamiliar, setTieneAsignacionFamiliar] = useState(true);
  const [bancoSueldo, setBancoSueldo] = useState('BCP');
  const [numeroCuentaBanco, setNumeroCuentaBanco] = useState('');
  const [cci, setCci] = useState('');
  const [bancoCts, setBancoCts] = useState('BBVA Banco Continental');
  const [numeroCuentaCts, setNumeroCuentaCts] = useState('');
  const [monedaCts, setMonedaCts] = useState<'PEN' | 'USD'>('PEN');

  // Cámara Web
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<{
    code: 'INSECURE_CONTEXT' | 'PERMISSION_DENIED' | 'NO_DEVICE' | 'DEVICE_BUSY' | 'NOT_SUPPORTED' | 'GENERAL';
    message: string;
    actionType?: 'switch_localhost' | 'site_settings';
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const handleStartCamera = async () => {
    setCameraError(null);
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    const isHttps = window.location.protocol === 'https:';

    if (!isLocal && !isHttps) {
      const port = window.location.port ? `:${window.location.port}` : '';
      setCameraError({
        code: 'INSECURE_CONTEXT',
        message: `Los navegadores solo permiten encender la cámara en vivo sobre conexiones seguras (localhost o HTTPS). Ingresa desde "http://localhost${port}".`,
        actionType: 'switch_localhost',
      });
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError({
        code: 'NOT_SUPPORTED',
        message: 'Tu navegador no expone la API de cámara web en vivo.',
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err: any) {
      setIsCameraActive(false);
      setCameraError({
        code: 'GENERAL',
        message: `No se pudo iniciar la cámara web (${err.message || ''}).`,
      });
    }
  };

  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((e) => console.warn('Error video play:', e));
    }
  }, [isCameraActive]);

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setFoto(dataUrl);
    }
    handleStopCamera();
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const lastOpenedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen && employee) {
      const key = `${employee.id}_open`;
      if (lastOpenedKeyRef.current !== key) {
        lastOpenedKeyRef.current = key;

        const parts = (employee.nombre || '').split(' ');
        setNombres(employee.nombres || parts[0] || '');
        setApellidos(employee.apellidos || (parts.length > 1 ? parts.slice(1).join(' ') : ''));
        setTipoDocumento(employee.tipoDocumento || 'DNI');
        setNumeroDocumento(employee.numeroDocumento || '');
        setCorreo(employee.correo || '');
        setCargo(employee.cargo || '');

        const safeDepts = Array.isArray(departamentos) ? departamentos.filter(Boolean) : [];
        const isDeptValid = safeDepts.some((d) => d && d.nombre === employee.departamento);
        setDepartamento(isDeptValid ? employee.departamento : (employee.departamento || safeDepts[0]?.nombre || ''));

        const safeSedes = Array.isArray(sedes) ? sedes.filter(Boolean) : [];
        const isSedeValid = safeSedes.some((s) => s && s.nombre === employee.sede);
        setSede(isSedeValid ? employee.sede : (employee.sede || safeSedes[0]?.nombre || ''));

        setEmpresa(employee.empresa || EMPRESAS_GRUPO_CARMELITA?.[0] || 'Importaciones Carmelita del Norte S.A.C.');
        setPin(employee.pin || '');
        setTarjetaRfid(!!employee.tarjetaRfid);
        setNumeroTarjeta(employee.numeroTarjeta || '');
        setTipoMarcadoPredilecto(employee.tipoMarcadoPredilecto || 'Huella');
        setBiometriaHuella(!!employee.biometriaHuella);
        setBiometriaRostro(!!employee.biometriaRostro);
        setEstado(employee.estado || 'Activo');
        setTelefono(employee.telefono || '');
        setDireccion(employee.direccion || '');
        setFechaNacimiento(employee.fechaNacimiento || '');
        setSueldoBase(employee.sueldoBase != null ? String(employee.sueldoBase) : '');
        setRegimenPrevisional(employee.regimenPrevisional || 'AFP Integra');
        setTipoComisionAfp(employee.tipoComisionAfp || 'Flujo');
        setCuspp(employee.cuspp || '');
        setTieneAsignacionFamiliar(employee.tieneAsignacionFamiliar ?? false);
        setBancoSueldo(employee.bancoSueldo || 'BCP');
        setNumeroCuentaBanco(employee.numeroCuentaBanco || '');
        setCci(employee.cci || '');
        setBancoCts(employee.bancoCts || 'BBVA Banco Continental');
        setNumeroCuentaCts(employee.numeroCuentaCts || '');
        setMonedaCts(employee.monedaCts || 'PEN');
        setFechaIngreso(employee.fechaIngreso || todayStr);
        setFechaCese(employee.fechaCese || '');
        setFoto(employee.foto || '');
        setShowUrlInput(false);
      }
    } else if (!isOpen) {
      lastOpenedKeyRef.current = null;
      handleStopCamera();
    }
  }, [isOpen, employee?.id]);

  if (!isOpen || !employee) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFoto('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const docTrim = numeroDocumento.trim();
    if (!nombres.trim() || !docTrim) {
      setValidationError('Por favor ingrese los nombres y el número de documento.');
      return;
    }

    // Validar DNI / CE
    if (tipoDocumento === 'DNI' && !/^\d{8}$/.test(docTrim)) {
      setValidationError('El DNI debe contener exactamente 8 dígitos numéricos.');
      setActiveTab('personal');
      return;
    }
    if (tipoDocumento === 'CE' && !/^[a-zA-Z0-9]{8,12}$/.test(docTrim)) {
      setValidationError('El Carné de Extranjería (CE) debe contener entre 8 y 12 caracteres alfanuméricos.');
      setActiveTab('personal');
      return;
    }

    // Validar Sueldo Básico (RMV Perú)
    const sueldoNum = parseFloat(sueldoBase);
    if (isNaN(sueldoNum) || sueldoNum < 1025) {
      setValidationError('El sueldo básico no puede ser menor a la Remuneración Mínima Vital (S/ 1,025.00).');
      setActiveTab('payroll');
      return;
    }

    // Validar Correo
    if (correo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      setValidationError('Por favor ingrese un correo electrónico válido.');
      setActiveTab('personal');
      return;
    }

    const nombreCompleto = `${nombres.trim()} ${apellidos.trim()}`.trim() || employee.nombre;

    const updated: Empleado = {
      ...employee,
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      nombre: nombreCompleto,
      tipoDocumento,
      numeroDocumento: docTrim,
      correo: correo.trim(),
      cargo: cargo.trim(),
      departamento,
      sede,
      empresa,
      pin: pin.trim() || employee.pin,
      tarjetaRfid,
      numeroTarjeta: tarjetaRfid ? numeroTarjeta.trim() : undefined,
      tipoMarcadoPredilecto,
      biometriaHuella,
      biometriaRostro,
      estado,
      telefono: telefono.trim(),
      direccion: direccion.trim() || undefined,
      fechaNacimiento: fechaNacimiento.trim() || undefined,
      fechaIngreso: fechaIngreso || todayStr,
      fechaCese: fechaCese.trim() || undefined,
      sueldoBase: sueldoNum,
      regimenPrevisional,
      tipoComisionAfp,
      cuspp: cuspp.trim() || undefined,
      tieneAsignacionFamiliar,
      bancoSueldo,
      numeroCuentaBanco: numeroCuentaBanco.trim() || undefined,
      cci: cci.trim() || undefined,
      bancoCts,
      numeroCuentaCts: numeroCuentaCts.trim() || undefined,
      monedaCts,
      foto: foto.trim(),
    };

    onSaveEmployee(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl overflow-y-auto max-h-[92vh] flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header del Modal */}
          <div className="flex justify-between items-start pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined text-[24px]">badge</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-headline">
                  Editar Ficha del Colaborador
                </h3>
                <p className="text-xs text-slate-500">
                  {nombres} {apellidos} ({numeroDocumento || employee.id})
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{validationError}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* BARRA NAVEGADORA DE PESTAÑAS                                              */}
          {/* ========================================================================= */}
          <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs font-bold select-none pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('personal')}
              className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'personal'
                  ? 'border-blue-600 text-blue-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
              Personal & Foto
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('laboral')}
              className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'laboral'
                  ? 'border-blue-600 text-blue-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">work</span>
              Puesto & Empresa
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('biometria')}
              className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'biometria'
                  ? 'border-blue-600 text-blue-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">fingerprint</span>
              Fichaje & Biometría
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payroll')}
              className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'payroll'
                  ? 'border-blue-600 text-blue-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
              Nómina & CTS
            </button>
          </div>

          <form id="edit-employee-form" onSubmit={handleSubmit} className="space-y-4 text-xs pt-2">
            {/* ========================================================================= */}
            {/* PESTAÑA 1: DATOS PERSONALES & FOTO                                       */}
            {/* ========================================================================= */}
            {activeTab === 'personal' && (
              <div className="space-y-4 animate-in fade-in">
                {/* Sección Foto */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-blue-600">photo_camera</span>
                      Foto de Perfil del Colaborador
                    </label>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      {foto ? (
                        <img
                          src={foto}
                          alt={nombres}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-blue-100 border-2 border-white shadow-sm ring-1 ring-slate-200 flex items-center justify-center text-xl font-bold text-blue-600">
                          {nombres ? nombres.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px] text-blue-600">upload</span>
                          Subir de PC
                        </button>
                        <button
                          type="button"
                          onClick={isCameraActive ? handleStopCamera : handleStartCamera}
                          className="px-3.5 py-1.5 border rounded-xl font-bold text-xs flex items-center gap-1.5 bg-blue-50 text-blue-700 border-blue-200 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                          {isCameraActive ? 'Apagar Cámara' : 'Tomar Foto'}
                        </button>
                        {foto && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-xs cursor-pointer"
                          >
                            Quitar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Nombres *</label>
                    <input
                      type="text"
                      required
                      value={nombres}
                      onChange={(e) => setNombres(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Apellidos *</label>
                    <input
                      type="text"
                      required
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Tipo de Documento</label>
                    <select
                      value={tipoDocumento}
                      onChange={(e) => setTipoDocumento(e.target.value as 'DNI' | 'CE' | 'Pasaporte')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                    >
                      <option value="DNI">DNI Perú</option>
                      <option value="CE">Carnet Extranjería</option>
                      <option value="Pasaporte">Pasaporte</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">N° Documento *</label>
                    <input
                      type="text"
                      required
                      value={numeroDocumento}
                      onChange={(e) => setNumeroDocumento(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Correo Corporativo *</label>
                    <input
                      type="email"
                      required
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Teléfono Móvil</label>
                    <input
                      type="text"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+51 9XX XXX XXX"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      value={fechaNacimiento}
                      onChange={(e) => setFechaNacimiento(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Dirección Domiciliaria</label>
                    <input
                      type="text"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Av. Javier Prado 123, Lima"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PESTAÑA 2: PUESTO & EMPRESA                                              */}
            {/* ========================================================================= */}
            {activeTab === 'laboral' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Cargo / Puesto *</label>
                    <input
                      type="text"
                      required
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Estado Laboral</label>
                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value as 'Activo' | 'Inactivo')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none font-bold"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo (Baja)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Departamento</label>
                    <select
                      value={departamento}
                      onChange={(e) => setDepartamento(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                    >
                      {(departamentos || []).filter(Boolean).map((d) => (
                        <option key={d.id || d.nombre} value={d.nombre}>
                          {d.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Sede de Trabajo</label>
                    <select
                      value={sede}
                      onChange={(e) => setSede(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                    >
                      {(sedes || []).filter(Boolean).map((s) => (
                        <option key={s.id || s.nombre} value={s.nombre}>
                          {s.nombre} ({s.ciudad})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Empresa (Grupo Carmelita)</label>
                  <select
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold outline-none"
                  >
                    {EMPRESAS_GRUPO_CARMELITA.map((emp) => (
                      <option key={emp} value={emp}>
                        {emp}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1 text-[11px]">Fecha de Ingreso *</label>
                    <input
                      type="date"
                      required
                      value={fechaIngreso}
                      onChange={(e) => setFechaIngreso(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-mono text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1 text-[11px]">Fecha de Cese (Opcional)</label>
                    <input
                      type="date"
                      value={fechaCese}
                      onChange={(e) => setFechaCese(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-mono text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PESTAÑA 3: FICHAJE & BIOMETRÍA                                           */}
            {/* ========================================================================= */}
            {activeTab === 'biometria' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-blue-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">fingerprint</span>
                    Credenciales Biométricas (ZKTeco Hardware)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={tarjetaRfid}
                          onChange={(e) => setTarjetaRfid(e.target.checked)}
                          className="rounded text-blue-600"
                        />
                        <span className="material-symbols-outlined text-blue-600 text-[18px]">badge</span>
                        <span>Tarjeta RFID Asignada</span>
                      </label>
                      {tarjetaRfid && (
                        <input
                          type="text"
                          value={numeroTarjeta}
                          onChange={(e) => setNumeroTarjeta(e.target.value)}
                          placeholder="Código RFID"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-mono text-slate-800 outline-none"
                        />
                      )}
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                      <label className="flex items-center gap-2 font-bold text-slate-800">
                        <span className="material-symbols-outlined text-amber-600 text-[18px]">dialpad</span>
                        <span>PIN para Teclado</span>
                      </label>
                      <input
                        type="text"
                        value={pin}
                        maxLength={6}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="PIN numérico"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-mono text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-white rounded-xl border border-slate-200">
                      <input
                        type="checkbox"
                        checked={biometriaHuella}
                        onChange={(e) => setBiometriaHuella(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span className="material-symbols-outlined text-emerald-600 text-[18px]">fingerprint</span>
                      <span className="font-semibold text-xs text-slate-800">Huella Biométrica</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-white rounded-xl border border-slate-200">
                      <input
                        type="checkbox"
                        checked={biometriaRostro}
                        onChange={(e) => setBiometriaRostro(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span className="material-symbols-outlined text-emerald-600 text-[18px]">face</span>
                      <span className="font-semibold text-xs text-slate-800">Reconocimiento Facial</span>
                    </label>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                      Método Habitual de Marcado
                    </label>
                    <select
                      value={tipoMarcadoPredilecto}
                      onChange={(e) =>
                        setTipoMarcadoPredilecto(
                          e.target.value as 'Huella' | 'Tarjeta RFID' | 'PIN' | 'Rostro'
                        )
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 outline-none"
                    >
                      <option value="Huella">Huella Biométrica</option>
                      <option value="Tarjeta RFID">Tarjeta RFID</option>
                      <option value="PIN">PIN Numérico</option>
                      <option value="Rostro">Reconocimiento Facial</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PESTAÑA 4: NÓMINA, AFPs & CTS                                             */}
            {/* ========================================================================= */}
            {activeTab === 'payroll' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Sueldo Básico (PEN S/.) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={sueldoBase}
                      onChange={(e) => setSueldoBase(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Fondo de Pensión</label>
                    <select
                      value={regimenPrevisional}
                      onChange={(e) => setRegimenPrevisional(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value="ONP">ONP (13% Nacional)</option>
                      <option value="AFP Integra">AFP Integra</option>
                      <option value="AFP Prima">AFP Prima</option>
                      <option value="AFP Profuturo">AFP Profuturo</option>
                      <option value="AFP Habitat">AFP Habitat</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {regimenPrevisional !== 'ONP' && (
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Tipo Comisión AFP</label>
                      <select
                        value={tipoComisionAfp}
                        onChange={(e) => setTipoComisionAfp(e.target.value as 'Flujo' | 'Mixta')}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                      >
                        <option value="Flujo">Comisión sobre Flujo</option>
                        <option value="Mixta">Comisión Mixta</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">CUSPP (Código AFP)</label>
                    <input
                      type="text"
                      value={cuspp}
                      onChange={(e) => setCuspp(e.target.value)}
                      placeholder="Ej. 654321VMY0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={tieneAsignacionFamiliar}
                      onChange={(e) => setTieneAsignacionFamiliar(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span className="material-symbols-outlined text-blue-600 text-[18px]">family_restroom</span>
                    <span>Asignación Familiar (10% RMV = S/ 102.50)</span>
                  </label>
                </div>

                {/* CUENTA SUELDO */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block text-[11px]">1. Cuenta Bancaria para Abono de Sueldo</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Banco Sueldo</label>
                      <select
                        value={bancoSueldo}
                        onChange={(e) => setBancoSueldo(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none"
                      >
                        <option value="BCP">BCP Banco de Crédito</option>
                        <option value="BBVA">BBVA Banco Continental</option>
                        <option value="Interbank">Interbank</option>
                        <option value="Scotiabank">Scotiabank</option>
                        <option value="BanBif">BanBif</option>
                        <option value="Banco de la Nación">Banco de la Nación</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">N° Cuenta Sueldo</label>
                      <input
                        type="text"
                        value={numeroCuentaBanco}
                        onChange={(e) => setNumeroCuentaBanco(e.target.value)}
                        placeholder="Ej. 191-00000000-0-00 (Opcional)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-800 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">CCI (Interbancario)</label>
                      <input
                        type="text"
                        value={cci}
                        onChange={(e) => setCci(e.target.value)}
                        placeholder="Ej. 00219100000000000000 (Opcional)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* CUENTA CTS */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-[11px]">2. Cuenta Bancaria Exclusiva para Abono de CTS (Ley D.L. 650)</span>
                    <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      Intangible
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Banco Depositario CTS</label>
                      <select
                        value={bancoCts}
                        onChange={(e) => setBancoCts(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none"
                      >
                        <option value="BBVA Banco Continental">BBVA Banco Continental</option>
                        <option value="BCP Banco de Crédito">BCP Banco de Crédito</option>
                        <option value="Interbank">Interbank</option>
                        <option value="Scotiabank">Scotiabank</option>
                        <option value="Caja Piura">Caja Piura</option>
                        <option value="Caja Arequipa">Caja Arequipa</option>
                        <option value="Caja Huancayo">Caja Huancayo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">N° Cuenta CTS</label>
                      <input
                        type="text"
                        value={numeroCuentaCts}
                        onChange={(e) => setNumeroCuentaCts(e.target.value)}
                        placeholder="Ej. 0011-0000-0000000000 (Opcional)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-800 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Moneda CTS</label>
                      <select
                        value={monedaCts}
                        onChange={(e) => setMonedaCts(e.target.value as 'PEN' | 'USD')}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-800 outline-none"
                      >
                        <option value="PEN">PEN (Soles S/.)</option>
                        <option value="USD">USD (Dólares US$)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer del Modal (Botones Guardar / Cancelar) */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
          <span className="text-[11px] text-slate-400">
            Pestaña activa: <b className="text-slate-700 capitalize">{activeTab}</b>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="edit-employee-form"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              Actualizar Ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
