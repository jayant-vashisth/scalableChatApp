import { Kafka, Producer } from "kafkajs";
import fs from "fs";
import prismaClient from "./prisma";

const kafka = new Kafka({
  brokers: [process.env.KAFKA_URL || "NULL"],
  ssl: {
    ca: [fs.readFileSync("./ca.pem", "utf-8")],
  },
  sasl: {
    username: process.env.KAFKA_USERNAME || "NULL",
    password: process.env.KAFKA_PASSWORD || "NULL",
    mechanism: "plain",
  },
});

let producer: null | Producer = null;

export async function createProducer() {
  if (producer) return producer;
  const _producer = kafka.producer();
  await _producer.connect();

  producer = _producer;

  return producer;
}

export async function produceMessage(message: string) {
  const producer = await createProducer();
  await producer.send({
    messages: [{ key: `message-${Date.now}`, value: message }],
    topic: "MESSAGES",
  });
}

export async function startMessageConsumer() {
  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });

  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      console.log("new message received");

      if (!message.value) return;

      try {
        await prismaClient.message.create({
          data: {
            text: message.value?.toString(),
          },
        });
      } catch (err) {
        console.log("something is wrong");
        pause();
        setTimeout(() => {
          consumer.resume([{ topic: "MESSAGES" }]);
        }, 60 * 1000);
      }
    },
  });
}
