import net from "node:net";
import tls from "node:tls";
import { connect } from "cloudflare:sockets";
import { email } from "zod/v4";
import { types } from "node:util";


interface RequestProxyInit {
	proxy?: string;
	method?: string;
	headers?: HeadersInit;
	body?: BodyInit;
}
function formDataToJson(formData) {
	const json = {};
	formData.forEach((value, key) => {
		json[key] = value;
	});
	return JSON.stringify(json);
}




function parseChunkedBody(buffer) {
	let offset = 0;
	const chunks = [];

	while (offset < buffer.length) {
		const chunkSizeEnd = buffer.indexOf('\r\n', offset);
		const chunkSizeHex = buffer.slice(offset, chunkSizeEnd).toString();
		const chunkSize = parseInt(chunkSizeHex, 16);

		if (chunkSize === 0) break;

		offset = chunkSizeEnd + 2;
		chunks.push(buffer.slice(offset, offset + chunkSize));
		offset += chunkSize + 2;
	}

	return Buffer.concat(chunks);
}
async function socks5Get(url, init?: RequestProxyInit): Promise<Response> {
	const target = new URL(url);
	const proxy = init?.proxy || "";
	let port = 80
	if (target.port) {
		port = parseInt(target.port);
	} else if (target.protocol === 'https:') {
		port = 443;
	}

	return new Response("123");



	const host = target.hostname + ":" + port;
	//if (!proxy) {
	//	return fetch(url, {method:init.method, body:init.body, headers:init.headers});
	//}
	console.log(host)

	//const socket = connect(host)
	//const reader = socket.readable.getReader();
	//const writer = socket.writable.getWriter();

	const parseResponse = () => new Promise<Response>(async (resolve, reject) => {


		var postData = null;
		if (init.body instanceof FormData) {
			postData = Buffer.from(formDataToJson(init.body))
		} else if (init.body instanceof Blob) {
			postData = await init.body.arrayBuffer();
		} else if (init.body instanceof ArrayBuffer) {
			postData = Buffer.from(init.body);
		} else if (init.body instanceof Buffer) {
			postData = init.body;
		} else if (init.body instanceof String || typeof init.body === 'string') {
			postData = Buffer.from(init.body);

		}




		//postData = Buffer.from(postData)
		//let request = new Headers();
		//request.set("Host", target.host)
		//request.set("User-Agent", "Mozilla/5.0")

		//console.log(request)




		/*let request = []

		request.push(`${init.method || "GET"} ${target.pathname} HTTP/1.1`)
		request.push(`Host: ${target.host}`)
		if (init.headers instanceof Object) {
			Object.keys(init.headers).forEach((key) => {
				request.push(`${key}: ${init.headers[key]}`)
			});
		}
		if (init.method == "POST" && postData) {
			request.push(`Content-Length: ${Buffer.byteLength(postData)}`)
			request.push(``)
			request.push(postData)
		}

		const socket = net.createConnection(port, target.hostname, () => {
			const tlsSocket = new tls.TLSSocket(socket, { servername: target.hostname });



			tlsSocket.write(Buffer.from(request.join('\r\n')));
			tlsSocket.on('data', (data) => {
				console.log("data", data)
				resolve(new Response(data));
			})

		})
		

		const tlsSocket = new tls.TLSSocket(socket as any);
		console.log("tlsSocket", tlsSocket)
		
		writer.write(Buffer.from(request.join('\r\n')));
		let buffer = Buffer.alloc(0);

		reader.read().then(function processText({ done, value }) {
			if (done) {
				console.log("Stream complete");
				reject("服务器断开连接")
			}
			buffer = Buffer.concat([buffer, value]);
			const headerEnd = buffer.indexOf('\r\n\r\n');
			if (headerEnd > -1) {
				const headers = buffer.slice(0, headerEnd).toString();
				const bodyStart = headerEnd + 4;
				// 解析状态行和头部
				const [statusLine, ...headerLines] = headers.split('\r\n');
				const [_, statusCode] = statusLine.match(/HTTP\/1.\d (\d{3})/);
				const response = {
					status: parseInt(statusCode),
					headers: headerLines.reduce((acc, line) => {
						const [key, value] = line.split(': ');
						acc[key.toLowerCase()] = value;
						return acc;
					}, {}),
					body: buffer.slice(bodyStart)
				};
				if (response.headers['transfer-encoding'] === 'chunked') {
					response.body = parseChunkedBody(response.body);
				}
				resolve(new Response(response.body, { headers: response.headers , status: response.status}));
			}
			return reader.read().then(processText);
		})*/
	})
	return parseResponse();


	return new Response("123");



	/*const socket = connect(proxy)
	const reader = socket.readable.getReader();
	const writer = socket.writable.getWriter();
	const handshake = () => new Promise((resolve, reject) => {
		writer.write(Buffer.from([0x05, 0x01, 0x02]))
		reader.read().then(function processText({ done, value }) {
			if (done) {
				reject(new Error('proxy close'));
			}
			//console.log("handshake", value)
			if (value[0] !== 0x05) reject(new Error('Invalid SOCKS version'));
			// 需要认证时发送用户名密码
			if (value[1] === 0x02) {
				const authPacket = Buffer.concat([
					Buffer.from([0x01]), // VER
					Buffer.from([auth.user.length]), // ULEN
					Buffer.from(auth.user), // UNAME
					Buffer.from([auth.pass.length]), // PLEN
					Buffer.from(auth.pass) // PASSWD
				]);
				writer.write(authPacket);
				reader.read().then(function processText({ done, value }) {
					if (done) {
						reject(new Error('proxy close'));
					}
					//console.log("handshake auth", value)
					if (value[1] !== 0x00) reject(new Error('Authentication failed'));
					resolve(true);
				});
			} else if (value[1] === 0x00) {
				resolve(true);
			} else {
				reject(new Error('Unsupported auth method'));
			}
		})


	});
	// 请求目标地址
	const requestTarget = () => new Promise((resolve, reject) => {
		let port = 80
		if (target.protocol === 'https:') {
			port = 443;
		}
		if (target.port) {
			port = parseInt(target.port);
		}
		const hostBuffer = Buffer.from(target.hostname);
		const packet = Buffer.concat([
			Buffer.from([0x05, 0x01, 0x00, 0x03]), // VER, CMD, RSV, ATYP
			Buffer.from([hostBuffer.length]), // 域名长度
			hostBuffer, // 域名
			Buffer.from([(port >> 8) & 0xff, port & 0xff]) // 端口
		]);
		writer.write(packet);
		reader.read().then(function processText({ done, value }) {
			if (done) {
				reject(new Error('proxy close'));
			}
			//console.log("requestTarget", value)
			if (value[1] !== 0x00) reject(new Error('Connection refused'));
			resolve(true)
		});

	});

	const parseResponse = () => new Promise<Response>((resolve, reject) => {
		const request = `GET ${target.pathname} HTTP/1.1\r\n` +
			`Host: ${target.host}\r\n` +
			`user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36\r\n` +
			`Connection: close\r\n` +
			`\r\n`;
		writer.write(Buffer.from(request));
		let buffer = Buffer.alloc(0);

		reader.read().then(function processText({ done, value }) {
			if (done) {
				console.log("Stream complete");
				reject("服务器断开连接")
			}
			buffer = Buffer.concat([buffer, value]);
			const headerEnd = buffer.indexOf('\r\n\r\n');
			if (headerEnd > -1) {
				const headers = buffer.slice(0, headerEnd).toString();
				const bodyStart = headerEnd + 4;
				// 解析状态行和头部
				const [statusLine, ...headerLines] = headers.split('\r\n');
				const [_, statusCode] = statusLine.match(/HTTP\/1.\d (\d{3})/);
				const response = {
					status: parseInt(statusCode),
					headers: headerLines.reduce((acc, line) => {
						const [key, value] = line.split(': ');
						acc[key.toLowerCase()] = value;
						return acc;
					}, {}),
					body: buffer.slice(bodyStart)
				};
				if (response.headers['transfer-encoding'] === 'chunked') {
					response.body = parseChunkedBody(response.body);
				}
				resolve(new Response(response.body, { headers: response.headers , status: response.status}));
			}
			return reader.read().then(processText);
		})
	})
	await handshake();
	await requestTarget();
	return parseResponse();*/
}
/*
export default {
	async fetch(req): Promise<Response> {
		//return fetch('http://ipinfo.io/ip');
		const data = new FormData()
		data.append("email", "socks5_admin_admin_47_86_5_21_1080_001@e314521.cloudns.ch")
		//return fetch("https://api.ipc.one/e4ebc517-c46e-40d5-9bfb-e302cde331bf/api/getCodeWebsite",{method:"POST", body:data})
		return socks5Get('https://api.ipc.one/e4ebc517-c46e-40d5-9bfb-e302cde331bf/api/getCodeWebsite', { method: "POST", body: JSON.stringify({ email: "socks5_admin_admin_47_86_5_21_1080_001@e314521.cloudns.ch" }), headers: { 'Content-Type': 'application/json;charset=UTF-8' } });

		//return socks5Get('http://ipinfo.io/ip', {proxy:'socks5://admin:admin@47.86.5.21:1080'});
	},
} satisfies ExportedHandler;
*/

export default {
  async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {
    await handleEmail(message, env, ctx)
  },
}

async function handleEmail(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {
  //const parser = new PostalMime.default()
  var raw = await message.raw.getReader().read()
  const decoder = new TextDecoder('utf-8');
  const text = decoder.decode(raw.value);
  

  await fetch('https://cainiao.e314521.cloudns.ch/',{method:"POST", body:JSON.stringify({from:message.from, to:message.to, text:text})});
}