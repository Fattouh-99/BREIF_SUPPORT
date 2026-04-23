/**
 * Utility to trigger Pusher events through a server-side proxy
 * This avoids CORS issues when triggering events from the browser
 */

type ProxyTriggerOptions = {
  channel: string;
  event: string;
  data: any;
};

/**
 * Trigger a Pusher event through our server-side proxy
 * @param channel The channel to trigger the event on
 * @param event The event name
 * @param data The event data
 * @returns Promise resolving to the API response
 */
export async function proxyTriggerEvent({
  channel,
  event,
  data,
}: ProxyTriggerOptions): Promise<any> {
  try {
    // Call our proxy endpoint
    const response = await fetch('/api/pusher/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel,
        event,
        data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to trigger event');
    }

    return await response.json();
  } catch (error) {
    console.error('Error triggering Pusher event via proxy:', error);
    throw error;
  }
}

/**
 * Create a proxy for a specific channel that can trigger multiple events
 * @param channelName The channel name to use for all events
 * @returns An object with a trigger method
 */
export function createChannelProxy(channelName: string) {
  return {
    /**
     * Trigger an event on the channel
     * @param eventName The event name
     * @param data The event data
     * @returns Promise resolving to the API response
     */
    trigger: async (eventName: string, data: any) => {
      return proxyTriggerEvent({
        channel: channelName,
        event: eventName,
        data,
      });
    },
  };
} 