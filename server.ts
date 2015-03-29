/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/request/request.d.ts' />

import http = require('http');
import url = require('url');
import request = require('request');

http.createServer((req, res) => {
  var conn: any = req.connection;
  if(!conn.encrypted){
    res.statusCode = 401
    res.write('https required');
    res.end();
    return;
  }
  var userAgent = req.headers['User-Agent'];
  var user = req.headers['Authorization'];
  if(!user){
    res.statusCode = 401
    res.write('Authorization header required');
    res.end();
    return;
  }
  var authReq = request({
    url: 'https://api.github.com/',
    // https://developer.github.com/v3/#user-agent-required
    headers: {'User-Agent': userAgent},
    auth: {user: user}
  })
  .on('response', authRsp => {
    if (authRsp.statusCode == 200) {
      var fileReq = request({
        // https://developer.github.com/changes/2014-04-25-user-content-security/
        url: 'https://raw.githubusercontent.com' + req.url,
        headers: {'User-Agent': userAgent},
        auth: {user: user}
      })
      .pipe(res);
    } else {
      authReq.pipe(res);
    }
  });
  authReq.end();
}).listen(process.env.PORT || 3000);
