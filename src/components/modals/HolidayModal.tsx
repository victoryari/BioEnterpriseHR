import React, { useState } from 'react';

interface HolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHoliday: (holiday: { name: string; date: string; isRecurring: boolean }) => void;
}

export const HolidayModal: React.FC<HolidayModalProps> = ({
  isOpen,
  onClose,
  onAddHoliday,
}) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('2026-10-08');
  const [isRecurring, setIsRecurring] = useState(true);

  React.useEffect(() => {
    if (isOpen) {
      setName('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsRecurring(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddHoliday({ name, date, isRecurring });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[24px]">event</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-headline">Registrar Día Festivo (Perú)</h3>
              <p className="text-xs text-slate-500">
                Excluir del cálculo de inasistencias y tardanzas de personal.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Nombre de la Festividad *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Combate de Angamos / Fiestas Patrias"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 focus:border-blue-600 focus:bg-white outline-none transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Fecha *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 focus:border-blue-600 focus:bg-white outline-none transition-all"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded text-blue-600"
            />
            <span className="text-xs text-slate-800">Repetir anualmente en el calendario</span>
          </label>

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
              <span className="material-symbols-outlined text-[16px]">check</span>
              Guardar Festivo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
