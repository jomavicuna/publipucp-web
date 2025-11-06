// Vercel → Discord Webhook Bridge
// This function receives Vercel deployment webhooks and forwards them to Discord

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { payload } = req.body;
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!discordWebhookUrl) {
      console.error('DISCORD_WEBHOOK_URL not configured');
      return res.status(500).json({ error: 'Webhook URL not configured' });
    }

    // Extract deployment info
    const deploymentName = payload.deployment?.name || 'Unknown';
    const deploymentUrl = payload.deployment?.url || '';
    const deploymentState = payload.deployment?.state || payload.type;
    const projectName = payload.project?.name || 'Unknown Project';
    const deploymentCreator = payload.user?.username || 'Unknown User';
    const target = payload.target || 'production';

    // Determine color based on state
    let color = 0x5865F2; // Discord Blurple default
    let emoji = '🚀';

    if (deploymentState === 'READY' || payload.type === 'deployment.succeeded') {
      color = 0x57F287; // Green
      emoji = '✅';
    } else if (deploymentState === 'ERROR' || payload.type === 'deployment.error') {
      color = 0xED4245; // Red
      emoji = '❌';
    } else if (deploymentState === 'BUILDING') {
      color = 0xFEE75C; // Yellow
      emoji = '🔨';
    }

    // Create Discord message with embed
    const discordPayload = {
      username: 'Vercel Deploy',
      avatar_url: 'https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png',
      embeds: [{
        title: `${emoji} ${payload.type === 'deployment.succeeded' ? 'Deployment Successful' : 'Deployment Update'}`,
        description: `**${projectName}** has been deployed`,
        color: color,
        fields: [
          {
            name: 'Status',
            value: deploymentState || 'Success',
            inline: true
          },
          {
            name: 'Environment',
            value: target.charAt(0).toUpperCase() + target.slice(1),
            inline: true
          },
          {
            name: 'Deployed by',
            value: deploymentCreator,
            inline: true
          }
        ],
        url: deploymentUrl ? `https://${deploymentUrl}` : undefined,
        timestamp: new Date().toISOString()
      }]
    };

    // Send to Discord
    const discordResponse = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error('Discord webhook failed:', errorText);
      return res.status(500).json({ error: 'Failed to send to Discord' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
