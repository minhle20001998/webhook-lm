const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('port', port);
require('dotenv').config();
// Start the server and listen on the preconfigured port
app.listen(port, () => console.log(`App started on port ${port}.`))

app.post('/webhook', (req, res) => {

    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {
        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {

            // Get the webhook event. entry.messaging is an array, but 
            // will only ever contain one event, so we get index 0
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);


            let sender_id = webhook_event.sender.id;
            console.log('Sender PSID: ', sender_id);
        });

        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});

app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.PAGE_ACCESS_TOKEN;

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


// Handles messages events
function handleMessage(sender_psid, received_message) {

}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {

}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {

}











const noti = [];

async function fetchHTML(url) {
    const { data } = await axios.get(url)
    return cheerio.load(data)
}

function toObject(title, content) {
    return {
        title: title,
        content: content
    }
}

async function getAnnouncements() {
    const $ = await fetchHTML("http://fit.hanu.vn/");
    $('.forumpost').each((index, element) => {
        const title = $(element).find('.forumpost .subject').text();
        const content = $(element).find('.forumpost .fullpost').text().split("\n").join(" ");
        noti.push(toObject(title, content))
    })
    fs.writeFileSync('data.json', JSON.stringify(noti));
}

getAnnouncements();
