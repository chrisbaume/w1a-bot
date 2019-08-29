const request = require('request');
const Fuse = require('fuse.js');
const model = require('./model.js');
const config = require('./config.js');

let sendMessage = (data, error) => {
    data.as_user = false;
    data.username = config.BOT_USERNAME;
    request.post(config.POST_MESSAGE_ENDPOINT, {
        auth: {
            bearer: process.env.BOT_USER_TOKEN
        },
        json: data
    }, (err, res, body) => {
        if (err) return error(err);
        if (!body.ok) return error(body.error);
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
    var options = {
        includeScore: true,
        shouldSort: true,
        threshold: config.FUZZY_MATCH_THRESHOLD,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
            "input"
        ]
    };
    var fuse = new Fuse(model, options);
    var result = fuse.search(text);
    if (result.length > 0 && result[0].score < config.FUZZY_MATCH_THRESHOLD) {
        cb(randomItem(result[0].item.output))
    }
}

let appMention = (event, error) => {
    findMatch(event.text, (response) => {
        let message = {
            channel: event.channel,
            text: response
        }
        sendMessage(message, error);
    });
}

let eventCallback = (event, error) => {
    if ('subtype' in event.event) return;
    findMatch(event.event.text, (response) => {
        let message = {
            channel: event.event.channel,
            text: response
        }
        sendMessage(message, error);
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
