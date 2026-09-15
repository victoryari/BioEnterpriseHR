import React, { useState, useRef, useEffect } from 'react';
import { Empleado, Sede, Departamento, EMPRESAS_GRUPO_CARMELITA } from '../../types';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sedes: Sede[];
  departamentos: Departamento[];
  onAddEmployee: (emp: Empleado) => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  sedes = [],
  departamentos = [],
  onAddEmployee,
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'laboral' | 'biometria' | 'payroll'>('personal');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Tab 1: Personal
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [direccion, setDireccion] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState<'DNI' | 'CE'>('DNI');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('+51 9');
  const [foto, setFoto] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Tab 2: Laboral
  const [cargo, setCargo] = useState('');
  const [departamento, setDepartamento] = useState((departamentos && departamentos[0])?.nombre || '');
  const [sede, setSede] = useState((sedes && sedes[0])?.nombre || '');
  const [empresa, setEmpresa] = useState<string>(EMPRESAS_GRUPO_CARMELITA[0]);
  const todayStr = new Date().toISOString().split('T')[0];
  const [fechaIngreso, setFechaIngreso] = useState(todayStr);
  const [fechaCese, setFechaCese] = useState('');

  // Tab 3: Biometría & Credenciales
  const [pin, setPin] = useState(Math.floor(1000 + Math.random() * 9000).toString());
  const [tarjetaRfid, setTarjetaRfid] = useState(true);
  const [numeroTarjeta, setNumeroTarjeta] = useState(`00${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [tipoMarcadoPredilecto, setTipoMarcadoPredilecto] = useState<'Huella' | 'Tarjeta RFID' | 'PIN' | 'Rostro'>('Huella');
  const [biometriaHuella, setBiometriaHuella] = useState(true);
  const [biometriaRostro, setBiometriaRostro] = useState(false);

  // Tab 4: Nómina & CTS
  const [sueldoBase, setSueldoBase] = useState('1025.00');
  const [regimenPrevisional, setRegimenPrevisional] = useState('AFP Integra');
  const [tipoComisionAfp, setTipoComisionAfp] = useState<'Flujo' | 'Mixta'>('Flujo');
  const [cuspp, setCuspp] = useState('');
  const [tieneAsignacionFamiliar, setTieneAsignacionFamiliar] = useState(false);
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
  };

  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError('No se pudo acceder a la cámara.');
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

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setFoto(reader.result);
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

    const nombreCompleto = `${nombres.trim()} ${apellidos.trim()}`.trim();

    const newEmp: Empleado = {
      id: `emp-${Date.now().toString().slice(-4)}`,
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      nombre: nombreCompleto,
      tipoDocumento,
      numeroDocumento: docTrim,
      pin: pin.trim() || docTrim.slice(-4),
      numeroTarjeta: tarjetaRfid ? numeroTarjeta.trim() : undefined,
      tarjetaRfid,
      biometriaHuella,
      biometriaRostro,
      tipoMarcadoPredilecto,
      correo: correo.trim() || `${docTrim}@carmelita.pe`,
      cargo: cargo.trim() || 'Colaborador',
      departamento: departamento || departamentos[0]?.nombre || 'Operaciones',
      sede: sede || sedes[0]?.nombre || 'Sede Principal',
      empresa,
      estado: 'Activo',
      foto: foto.trim(),
      conteoHuellas: biometriaHuella ? 2 : 0,
      rostroActualizado: biometriaRostro ? todayStr : 'Sin registro',
      accesoPuertas: { entradaPrincipal: true, centroDatos: false },
      telefono: telefono.trim(),
      direccion: direccion.trim() || undefined,
      fechaNacimiento: fechaNacimiento || undefined,
      fechaIngreso: fechaIngreso || todayStr,
      fechaCese: fechaCese || undefined,
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
    };

    onAddEmployee(newEmp);
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
              <span className="material-symbols-outlined text-[18px] text-blue-200">person_add</span>
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-tight">
                Registro de Nuevo Colaborador
              </h2>
              <p className="text-[9px] text-blue-200 uppercase font-medium">Módulo de Gestión de Personal & Ficha Laboral</p>
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

        {/* Barra Navegadora de Pestañas Compacta */}
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
            <span className="material-symbols-outlined text-[16px]">person</span>
            Personal & Foto
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
            <span className="material-symbols-outlined text-[16px]">work</span>
            Puesto & Empresa
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
            <span className="material-symbols-outlined text-[16px]">fingerprint</span>
            Fichaje & Biometría
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
            <span className="material-symbols-outlined text-[16px]">account_balance</span>
            Nómina & CTS
          </button>
        </div>

        {/* Contenido Formulario con Scroll */}
        <form id="add-employee-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/70">
          {activeTab === 'personal' && (
            <div className="space-y-2.5 animate-in fade-in">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#004A99]">photo_camera</span>
                  <span className="text-[11px] font-bold text-blue-950 uppercase tracking-tight">Fotografía y Perfil</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {foto ? (
                      <img src={foto} alt="Nuevo" className="w-14 h-14 rounded-lg object-cover border border-slate-300 shadow-2xs" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-lg font-bold text-[#004A99]">
                        {nombres ? nombres.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="h-8 px-3 bg-white border border-slate-300 hover:bg-slate-50 rounded text-xs font-bold text-slate-700 cursor-pointer shadow-2xs">
                        Subir Foto
                      </button>
                      <button type="button" onClick={isCameraActive ? handleStopCamera : handleStartCamera} className="h-8 px-3 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-[#004A99] rounded text-xs font-bold cursor-pointer">
                        {isCameraActive ? 'Detener Cámara' : 'Cámara Web'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#004A99]">badge</span>
                  <span className="text-[11px] font-bold text-blue-950 uppercase tracking-tight">Datos de Identidad y Contacto</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Nombres *</label>
                    <input type="text" required value={nombres} onChange={(e) => setNombres(e.target.value)} placeholder="Ej. Juan" className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Apellidos *</label>
                    <input type="text" required value={apellidos} onChange={(e) => setApellidos(e.target.value)} placeholder="Ej. Pérez Gómez" className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Tipo Documento</label>
                    <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value as 'DNI' | 'CE')} className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none">
                      <option value="DNI">DNI (8 dígitos)</option>
                      <option value="CE">Carné de Extranjería (CE)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Número Documento *</label>
                    <input type="text" required value={numeroDocumento} onChange={(e) => setNumeroDocumento(e.target.value)} placeholder="Ej. 45891234" className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-800 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Correo Electrónico</label>
                    <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="correo@carmelita.pe" className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-800 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Teléfono Móvil</label>
                    <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+51 9XX XXX XXX" className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Dirección Domiciliaria</label>
                    <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Av. Principal 123, Lima" className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-800 focus:border-blue-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'laboral' && (
            <div className="space-y-2.5 animate-in fade-in">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#004A99]">business</span>
                  <span className="text-[11px] font-bold text-blue-950 uppercase tracking-tight">Filiación Empresarial y Cargo</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Razón Social / Empresa *</label>
                    <select value={empresa} onChange={(e) => setEmpresa(e.target.value)} className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none">
                      {EMPRESAS_GRUPO_CARMELITA.map((emp) => (
                        <option key={emp} value={emp}>{emp}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Cargo / Puesto *</label>
                    <input type="text" required value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ej. Analista de Operaciones" className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Área / Departamento *</label>
                    <select value={departamento} onChange={(e) => setDepartamento(e.target.value)} className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none">
                      {departamentos.map((d) => (
                        <option key={d.id} value={d.nombre}>{d.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Sede Asignada *</label>
                    <select value={sede} onChange={(e) => setSede(e.target.value)} className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none">
                      {sedes.map((s) => (
                        <option key={s.id} value={s.nombre}>{s.nombre} ({s.ciudad})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Fecha de Ingreso *</label>
                    <input type="date" required value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'biometria' && (
            <div className="space-y-2.5 animate-in fade-in">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#004A99]">fingerprint</span>
                  <span className="text-[11px] font-bold text-blue-950 uppercase tracking-tight">Credenciales y Terminales ZKTeco</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">PIN de Marcación (Teclado Reloj)</label>
                    <input type="text" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN 4 dígitos" className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-800 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">N° Tarjeta RFID / Proximidad</label>
                    <input type="text" value={numeroTarjeta} onChange={(e) => setNumeroTarjeta(e.target.value)} placeholder="00XXXXXXXX" className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-800 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Modalidad de Marcado Habitual</label>
                    <select value={tipoMarcadoPredilecto} onChange={(e) => setTipoMarcadoPredilecto(e.target.value as any)} className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none">
                      <option value="Huella">Huella Dactilar (Lector Óptico)</option>
                      <option value="Tarjeta RFID">Tarjeta de Proximidad RFID</option>
                      <option value="PIN">Teclado Numérico PIN</option>
                      <option value="Rostro">Reconocimiento Facial 3D</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="space-y-2.5 animate-in fade-in">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#004A99]">payments</span>
                  <span className="text-[11px] font-bold text-blue-950 uppercase tracking-tight">Régimen Previsional & Sueldo (D.L. 728)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Sueldo Básico (S/.) *</label>
                    <input type="number" step="0.01" min="1025" required value={sueldoBase} onChange={(e) => setSueldoBase(e.target.value)} placeholder="1025.00" className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-800 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Régimen Pensionario *</label>
                    <select value={regimenPrevisional} onChange={(e) => setRegimenPrevisional(e.target.value)} className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none">
                      <option value="AFP Integra">AFP Integra</option>
                      <option value="AFP Prima">AFP Prima</option>
                      <option value="AFP Profuturo">AFP Profuturo</option>
                      <option value="AFP Habitat">AFP Habitat</option>
                      <option value="ONP">ONP (13%)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Tipo Comisión AFP</label>
                    <select value={tipoComisionAfp} onChange={(e) => setTipoComisionAfp(e.target.value as 'Flujo' | 'Mixta')} className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none">
                      <option value="Flujo">Flujo (Sueldo)</option>
                      <option value="Mixta">Mixta (Saldo)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Código CUSPP</label>
                    <input type="text" value={cuspp} onChange={(e) => setCuspp(e.target.value)} placeholder="123456XXXXXX" className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-800 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="sm:col-span-2 flex items-center pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={tieneAsignacionFamiliar} onChange={(e) => setTieneAsignacionFamiliar(e.target.checked)} className="h-4 w-4 text-[#004A99] border-slate-300 rounded" />
                      <span className="text-xs font-bold text-slate-700">Percibe Asignación Familiar (10% RMV)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#004A99]">account_balance</span>
                  <span className="text-[11px] font-bold text-blue-950 uppercase tracking-tight">Cuentas Bancarias Sueldo & CTS</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Banco Sueldo</label>
                    <select value={bancoSueldo} onChange={(e) => setBancoSueldo(e.target.value)} className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none">
                      <option value="BCP">BCP</option>
                      <option value="BBVA">BBVA</option>
                      <option value="Interbank">Interbank</option>
                      <option value="Scotiabank">Scotiabank</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">N° Cuenta Sueldo</label>
                    <input type="text" value={numeroCuentaBanco} onChange={(e) => setNumeroCuentaBanco(e.target.value)} placeholder="000-00000000-0-00" className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-800 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Banco CTS (D.S. 001-97-TR)</label>
                    <select value={bancoCts} onChange={(e) => setBancoCts(e.target.value)} className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none">
                      <option value="BBVA Banco Continental">BBVA Continental</option>
                      <option value="BCP Banco de Crédito">BCP Crédito</option>
                      <option value="Interbank">Interbank</option>
                      <option value="Scotiabank">Scotiabank</option>
                    </select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">N° Cuenta CTS</label>
                    <input type="text" value={numeroCuentaCts} onChange={(e) => setNumeroCuentaCts(e.target.value)} placeholder="0011-XXXX-XXXXXXXXXX" className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-800 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Moneda CTS</label>
                    <select value={monedaCts} onChange={(e) => setMonedaCts(e.target.value as 'PEN' | 'USD')} className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none">
                      <option value="PEN">PEN (Soles S/.)</option>
                      <option value="USD">USD (Dólares $)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Pie de Formulario Institucional ERP */}
        <div className="px-4 py-2.5 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="h-8 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-red-500">close</span> Cancelar
          </button>

          <button 
            type="submit" 
            form="add-employee-form"
            className="h-8 px-5 bg-[#004A99] hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">save</span> Guardar Colaborador
          </button>
        </div>
      </div>
    </div>
  );
};
