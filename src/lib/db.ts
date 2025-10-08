
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI missing");

let conn = global as unknown as { mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } };
if (!conn.mongoose) conn.mongoose = { conn: null, promise: null };

export async function dbConnect() {
  if (conn.mongoose.conn) return conn.mongoose.conn;
  if (!conn.mongoose.promise) {
    conn.mongoose.promise = mongoose.connect(MONGODB_URI, { dbName: "vrs" });
  }
  conn.mongoose.conn = await conn.mongoose.promise;
  return conn.mongoose.conn;
}
