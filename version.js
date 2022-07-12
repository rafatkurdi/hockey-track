const write = require('write');

var currentdate = new Date();
var minute = currentdate.getMinutes();
var seconds = currentdate.getSeconds();

if (minute < 10) {
  minute = "0" + minute;
}

if (seconds < 10) {
  seconds = "0" + seconds;
}

var datetime = currentdate.getDate() + "." +
  (currentdate.getMonth() + 1) + "." +
  currentdate.getFullYear() + "  " +
  currentdate.getHours() + ":" +
  minute + ":" +
  seconds;

// promise
write('src/environments/environment.prod.ts', 'export const environment = { production: true, version:"' + datetime + '" };')
  .then(() => {
    // do stuff
  });


write('src/environments/environment.ts', 'export const environment = { production: false, version:"' + datetime + '" };')
  .then(() => {
    // do stuff
  });
