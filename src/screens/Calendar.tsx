import React, { useState } from 'react';
import { format, isToday, isThisMonth, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { useCalendar, CalendarEvent } from '../hooks/useCalendar';
import Button from '../components/shared/Button';
import 'react-day-picker/dist/style.css';

const Calendar: React.FC = () => {
  const { profile, loading: userLoading } = useUser();
  const { events, loading: eventsLoading, addEvent, deleteEvent } = useCalendar(profile?.calendarId || null);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date(),
    allDay: true,
  });
  
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addEvent({
        title: newEvent.title,
        description: newEvent.description,
        date: selectedDate || new Date(),
        allDay: newEvent.allDay,
        tags: [],
      });
      
      setNewEvent({
        title: '',
        description: '',
        date: new Date(),
        allDay: true,
      });
      setShowAddEvent(false);
    } catch (error) {
      console.error('Error al agregar evento:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
    } catch (error) {
      console.error('Error al eliminar evento:', error);
    }
  };
  
  const selectedDateEvents = events.filter(event => 
    selectedDate && format(event.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );
  
  const renderEventMarker = (date: Date) => {
    const dayEvents = events.filter(
      event => format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    
    if (dayEvents.length > 0) {
      return (
        <div className="flex justify-center">
          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
        </div>
      );
    }
    
    return null;
  };
  
  const dayPickerClassNames = {
    months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
    month: 'space-y-4',
    caption: 'flex justify-center pt-1 relative items-center',
    caption_label: 'text-sm font-medium text-gray-900 dark:text-gray-100',
    nav: 'space-x-1 flex items-center',
    nav_button: 'inline-flex p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
    nav_button_previous: 'absolute left-1',
    nav_button_next: 'absolute right-1',
    table: 'w-full border-collapse',
    head_row: 'flex',
    head_cell: 'w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 text-sm rounded-md',
    row: 'flex w-full mt-2',
    cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-primary-50 dark:[&:has([aria-selected])]:bg-primary-900/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
    day: 'h-10 w-10 p-0 font-normal flex items-center justify-center rounded-md aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800',
    day_selected: 'bg-primary-500 text-white hover:bg-primary-600 hover:text-white focus:bg-primary-500 focus:text-white',
    day_today: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white',
    day_outside: 'text-gray-400 dark:text-gray-600 opacity-50',
    day_disabled: 'text-gray-400 dark:text-gray-600',
    day_range_middle: 'aria-selected:bg-primary-50 aria-selected:text-primary-600 dark:aria-selected:bg-primary-900/20 dark:aria-selected:text-primary-300',
    day_hidden: 'invisible',
  };

  if (userLoading || eventsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-primary-400 dark:bg-primary-600 mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!profile?.partnerId) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Conecta con tu pareja
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
          Para usar el calendario compartido, necesitas conectarte con tu pareja. Ve al perfil para enviar una invitación.
        </p>
        <Button
          onClick={() => window.location.href = '/profile'}
          size="lg"
        >
          Ir al Perfil
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {selectedDate 
                ? format(selectedDate, 'MMMM yyyy', { locale: es }) 
                : format(new Date(), 'MMMM yyyy', { locale: es })}
            </h2>
            <Button
              onClick={() => {
                setSelectedDate(new Date());
                setShowAddEvent(true);
              }}
              icon={<Plus className="h-4 w-4" />}
              size="sm"
            >
              Agregar Evento
            </Button>
          </div>
          
          <div className="calendar-container">
            <style jsx>{`
              .rdp {
                --rdp-cell-size: 40px;
                --rdp-caption-font-size: 16px;
                --rdp-accent-color: rgb(244, 63, 94);
                --rdp-background-color: rgba(244, 63, 94, 0.1);
                --rdp-accent-color-dark: rgb(244, 63, 94);
                --rdp-background-color-dark: rgba(244, 63, 94, 0.2);
                margin: 0;
              }
            `}</style>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              showOutsideDays
              locale={es}
              classNames={dayPickerClassNames}
              components={{
                DayContent: ({ date, displayMonth }) => (
                  <div className="relative flex flex-col items-center justify-center w-full h-full">
                    <span
                      className={`${
                        isToday(date) 
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium' 
                          : ''
                      } flex items-center justify-center h-8 w-8 rounded-full`}
                    >
                      {format(date, 'd')}
                    </span>
                    {isThisMonth(date, displayMonth) && renderEventMarker(date)}
                  </div>
                ),
              }}
            />
          </div>
        </div>
        
        <div className="lg:w-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {selectedDate ? format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }) : 'Selecciona una fecha'}
            </h2>
            {selectedDate && (
              <Button 
                onClick={() => setShowAddEvent(true)}
                icon={<Plus className="h-4 w-4" />}
                size="sm"
                variant="ghost"
              >
                Agregar
              </Button>
            )}
          </div>
          
          {selectedDateEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedDateEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {event.allDay 
                          ? 'Todo el día' 
                          : format(event.date, 'h:mm a')}
                      </span>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1"
                        title="Eliminar evento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {event.description && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {event.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Agregado por {event.createdBy === profile?.uid ? 'ti' : 'tu pareja'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {selectedDate 
                  ? 'No hay eventos programados para este día' 
                  : 'Selecciona una fecha para ver eventos'}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de Agregar Evento */}
      {showAddEvent && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full animate-fade-in">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Agregar Evento para {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
              </h3>
            </div>
            
            <form onSubmit={handleCreateEvent}>
              <div className="p-4 space-y-4">
                <div>
                  <label 
                    htmlFor="title" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Título del Evento*
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="description" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allDay"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                    checked={newEvent.allDay}
                    onChange={(e) => setNewEvent({...newEvent, allDay: e.target.checked})}
                  />
                  <label 
                    htmlFor="allDay" 
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Todo el día
                  </label>
                </div>
                
                {!newEvent.allDay && (
                  <div>
                    <label 
                      htmlFor="time" 
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Hora
                    </label>
                    <input
                      type="time"
                      id="time"
                      className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  variant="ghost"
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Agregar Evento
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;