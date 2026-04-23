import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
// Import pusher client/server from the dedicated file
import { pusherClient, pusherServer } from './pusher'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const extractUUIDFromString = (url: string) => {
  return url.match(
    /^[0-9a-f]{8}-?[0-9a-f]{4}-?[1-5][0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}$/i
  )
}

// Commented out duplicate Pusher initialization
// We now import these from the dedicated pusher.ts file
/*
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
  useTLS: true,
})

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
  }
)
*/

export const postToParent = (message: string) => {
  window.parent.postMessage(message, '*')
}

export const extractURLfromString = (url: string) => {
  // Match both absolute URLs and relative URLs starting with /portal
  return url.match(/(?:https?:\/\/[^\s"<>]+)|(?:\/portal\/[a-zA-Z0-9-]+\/(?:payment|appointment)\/[a-zA-Z0-9-]+)/)
}

export const extractEmailsFromString = (text: string) => {
  return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month]
}

export function findBestMatch(userQuestion: string, registeredQuestions: { question: string; answer: string }[]) {
  // Convert user question to lowercase for better matching
  const userQuestionLower = userQuestion.toLowerCase().trim();
  
  // Find the best match using simple word matching
  let bestMatch = null;
  let highestScore = 0;
  
  for (const qa of registeredQuestions) {
    const questionLower = qa.question.toLowerCase();
    const words = userQuestionLower.split(' ');
    let score = 0;
    
    // Calculate match score based on word overlap
    words.forEach(word => {
      if (word.length > 2 && questionLower.includes(word)) {
        score++;
      }
    });
    
    // Consider it a match if score is above threshold
    if (score > highestScore && score >= 2) { // Require at least 2 matching words
      highestScore = score;
      bestMatch = qa;
    }
  }
  
  return bestMatch;
}

// Local storage keys
export const STORAGE_KEYS = {
  CHAT_MESSAGES: 'chat_messages',
  CHAT_ROOM: 'chat_room',
  REALTIME_MODE: 'realtime_mode'
} as const;

// Save chat messages to local storage
export const saveChatToStorage = (
  chatRoom: string,
  messages: Array<{
    role: 'assistant' | 'user';
    content: string;
    link?: string;
  }>,
  isRealtime: boolean,
  supportAgent?: {
    name: string;
  }
) => {
  try {
    // Validate messages before saving
    if (!Array.isArray(messages)) {
      throw new Error('Messages must be an array');
    }

    // Ensure all messages have required fields
    const validMessages = messages.every(msg => 
      msg && 
      typeof msg === 'object' && 
      (msg.role === 'assistant' || msg.role === 'user') &&
      typeof msg.content === 'string'
    );

    if (!validMessages) {
      throw new Error('Invalid message format detected');
    }

    const storageData = {
      messages,
      chatRoom,
      isRealtime,
      supportAgent,
      timestamp: new Date().getTime()
    };

    // Use a temporary key first
    const tempKey = `${STORAGE_KEYS.CHAT_MESSAGES}_temp`;
    localStorage.setItem(tempKey, JSON.stringify(storageData));

    // Verify the data was stored correctly
    const verifyData = localStorage.getItem(tempKey);
    if (!verifyData) {
      throw new Error('Failed to verify stored data');
    }

    // If verification passes, move to final key
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, verifyData);
    localStorage.removeItem(tempKey);

    // Store a backup with timestamp
    localStorage.setItem(
      `${STORAGE_KEYS.CHAT_MESSAGES}_backup_${Date.now()}`,
      verifyData
    );
  } catch (error) {
    console.error('Error saving chat to storage:', error);
    // Attempt to save to session storage as fallback
    try {
      sessionStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify({
        messages,
        chatRoom,
        isRealtime,
        supportAgent,
        timestamp: new Date().getTime()
      }));
    } catch (fallbackError) {
      console.error('Failed to save to session storage fallback:', fallbackError);
    }
    throw error;
  }
};

// Load chat messages from local storage
export const loadChatFromStorage = () => {
  try {
    // Try to load from main storage
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    
    // If main storage fails, try session storage
    if (!data) {
      const sessionData = sessionStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      if (sessionData) {
        return JSON.parse(sessionData);
      }
      return null;
    }

    const parsedData = JSON.parse(data);

    // Validate loaded data
    if (!parsedData.messages || !Array.isArray(parsedData.messages)) {
      throw new Error('Invalid stored data format');
    }

    // Check if the data is less than 24 hours old
    const now = new Date().getTime();
    const storedTime = parsedData.timestamp;
    const hoursDiff = (now - storedTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      // Save to backup before clearing
      localStorage.setItem(
        `${STORAGE_KEYS.CHAT_MESSAGES}_expired_${Date.now()}`,
        data
      );
      return null;
    }

    return parsedData;
  } catch (error) {
    console.error('Error loading chat from storage:', error);
    return null;
  }
};

// Clear chat storage
export const clearChatStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
  } catch (error) {
    console.error('Error clearing chat storage:', error);
  }
};

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word characters
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '')          // Trim - from end of text
}

/**
 * Format a number as currency (USD by default)
 */
export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
