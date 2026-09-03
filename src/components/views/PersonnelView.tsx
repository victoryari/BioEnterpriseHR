import React, { useState } from 'react';
import { Empleado, Sede, Departamento, EMPRESAS_GRUPO_CARMELITA } from '../../types';
import { EmployeeDetailModal } from '../modals/EmployeeDetailModal';

interface PersonnelViewProps {
  employees: Empleado[];
  sedes: Sede[];
  departamentos: Departamento[];
  selectedEmployee: Empleado | null;
  onSelectEmployee: (emp: Empleado) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (emp: Empleado) => void;
  onOpenDeleteModal: (emp: Empleado) => void;
  onOpenDeactivationHistory: () => void;
  onOpenManageOrgsModal: () => void;
  onToggleAccess: (
    employeeId: string,
    door: 'entradaPrincipal' | 'centroDatos' | 'almacen'
  ) => void;
  onToggleStatus: (employeeId: string) => void;
  onReEnrollBiometric: (employeeId: string, type: 'huella' | 'rostro') => void;
  onSyncEmployee: (employeeId: string) => void;
  onNavigateToSelfService?: () => void;
}

export const PersonnelView: React.FC<PersonnelViewProps> = ({
  employees,
  sedes,
  departamentos,
  selectedEmployee,
  onSelectEmployee,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onOpenDeactivationHistory,
  onOpenManageOrgsModal,
  onToggleAccess,
  onToggleStatus,
  onReEnrollBiometric,
  onSyncEmployee,
  onNavigateToSelfService,
}) => {
  const [search, setSearch] = useState('');
  const [siteFilter, setSiteFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Activo' | 'Inactivo'>('all');
  const [detailEmployee, setDetailEmployee] = useState<Empleado | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.nombre.toLowerCase().includes(search.toLowerCase()) ||
      emp.pin.includes(search) ||
      (emp.numeroDocumento && emp.numeroDocumento.includes(search)) ||
      emp.correo.toLowerCase().includes(search.toLowerCase()) ||
      emp.cargo.toLowerCase().includes(search.toLowerCase());
    const matchesSite = siteFilter === 'all' || emp.sede === siteFilter;
    const matchesDept = deptFilter === 'all' || emp.departamento === deptFilter;
    const matchesCompany =
      companyFilter === 'all' ||
      (emp.empresa || 'Importaciones Carmelita del Norte S.A.C.') === companyFilter;
    const matchesStatus = statusFilter === 'all' || (emp.estado || 'Activo') === statusFilter;
    return matchesSearch && matchesSite && matchesDept && matchesCompany && matchesStatus;
  });

  const activeEmployee = selectedEmployee || employees[0] || null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-slate-900 tracking-tight">
            Módulo de Personal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gestión de colaboradores en Perú, documentos (DNI/CE), biometría y accesos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onOpenManageOrgsModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-600">apartment</span>
            Sedes y Áreas
          </button>
          <button
            onClick={onOpenDeactivationHistory}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-rose-500">history</span>
            Historial de Bajas
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Añadir Colaborador
          </button>
        </div>
      </div>

      {/* Contenedor de Ancho Completo (100% W) */}
      <div className="space-y-4 w-full">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-2.5 items-center justify-between">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por DNI, nombre, PIN o correo..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-2xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 font-medium cursor-pointer"
              >
                <option value="all">Todas las Empresas ({EMPRESAS_GRUPO_CARMELITA.length})</option>
                {EMPRESAS_GRUPO_CARMELITA.map((emp) => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </select>

              <select
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="all">Todas las Sedes ({sedes.length})</option>
                {sedes.map((s) => (
                  <option key={s.id} value={s.nombre}>
                    {s.nombre} ({s.ciudad})
                  </option>
                ))}
              </select>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="all">Todos los Deptos ({departamentos.length})</option>
                {departamentos.map((d) => (
                  <option key={d.id} value={d.nombre}>
                    {d.nombre}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Activo' | 'Inactivo')}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 font-bold cursor-pointer"
              >
                <option value="all">Todos los Estados</option>
                <option value="Activo">🟢 Solo Activos</option>
                <option value="Inactivo">🔴 Solo Inactivos (Bajas)</option>
              </select>
            </div>
          </div>

          {/* Personnel Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Colaborador / DNI</th>
                    <th className="p-3">Cargo & Sede</th>
                    <th className="p-3">Empresa</th>
                    <th className="p-3 text-center">Métodos de Marcado</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((emp) => {
                    const isSelected = activeEmployee?.id === emp.id;
                    return (
                      <tr
                        key={emp.id}
                        onClick={() => onSelectEmployee(emp)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/70 font-medium' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            {emp.foto ? (
                              <img
                                alt={emp.nombre}
                                src={emp.foto}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                                {emp.nombre.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-800 text-xs leading-tight">
                                {emp.nombre}
                              </p>
                              <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                                <span>PIN: {emp.pin}</span>
                                {emp.numeroDocumento && (
                                  <span className="text-blue-600 font-semibold">
                                    • {emp.tipoDocumento || 'DNI'}: {emp.numeroDocumento}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="text-xs text-slate-800 font-semibold">{emp.cargo}</p>
                          <p className="text-[11px] text-slate-500">
                            {emp.departamento} • {emp.sede}
                          </p>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              (emp.empresa || '').includes('Carmelita')
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : (emp.empresa || '').includes('Chemmer')
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : (emp.empresa || '').includes('León') || (emp.empresa || '').includes('Leon')
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {emp.empresa || 'Importaciones Carmelita del Norte S.A.C.'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            {/* Huella */}
                            <span
                              title={
                                emp.biometriaHuella
                                  ? `Huella Biométrica: ${emp.conteoHuellas} enroladas`
                                  : 'Sin Huella enrolada'
                              }
                              className={`material-symbols-outlined text-[17px] ${
                                emp.biometriaHuella ? 'text-emerald-600' : 'text-slate-300'
                              }`}
                            >
                              fingerprint
                            </span>

                            {/* Tarjeta RFID */}
                            <span
                              title={
                                emp.tarjetaRfid
                                  ? `Tarjeta RFID asignada: ${emp.numeroTarjeta || 'Activa'}`
                                  : 'Sin Tarjeta RFID'
                              }
                              className={`material-symbols-outlined text-[17px] ${
                                emp.tarjetaRfid ? 'text-blue-600' : 'text-slate-300'
                              }`}
                            >
                              badge
                            </span>

                            {/* PIN de Teclado */}
                            <span
                              title={
                                emp.pin
                                  ? `Marcado por PIN en Teclado: ${emp.pin}`
                                  : 'Sin PIN'
                              }
                              className={`material-symbols-outlined text-[17px] ${
                                emp.pin ? 'text-amber-600' : 'text-slate-300'
                              }`}
                            >
                              dialpad
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              emp.estado === 'Activo'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                : 'bg-rose-50 text-rose-700 border-rose-200/60'
                            }`}
                          >
                            {emp.estado}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailEmployee(emp);
                                setIsDetailModalOpen(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Ver Ficha / Detalle Completo"
                            >
                              <span className="material-symbols-outlined text-[17px]">visibility</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenEditModal(emp);
                              }}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Editar Ficha"
                            >
                              <span className="material-symbols-outlined text-[17px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenDeleteModal(emp);
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar Colaborador"
                            >
                              <span className="material-symbols-outlined text-[17px]">delete</span>
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

      {/* Modal Ficha Completa del Colaborador */}
      <EmployeeDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        employee={detailEmployee}
        onOpenEditModal={onOpenEditModal}
        onToggleAccess={onToggleAccess}
        onReEnrollBiometric={onReEnrollBiometric}
        onSyncEmployee={onSyncEmployee}
      />
    </div>
  );
};
