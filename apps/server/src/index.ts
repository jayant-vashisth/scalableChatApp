import http from "http";
import SocketService from "./services/socket";
import dotenv from "dotenv";
import { startMessageConsumer } from "./services/kafka";

async function init() {
  dotenv.config();
  const socketService = new SocketService();
  const httpServer = http.createServer();
  const PORT = process.env.PORT || 8000;

  startMessageConsumer();

  socketService.io.attach(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });

  socketService.initListener();
}

init();
