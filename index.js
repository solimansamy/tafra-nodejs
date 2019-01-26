'use strict'

/**
 * -------------------------
 * -------- IMPORTS --------
 * -------------------------
 */

const express     = require('express')
const bodyParser  = require('body-parser')
const request     = require('request')
const path        = require('path');
const timestamp   = require('console-timestamp');
const colors      = require('colors');

require('dotenv').config()
require('request-debug')(request);

const SERVER_URL   = process.env.SERVER_URL
const VERIFY_TOKEN = process.env.VERIFY_TOKEN

const app          = express()

app.set('port', (process.env.PORT || 5000))

app.use(bodyParser.urlencoded({extended: false}))

app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hi there')
    console.info('You have successfully started working with winston and morgan')
})

// Adds support for GET requests to our webhook
app.get('/webhook/', (req, res) => {

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

app.post('/webhook/', (req, res) => {

    let body = req.body;

    console.log('\n------------------ JSON.stringify(req.body) ---------------------')
    console.log(JSON.stringify(req.body))
    console.log('------------------ JSON.stringify(req.body) ---------------------\n')

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

            // Gets the message. entry.messaging is an array, but
            // will only ever contain one message, so we get index 0
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});

app.listen(app.get('port'), function() {
    console.log('---------------------------------')
    console.log('ENV: ', process.env.NODE_ENV)
    console.log('Server Url: ', SERVER_URL)
    console.log('---------------------------------')
    console.log('Bot is running on port', app.get('port'))
})