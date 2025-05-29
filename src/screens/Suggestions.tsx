import React, { useState } from 'react';
import { Lightbulb, Gift, Calendar, DollarSign, MapPin, Tag } from 'lucide-react';
import { getDateSuggestion } from '../services/openai';
import { useNavigate } from 'react-router-dom';
import Button from '../components/shared/Button';

const OCCASIONS = [
  { id: 'anniversary', label: 'Aniversario' },
  { id: 'birthday', label: 'Cumpleaños' },
  { id: 'date-night', label: 'Cita Romántica' },
  { id: 'weekend', label: 'Actividad de Fin de Semana' },
  { id: 'surprise', label: 'Sorpresa' },
];

const BUDGETS = [
  { id: 'free', label: 'Gratis' },
  { id: 'budget', label: 'Económico' },
  { id: 'moderate', label: 'Moderado' },
  { id: 'luxury', label: 'Lujo' },
];

interface Suggestion {
  title: string;
  description: string;
  image: string;
}

const Suggestions: React.FC = () => {
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const navigate = useNavigate();
  
  const handleGetSuggestion = async () => {
    setLoading(true);
    
    try {
      const interestsList = interests
        .split(',')
        .map(i => i.trim())
        .filter(i => i);
      
      const newSuggestion = await getDateSuggestion({
        occasion,
        budget,
        location,
        interests: interestsList,
      });
      
      setSuggestions([newSuggestion, ...suggestions.slice(0, 2)]);
    } catch (error) {
      console.error('Error al obtener sugerencia:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveToCalendar = (suggestion: Suggestion) => {
    navigate('/calendar', {
      state: {
        newEvent: {
          title: suggestion.title,
          description: suggestion.description,
          allDay: true,
          date: new Date()
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center mb-6">
          <Lightbulb className="h-6 w-6 text-primary-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Generador de Ideas para Citas
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ocasión
            </label>
            <div className="grid grid-cols-2 gap-2">
              {OCCASIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    occasion === item.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-800'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-transparent'
                  }`}
                  onClick={() => setOccasion(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Presupuesto
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BUDGETS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    budget === item.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-800'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-transparent'
                  }`}
                  onClick={() => setBudget(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label 
              htmlFor="location" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Ubicación (opcional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="location"
                className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ciudad o región"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label 
              htmlFor="interests" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Intereses (opcional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="interests"
                className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="senderismo, cocina, arte (separados por comas)"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Button
            onClick={handleGetSuggestion}
            size="lg"
            loading={loading}
            icon={<Lightbulb className="h-5 w-5" />}
          >
            Generar Idea para Cita
          </Button>
        </div>
      </div>
      
      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-transform hover:scale-[1.02]"
            >
              <img 
                src={suggestion.image} 
                alt={suggestion.title} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {suggestion.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {suggestion.description}
                </p>
                <Button
                  onClick={() => handleSaveToCalendar(suggestion)}
                  variant="outline"
                  size="sm"
                  fullWidth
                  icon={<Calendar className="h-4 w-4" />}
                >
                  Agregar al Calendario
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {suggestions.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <Gift className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aún no hay sugerencias
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Completa el formulario anterior para generar ideas personalizadas para ti y tu pareja.
          </p>
        </div>
      )}
    </div>
  );
};

export default Suggestions;