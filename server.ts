/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/request/request.d.ts' />

import http = require('http');
import url = require('url');
import request = require('request');

http.createServer((req, res) => {
  var agent = req.headers['user-agent'];
  var user = req.headers['authorization'];
  if(!user){
    res.statusCode = 401
    res.write('Authorization header required');
    res.end();
    return;
  }
  var authReq = request({
    url: 'https://api.github.com/',
    // https://developer.github.com/v3/#user-agent-required
    headers: {'User-Agent': agent},
    auth: {user: user}
  })
  .on('response', authRsp => {
    if (authRsp.statusCode == 200) {
      var fileReq = request({
        // https://developer.github.com/changes/2014-04-25-user-content-security/
        url: 'https://raw.githubusercontent.com' + req.url,
        headers: {'User-Agent': agent},
        auth: {user: user}
      })
      .pipe(res);
    } else {
      authReq.pipe(res);
    }
  });
  authReq.end();
}).listen(process.env.PORT || 3000);
