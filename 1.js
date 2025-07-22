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
  // 设置响应头
  res.writeHead(200, { 'Content-Type': 'text/plain' });

  console.log(req)

  // 发送响应内容
  res.end('Hello, secure world!\n');
});

// 监听端口
const port = 443;
server.listen(port, () => {
  console.log(`Secure server running at https://localhost:${port}/`);
});
