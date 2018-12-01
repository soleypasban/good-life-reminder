This is a simple app to remind you that you are a miracle.

It will help you to do something good every hour during the day.

### install

Clone the repo, and then install it using npm or yarn

`yarn install` or `npm install`

### credentials

Update *appURL* and gmail *user* and *pass*.

### Run

Use `yarn start`, `npm run start` or `node index.js`

### End points
Here are available end points

*url/?add=email*
Add an email to list

*url/?remove=hash*
Remove email from the list

*url/?disable=hash*
Disable email, will keep email but won't send anything

*url/?finished=hash*
Add +1 point to points

*url/?send=1*
Force send emails to all

*url/?exit=1*
Exit app

### Storage

Your emails and points are stored inside `.emails.json`

### Copyright

MIT, It is free to help you to improve your life :)
