import React, { useState } from 'react';
import { DiaFestivo } from '../../types';

interface ManageHolidaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  holidays: DiaFestivo[];
  onAddHoliday: (holiday: { name: string; date: string; isRecurring: boolean }) => void;
  onUpdateHoliday: (holiday: DiaFestivo) => void;
  onDeleteHoliday: (id: number | string) => void;
}

export const ManageHolidaysModal: React.FC<ManageHolidaysModalProps> = ({
  isOpen,
  onClose,
  holidays,
  onAddHoliday,
  onUpdateHoliday,
  onDeleteHoliday,
}) => {
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editRecurring, setEditRecurring] = useState(true);

  // Form for new holiday
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('2026-10-08');
  const [newRecurring, setNewRecurring] = useState(true);

  if (!isOpen) return null;

  const handleStartEdit = (h: DiaFestivo) => {
    setEditingId(h.id ?? h.fecha);
    setEditName(h.nombre);
    setEditDate(h.fecha);
    setEditRecurring(h.esRecurrente);
  };

  const handleSaveEdit = (h: DiaFestivo) => {
    if (!editName.trim() || !editDate.trim()) return;
    onUpdateHoliday({
      ...h,
      nombre: editName,
      fecha: editDate,
      esRecurrente: editRecurring,
    });
    setEditingId(null);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDate.trim()) return;
    onAddHoliday({
      name: newName,
      date: newDate,
      isRecurring: newRecurring,
    });
    setNewName('');
    setIsAddingNew(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[24px]">event_available</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-headline">
                Gestión de Días Festivos y Feriados (Perú)
              </h3>
              <p className="text-xs text-slate-500">
                Administrar calendario de días no laborables y exclusiones de tardanza.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Add Button & New Form */}
        <div className="py-3 border-b border-slate-100">
          {!isAddingNew ? (
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-blue-200"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              Añadir Nuevo Feriado o Día No Laborable
            </button>
          ) : (
            <form onSubmit={handleCreateNew} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-800 text-xs">Nuevo Día Festivo</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Nombre de la festividad..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-600"
                />
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-600"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700">
                <input
                  type="checkbox"
                  checked={newRecurring}
                  onChange={(e) => setNewRecurring(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Repetir anualmente en el calendario</span>
              </label>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">save</span>
                  Guardar Festivo
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Holidays List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-2">
          {holidays.map((h, index) => {
            const isEditing = editingId === (h.id ?? h.fecha);
            return (
              <div
                key={h.id ?? `${h.fecha}-${index}`}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                {isEditing ? (
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600"
                      />
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editRecurring}
                          onChange={(e) => setEditRecurring(e.target.checked)}
                          className="rounded text-blue-600"
                        />
                        <span>Recurrente</span>
                      </label>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-[11px]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(h)}
                          className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[11px] font-bold"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{h.nombre}</p>
                      <p className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                        <span>Fecha: {h.fecha}</span>
                        {h.esRecurrente && (
                          <span className="text-[10px] text-blue-600 font-semibold">• Anual</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(h)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar festivo"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteHoliday(h.id ?? h.fecha)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar festivo"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>{holidays.length} días festivos oficiales</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
