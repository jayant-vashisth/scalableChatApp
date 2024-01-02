import { Server } from "socket.io";
import Redis, { RedisOptions } from "ioredis";
import dotenv from "dotenv";
import prismaClient from "./prisma";
import { produceMessage } from "./kafka";

dotenv.config();

const redisUrienv = `redis://${process.env.HOST}:${process.env.PASSWORD}`;
const pub = new Redis(redisUrienv);
const sub = new Redis(redisUrienv);

class SocketService {
  private _io: Server;

  constructor() {
    console.log("init socket service");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
    sub.subscribe("MESSAGES");
  }

  public initListener() {
    const io = this._io;
    console.log("initialize socket listeners");

    io.on("connect", (socket) => {
      console.log("new socket connected", socket.id);
      console.log("redisUrienv: ", redisUrienv);
      socket.on("event:message", async ({ message }: { message: string }) => {
        await pub.publish("MESSAGES", JSON.stringify({ message }));
        console.log("message: " + message);
        // publish this message on Redis
      });
    });

    sub.on("message", async (channel, message) => {
      if (channel === "MESSAGES") {
        console.log("new message from redis", message);
        io.emit("message", message);

        await produceMessage(message);
        console.log("Message produced to kafka broker")
      }
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
