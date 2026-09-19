# BT Warriors role button

This Cloudflare Worker handles Discord self-assignable role toggles for the BT warriors role.

## Quick Cloudflare setup

Run these once from the project root:

```bash
npm install
npm run cf:login
npm run cf:secrets
npm run deploy
```

This uses the project-local Wrangler install, so there is no need to install Wrangler globally or rely on a separate CLI setup.

The Worker config enables observability for logs and traces so production issues are easier to diagnose.

## Secrets

If you prefer to set them manually, the equivalent commands are:

```bash
wrangler secret put DISCORD_BOT_TOKEN
wrangler secret put DISCORD_PUBLIC_KEY
```

## Deploy

```bash
wrangler deploy
```

## Discord Developer Portal setup

1. Open your Discord application in the Developer Portal.
2. Go to the Bot section and ensure the bot is invited to the guild with the proper permissions.
3. In the Interactions Endpoint URL field, set the deployed Worker URL:

```text
https://<your-worker-subdomain>.workers.dev
```

If you use a custom domain, point the endpoint there instead.

## Post the button message

Set the Bot token and the target channel ID before running the helper script:

```bash
export BOT_TOKEN="your_bot_token"
export CHANNEL_ID="your_channel_id"
node scripts/post-button.js
```

This script posts a message with a button whose custom ID is `role:883161380029595689`.

## Role hierarchy note

The bot's role must be positioned above the target role in Server Settings → Roles, or the role assignment request will fail with a 403.
