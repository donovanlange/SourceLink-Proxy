/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/request/request.d.ts' />
/// <reference path='node_modules/applicationinsights/applicationInsights.d.ts' />
var http = require('http');
var request = require('request');
var AppInsights = require('./node_modules/applicationinsights/applicationInsights');
var appInsights = new AppInsights();
appInsights.trackAllHttpServerRequests("favicon");
appInsights.trackAllUncaughtExceptions();
http.createServer(function (req, res) {
    if (req.url === '/') {
        res.writeHead(302, { 'Location': 'http://ctaggart.github.io/SourceLink/' });
        res.end();
        return;
    }
    if (req.url === '/index2.txt') {
        res.statusCode = 200;
        res.end();
        return;
    }
    var agent = req.headers['user-agent'];
    var auth = req.headers['authorization'];
    if (!auth) {
        res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="SourceLink Proxy for GitHub"' });
        res.write('Authorization header required');
        res.end();
        return;
    }
    var authReq = request({
        url: 'https://api.github.com/',
        // https://developer.github.com/v3/#user-agent-required
        headers: {
            'User-Agent': agent,
            'Authorization': auth
        }
    }).on('response', function (authRsp) {
        if (authRsp.statusCode == 200) {
            var fileReq = request({
                // https://developer.github.com/changes/2014-04-25-user-content-security/
                url: 'https://raw.githubusercontent.com' + req.url,
                headers: {
                    'User-Agent': agent,
                    'Authorization': auth
                }
            }).pipe(res);
        }
        else if (authRsp.statusCode == 401) {
            res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="SourceLink Proxy for GitHub"' });
            res.write('Bad credentials');
            res.end();
        }
        else {
            authReq.pipe(res);
        }
    });
    authReq.end();
}).listen(process.env.PORT || 3000);
