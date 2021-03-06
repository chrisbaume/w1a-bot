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

let verify = (event, cb) => {
    if (event.token === process.env.VERIFICATION_TOKEN) cb(null, event.challenge);
    else cb('Token does not match.');
}

let findMatch = (text) => {
    if (text.length < config.MIN_TEXT_LEN ||
        text.length > config.MAX_TEST_LEN) return;
    var options = {
        threshold: config.FUZZY_MATCH_THRESHOLD,
        location: 0,
        distance: 100,
        maxPatternLength: config.MAX_TEST_LEN,
        minMatchCharLength: 1,
        keys: [
            "input"
        ]
    };
    var fuse = new Fuse(model, options);
    var result = fuse.search(text);
    for (let match of result) {
        if (Math.abs(text.length - match.input.length) <= config.FUZZY_MATCH_MAX_LEN_DIFF) {
            let response = randomItem(match.output);
            console.log(`INPUT: "${text}", OUTPUT: "${response}"`);
            return response;
        }
    }
    return null;
}

let appMention = (event, error) => {
    let response = findMatch(event.text);
    if (response) {
        let message = {
            channel: event.channel,
            text: response
        }
        sendMessage(message, error);
    }
}

let eventCallback = (event, error) => {
    if ('subtype' in event.event) return;
    let response = findMatch(event.event.text);
    if (response) {
        let message = {
            channel: event.event.channel,
            text: response
        }
        sendMessage(message, error);
    }
}

exports.handler = (event, context, cb) => {
    switch(event.type) {
        case 'app_mention':
            return appMention(event, cb);
        case 'url_verification':
            return verify(event, cb);
        case 'event_callback':
            return eventCallback(event, cb);
    }
};
