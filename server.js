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

  // 使用者靠近 Beacon 時
  if (event.type === 'beacon' && event.beacon.type === 'enter') {
    const message = {
      type: 'template',
      altText: '是否來點新鮮的？',
      template: {
        type: 'buttons',
        text: '📡 歡迎靠近「屏行拾光」智能販賣機～今天想看什麼？',
        actions: [
          {
            type: 'message',
            label: '飲料',
            text: '我想看飲料',
          },
          {
            type: 'message',
            label: '零食',
            text: '我想看零食',
          },
          {
            type: 'message',
            label: '限時優惠',
            text: '我想看限時優惠',
          },
          {
            type: 'message',
            label: '更多服務',
            text: '更多服務可以點選下方唷～',
          },
        ],
      },
    };

    return client.pushMessage(event.source.userId, message);
  }

  // 處理使用者點選選項後的回應
  if (event.type === 'message' && event.message.type === 'text') {
    const text = event.message.text;
    let replyText = '請問您需要什麼？';

    if (text.includes('飲料')) {
      replyText = '🥤 今天有冷泡茶、運動飲料、果汁～要來一瓶嗎？';
    } else if (text.includes('零食')) {
      replyText = '🍪 熱門零食有洋芋片、堅果包與巧克力！';
    } else if (text.includes('限時優惠')) {
      replyText = '🔥 現在指定商品第優惠中！快看看上方 Banner！';
          } else if (text.includes('更多服務')) {
      replyText = ' ⬇️👇更多服務可以點選下方唷～ 👇⬇️ ';
    }

    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: replyText,
    });
  }

  return Promise.resolve(null);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`伺服器啟動於 http://localhost:${port}`);
});
