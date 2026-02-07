import { NextResponse } from 'next/server';
import { exchangeCodeForToken, parseOAuthState } from '@/lib/slack';

// GET /api/slack/oauth - OAuth callback from Slack
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Use ngrok/tunnel URL for Slack API calls, but localhost for user redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const userRedirectUrl = 'http://localhost:3000';

    // Handle OAuth errors
    if (error) {
      console.error('Slack OAuth error:', error);
      return NextResponse.redirect(
        `${userRedirectUrl}/configuration-bot?slack_error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${userRedirectUrl}/configuration-bot?slack_error=missing_params`
      );
    }

    // Parse state to get botId
    const stateData = parseOAuthState(state);
    if (!stateData?.botId) {
      return NextResponse.redirect(
        `${userRedirectUrl}/configuration-bot?slack_error=invalid_state`
      );
    }

    const { botId } = stateData;

    // Exchange code for token (use baseUrl for Slack API redirect_uri)
    const redirectUri = `${baseUrl}/api/slack/oauth`;
    const tokenResponse = await exchangeCodeForToken(code, redirectUri);

    if (!tokenResponse.ok || !tokenResponse.access_token || !tokenResponse.team) {
      console.error('Slack token exchange failed:', tokenResponse.error);
      return NextResponse.redirect(
        `${userRedirectUrl}/configuration-bot?id=${botId}&slack_error=${encodeURIComponent(tokenResponse.error || 'token_exchange_failed')}`
      );
    }

    // Save Slack connection to bot using service role
    const { createClient: createServiceClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { error: updateError } = await supabaseAdmin
      .from('bots')
      .update({
        slack_team_id: tokenResponse.team.id,
        slack_team_name: tokenResponse.team.name,
        slack_access_token: tokenResponse.access_token,
        slack_channels: [],
      })
      .eq('id', botId);

    if (updateError) {
      console.error('Failed to save Slack connection:', updateError);
      return NextResponse.redirect(
        `${userRedirectUrl}/configuration-bot?id=${botId}&slack_error=save_failed`
      );
    }

    // Redirect back to bot config with success (to localhost for auth cookies)
    return NextResponse.redirect(
      `${userRedirectUrl}/configuration-bot?id=${botId}&slack_connected=true`
    );
  } catch (error) {
    console.error('Error in Slack OAuth callback:', error);
    return NextResponse.redirect(
      `http://localhost:3000/configuration-bot?slack_error=unknown_error`
    );
  }
}
