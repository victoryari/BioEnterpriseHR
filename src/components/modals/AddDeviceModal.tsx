import React, { useState } from 'react';
import { Dispositivo, Sede } from '../../types';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDevice: (device: Dispositivo) => void;
  sedes?: Sede[];
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  isOpen,
  onClose,
  onAddDevice,
  sedes = [],
}) => {
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [ip, setIp] = useState('192.168.1.120');
  const [puerto, setPuerto] = useState<number>(4370);
  const [claveComunicacion, setClaveComunicacion] = useState<number>(0);
  const [protocolo, setProtocolo] = useState<Dispositivo['protocolo']>('Autónomo');
  const [numeroSerie, setNumeroSerie] = useState(
    `BIO${Math.floor(10000000 + Math.random() * 90000000)}`
  );

  React.useEffect(() => {
    if (isOpen) {
      setNombre('');
      setUbicacion(sedes.length > 0 ? `${sedes[0].nombre} (${sedes[0].ciudad})` : '');
      setIp('192.168.1.120');
      setPuerto(4370);
      setClaveComunicacion(0);
      setProtocolo('Autónomo');
      setNumeroSerie(`BIO${Math.floor(10000000 + Math.random() * 90000000)}`);
    }
  }, [isOpen, sedes]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !ubicacion.trim()) return;

    const newDevice: Dispositivo = {
      id: `dev-${Date.now()}`,
      numeroSerie,
      nombre,
      ubicacion,
      ip,
      puerto: Number(puerto) || 4370,
      claveComunicacion: Number(claveComunicacion) || 0,
      protocolo,
      estado: 'online',
      ultimoPulso: 'hace 10 seg',
      conteoUsuarios: 0,
      conteoRegistros: 0,
      firmware: 'BioFirm v4.3.0',
    };

    onAddDevice(newDevice);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[24px]">dns</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-headline">
                Añadir Terminal Biométrico
              </h3>
              <p className="text-xs text-slate-500">
                Conectar hardware de control de acceso y asistencia en sedes Perú.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4 text-xs">
          {/* Nombre y Sede */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Nombre del Terminal *</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder={sedes.length > 0 ? `Ej. Torniquete ${sedes[0].nombre}` : 'Ej. Torniquete Entrada Principal'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:border-blue-600 focus:bg-white outline-none transition-all"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">Sede / Ubicación *</label>
              <select
                required
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:border-blue-600 focus:bg-white outline-none transition-all cursor-pointer"
              >
                {sedes.length === 0 ? (
                  <option value="Sede Central (Lima)">Sede Central (Lima)</option>
                ) : (
                  sedes.map((s) => (
                    <option key={s.id} value={`${s.nombre} (${s.ciudad})`}>
                      {s.nombre} ({s.ciudad})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Parámetros de Red Local (IP, Puerto y Clave CommKey) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-blue-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">lan</span>
                Parámetros de Red Local (TCP/IP)
              </h4>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                Socket LAN
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1">Dirección IP Estática *</label>
                <input
                  type="text"
                  required
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder="192.168.1.120"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono focus:border-blue-600 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Puerto TCP *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={65535}
                  value={puerto}
                  onChange={(e) => setPuerto(Number(e.target.value))}
                  placeholder="4370"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono font-bold text-blue-700 focus:border-blue-600 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Clave de Comunicación (CommKey)
                </label>
                <input
                  type="number"
                  min={0}
                  value={claveComunicacion}
                  onChange={(e) => setClaveComunicacion(Number(e.target.value))}
                  placeholder="0 (por defecto)"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 font-mono focus:border-blue-600 outline-none"
                />
                <span className="text-[10px] text-slate-400">Por defecto es 0 en ZKTeco</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Protocolo de Red</label>
                <select
                  value={protocolo}
                  onChange={(e) => setProtocolo(e.target.value as Dispositivo['protocolo'])}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:border-blue-600 outline-none"
                >
                  <option value="Autónomo">Autónomo / LAN ZK (Puerto 4370)</option>
                  <option value="ADMS">ADMS (Cloud Push)</option>
                  <option value="Push SDK">Push SDK v3.2</option>
                </select>
                <span className="text-[10px] text-slate-400">Tipo de comunicación</span>
              </div>
            </div>

            {/* Tip explicativo sobre puertos */}
            <div className="p-2.5 bg-blue-50/70 rounded-lg border border-blue-100 text-[11px] text-blue-900 flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-blue-600 shrink-0 mt-0.5">
                info
              </span>
              <p className="leading-relaxed">
                <strong>¿Qué puerto usar?</strong> En conexión directa por cable de red o WiFi local,
                el puerto estándar de fábrica para <strong>ZKTeco es 4370</strong>. Si usas Hikvision
                suele ser <strong>8000</strong> y en Dahua <strong>37777</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Número de Serie</label>
              <input
                type="text"
                value={numeroSerie}
                onChange={(e) => setNumeroSerie(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono focus:border-blue-600 focus:bg-white outline-none transition-all"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">Tipo de Hardware</label>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-xs">
                Lector Multibiométrico (Huella, Facial, RFID)
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">add_link</span>
              Conectar y Emparejar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
