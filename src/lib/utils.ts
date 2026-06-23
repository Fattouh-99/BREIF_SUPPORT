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

/** Coerce Prisma Decimal, string, or number values to a plain number. */
export function toNumber(value: unknown): number {
  if (value == null) return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') return parseFloat(value) || 0
  if (typeof value === 'object' && value !== null) {
    if ('toNumber' in value && typeof (value as { toNumber: () => number }).toNumber === 'function') {
      return (value as { toNumber: () => number }).toNumber()
    }
    return parseFloat(String(value)) || 0
  }
  return parseFloat(String(value)) || 0
}

export function formatMoney(value: unknown, decimals = 2): string {
  return toNumber(value).toFixed(decimals)
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
    const hasStrongSingleWordMatch =
      score >= 1 && words.some((word) => word.length >= 5 && questionLower.includes(word))

    if (score > highestScore && (score >= 2 || hasStrongSingleWordMatch)) {
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

/** Keep chat history for 30 days in the browser. */
const CHAT_STORAGE_TTL_HOURS = 24 * 30

export function getChatStorageKey(domainId?: string | null): string {
  return domainId ? `${STORAGE_KEYS.CHAT_MESSAGES}_${domainId}` : STORAGE_KEYS.CHAT_MESSAGES
}

export const CHATBOT_LOAD_ERROR_TEXT = 'Sorry, there was an error loading this chatbot'

export function isStoredChatUsable(
  messages: Array<{ role: string; content: string }> | undefined
): boolean {
  if (!messages?.length) return false

  if (messages.some((message) => message.content?.includes(CHATBOT_LOAD_ERROR_TEXT))) {
    return false
  }

  const firstMessage = messages[0]?.content || ''
  if (firstMessage.includes('email address') && firstMessage.includes('live support')) {
    return false
  }

  return true
}

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
  },
  domainId?: string | null
) => {
  try {
    const storageKey = getChatStorageKey(domainId)
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
    const tempKey = `${storageKey}_temp`;
    localStorage.setItem(tempKey, JSON.stringify(storageData));

    // Verify the data was stored correctly
    const verifyData = localStorage.getItem(tempKey);
    if (!verifyData) {
      throw new Error('Failed to verify stored data');
    }

    // If verification passes, move to final key
    localStorage.setItem(storageKey, verifyData);
    localStorage.removeItem(tempKey);

    // Store a backup with timestamp
    localStorage.setItem(
      `${storageKey}_backup_${Date.now()}`,
      verifyData
    );
  } catch (error) {
    console.error('Error saving chat to storage:', error);
    // Attempt to save to session storage as fallback
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({
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
export const loadChatFromStorage = (domainId?: string | null) => {
  try {
    const storageKey = getChatStorageKey(domainId)
    // Try to load from main storage
    let data = localStorage.getItem(storageKey);

    // Fall back to legacy global key for older sessions
    if (!data && domainId) {
      data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES)
    }
    
    // If main storage fails, try session storage
    if (!data) {
      const sessionData = sessionStorage.getItem(storageKey);
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
    
    if (hoursDiff > CHAT_STORAGE_TTL_HOURS) {
      // Save to backup before clearing
      localStorage.setItem(
        `${storageKey}_expired_${Date.now()}`,
        data
      );
      return null;
    }

    if (!isStoredChatUsable(parsedData.messages)) {
      clearChatStorage(domainId);
      return null;
    }

    return parsedData;
  } catch (error) {
    console.error('Error loading chat from storage:', error);
    return null;
  }
};

// Clear chat storage
export const clearChatStorage = (domainId?: string | null) => {
  try {
    localStorage.removeItem(getChatStorageKey(domainId));
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
