/**
 * Chat utility functions
 */

/**
 * Extracts URLs from text content
 */
export function extractURLs(text: string): string[] {
  if (!text) return [];
  
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Extract URLs from text
  const matches = text.match(urlRegex);
  
  // Return matches or empty array
  return matches || [];
}

/**
 * Formats a date object to a time string
 */
export function formatTimeFromDate(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Checks if a message contains a URL
 */
export function containsURL(text: string): boolean {
  return extractURLs(text).length > 0;
}

/**
 * Formats a chat message with enhanced styling
 */
export function formatChatMessage(message: string): string {
  if (!message) return '';
  
  // Replace URLs with HTML links
  let formattedMessage = message.replace(
    /(https?:\/\/[^\s]+)/g, 
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
  );
  
  // Format code blocks
  formattedMessage = formattedMessage.replace(
    /```([^`]+)```/g,
    '<pre class="bg-muted/80 p-2 rounded-md text-sm overflow-auto my-2">$1</pre>'
  );
  
  // Format inline code
  formattedMessage = formattedMessage.replace(
    /`([^`]+)`/g,
    '<code class="bg-muted/50 px-1 py-0.5 rounded-sm text-xs font-mono">$1</code>'
  );
  
  return formattedMessage;
} 