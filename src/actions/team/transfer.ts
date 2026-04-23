export async function onTransferConversation(chatRoomId: string, memberId: string) {
  try {
    const response = await fetch('/api/conversations/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatRoomId,
        memberId
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to transfer conversation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in onTransferConversation:', error);
    throw error;
  }
} 