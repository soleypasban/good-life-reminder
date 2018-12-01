const express = require('express')
const app = express()
const url = require('url');
const crypto = require('crypto');
const port = process.env.PORT || 3000
const fs = require('fs');
const file = '.emails.json'
let h = null
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '***@gmail.com',
        pass: '***'
    }
});

const appURL = '<url withoud ending forward slash>'

function addToFile(email) {
    const json = JSON.parse(fs.readFileSync(file))
    const hash = crypto.createHash('md5').update(email + Math.random()).digest("hex")
    const finished = 0
    const isActive = true
    json[email] = { hash, finished, isActive }
    fs.writeFileSync(file, JSON.stringify(json));
}

function enableEmail(email) {
    const json = JSON.parse(fs.readFileSync(file))
    const keys = Object.keys(json)
    for (let index = 0; index < keys.length; index++) {
        const to = keys[index];
        if (to === email) {
            const row = json[email]
            json[email] = { ...row, isActive: true }
            fs.writeFileSync(file, JSON.stringify(json));
            return true
        }
    }
    return false
}


function disableEmail(hash) {
    const json = JSON.parse(fs.readFileSync(file))
    const keys = Object.keys(json)
    for (let index = 0; index < keys.length; index++) {
        const to = keys[index];
        const row = json[to]
        if (row.hash === hash) {
            json[to] = { ...row, isActive: false }
            fs.writeFileSync(file, JSON.stringify(json));
            return true
        }
    }
    return false
}

function incFinished(hash) {
    const json = JSON.parse(fs.readFileSync(file))
    const keys = Object.keys(json)
    for (let index = 0; index < keys.length; index++) {
        const to = keys[index];
        const row = json[to]
        if (row.hash === hash) {
            json[to] = { ...row, finished: Number(row.finished) + 1 }
            fs.writeFileSync(file, JSON.stringify(json));
            return json[to].finished
        }
    }
    return false
}

function removeFromFile(hash) {
    const json = JSON.parse(fs.readFileSync(file))
    const keys = Object.keys(json)
    for (let index = 0; index < keys.length; index++) {
        const tmp = json[keys[index]];
        if (tmp.hash === hash) {
            delete json[keys[index]]
            break
        }
    }
    fs.writeFileSync(file, JSON.stringify(json));
}

app.get('/', (req, res) => {
    const url_parts = url.parse(req.url, true);
    const query = url_parts.query;

    if (query.exit) {
        res.send('App terminated')
        process.exit()
        return
    }

    if (query.add) {
        if (enableEmail(query.add)) {
            res.send('Sending mail enabled.')
        } else {
            addToFile(query.add)
            res.send('Added to the list.')
        }
        return
    }

    if (query.finished) {
        const points = incFinished(query.finished)
        if (points) {
            res.send(`
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <h2>Well done!</h2>
            <br/>
            <h3>You have earned +1 point!</h3>
            <br/>
            <br/>
            <hr/>
            <p>You already have <b>${points}</b> point${points > 1 ? 's' : ''}!</p>
            `)
            return
        }
    }

    if (query.disable && disableEmail(query.disable)) {
        res.send('Sending mail disabled.')
    }

    if (query.remove) {
        removeFromFile(query.remove)
        res.send('Removed from the list.')
        return
    }

    if (query.send) {
        doSomethingGood()
        res.send('Sent to all emails')
        return
    }

    res.send('Unknown command. Use only send, exit, add, remove, and disable endpoints')
})

app.listen(port, () => console.log(`App listening on port ${port}!`))

function sendEmail(to, subject, html) {
    const mailOptions = {
        from: 'a.life.with.discipline@gmail.com',
        to,
        subject,
        html
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

function send(subject, text) {
    const json = JSON.parse(fs.readFileSync(file))
    const keys = Object.keys(json)
    for (let index = 0; index < keys.length; index++) {
        const to = keys[index];
        const { hash } = json[to];

        const html = `
        <h2>${text}</h2>
        
        <hr />
        
        <a style="
        font-size: 14px;
        color: #ffffff;
        background: #FF9800;
        padding: 10px 15px;
        border-radius: 4px;
        text-decoration: none;
        margin: 50px 0;
        display: inline-block;" href="${appURL}/?finished=${hash}">FInished it!</a>
        
        <hr />
        
        <a style="font-size: 11px;" href="${appURL}/?disable=${hash}">Disable emails</a>
        <br/>
        <a style="font-size: 11px;" href="${appURL}/?add=${to}">Enable emails</a>
        <br/>
        <a style="font-size: 11px;" href="${appURL}/?remove=${hash}">Disable and remove email</a>
        `

        sendEmail(to, subject, html)
    }
}

function sendGoodMorning() {
    send('Start a wonderful day', 'Today will be a facinating day. Do lots of great things and be proud of yourself, because you deserve it. Soley')
}

function doSomethingGood() {
    send('You are a miracle :)', 'Time to do something good!')
}

function sendDailyEmails() {
    console.log('Checking...')
    const H = new Date().getHours()
    if (h !== H) {
        h = H;
        if (H === 9) sendGoodMorning()
        if (H >= 10 && H <= 18) {
            doSomethingGood()
            console.log('Time to do something!')
        }
    }
}

setInterval(() => {
    sendDailyEmails()
}, 60 * 1000 * 60);
