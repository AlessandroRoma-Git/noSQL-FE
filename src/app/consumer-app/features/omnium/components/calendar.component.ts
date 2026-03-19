import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Match } from '../services/store.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto card-soft p-10 animate-soft-in border-white/10 text-center shadow-2xl bg-[#0a0a0f]/80 rounded-[2.5rem]">
      <!-- Header Calendario -->
      <div class="flex justify-between items-center mb-12 border-b border-white/5 pb-8 font-black italic">
        <button (click)="prevMonth()" class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 shadow-inner">&larr;</button>
        <h3 class="text-3xl font-black text-white uppercase tracking-tighter gaming-font leading-none text-center">{{ monthLabel() }}</h3>
        <button (click)="nextMonth()" class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 shadow-inner">&rarr;</button>
      </div>

      <!-- Giorni della Settimana -->
      <div class="grid grid-cols-7 gap-4 md:gap-6 text-center mb-6 font-black italic">
        @for (day of ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']; track day) {
          <div class="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">{{ day }}</div>
        }
      </div>

      <!-- Griglia Giorni -->
      <div class="grid grid-cols-7 gap-4 md:gap-6 italic">
        @for (day of calendarDays(); track $index) {
          @if (day.day === null) {
            <div class="aspect-square bg-white/[0.01] rounded-3xl opacity-10"></div>
          } @else {
            <div class="aspect-square bg-black/40 border border-white/5 rounded-3xl p-3 relative hover:bg-white/[0.05] transition-all group overflow-hidden shadow-inner text-left">
              <span class="text-[10px] font-mono font-black text-gray-600 absolute top-3 right-4 group-hover:text-cyan-400 transition-colors">{{ day.day }}</span>
              <div class="mt-6 space-y-1.5">
                @for (m of day.matches; track m.id) {
                  <div (click)="canEdit ? onEdit.emit(m) : null" 
                       class="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[8px] font-black uppercase truncate text-cyan-400 cursor-pointer hover:bg-cyan-500 hover:text-black transition-all">
                    {{ m.teamA }} VS {{ m.teamB }}
                  </div>
                }
              </div>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class CalendarComponent {
  @Input() matches: Match[] = [];
  @Input() canEdit: boolean = false;
  @Output() onEdit = new EventEmitter<Match>();

  currentDate = signal(new Date());

  monthLabel = computed(() => 
    this.currentDate().toLocaleString('default', { month: 'long', year: 'numeric' })
  );

  calendarDays = computed(() => {
    const curr = this.currentDate();
    const year = curr.getFullYear();
    const month = curr.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); 
    
    const days: { day: number | null, matches: Match[] }[] = [];
    
    // Pad empty days
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, matches: [] });
    }
    
    // Fill month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayMatches = this.matches.filter(m => m.date.startsWith(dateStr));
      days.push({ day: i, matches: dayMatches });
    }
    
    return days;
  });

  prevMonth() { this.currentDate.update(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)); }
  nextMonth() { this.currentDate.update(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)); }
}
