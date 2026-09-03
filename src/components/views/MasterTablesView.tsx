import React, { useState } from 'react';
import {
  BancoMaestro,
  TipoDocumentoMaestro,
  ConceptoRemunerativoMaestro,
} from '../../types';

export const INITIAL_BANCOS: BancoMaestro[] = [
  {
    id: 'banco-1',
    codigoSbs: '002',
    nombre: 'Banco de Crédito del Perú (BCP)',
    ruc: '20100047218',
    tipo: 'Banco Comercial',
    aplicaSueldo: true,
    aplicaCts: true,
    moneda: 'Ambas',
    formatoCci: '002-XXXXXXXXXXXX-XX',
    activo: true,
  },
  {
    id: 'banco-2',
    codigoSbs: '011',
    nombre: 'BBVA Banco Continental',
    ruc: '20100130204',
    tipo: 'Banco Comercial',
    aplicaSueldo: true,
    aplicaCts: true,
    moneda: 'Ambas',
    formatoCci: '011-XXXXXXXXXXXX-XX',
    activo: true,
  },
  {
    id: 'banco-3',
    codigoSbs: '003',
    nombre: 'Interbank (Banco Internacional del Perú)',
    ruc: '20100053455',
    tipo: 'Banco Comercial',
    aplicaSueldo: true,
    aplicaCts: true,
    moneda: 'Ambas',
    formatoCci: '003-XXXXXXXXXXXX-XX',
    activo: true,
  },
  {
    id: 'banco-4',
    codigoSbs: '009',
    nombre: 'Scotiabank Perú S.A.A.',
    ruc: '20100130204',
    tipo: 'Banco Comercial',
    aplicaSueldo: true,
    aplicaCts: true,
    moneda: 'Ambas',
    formatoCci: '009-XXXXXXXXXXXX-XX',
    activo: true,
  },
  {
    id: 'banco-5',
    codigoSbs: '018',
    nombre: 'Banco de la Nación del Perú',
    ruc: '20100030595',
    tipo: 'Banco Comercial',
    aplicaSueldo: true,
    aplicaCts: false,
    moneda: 'PEN',
    formatoCci: '018-XXXXXXXXXXXX-XX',
    activo: true,
  },
  {
    id: 'banco-6',
    codigoSbs: '101',
    nombre: 'Caja Municipal de Ahorro y Crédito Piura',
    ruc: '20144933930',
    tipo: 'Caja Municipal',
    aplicaSueldo: false,
    aplicaCts: true,
    moneda: 'Ambas',
    formatoCci: '801-XXXXXXXXXXXX-XX',
    activo: true,
  },
  {
    id: 'banco-7',
    codigoSbs: '102',
    nombre: 'Caja Municipal Arequipa',
    ruc: '20142852274',
    tipo: 'Caja Municipal',
    aplicaSueldo: false,
    aplicaCts: true,
    moneda: 'Ambas',
    formatoCci: '802-XXXXXXXXXXXX-XX',
    activo: true,
  },
  {
    id: 'banco-8',
    codigoSbs: '103',
    nombre: 'Caja Municipal Huancayo',
    ruc: '20142999968',
    tipo: 'Caja Municipal',
    aplicaSueldo: false,
    aplicaCts: true,
    moneda: 'Ambas',
    formatoCci: '803-XXXXXXXXXXXX-XX',
    activo: true,
  },
];

export const INITIAL_TIPOS_DOC: TipoDocumentoMaestro[] = [
  {
    id: 'doc-1',
    codigoSunat: '01',
    nombre: 'Documento Nacional de Identidad',
    abrev: 'DNI Perú',
    longitudExacta: 8,
    esAlfanumerico: false,
    activo: true,
  },
  {
    id: 'doc-2',
    codigoSunat: '04',
    nombre: 'Carné de Extranjería (CE)',
    abrev: 'CE',
    longitudMinima: 8,
    longitudMaxima: 12,
    esAlfanumerico: true,
    activo: true,
  },
  {
    id: 'doc-3',
    codigoSunat: '07',
    nombre: 'Pasaporte Extranjero',
    abrev: 'PASAPORTE',
    longitudMinima: 6,
    longitudMaxima: 15,
    esAlfanumerico: true,
    activo: true,
  },
  {
    id: 'doc-4',
    codigoSunat: '11',
    nombre: 'Partida de Nacimiento',
    abrev: 'P.NAC',
    longitudMinima: 5,
    longitudMaxima: 15,
    esAlfanumerico: true,
    activo: true,
  },
];

export const INITIAL_CONCEPTOS: ConceptoRemunerativoMaestro[] = [
  {
    id: 'con-1',
    codigoPlame: '0121',
    nombre: 'Remuneración o Sueldo Básico',
    categoria: 'Ingreso',
    afectoEssalud: true,
    afectoOnpAfp: true,
    afectoIr5ta: true,
    activo: true,
  },
  {
    id: 'con-2',
    codigoPlame: '0201',
    nombre: 'Asignación Familiar (Ley 25129 - 10% RMV)',
    categoria: 'Ingreso',
    afectoEssalud: true,
    afectoOnpAfp: true,
    afectoIr5ta: true,
    activo: true,
  },
  {
    id: 'con-3',
    codigoPlame: '0105',
    nombre: 'Horas Extras 25% (Primeras 2 Horas)',
    categoria: 'Ingreso',
    afectoEssalud: true,
    afectoOnpAfp: true,
    afectoIr5ta: true,
    activo: true,
  },
  {
    id: 'con-4',
    codigoPlame: '0106',
    nombre: 'Horas Extras 35% (Horas Restantes)',
    categoria: 'Ingreso',
    afectoEssalud: true,
    afectoOnpAfp: true,
    afectoIr5ta: true,
    activo: true,
  },
  {
    id: 'con-5',
    codigoPlame: '0118',
    nombre: 'Sobretasa Nocturna (35% RMV)',
    categoria: 'Ingreso',
    afectoEssalud: true,
    afectoOnpAfp: true,
    afectoIr5ta: true,
    activo: true,
  },
  {
    id: 'con-6',
    codigoPlame: '0403',
    nombre: 'Gratificación Fiestas Patrias / Navidad (Ley 27735)',
    categoria: 'Ingreso',
    afectoEssalud: false,
    afectoOnpAfp: false,
    afectoIr5ta: true,
    activo: true,
  },
  {
    id: 'con-7',
    codigoPlame: '0312',
    nombre: 'Bonificación Extraordinaria Ley 29351 (9% EsSalud)',
    categoria: 'Ingreso',
    afectoEssalud: false,
    afectoOnpAfp: false,
    afectoIr5ta: true,
    activo: true,
  },
  {
    id: 'con-8',
    codigoPlame: '0904',
    nombre: 'Compensación por Tiempo de Servicios (CTS)',
    categoria: 'Ingreso',
    afectoEssalud: false,
    afectoOnpAfp: false,
    afectoIr5ta: false,
    activo: true,
  },
  {
    id: 'con-9',
    codigoPlame: '0107',
    nombre: 'Horas Extras 100% (Trabajo en Feriado o Día de Descanso)',
    categoria: 'Ingreso',
    afectoEssalud: true,
    afectoOnpAfp: true,
    afectoIr5ta: true,
    activo: true,
  },
  {
    id: 'con-10',
    codigoPlame: '0313',
    nombre: 'Participación en las Utilidades (Decreto Legislativo 892)',
    categoria: 'Ingreso',
    afectoEssalud: false,
    afectoOnpAfp: false,
    afectoIr5ta: true,
    activo: true,
  },
  {
    id: 'con-11',
    codigoPlame: '0501',
    nombre: 'Movilidad Supeditada a la Asistencia (Condición de Trabajo)',
    categoria: 'Ingreso',
    afectoEssalud: false,
    afectoOnpAfp: false,
    afectoIr5ta: false,
    activo: true,
  },
  {
    id: 'con-12',
    codigoPlame: '0601',
    nombre: 'Aporte Mandatorio ONP / Sistema Nacional (13%)',
    categoria: 'Descuento',
    afectoEssalud: false,
    afectoOnpAfp: false,
    afectoIr5ta: false,
    activo: true,
  },
  {
    id: 'con-13',
    codigoPlame: '0606',
    nombre: 'Aporte AFP (Obligatorio 10% + Comisión + Prima)',
    categoria: 'Descuento',
    afectoEssalud: false,
    afectoOnpAfp: false,
    afectoIr5ta: false,
    activo: true,
  },
  {
    id: 'con-14',
    codigoPlame: '0605',
    nombre: 'Impuesto a la Renta de Quinta Categoría (IR 5ta)',
    categoria: 'Descuento',
    afectoEssalud: false,
    afectoOnpAfp: false,
    afectoIr5ta: false,
    activo: true,
  },
  {
    id: 'con-15',
    codigoPlame: '0602',
    nombre: 'Descuento por Tardanza / Minutos no Laborados',
    categoria: 'Descuento',
    afectoEssalud: false,
    afectoOnpAfp: false,
    afectoIr5ta: false,
    activo: true,
  },
  {
    id: 'con-16',
    codigoPlame: '0603',
    nombre: 'Descuento por Inasistencia / Faltas Injustificadas',
    categoria: 'Descuento',
    afectoEssalud: false,
    afectoOnpAfp: false,
    afectoIr5ta: false,
    activo: true,
  },
  {
    id: 'con-17',
    codigoPlame: '0609',
    nombre: 'Retención Judicial por Alimentos',
    categoria: 'Descuento',
    afectoEssalud: false,
    afectoOnpAfp: false,
    afectoIr5ta: false,
    activo: true,
  },
  {
    id: 'con-18',
    codigoPlame: '0610',
    nombre: 'Adelanto de Remuneraciones / Sueldo',
    categoria: 'Descuento',
    afectoEssalud: false,
    afectoOnpAfp: false,
    afectoIr5ta: false,
    activo: true,
  },
  {
    id: 'con-19',
    codigoPlame: '0804',
    nombre: 'Aporte Empleador EsSalud Seguro Social (9%)',
    categoria: 'Aporte Empleador',
    afectoEssalud: false,
    afectoOnpAfp: false,
    afectoIr5ta: false,
    activo: true,
  },
  {
    id: 'con-20',
    codigoPlame: '0805',
    nombre: 'Seguro Complementario de Trabajo de Riesgo (SCTR Salud / Pensión)',
    categoria: 'Aporte Empleador',
    afectoEssalud: false,
    afectoOnpAfp: false,
    afectoIr5ta: false,
    activo: true,
  },
  {
    id: 'con-21',
    codigoPlame: '0810',
    nombre: 'Seguro de Vida Ley (Decreto Legislativo 688)',
    categoria: 'Aporte Empleador',
    afectoEssalud: false,
    afectoOnpAfp: false,
    afectoIr5ta: false,
    activo: true,
  },
];

export const MasterTablesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bancos' | 'documentos' | 'conceptos'>('bancos');
  const [search, setSearch] = useState('');

  // Estados de datos
  const [bancos, setBancos] = useState<BancoMaestro[]>(INITIAL_BANCOS);
  const [tiposDoc, setTiposDoc] = useState<TipoDocumentoMaestro[]>(INITIAL_TIPOS_DOC);
  const [conceptos, setConceptos] = useState<ConceptoRemunerativoMaestro[]>(INITIAL_CONCEPTOS);

  // Estado Modal Agregar / Editar Banco
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanco, setEditingBanco] = useState<BancoMaestro | null>(null);

  // Formulario Banco
  const [formSbs, setFormSbs] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formRuc, setFormRuc] = useState('');
  const [formTipo, setFormTipo] = useState<'Banco Comercial' | 'Caja Municipal' | 'Financiera'>('Banco Comercial');
  const [formAplicaSueldo, setFormAplicaSueldo] = useState(true);
  const [formAplicaCts, setFormAplicaCts] = useState(true);
  const [formMoneda, setFormMoneda] = useState<'PEN' | 'USD' | 'Ambas'>('Ambas');

  const handleOpenAddBanco = () => {
    setEditingBanco(null);
    setFormSbs('');
    setFormNombre('');
    setFormRuc('');
    setFormTipo('Banco Comercial');
    setFormAplicaSueldo(true);
    setFormAplicaCts(true);
    setFormMoneda('Ambas');
    setIsModalOpen(true);
  };

  const handleOpenEditBanco = (b: BancoMaestro) => {
    setEditingBanco(b);
    setFormSbs(b.codigoSbs);
    setFormNombre(b.nombre);
    setFormRuc(b.ruc || '');
    setFormTipo(b.tipo);
    setFormAplicaSueldo(b.aplicaSueldo);
    setFormAplicaCts(b.aplicaCts);
    setFormMoneda(b.moneda);
    setIsModalOpen(true);
  };

  const handleSaveBanco = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim()) return;

    if (editingBanco) {
      setBancos(
        bancos.map((b) =>
          b.id === editingBanco.id
            ? {
                ...b,
                codigoSbs: formSbs.trim() || '000',
                nombre: formNombre.trim(),
                ruc: formRuc.trim() || undefined,
                tipo: formTipo,
                aplicaSueldo: formAplicaSueldo,
                aplicaCts: formAplicaCts,
                moneda: formMoneda,
              }
            : b
        )
      );
    } else {
      const newBanco: BancoMaestro = {
        id: `banco-${Date.now()}`,
        codigoSbs: formSbs.trim() || '000',
        nombre: formNombre.trim(),
        ruc: formRuc.trim() || undefined,
        tipo: formTipo,
        aplicaSueldo: formAplicaSueldo,
        aplicaCts: formAplicaCts,
        moneda: formMoneda,
        activo: true,
      };
      setBancos([...bancos, newBanco]);
    }

    setIsModalOpen(false);
  };

  const handleToggleBanco = (id: string) => {
    setBancos(
      bancos.map((b) => (b.id === id ? { ...b, activo: !b.activo } : b))
    );
  };

  const handleToggleDoc = (id: string) => {
    setTiposDoc(
      tiposDoc.map((d) => (d.id === id ? { ...d, activo: !d.activo } : d))
    );
  };

  const handleToggleConcepto = (id: string) => {
    setConceptos(
      conceptos.map((c) => (c.id === id ? { ...c, activo: !c.activo } : c))
    );
  };

  const filteredBancos = bancos.filter(
    (b) =>
      b.nombre.toLowerCase().includes(search.toLowerCase()) ||
      b.codigoSbs.includes(search)
  );

  const filteredDocs = tiposDoc.filter((d) =>
    d.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const filteredConceptos = conceptos.filter(
    (c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.codigoPlame.includes(search)
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-600 text-[28px]">database</span>
            Módulo de Tablas Maestras del Sistema
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gestión centralizada de entidades financieras, tipos de documento de identidad y conceptos SUNAT PLAME.
          </p>
        </div>

        {activeTab === 'bancos' && (
          <button
            type="button"
            onClick={handleOpenAddBanco}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">account_balance</span>
            Añadir Banco / Caja CTS
          </button>
        )}
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <span className="material-symbols-outlined text-[22px]">account_balance</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Entidades Financieras</p>
            <p className="text-xl font-extrabold text-slate-900 font-headline">{bancos.length} Entidades</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <span className="material-symbols-outlined text-[22px]">badge</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tipos de Documentos</p>
            <p className="text-xl font-extrabold text-emerald-600 font-headline">{tiposDoc.length} Tipos</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <span className="material-symbols-outlined text-[22px]">payments</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Conceptos PLAME (Tabla 22)</p>
            <p className="text-xl font-extrabold text-purple-600 font-headline">{conceptos.length} Conceptos</p>
          </div>
        </div>
      </div>

      {/* Pestañas de Navegación del Módulo */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('bancos')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'bancos'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">account_balance</span>
          Bancos y Cajas CTS ({bancos.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('documentos')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'documentos'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">badge</span>
          Tipos de Documento SUNAT ({tiposDoc.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('conceptos')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'conceptos'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          Conceptos Remunerativos SUNAT PLAME ({conceptos.length})
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código SBS/PLAME, nombre o RUC..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* PESTAÑA 1: BANCOS Y CAJAS CTS */}
      {activeTab === 'bancos' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Cód. SBS</th>
                  <th className="p-3.5">Entidad Financiera</th>
                  <th className="p-3.5">Tipo de Entidad</th>
                  <th className="p-3.5">Pago Sueldos</th>
                  <th className="p-3.5">Depósito CTS</th>
                  <th className="p-3.5">Monedas</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBancos.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-700">{b.codigoSbs}</td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{b.nombre}</p>
                      {b.ruc && <p className="text-[11px] text-slate-400 font-mono">RUC: {b.ruc}</p>}
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">{b.tipo}</td>
                    <td className="p-3.5">
                      {b.aplicaSueldo ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px] font-bold border border-emerald-200">
                          <span className="material-symbols-outlined text-[14px]">check</span> Sí
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">No</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {b.aplicaCts ? (
                        <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-[10px] font-bold border border-blue-200">
                          <span className="material-symbols-outlined text-[14px]">check</span> Sí
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">No</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] font-semibold text-slate-800">{b.moneda}</td>
                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleBanco(b.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                          b.activo
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${b.activo ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {b.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEditBanco(b)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Editar Entidad"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: TIPOS DE DOCUMENTO */}
      {activeTab === 'documentos' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Cód. SUNAT</th>
                  <th className="p-3.5">Nombre del Documento</th>
                  <th className="p-3.5">Abreviatura</th>
                  <th className="p-3.5">Regla de Longitud</th>
                  <th className="p-3.5">Tipo Caracteres</th>
                  <th className="p-3.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-700">{d.codigoSunat}</td>
                    <td className="p-3.5 font-bold text-slate-900">{d.nombre}</td>
                    <td className="p-3.5 font-medium text-slate-700">{d.abrev}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-800">
                      {d.longitudExacta
                        ? `Exactamente ${d.longitudExacta} dígitos`
                        : `Entre ${d.longitudMinima} y ${d.longitudMaxima} caracteres`}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {d.esAlfanumerico ? 'Alfanumérico (A-Z, 0-9)' : 'Solo Numérico (0-9)'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleDoc(d.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                          d.activo
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {d.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: CONCEPTOS SUNAT PLAME */}
      {activeTab === 'conceptos' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Cód. PLAME</th>
                  <th className="p-3.5">Denominación del Concepto</th>
                  <th className="p-3.5">Categoría</th>
                  <th className="p-3.5">EsSalud (9%)</th>
                  <th className="p-3.5">ONP / AFP</th>
                  <th className="p-3.5">Renta 5ta</th>
                  <th className="p-3.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredConceptos.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-blue-700 bg-blue-50/40">{c.codigoPlame}</td>
                    <td className="p-3.5 font-bold text-slate-900">{c.nombre}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                          c.categoria === 'Ingreso'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : c.categoria === 'Descuento'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {c.categoria}
                      </span>
                    </td>
                    <td className="p-3.5">{c.afectoEssalud ? 'Afecto' : 'Inafecto'}</td>
                    <td className="p-3.5">{c.afectoOnpAfp ? 'Afecto' : 'Inafecto'}</td>
                    <td className="p-3.5">{c.afectoIr5ta ? 'Afecto' : 'Inafecto'}</td>
                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleConcepto(c.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                          c.activo
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {c.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR BANCO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-headline flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">account_balance</span>
                {editingBanco ? 'Editar Entidad Financiera' : 'Registrar Nueva Entidad Financiera'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveBanco} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nombre de la Entidad *</label>
                <input
                  type="text"
                  required
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  placeholder="Ej: Caja Municipal Arequipa"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Código SBS</label>
                  <input
                    type="text"
                    value={formSbs}
                    onChange={(e) => setFormSbs(e.target.value)}
                    placeholder="Ej: 102"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">RUC Entidad</label>
                  <input
                    type="text"
                    value={formRuc}
                    onChange={(e) => setFormRuc(e.target.value)}
                    placeholder="Ej: 20142852274"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tipo de Entidad</label>
                  <select
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-600"
                  >
                    <option value="Banco Comercial">Banco Comercial</option>
                    <option value="Caja Municipal">Caja Municipal</option>
                    <option value="Financiera">Financiera</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Monedas Soportadas</label>
                  <select
                    value={formMoneda}
                    onChange={(e) => setFormMoneda(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-600"
                  >
                    <option value="Ambas">Soles (PEN) & Dólares (USD)</option>
                    <option value="PEN">Solo Soles (PEN)</option>
                    <option value="USD">Solo Dólares (USD)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formAplicaSueldo}
                    onChange={(e) => setFormAplicaSueldo(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  Pago de Sueldo
                </label>

                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formAplicaCts}
                    onChange={(e) => setFormAplicaCts(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  Depósito CTS
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer"
                >
                  Guardar Entidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
