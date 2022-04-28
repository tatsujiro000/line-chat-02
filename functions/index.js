const functions = require('firebase-functions');
//express
const express = require('express');
//consolidate
const engines = require('consolidate');

const app = express();
app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');


//cors
const cors = require('cors')({origin: true});
//line
const line = require('@line/bot-sdk');
const { requires } = require('consolidate');

const config = {
    channelSecret: '3cfd07c22b62f9295ddedbdc194c4dc4',
    channelAccessToken: 'Mc6+kZuF20d0Db8ZwmoftWdJRs3mukCdK6S5pFSTJPD98Fclb93DSdwcQ4NJdB0T4CApD+ZwQRz/MpMYY4yIA6J3piUJIOGVRoAVe41qyofdiVjdDhaaJk0cIqS//hmReeykDu0Zrk5x+xNFyoCCpgdB04t89/1O/w1cDnyilFU='
};


app.use(cors);

app.get('/', (req, res) => {
    res.render('index', {});
});

//なくてもよい。てか、いらない。
app.get('/api', (req, res) => {
    const date = new Date();
    const hours = (date.getHours() % 12) + 1;  // London is UTC + 1hr;
    res.json({bongs: 'BONG '.repeat(hours)});
});


app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);

    
    if(req.body.events[0].replyToken === '00000000000000000000000000000000' && req.body.events[1].replyToken === 'ffffffffffffffffffffffffffffffff'){
        res.send('Hello LINE BOT!(POST)');
        console.log('疎通確認用');
        return; 
    }

    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});

const client = new line.Client(config);

async function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
      return Promise.resolve(null);
    }
  
    let replyTexet = '';
    //事前登録ワード　ここに言語の揺れ幅を許容するAI使う
    let expectWord = [
        {key:1, word: '料金'},
        {key:2, word: '場所'},
        {key:3, word: '何年間'},
    ];
  
    if(event.message.text === expectWord[0].word){
        replyTexet = '料金は5000万円です';
        returnText();
    } else if(event.message.text === expectWord[1].word){
        replyTexet = '場所は宮城県仙台市のホールです';
        returnText();
    } else if(event.message.text === expectWord[2].word){
        replyTexet = '1年間です。';
        returnText();
    }else{
      replyTexet = '何を言っているのかさっぱりです';
      returnText();
    }
    function returnText() {
      return client.replyMessage(event.replyToken, {
          type: 'text',
          text: replyTexet //実際に返信の言葉を入れる箇所
        });    
    }
  }


exports.app = functions.https.onRequest(app);
