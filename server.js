/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/request/request.d.ts' />
var http = require('http');
var request = require('request');
http.createServer(function (req, res) {
    var conn = req.connection;
    if (!conn.encrypted) {
        res.statusCode = 401;
        res.write('https required');
        res.end();
        return;
    }
    var userAgent = req.headers['User-Agent'];
    var user = req.headers['Authorization'];
    if (!user) {
        res.statusCode = 401;
        res.write('Authorization header required');
        res.end();
        return;
    }
    var authReq = request({
        url: 'https://api.github.com/',
        headers: {
            'User-Agent': userAgent
        },
        auth: {
            user: user
        }
    }).on('response', function (authRsp) {
        if (authRsp.statusCode == 200) {
            var fileReq = request({
                url: 'https://raw.githubusercontent.com' + req.url,
                headers: {
                    'User-Agent': userAgent
                },
                auth: {
                    user: user
                }
            }).pipe(res);
        }
        else {
            authReq.pipe(res);
        }
    });
    authReq.end();
}).listen(process.env.PORT || 3000);
