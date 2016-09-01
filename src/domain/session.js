import * as mongo from "../db";

export async function get(sessionId) {
  const db = await mongo.getDb();
  const sessions = db.collection("sessions");
  return await sessions.find({ sessionId }).limit(1).next();
}

export async function save(session) {
  const db = await mongo.getDb();
  const sessions = db.collection("sessions");
  return await sessions.updateOne({ sessionId: session.sessionId }, {$set: session});
}
