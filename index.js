const fs = require("fs");
const request = require('request');
const Fuse = require("fuse.js")

const BOT_USERNAME='Ian Fletcher';
const POST_MESSAGE_ENDPOINT='https://slack.com/api/chat.postMessage';
const FUZZY_MATCH_THRESHOLD=0.1;

let sendMessage = (data) => {
    data.as_user = false;
    data.username = BOT_USERNAME;
    request.post(POST_MESSAGE_ENDPOINT, {
        auth: {
            bearer: process.env.BOT_USER_TOKEN
        },
        json: data
    }, (error, res, body) => {
        if (error) return error(error);
        if (!body.ok) return error(body.error);
    });
}

let loadModel = (cb) => {
    fs.readFile(__dirname +'/w1a.json', function (err, data) {
        if (err) throw err;
        cb(JSON.parse(data));
    });
}

let randomItem = (items) => {
    return items[Math.floor(Math.random()*items.length)];
}

let verify = (event, error) => {
    if (event.token === process.env.VERIFICATION_TOKEN) return event.challenge;
    else error('Token does not match.');
}

let findMatch = (text, cb) => {
    loadModel((data) => {
        var options = {
            includeScore: true,
            shouldSort: true,
            threshold: FUZZY_MATCH_THRESHOLD,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: [
                "input"
            ]
        };
        var fuse = new Fuse(data, options);
        var result = fuse.search(text);
        if (result.length > 0 && result[0].score < FUZZY_MATCH_THRESHOLD) {
            cb(randomItem(result[0].item.output))
        }
    });
}

let appMention = (event, error) => {
    findMatch(event.text, (response) => {
        let message = {
            channel: event.channel,
            text: response
        }
        sendMessage(message);
    });
}

let eventCallback = (event, error) => {
    if ('subtype' in event.event) return;
    findMatch(event.event.text, (response) => {
        let message = {
            channel: event.event.channel,
            text: response
        }
        sendMessage(message);
    });
}

exports.handler = (event, context, error) => {
    switch(event.type) {
        case 'app_mention':
            return appMention(event, error);
        case 'url_verification':
            return verify(event, error);
        case 'event_callback':
            return eventCallback(event, error);
    }
};
