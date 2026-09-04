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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl overflow-y-auto max-h-[92vh] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-start pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined text-[24px]">person_add</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-headline">
                  Registrar Nuevo Colaborador
                </h3>
                <p className="text-xs text-slate-500">
                  Alta de personal, enrolamiento biométrico y datos de nómina/CTS.
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

          {/* BARRA NAVEGADORA DE PESTAÑAS */}
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

          <form id="add-employee-form" onSubmit={handleSubmit} className="space-y-4 text-xs pt-2">
            {activeTab === 'personal' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      {foto ? (
                        <img src={foto} alt="Nuevo" className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-slate-200" />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-blue-100 border-2 border-white shadow-sm ring-1 ring-slate-200 flex items-center justify-center text-xl font-bold text-blue-600">
                          {nombres ? nombres.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-xs cursor-pointer">
                          Subir Foto
                        </button>
                        <button type="button" onClick={isCameraActive ? handleStopCamera : handleStartCamera} className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl font-bold text-xs cursor-pointer">
                          Cámara Web
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Nombres *</label>
                    <input type="text" required value={nombres} onChange={(e) => setNombres(e.target.value)} placeholder="Ej. Juan" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Apellidos *</label>
                    <input type="text" required value={apellidos} onChange={(e) => setApellidos(e.target.value)} placeholder="Ej. Perez" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Tipo Documento</label>
                    <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value as 'DNI' | 'CE')} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none">
                      <option value="DNI">DNI Perú</option>
                      <option value="CE">Carnet Extranjería</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">N° Documento *</label>
                    <input type="text" required value={numeroDocumento} onChange={(e) => setNumeroDocumento(e.target.value)} placeholder="8 dígitos" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Correo Corporativo</label>
                    <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="juan@carmelita.pe" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Teléfono Móvil</label>
                    <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 outline-none" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'laboral' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Cargo / Puesto *</label>
                    <input type="text" required value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ej. Analista de Sistemas" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Empresa</label>
                    <select value={empresa} onChange={(e) => setEmpresa(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none">
                      {EMPRESAS_GRUPO_CARMELITA.map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Departamento</label>
                    <select value={departamento} onChange={(e) => setDepartamento(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none">
                      {departamentos.map((d) => (
                        <option key={d.id} value={d.nombre}>{d.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Sede de Trabajo</label>
                    <select value={sede} onChange={(e) => setSede(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none">
                      {sedes.map((s) => (
                        <option key={s.id} value={s.nombre}>{s.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Fecha de Ingreso *</label>
                  <input type="date" required value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 outline-none" />
                </div>
              </div>
            )}

            {activeTab === 'biometria' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                        <input type="checkbox" checked={tarjetaRfid} onChange={(e) => setTarjetaRfid(e.target.checked)} className="rounded text-blue-600" />
                        <span>Tarjeta RFID</span>
                      </label>
                      {tarjetaRfid && (
                        <input type="text" value={numeroTarjeta} onChange={(e) => setNumeroTarjeta(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-mono text-slate-800 outline-none" />
                      )}
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                      <label className="block font-bold text-slate-800 text-[11px]">PIN para Teclado</label>
                      <input type="text" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-mono text-slate-800 outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payroll' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Sueldo Básico (PEN S/.) *</label>
                    <input type="number" step="0.01" required value={sueldoBase} onChange={(e) => setSueldoBase(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-800 outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Fondo de Pensión</label>
                    <select value={regimenPrevisional} onChange={(e) => setRegimenPrevisional(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none">
                      <option value="ONP">ONP (13% Nacional)</option>
                      <option value="AFP Integra">AFP Integra</option>
                      <option value="AFP Prima">AFP Prima</option>
                      <option value="AFP Profuturo">AFP Profuturo</option>
                      <option value="AFP Habitat">AFP Habitat</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input type="checkbox" checked={tieneAsignacionFamiliar} onChange={(e) => setTieneAsignacionFamiliar(e.target.checked)} className="rounded text-blue-600" />
                    <span>Asignación Familiar (10% RMV = S/ 102.50)</span>
                  </label>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block text-[11px]">Cuenta para Abono de Sueldo</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Banco Sueldo</label>
                      <select value={bancoSueldo} onChange={(e) => setBancoSueldo(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none">
                        <option value="BCP">BCP Banco de Crédito</option>
                        <option value="BBVA">BBVA Banco Continental</option>
                        <option value="Interbank">Interbank</option>
                        <option value="Scotiabank">Scotiabank</option>
                        <option value="BanBif">BanBif</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">N° Cuenta Sueldo</label>
                      <input type="text" value={numeroCuentaBanco} onChange={(e) => setNumeroCuentaBanco(e.target.value)} placeholder="Ej. 191-00000000-0-00 (Opcional)" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-800 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">CCI (Interbancario)</label>
                      <input type="text" value={cci} onChange={(e) => setCci(e.target.value)} placeholder="Ej. 00219100000000000000 (Opcional)" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-800 outline-none" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block text-[11px]">Cuenta Exclusiva para Abono de CTS (Ley D.L. 650)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Banco CTS</label>
                      <select value={bancoCts} onChange={(e) => setBancoCts(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none">
                        <option value="BBVA Banco Continental">BBVA Banco Continental</option>
                        <option value="BCP Banco de Crédito">BCP Banco de Crédito</option>
                        <option value="Interbank">Interbank</option>
                        <option value="Scotiabank">Scotiabank</option>
                        <option value="Caja Piura">Caja Piura</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">N° Cuenta CTS</label>
                      <input type="text" value={numeroCuentaCts} onChange={(e) => setNumeroCuentaCts(e.target.value)} placeholder="Ej. 0011-0000-0000000000 (Opcional)" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-800 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Moneda CTS</label>
                      <select value={monedaCts} onChange={(e) => setMonedaCts(e.target.value as 'PEN' | 'USD')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-800 outline-none">
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

        <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
          <span className="text-[11px] text-slate-400">
            Pestaña activa: <b className="text-slate-700 capitalize">{activeTab}</b>
          </span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer">
              Cancelar
            </button>
            <button type="submit" form="add-employee-form" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 text-xs cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              Guardar Colaborador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
