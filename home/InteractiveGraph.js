const Influx = require('influx');
const express = require('express');
const http = require('http');
const os = require('os');

const app = express();

const influx = new Influx.InfluxDB({
    host: '10.11.90.15',
    database: 'Wind_Station',
    schema: [
        {
            measurement: 'WS_MT1',
            fields: {
                path: Influx.FieldType.STRING,
                duration: Influx.FieldType.INTEGER
            },
            tags: [
                'host'
            ]
        }
    ]
});


influx.getDatabaseNames()
    .then(names => {
    if (!names.includes('Wind_Station')) {
    return influx.createDatabase('Wind_Station');
}
})
.then(() => {
    // http.createServer(app).listen(3000, function () {
    app.listen(3000, function () {
    console.log('Listening on port 3000')
})
})
.catch(err => {
    console.error(`Error creating Influx database!`);
});

app.get('/', function (req, res) {
    setTimeout(() => res.end('Hello world!'), Math.random() * 500)
});

var v1 =[];
app.get('/times', function (req, res) {
    influx.query('select * from WS_MT1'

    ).then(result => {
        console.log(result.length);

    res.send(result)
}).catch(err => {
        res.status(500).send(err.stack)
})
});

app.get('/filterUser', function (req, res) {
    var myStat = "SELECT Hum_Out, time FROM WS_MT1 WHERE time >= '" + req.query.timeFrom + "' AND time <= '" + req.query.timeTo + "'";

    console.log(myStat);

    res.setHeader("Access-Control-Allow-Origin", "*");

    influx.query(myStat, function (err, result, fields) {
        var status = [{errStatus: ""}];

        if (err) {
            console.log(err);
            status[0].errStatus = "fail";
            res.send(status);
            res.end();
        } else if (result.length === 0) {
            status[0].errStatus = "no data entry";
            res.send(status);
            res.end();
        } else {
            var Hum_Out = [];

            Hum_Out = JSON.stringify(result, null, "\t");
            console.log(Hum_Out);
            res.send(Hum_Out);
            res.end();
        }
    }).then(result => {
        console.log(result.length);
        res.send(result)
    }).catch(err => {
            res.status(500).send(err.stack)
    });
});

app.get('/all', function (req, res) {
    var myStat = "SELECT Hum_Out, time FROM WS_MT1 WHERE time >= '2018-04-01T04:00:00.000Z' AND time <= '2018-05-30T04:00:00.000Z'";

    console.log(myStat);

    res.setHeader("Access-Control-Allow-Origin", "*");

    influx.query(myStat, function (err, result, fields) {
        var status = [{errStatus: ""}];

        if (err) {
            console.log(err);
            status[0].errStatus = "fail";
            res.send(status);
            res.end();
        } else if (result.length === 0) {
            status[0].errStatus = "no data entry";
            res.send(status);
            res.end();
        } else {
            var Hum_Out = [];

            Hum_Out = JSON.stringify(result, null, "\t");
            console.log(Hum_Out);
            res.send(Hum_Out);
            res.end();
        }
    }).then(result => {
        console.log(result.length);
    res.send(result)
}).catch(err => {
        res.status(500).send(err.stack)
});
});
