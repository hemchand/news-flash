import * as libDBO from "./dbo";

// export async function get(name) {
//   const db = await mongo.getDb();
//   const users = db.collection("users");
//   const results = await users.find({ name });
//   return await users.find({ sessionId }).limit(1).next();
// }
const collName = 'users';

export async function save(userId, source, pageId) {
  let dbUser = await libDBO.findOne(collName, {userId});
  console.log("dbUser:", dbUser);
  if (dbUser) {
    console.log("in update");
    await libDBO.updateOne(collName, {userId}, {source, pageId, last_active: new Date()});
  } else {
    console.log("in create");
    await libDBO.createNew(collName, {userId, source, pageId, last_active: new Date()});
  }
}
