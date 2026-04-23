import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatRoom = await prisma.chatRoom.findUnique({
      where: {
        id: params.chatId,
      },
      select: {
        live: true,
      },
    });

    if (!chatRoom) {
      return NextResponse.json(
        { error: 'Chat room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(chatRoom);
  } catch (error) {
    console.error('Error getting chat room status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 