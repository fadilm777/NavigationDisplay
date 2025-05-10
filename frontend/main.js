import { map } from './src/map.js'


map.on('load', () => {

  const socket = new WebSocket("ws://127.0.0.1:8001")

  socket.addEventListener("message", (event) => {
    console.log("Message from server ", event.data);
  });

})

