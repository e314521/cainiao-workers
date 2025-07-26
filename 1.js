const https = require('https');
const SocksProxyAgent = require('socks-proxy-agent').SocksProxyAgent;
const SocksClientError = require('socks').SocksClientError;
const fs = require('fs');
const path = require('path');
const MailParser = require('mailparser').MailParser;
const simpleParser = require('mailparser').simpleParser;
const lockfile = require('proper-lockfile');
const { Mutex } = require('async-mutex');
const { json } = require('stream/consumers');
const mutex = new Mutex();

const filePath = path.join(__dirname, 'output.json');
const socks5Path = path.join(__dirname, 'socks5.txt');
//import MailParser from 'mailparser';

// {"data":{"message":"邮箱验证码有误"},"code":201,"message":"邮箱验证码有误"}
// {"data":{"data":{"token":"313340d081a9f0587f0c0eb9ce6e2026","is_admin":0,"auth_data":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6NTI0MjkyLCJzZXNzaW9uIjoiNWM2YTllMDNiZjlhN2VmMTI3ZTJkNTM2ZjZlYWM4MTIifQ.xjTM0kn8YzU21rI6uwVJu1G7HVotren505QToepQTGc"}},"code":200,"message":"成功"}

if (!fs.existsSync(filePath)) {
  const socks5s = fs.readFileSync(socks5Path).toString().split(/[\r\n]+/);
  jsondata = {};
  socks5s.forEach((socks5) => {
    jsondata[socks5] = {
      "count": 0,
      "time": new Date().getTime()
    }
  })
  fs.writeFileSync(filePath, JSON.stringify(jsondata));


}


async function setProxy(proxy, time = 86400, count = 0) {
  const release = await mutex.acquire();
  try {
    data = JSON.parse(fs.readFileSync(filePath));


    if (proxy in data) {
      //console.log("代理存在")
      if (count > 0) {
        data[proxy]["count"] = data[proxy]["count"] + count
      } else {
        data[proxy]["count"] = 1
      }
      data[proxy]["time"] = new Date().getTime() + time * 1000  * data[proxy]["count"]
    } else {
      console.log("代理不存在")
      data[proxy] = {
        "count": 1,
        "time": new Date().getTime() + time * 1000
      }
    }
    fs.writeFileSync(filePath, JSON.stringify(data));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    release();
  }
}

async function getProxy() {
  const release = await mutex.acquire();
  try {
    data = JSON.parse(fs.readFileSync(filePath));
    let proxy = Object.keys(data).find(key => data[key]["time"] < new Date().getTime());
    return proxy;
  } catch (error) {
    console.error('Error:', error);
  } finally {
    release();
  }

}

async function getCode(email) {
  const postData = JSON.stringify({
    "email": email,
  });
  const options = {
    method: 'POST',
    headers: {
      "accept": "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "content-type": "application/json",
      "origin": "https://cn.cainiao.uk",
      "referer": "https://cn.cainiao.uk/",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  const req = https.request("https://api.ipc.one/e4ebc517-c46e-40d5-9bfb-e302cde331bf/api/getCodeWebsite", options, (res) => {
    let data = '';
    res.on('error', (err) => {
      console.error('Error:', err);
    })
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        if (jsonData.code == 200) {
          console.log("获取验证码成功")
        } else {
          console.log(jsonData)
          setTimeout(() => {
            getCode(email)
          }, 10000)
        }

      } catch (error) {
        console.error('Error parsing JSON:', err);
        setTimeout(() => {
          getCode(email)
        }, 10000)
      }
    })

  })
  req.on('error', (err) => {

    console.error('Error:', err);
    setTimeout(() => {
      getCode(email)
    }, 10000)
  })
  req.write(postData);
  req.end();

}

function register(email, code) {
  getProxy().then(proxy => {
    if (!proxy) {
      console.log("没有可用的代理")
      return;
    }
    const agent = new SocksProxyAgent(proxy);
    const postData = JSON.stringify({
      "email": email,
      "email_code": code,
      "invite_code": "2zva83ri",
      "password": "Aa123456"
    });
    const options = {
      method: 'POST',
      agent: agent,
      headers: {
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        "content-type": "application/json",
        "origin": "https://cn.cainiao.uk",
        "referer": "https://cn.cainiao.uk/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const req = https.request("https://api.ipc.one/e4ebc517-c46e-40d5-9bfb-e302cde331bf/api/registerWebsite", options, (res) => {
      let data = '';
      res.on('error', (err) => {
        console.error('Error:', err);
      })
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.code == 200) {
            setProxy(proxy, 86400).then(() => {
              console.log("注册成功")
              newEmail = email.replace(/(\d+)(?=@)/, (match) => {
                console.log("匹配到数字", match)
                // 将匹配到的数字递增 1
                const incrementedNumber = parseInt(match, 10) + 1;
                // 使用 padStart 方法确保数字保持三位数
                return incrementedNumber.toString().padStart(match.length, '0');
              });
              console.log("新邮箱", newEmail)
              setTimeout(() => {
                getCode(newEmail)
              }, 60000);
              
            })

          } else if (jsonData.code == 201) {
            setProxy(proxy, 86400).then(() => {
              register(email, code)
            })
            console.log("代理IP已经使用")
          } else {
            console.log(jsonData)
          }

        } catch (error) {
          console.error('Error parsing JSON:', err);
        }
      })

    })
    req.on('error', (err) => {
      if (err instanceof SocksClientError) {
        console.log("代理错误")
        setProxy(proxy, 6000, 1).then(() => {
          register(email, code)
        })
      } else {
        console.error('Error:', err);
      }


    })
    req.write(postData);
    req.end();
  })
}




// 读取证书文件
const options = {
  key: fs.readFileSync(path.join(__dirname, 'private-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certificate.pem'))
};

// 创建 HTTPS 服务器
const server = https.createServer(options, (req, res) => {
  console.log('Request received:', req.method, req.url);
  if (req.method === 'POST') {
    simpleParser(req, (err, mail) => {
      try {
        if (err) {
          console.error('Error parsing email:', err);
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('Hello, world!\n');
        } else {
          const regex = /分钟内有效[^\d]+(\d{1,6})/;
          const match = mail.text.match(regex);
          if (match) {
            console.log("匹配到验证码", match[1]);
            register(mail.to.text, match[1]);
          } else {
            console.log('Email content:', mail.text);
            console.log("没有匹配到验证码")
          }
          //register(mail.to.text, mail.text);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ret: 1, msg: '提交成功' }));
        }
      } catch (error) {
        console.error('Error handling request:', error);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ret: 0, msg: '' }));
      }
    })
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ret: 0, msg: '当前只支持post' }));
  }
});

// 监听端口
const port = 443;
server.listen(port, () => {
  console.log(`Secure server running at https://localhost:${port}/`);
});
