import { NextRequest, NextResponse } from 'next/server';
import { adminSetTeamJoinCode, validateTeamCode } from '@/actions/team';
import { client } from '@/lib/prisma';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Extract the code from query params
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const teamId = searchParams.get('teamId');
    const action = searchParams.get('action') || 'validate';
    
    console.log('Debug teamCode API called:', { action, code, teamId });
    
    // Security check - only allow in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development mode' },
        { status: 403 }
      );
    }
    
    // Verify our database connection
    try {
      await client.$queryRaw`SELECT 1`;
      console.log('Database connection verified');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError },
        { status: 500 }
      );
    }
    
    if (action === 'inspect') {
      // Inspect all teams and their team settings
      const teams = await client.$queryRaw`
        SELECT t.id, t.name, t."ownerId", ts.id as "settingsId", ts."recognitionMessage"
        FROM "Team" t
        LEFT JOIN "TeamSettings" ts ON t.id = ts."teamId"
      `;
      
      // Process the result to parse recognitionMessage JSON
      const processedTeams = (teams as any[]).map(team => {
        let joinCode = null;
        let expiresAt = null;
        
        if (team.recognitionMessage) {
          try {
            const recognition = JSON.parse(team.recognitionMessage);
            joinCode = recognition.joinCode;
            expiresAt = recognition.expiresAt;
          } catch (e) {
            console.error(`Error parsing recognitionMessage for team ${team.id}:`, e);
          }
        }
        
        return {
          ...team,
          joinCode,
          expiresAt,
        };
      });
      
      return NextResponse.json({
        success: true,
        teams: processedTeams
      });
    }
    
    if (action === 'set' && teamId && code) {
      // Set a join code for a specific team
      const result = await adminSetTeamJoinCode(teamId, code);
      return NextResponse.json(result);
    }
    
    if (action === 'validate' && code) {
      // Validate a join code
      const result = await validateTeamCode(code);
      return NextResponse.json(result);
    }
    
    // Default response for no parameters
    return NextResponse.json({
      success: false,
      error: 'Missing required parameters',
      help: 'Use ?action=inspect to see all teams, ?action=set&teamId=X&code=Y to set a code, or ?action=validate&code=Z to validate a code'
    });
    
  } catch (error) {
    console.error('Error in debug team code API:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error },
      { status: 500 }
    );
  }
} 