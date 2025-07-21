import net from "node:net";

const exampleIP = "127.0.0.1";

export default {
  async fetch(req): Promise<Response> {
    const socket = new net.Socket();
    socket.connect(4000, exampleIP, function () {
      console.log("Connected");
    });

    socket.write("Hello, Server!");
    socket.end();

    return new Response("Wrote to server", { status: 200 });
  },
} satisfies ExportedHandler;