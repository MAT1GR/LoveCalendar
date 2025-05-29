import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db, auth, deleteCalendarEvent } from '../services/firebase';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  allDay: boolean;
  tags?: string[];
  createdBy: string;
  createdAt: Date;
}

export function useCalendar(calendarId: string | null) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!calendarId) {
      setLoading(false);
      return;
    }

    const fetchCalendar = async () => {
      try {
        const calendarRef = doc(db, 'calendars', calendarId);
        const calendarSnap = await getDoc(calendarRef);
        
        if (calendarSnap.exists()) {
          const calendarData = calendarSnap.data();
          
          const formattedEvents = calendarData.events.map((event: any) => ({
            ...event,
            date: event.date.toDate(),
            endDate: event.endDate ? event.endDate.toDate() : undefined,
            createdAt: event.createdAt.toDate(),
          }));
          
          setEvents(formattedEvents);
        } else {
          setError(new Error('Calendario no encontrado'));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [calendarId]);

  const addEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdBy' | 'createdAt'>) => {
    if (!calendarId || !auth.currentUser) {
      throw new Error('Debes iniciar sesión y tener un calendario');
    }

    try {
      const newEvent: CalendarEvent = {
        ...eventData,
        id: crypto.randomUUID(),
        createdBy: auth.currentUser.uid,
        createdAt: new Date(),
      };

      const calendarRef = doc(db, 'calendars', calendarId);
      
      const firestoreEvent = {
        ...newEvent,
        date: Timestamp.fromDate(newEvent.date),
        endDate: newEvent.endDate ? Timestamp.fromDate(newEvent.endDate) : null,
        createdAt: Timestamp.fromDate(newEvent.createdAt),
      };

      await updateDoc(calendarRef, {
        events: arrayUnion(firestoreEvent)
      });

      setEvents((prevEvents) => [...prevEvents, newEvent]);
      
      return newEvent;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al agregar evento'));
      throw err;
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!calendarId) {
      throw new Error('Calendario no encontrado');
    }

    try {
      await deleteCalendarEvent(calendarId, eventId);
      setEvents((prevEvents) => prevEvents.filter(event => event.id !== eventId));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al eliminar evento'));
      throw err;
    }
  };

  return { events, loading, error, addEvent, deleteEvent };
}