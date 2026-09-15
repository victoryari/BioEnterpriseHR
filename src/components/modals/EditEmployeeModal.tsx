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
  const [foto, setFoto] = useState('');
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
  const [cameraError, setCameraError] = useState<string | null>(null);
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError('No se pudo acceder a la cámara web.');
    }
  };

  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isCameraActive]);

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 640, 480);
      setFoto(canvas.toDataURL('image/jpeg', 0.9));
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
        setSueldoBase(employee.sueldoBase != null ? String(employee.sueldoBase) : '1025.00');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const docTrim = numeroDocumento.trim();
    if (!nombres.trim() || !docTrim) {
      setValidationError('Por favor ingrese los nombres y el número de documento.');
      return;
    }

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

    const sueldoNum = parseFloat(sueldoBase);
    if (isNaN(sueldoNum) || sueldoNum < 1025) {
      setValidationError('El sueldo básico no puede ser menor a la Remuneración Mínima Vital (S/ 1,025.00).');
      setActiveTab('payroll');
      return;
    }

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
      fechaCese: estado === 'Inactivo' ? (fechaCese.trim() || todayStr) : undefined,
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
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 overflow-hidden animate-in fade-in">
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" 
      />
      
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-300 max-h-[92vh] z-10">
        {/* Cabecera Institucional ERP */}
        <div className="bg-[#004A99] px-4 py-2.5 flex items-center justify-between text-white shadow-sm shrink-0 border-b border-blue-900">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white/10 rounded">
              <span className="material-symbols-outlined text-[18px] text-blue-200">badge</span>
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-tight">
                Editar Ficha del Colaborador
              </h2>
              <p className="text-[9px] text-blue-200 uppercase font-medium">
                {nombres} {apellidos} — DOC: {numeroDocumento || employee.id}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-red-600 rounded text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {validationError && (
          <div className="mx-3 mt-2.5 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{validationError}</span>
          </div>
        )}

        {/* Barra Navegadora de Pestañas */}
        <div className="flex bg-slate-100/90 px-3 pt-1 border-b border-slate-200 gap-1 overflow-x-auto text-xs font-bold shrink-0 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'personal'
                ? 'border-[#004A99] text-[#004A99] bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">person</span>
            1. Personal & Foto
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('laboral')}
            className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'laboral'
                ? 'border-[#004A99] text-[#004A99] bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">work</span>
            2. Puesto & Empresa
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('biometria')}
            className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'biometria'
                ? 'border-[#004A99] text-[#004A99] bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">fingerprint</span>
            3. Biometría & Credenciales
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payroll')}
            className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'payroll'
                ? 'border-[#004A99] text-[#004A99] bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">account_balance</span>
            4. Nómina & CTS (D.L. 728)
          </button>
        </div>

        {/* Formulario Principal */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/70">
          {/* TAB 1: DATOS PERSONALES */}
          {activeTab === 'personal' && (
            <div className="space-y-2.5">
              {/* Card Foto de Perfil */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-700">photo_camera</span>
                  <span className="text-[11px] font-bold text-blue-950 uppercase tracking-tight">
                    Fotografía del Colaborador
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                    {foto ? (
                      <img src={foto} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-slate-400 text-[28px]">person</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap gap-1.5">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-8 px-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[14px]">upload</span>
                        Subir Archivo
                      </button>
                      <button
                        type="button"
                        onClick={isCameraActive ? handleCapturePhoto : handleStartCamera}
                        className="h-8 px-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isCameraActive ? 'camera' : 'videocam'}
                        </span>
                        {isCameraActive ? 'Capturar Foto' : 'Tomar Foto'}
                      </button>
                      {foto && (
                        <button
                          type="button"
                          onClick={() => setFoto('')}
                          className="h-8 px-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded text-xs font-bold cursor-pointer"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                    {cameraError && <p className="text-[10px] text-rose-600 font-bold">{cameraError}</p>}
                    {isCameraActive && (
                      <div className="relative w-48 h-36 bg-black rounded overflow-hidden border border-blue-500">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Identidad y Contacto */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-700">id_card</span>
                  <span className="text-[11px] font-bold text-blue-950 uppercase tracking-tight">
                    Datos de Identificación & Contacto
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Tipo Documento</label>
                    <select
                      value={tipoDocumento}
                      onChange={(e) => setTipoDocumento(e.target.value as any)}
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                    >
                      <option value="DNI">DNI (Perú - 8 dígitos)</option>
                      <option value="CE">Carné Extranjería (CE)</option>
                      <option value="Pasaporte">Pasaporte</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Número Documento *</label>
                    <input
                      type="text"
                      value={numeroDocumento}
                      onChange={(e) => setNumeroDocumento(e.target.value)}
                      placeholder="Ingrese número de documento"
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold font-mono text-slate-800 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Nombres *</label>
                    <input
                      type="text"
                      value={nombres}
                      onChange={(e) => setNombres(e.target.value)}
                      placeholder="Nombres completos"
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Apellidos *</label>
                    <input
                      type="text"
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                      placeholder="Apellidos paterno y materno"
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Correo Electrónico</label>
                    <input
                      type="email"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-800 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Teléfono Móvil</label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+51 987 654 321"
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-800 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      value={fechaNacimiento}
                      onChange={(e) => setFechaNacimiento(e.target.value)}
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-800 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Dirección Domiciliaria</label>
                    <input
                      type="text"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Av. / Jr. / Calle..."
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-800 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATOS LABORALES */}
          {activeTab === 'laboral' && (
            <div className="space-y-2.5">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-700">corporate_fare</span>
                  <span className="text-[11px] font-bold text-blue-950 uppercase tracking-tight">
                    Adscripción Organizacional & Cargo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Empresa Razón Social *</label>
                    <select
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                    >
                      {EMPRESAS_GRUPO_CARMELITA.map((emp) => (
                        <option key={emp} value={emp}>
                          {emp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Cargo / Puesto *</label>
                    <input
                      type="text"
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      placeholder="Ej. Operador de Almacén"
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Departamento / Área</label>
                    <select
                      value={departamento}
                      onChange={(e) => setDepartamento(e.target.value)}
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                    >
                      {departamentos.map((d) => (
                        <option key={d.id} value={d.nombre}>
                          {d.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Sede de Trabajo</label>
                    <select
                      value={sede}
                      onChange={(e) => setSede(e.target.value)}
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                    >
                      {sedes.map((s) => (
                        <option key={s.id} value={s.nombre}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Estado Laboral</label>
                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value as 'Activo' | 'Inactivo')}
                      className={`w-full h-8 px-2 bg-white border rounded text-xs font-bold outline-none ${
                        estado === 'Activo' ? 'text-emerald-700 border-emerald-300' : 'text-rose-700 border-rose-300'
                      }`}
                    >
                      <option value="Activo">Activo (En planilla vigente)</option>
                      <option value="Inactivo">Inactivo / Cesado</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Fecha de Ingreso *</label>
                    <input
                      type="date"
                      value={fechaIngreso}
                      onChange={(e) => setFechaIngreso(e.target.value)}
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Fecha de Cese (si aplica)</label>
                    <input
                      type="date"
                      value={fechaCese}
                      onChange={(e) => setFechaCese(e.target.value)}
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-800 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BIOMETRÍA & CREDENCIALES */}
          {activeTab === 'biometria' && (
            <div className="space-y-2.5">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-700">key</span>
                  <span className="text-[11px] font-bold text-blue-950 uppercase tracking-tight">
                    Credenciales de Acceso & Fichaje
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">PIN de Acceso Reloj (4 dígitos)</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold font-mono text-slate-800 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Método de Marcado Predilecto</label>
                    <select
                      value={tipoMarcadoPredilecto}
                      onChange={(e) => setTipoMarcadoPredilecto(e.target.value as any)}
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                    >
                      <option value="Huella">Huella Dactilar</option>
                      <option value="Tarjeta RFID">Tarjeta de Proximidad RFID</option>
                      <option value="PIN">Código PIN en Reloj</option>
                      <option value="Rostro">Reconocimiento Facial</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Tarjeta RFID / Código</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="tarjetaRfidEdit"
                        checked={tarjetaRfid}
                        onChange={(e) => setTarjetaRfid(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        disabled={!tarjetaRfid}
                        value={numeroTarjeta}
                        onChange={(e) => setNumeroTarjeta(e.target.value)}
                        placeholder="N° Tarjeta RFID"
                        className="flex-1 h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold font-mono text-slate-800 disabled:bg-slate-100 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Habilitación Biometría</label>
                    <div className="flex items-center gap-4 pt-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={biometriaHuella}
                          onChange={(e) => setBiometriaHuella(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        Huella
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={biometriaRostro}
                          onChange={(e) => setBiometriaRostro(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        Facial
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NÓMINA & CTS */}
          {activeTab === 'payroll' && (
            <div className="space-y-2.5">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-700">payments</span>
                  <span className="text-[11px] font-bold text-blue-950 uppercase tracking-tight">
                    Remuneración & Sistema Previsional (Ley D.L. 728)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Sueldo Básico Mensual (PEN) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1025"
                      value={sueldoBase}
                      onChange={(e) => setSueldoBase(e.target.value)}
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1 flex flex-col justify-end">
                    <label className="flex items-center gap-2 h-8 px-2.5 bg-slate-50 border border-slate-300 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tieneAsignacionFamiliar}
                        onChange={(e) => setTieneAsignacionFamiliar(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-xs font-bold text-slate-700">Asignación Familiar (10% RMV - Ley 25129)</span>
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Régimen Pensionario</label>
                    <select
                      value={regimenPrevisional}
                      onChange={(e) => setRegimenPrevisional(e.target.value)}
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                    >
                      <option value="AFP Integra">AFP Integra</option>
                      <option value="AFP Prima">AFP Prima</option>
                      <option value="AFP Profuturo">AFP Profuturo</option>
                      <option value="AFP Habitat">AFP Habitat</option>
                      <option value="ONP">ONP (Sistema Nacional D.L. 19990)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Tipo de Comisión AFP</label>
                    <select
                      disabled={regimenPrevisional === 'ONP'}
                      value={tipoComisionAfp}
                      onChange={(e) => setTipoComisionAfp(e.target.value as any)}
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 disabled:bg-slate-100 outline-none"
                    >
                      <option value="Flujo">Comisión por Flujo (Sueldo)</option>
                      <option value="Mixta">Comisión Mixta (Saldo + Flujo)</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Código CUSPP (AFP)</label>
                    <input
                      type="text"
                      disabled={regimenPrevisional === 'ONP'}
                      value={cuspp}
                      onChange={(e) => setCuspp(e.target.value)}
                      placeholder="12 dígitos CUSPP"
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold font-mono text-slate-800 disabled:bg-slate-100 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Cuentas Bancarias */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-700">account_balance</span>
                  <span className="text-[11px] font-bold text-blue-950 uppercase tracking-tight">
                    Cuentas Bancarias de Sueldo & CTS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Banco Sueldo</label>
                    <select
                      value={bancoSueldo}
                      onChange={(e) => setBancoSueldo(e.target.value)}
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value="BCP">BCP</option>
                      <option value="BBVA">BBVA</option>
                      <option value="Interbank">Interbank</option>
                      <option value="Scotiabank">Scotiabank</option>
                      <option value="Banco de la Nación">Banco de la Nación</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">N° Cuenta Sueldo</label>
                    <input
                      type="text"
                      value={numeroCuentaBanco}
                      onChange={(e) => setNumeroCuentaBanco(e.target.value)}
                      placeholder="N° Cuenta"
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold font-mono text-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">CCI (Interbancaria)</label>
                    <input
                      type="text"
                      value={cci}
                      onChange={(e) => setCci(e.target.value)}
                      placeholder="CCI 20 dígitos"
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold font-mono text-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Banco CTS</label>
                    <select
                      value={bancoCts}
                      onChange={(e) => setBancoCts(e.target.value)}
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value="BBVA Banco Continental">BBVA Banco Continental</option>
                      <option value="Banco de Crédito BCP">Banco de Crédito BCP</option>
                      <option value="Interbank">Interbank</option>
                      <option value="Scotiabank">Scotiabank</option>
                      <option value="Caja Huancayo">Caja Huancayo</option>
                      <option value="Caja Piura">Caja Piura</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">N° Cuenta CTS</label>
                    <input
                      type="text"
                      value={numeroCuentaCts}
                      onChange={(e) => setNumeroCuentaCts(e.target.value)}
                      placeholder="N° Cuenta CTS"
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold font-mono text-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Moneda CTS</label>
                    <select
                      value={monedaCts}
                      onChange={(e) => setMonedaCts(e.target.value as any)}
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value="PEN">PEN (Soles - S/)</option>
                      <option value="USD">USD (Dólares - $)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer del Formulario */}
          <div className="px-4 py-2.5 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between shrink-0 -mx-3 -mb-3 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px] text-red-500">close</span>
              Cancelar
            </button>

            <button
              type="submit"
              className="h-8 px-5 bg-[#004A99] hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">save</span>
              Actualizar Colaborador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
