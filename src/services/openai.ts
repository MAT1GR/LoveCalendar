// Note: This should be moved to a backend service in production
// For demo purposes, we're implementing it on the client side
// In a real app, you should never expose your API key on the client side

interface SuggestionOptions {
  occasion?: string;
  budget?: string;
  location?: string;
  interests?: string[];
}

export async function getDateSuggestion(options: SuggestionOptions) {
  try {
    // In a real app, this would be an API call to your backend
    // Your backend would then call OpenAI with your API key
    
    // For now, we'll simulate a response
    const simulatedResponse = {
      title: `${options.occasion || 'Date'} Idea`,
      description: getSimulatedSuggestion(options),
      image: getRandomImageUrl(),
    };
    
    return simulatedResponse;
  } catch (error) {
    console.error('Error getting suggestion:', error);
    throw error;
  }
}

// This is a placeholder function that will be replaced by a real API call in production
function getSimulatedSuggestion(options: SuggestionOptions): string {
  const occasions = {
    anniversary: [
      "Book a private chef to recreate your first date meal",
      "Create a scrapbook of your relationship milestones",
      "Take a dance class together",
    ],
    birthday: [
      "Plan a surprise themed party based on their favorite movie",
      "Book a spa day together",
      "Arrange a virtual meet-up with friends from different cities",
    ],
    weekend: [
      "Go hiking and have a picnic with their favorite foods",
      "Take a cooking class together",
      "Visit a local museum or art gallery",
    ],
    default: [
      "Have a game night with their favorite board games",
      "Create a movie marathon of films you've been wanting to watch",
      "Try a new restaurant in town",
    ]
  };

  const occasion = options.occasion?.toLowerCase() || 'default';
  const suggestions = (occasions as any)[occasion] || occasions.default;
  
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

function getRandomImageUrl(): string {
  const images = [
    "https://images.pexels.com/photos/5257534/pexels-photo-5257534.jpeg",
    "https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg",
    "https://images.pexels.com/photos/4255483/pexels-photo-4255483.jpeg",
    "https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg",
    "https://images.pexels.com/photos/5257502/pexels-photo-5257502.jpeg",
  ];
  
  return images[Math.floor(Math.random() * images.length)];
}