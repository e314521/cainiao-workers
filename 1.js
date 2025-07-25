const https = require('https');
const fs = require('fs');
const path = require('path');

// 读取证书文件
const options = {
  key: fs.readFileSync(path.join(__dirname, 'private-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certificate.pem'))
};

// 创建 HTTPS 服务器
const server = https.createServer(options, (req, res) => {
   if (req.method === 'POST') {
    let body = '';

    // 接收数据块
    req.on('data', chunk => {
      body += chunk.toString(); // 将 Buffer 转换为字符串
    });

    // 数据接收完毕
    req.on('end', () => {
      console.log('POST body: ', body);
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Received your POST request.\n');
    });
  } else {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello, world!\n');
  }
});

// 监听端口
const port = 443;
server.listen(port, () => {
  console.log(`Secure server running at https://localhost:${port}/`);
});
