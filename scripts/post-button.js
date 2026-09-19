const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

if (!BOT_TOKEN || !CHANNEL_ID) {
  console.error('Missing BOT_TOKEN or CHANNEL_ID in environment variables.');
  process.exit(1);
}

const url = `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`;

const payload = {
  content: 'Click below to get the **BT warriors** role.',
  components: [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 1,
          label: 'BT warriors',
          custom_id: 'role:883161380029595689',
        },
      ],
    },
  ],
};

const response = await fetch(url, {
  method: 'POST',
  headers: {
    Authorization: `Bot ${BOT_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});

const bodyText = await response.text();
console.log(`Status: ${response.status}`);
console.log(bodyText);
