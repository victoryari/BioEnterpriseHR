import React, { useState } from 'react';
import { Dispositivo } from '../../types';

interface HardwareViewProps {
  devices: Dispositivo[];
  syncingDeviceId?: string | null;
  onOpenAddDeviceModal: () => void;
  onOpenEditDeviceModal: (device: Dispositivo) => void;
  onOpenDeleteDeviceModal: (device: Dispositivo) => void;
  onOpenSyncModal: () => void;
  onSyncSingleDevice: (id: string) => void;
  onRestartDevice: (id: string) => void;
}

export const HardwareView: React.FC<HardwareViewProps> = ({
  devices,
  syncingDeviceId,
  onOpenAddDeviceModal,
  onOpenEditDeviceModal,
  onOpenDeleteDeviceModal,
  onOpenSyncModal,
  onSyncSingleDevice,
  onRestartDevice,
}) => {
  const [search, setSearch] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      d.nombre.toLowerCase().includes(search.toLowerCase()) ||
      d.ip.includes(search) ||
      d.ubicacion.toLowerCase().includes(search.toLowerCase()) ||
      d.numeroSerie.toLowerCase().includes(search.toLowerCase());
    const matchesProtocol = protocolFilter === 'all' || d.protocolo === protocolFilter;
    const matchesStatus = statusFilter === 'all' || d.estado === statusFilter;
    return matchesSearch && matchesProtocol && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-slate-900 tracking-tight">
            Gestión de Terminales Biométricos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitoreo y enlace en tiempo real de lectores biométricos y torniquetes en Perú.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onOpenSyncModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-600">sync</span>
            Sincronizar Red
          </button>
          <button
            onClick={onOpenAddDeviceModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Añadir Terminal
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Terminales
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{devices.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Conectados en sedes Perú</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            En Línea (Online)
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {devices.filter((d) => d.estado === 'online').length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Último pulso &lt; 5 min</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Fuera de Línea / Error
          </span>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            {devices.filter((d) => d.estado !== 'online').length}
          </div>
          <p className="text-[11px] text-rose-600 font-semibold mt-1">Requiere revisión técnica</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Protocolo Activo
          </span>
          <div className="text-2xl font-bold text-blue-600 mt-1">ADMS Push</div>
          <p className="text-[11px] text-slate-500 mt-1">Cifrado TLS 1.3 / ZKTeco</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, IP, serie o sede..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={protocolFilter}
            onChange={(e) => setProtocolFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600"
          >
            <option value="all">Todos los Protocolos</option>
            <option value="ADMS">ADMS</option>
            <option value="Push SDK">Push SDK</option>
            <option value="Autónomo">Autónomo</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600"
          >
            <option value="all">Todos los Estados</option>
            <option value="online">En Línea</option>
            <option value="offline">Fuera de Línea</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Terminal & Sede</th>
                <th className="p-3.5">IP & Protocolo</th>
                <th className="p-3.5">N° Serie & Firmware</th>
                <th className="p-3.5">Usuarios / Marcaciones</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.map((device) => {
                const statusStyles = {
                  online: {
                    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                    dot: 'bg-emerald-500',
                    label: 'En Línea',
                  },
                  offline: {
                    badge: 'bg-slate-100 text-slate-600 border-slate-200',
                    dot: 'bg-slate-400',
                    label: 'Fuera de Línea',
                  },
                  error: {
                    badge: 'bg-rose-50 text-rose-700 border-rose-200/60',
                    dot: 'bg-rose-500',
                    label: 'Fallo de Red',
                  },
                }[device.estado];

                return (
                  <tr key={device.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <span className="material-symbols-outlined text-[20px]">
                            fingerprint
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{device.nombre}</p>
                          <p className="text-[11px] text-slate-500">{device.ubicacion}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <p className="font-mono font-medium text-slate-800">
                        {device.ip}
                        <span className="text-slate-400 font-normal">:{device.puerto || 4370}</span>
                      </p>
                      <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded-md">
                        {device.protocolo}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <p className="font-mono text-[11px] text-slate-700">{device.numeroSerie}</p>
                      <p className="text-[10px] text-slate-400">{device.firmware}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-slate-800">{device.conteoUsuarios} usuarios</p>
                      <p className="text-[11px] text-slate-500">
                        {device.conteoRegistros.toLocaleString()} marcas
                      </p>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyles.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`}></span>
                        {statusStyles.label}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{device.ultimoPulso}</p>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenEditDeviceModal(device)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar parámetros del terminal"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          type="button"
                          disabled={syncingDeviceId === device.id}
                          onClick={() => onSyncSingleDevice(device.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            syncingDeviceId === device.id
                              ? 'text-blue-600 bg-blue-50 cursor-wait'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                          title={syncingDeviceId === device.id ? 'Leyendo transacciones biométricas...' : 'Sincronizar huellas y marcas'}
                        >
                          <span className={`material-symbols-outlined text-[18px] ${syncingDeviceId === device.id ? 'animate-spin text-blue-600' : ''}`}>
                            sync
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onRestartDevice(device.id)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Reiniciar terminal remoto"
                        >
                          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenDeleteDeviceModal(device)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Desvincular / Eliminar terminal"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
