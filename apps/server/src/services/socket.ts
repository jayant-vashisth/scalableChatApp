import { Server } from "socket.io";

class SocketService {
  private _io: Server;

  constructor() {
    console.log("init socker service");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
  }

  public initListner() {
    const io = this._io;
    console.log("initialise socket listeners");
    io.on("connect", (socket) => {
      console.log("new socket connected", socket.id);

      socket.on("event:message", async ({ message }: { message: string }) => {
        await console.log("message: " + message);
      });
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
