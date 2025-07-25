const https = require('https');
const fs = require('fs');
const path = require('path');
const MailParser = require('mailparser').MailParser;
//import MailParser from 'mailparser';

// 读取证书文件
const options = {
  key: fs.readFileSync(path.join(__dirname, 'private-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certificate.pem'))
};

// 创建 HTTPS 服务器
const server = https.createServer(options, (req, res) => {
  console.log('Request received:', req.method, req.url);
  try {
    if (req.method === 'POST') {
      const mailParser = new MailParser();
      let body = '';
      mailParser.on('end', (mail) => {
        // 获取邮件内容
        console.log('Subject:', mail.subject);
        console.log('From:', mail.from);
        console.log('To:', mail.to);
        console.log('Text:', mail.text); // 纯文本内容
        console.log('HTML:', mail.html); // HTML 内容
      });

      // 监听错误事件
      mailParser.on('error', (err) => {
        console.error('Error parsing email:', err);
      });
      mailParser.on('headers', (headers) => {
        console.log('Headers:', headers);
      })

      
      //mailParser.pipe(res);




      req.on('data', chunk => {
        //body += chunk.toString(); // 将 Buffer 转换为字符串
        mailParser.write(chunk.toString());
      });
  
      // 数据接收完毕
      req.on('end', () => {
        mailParser.end();
        //console.log('POST body: ', body);
        //res.writeHead(200, {'Content-Type': 'text/plain'});
        //res.end('Received your POST request.\n');
      });
    } else {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Hello, world!\n');
    }
  } catch (error) {
    console.error('Error handling request:', error);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, world!\n');
  }

});

// 监听端口
const port = 443;
server.listen(port, () => {
  console.log(`Secure server running at https://localhost:${port}/`);
});
