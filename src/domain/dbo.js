import * as libDB from "../db";
import * as mongodb from "mongodb";

export const ObjectID = mongodb.ObjectID;

export async function getCollection(collName) {
  const db = await libDB.getDb();
  return db.collection(collName);
}

function getFieldObject(fields) {
  if (fields instanceof Array) {
    const fieldObj = fields ? fields.reduce((o, v, i) => { o[v] = 1; return o; },{}) : {};
    if (fields && !fields.includes('_id')) fieldObj['_id'] = 0;
    return fieldObj;
  } else {
    return fields;
  }
}

function getObjectId(entityId) {
  return (entityId instanceof Object && '_bsontype' in entityId && entityId._bsontype === 'ObjectID') ? entityId : new ObjectID(entityId);
}

export async function get(collName, entityId, fields) {
  return await findOne(collName, { _id: getObjectId(entityId) }, fields);
}

export async function findOne(collName, filter, fields) {
  return await (await getCollection(collName)).find(filter, getFieldObject(fields)).limit(1).next();
}

export async function getList(collName, entityIds, fields) {
  return await findMany(collName, {_id: {$in: entityIds}}, fields);
}

export async function getByClient(collName, clientId, fields) {
  return await findMany(collName, { clientId : getObjectId(clientId) }, fields);
}

export async function findMany(collName, filter, fields) {
  return await ((await getCollection(collName)).find(filter, getFieldObject(fields))).toArray();
}

export async function findManyCursor(collName, filter, fields) {
  return (await getCollection(collName)).find(filter, getFieldObject(fields));
}

export async function createNew(collName, entity) {
  return await (await getCollection(collName)).insertOne(entity);
}

export async function save(collName, entity) {
  return await updateOne(collName, { _id: entity._id }, entity);
}

export async function updateOne(collName, filter, entity) {
  return await (await getCollection(collName)).updateOne(filter, {$set: entity});
}

export async function deleteOne(collName, entityId) {
  return await (await getCollection(collName)).deleteOne({ _id: getObjectId(entityId) });
}

export async function deleteMany(collName, filter) {
  return await (await getCollection(collName)).deleteMany(filter);
}
