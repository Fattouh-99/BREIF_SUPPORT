export const runtime = 'nodejs';

// This is a server-side route handling the /admin/applications path
// This approach avoids the static generation issues

export async function GET() {
  return new Response(JSON.stringify({ message: "Please use client side navigation for this route" }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
} 