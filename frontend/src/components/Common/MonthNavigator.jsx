import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function MonthNavigator({ currentDate, onDateChange }) {
  const [showPicker, setShowPicker] = useState(false);

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const selectMonth = (monthIndex) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    onDateChange(newDate);
    setShowPicker(false);
  };

  const goToToday = () => {
    onDateChange(new Date());
    setShowPicker(false);
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return currentDate.getMonth() === now.getMonth() &&
           currentDate.getFullYear() === now.getFullYear();
  };

  return (
    <div className="relative inline-flex w-full sm:w-auto">
      <div className="flex w-full flex-wrap items-center gap-2 rounded-[24px] border border-slate-200/80 bg-white/88 p-2 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:w-auto sm:flex-nowrap">
        <button
          onClick={goToPreviousMonth}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100/90 text-slate-600 transition-colors hover:bg-slate-200"
          title="Mois précédent"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 font-semibold text-slate-800 transition-colors hover:bg-slate-100 sm:min-w-[12rem] sm:flex-none sm:justify-start"
        >
          <Calendar className="w-5 h-5 text-sky-600" />
          <span className="truncate">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
        </button>

        <button
          onClick={goToNextMonth}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100/90 text-slate-600 transition-colors hover:bg-slate-200"
          title="Mois suivant"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        
        {!isCurrentMonth() && (
          <button
            onClick={goToToday}
            className="w-full rounded-xl bg-sky-100 px-3 py-2 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-200 sm:w-auto"
          >
            Aujourd'hui
          </button>
        )}
      </div>

      {showPicker && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPicker(false)}
          />
          <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-50 rounded-[24px] border border-slate-200 bg-white/95 p-4 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.4)] backdrop-blur-md sm:left-auto sm:right-0 sm:w-[360px]">
            <div className="mb-3">
              <p className="mb-2 text-sm font-semibold text-slate-700">Sélectionner un mois</p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {months.map((month, index) => {
                const isSelected = index === currentDate.getMonth();
                const now = new Date();
                const isCurrent = index === now.getMonth() &&
                                 currentDate.getFullYear() === now.getFullYear();

                return (
                  <button
                    key={month}
                    onClick={() => selectMonth(index)}
                    className={`p-3 rounded-lg font-medium transition-all ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-md'
                        : isCurrent
                        ? 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {month.substring(0, 3).toUpperCase()}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 border-t border-slate-200 pt-3">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setFullYear(newDate.getFullYear() - 1);
                    onDateChange(newDate);
                  }}
                  className="flex-1 rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-slate-200"
                >
                  {currentDate.getFullYear() - 1}
                </button>
                <button
                  className="flex-1 rounded-lg bg-sky-100 px-3 py-2.5 text-sm font-semibold text-sky-700"
                >
                  {currentDate.getFullYear()}
                </button>
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setFullYear(newDate.getFullYear() + 1);
                    onDateChange(newDate);
                  }}
                  className="flex-1 rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-slate-200"
                >
                  {currentDate.getFullYear() + 1}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
