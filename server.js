const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);
const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => {
      console.error('處理事件錯誤：', err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  console.log('接收到事件：', JSON.stringify(event, null, 2));

  if (event.type === 'beacon' && event.beacon.type === 'enter') {
    const message = {
      type: 'text',
      text: '📡 歡迎靠近淨顏美學～首次體驗送好禮！',
    };
    return client.pushMessage(event.source.userId, message);
  }

  return Promise.resolve(null);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`伺服器啟動於 http://localhost:${port}`);
});
