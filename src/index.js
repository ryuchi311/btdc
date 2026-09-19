import { InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions';

export default {
  async fetch(request, env) {
    if (request.method === 'GET') {
      return new Response('ok', { status: 200 });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get('x-signature-ed25519');
    const timestamp = request.headers.get('x-signature-timestamp');
    const publicKey = env.DISCORD_PUBLIC_KEY;

    if (!signature || !timestamp || !publicKey || !verifyKey(rawBody, signature, timestamp, publicKey)) {
      return new Response('Unauthorized', { status: 401 });
    }

    let interaction;
    try {
      interaction = JSON.parse(rawBody);
    } catch {
      return new Response('Unauthorized', { status: 401 });
    }

    if (interaction.type === InteractionType.PING) {
      return Response.json({ type: InteractionResponseType.PONG });
    }

    if (interaction.type !== InteractionType.MESSAGE_COMPONENT) {
      return new Response(null, { status: 204 });
    }

    const customId = interaction?.data?.custom_id;
    if (typeof customId !== 'string' || !customId.startsWith('role:')) {
      return new Response(null, { status: 204 });
    }

    const roleId = customId.slice('role:'.length);
    const member = interaction.member;
    const userId = member?.user?.id;
    const memberRoles = member?.roles ?? [];

    if (!userId) {
      return Response.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'This role toggle is only available in a server context.',
          flags: 64,
          allowed_mentions: { parse: [] },
        },
      });
    }

    const hasRole = memberRoles.includes(roleId);
    const url = `https://discord.com/api/v10/guilds/${env.GUILD_ID}/members/${userId}/roles/${roleId}`;
    const response = await fetch(url, {
      method: hasRole ? 'DELETE' : 'PUT',
      headers: {
        Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
        'X-Audit-Log-Reason': 'Self-assigned via button',
      },
    });

    if (!response.ok) {
      return Response.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `I couldn't ${hasRole ? 'remove' : 'add'} <@&${roleId}>. Discord returned HTTP ${response.status}. Please check the bot permissions and role hierarchy.`,
          flags: 64,
          allowed_mentions: { parse: [] },
        },
      });
    }

    const actionText = hasRole ? 'Removed' : 'Added';
    return Response.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `${actionText} <@&${roleId}> ${hasRole ? 'from your roles.' : 'to your roles.'}`,
        flags: 64,
        allowed_mentions: { parse: [] },
      },
    });
  },
};
