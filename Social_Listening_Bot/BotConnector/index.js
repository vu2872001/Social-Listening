require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/index');

const app = express();

app.use('/web-page', express.static(__dirname + '/build'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(process.env.port || process.env.PORT || 8080, function () {
    console.log(`${app.name} listening to ${process.env.PORT}`);
});

route(app);
