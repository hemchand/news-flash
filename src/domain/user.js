import * as libDBO from "./dbo";

// export async function get(name) {
//   const db = await mongo.getDb();
//   const users = db.collection("users");
//   const results = await users.find({ name });
//   return await users.find({ sessionId }).limit(1).next();
// }
const collName = 'users';

export async function save(session) {
  let userId = session.user.id;
  let dbUser = await libDBO.findOne(collName, {userId});
  console.log("dbUser:", dbUser);
  if (dbUser) {
    await libDBO.updateOne(collName, {userId}, {source:session.type, pageId:session.pageId, last_active: new Date()});
  } else {
    await libDBO.createNew(collName, {userId, source:session.type, pageId:session.pageId, last_active: new Date()});
  }
}
