import * as mongo from "../db";

export async function get(name) {
  const db = await mongo.getDb();
  const users = db.collection("users");
  const results = await users.find({ name });
  return await users.find({ sessionId }).limit(1).next();
}
