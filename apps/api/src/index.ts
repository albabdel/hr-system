import express from "express";
import helmet from "helmet";
import cors from "cors";
import pino from "pino";

const app = express();
const log = pino({ name: "api" });

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  log.info({ port }, "API listening");
});
