import Driver from "isotropy-backend-mongodb";

let CONN_STR, db;

export function setConnectionString(connectionString) {
  CONN_STR = connectionString;
}

export async function getDb(str) {
  if (!db) {
    if (!CONN_STR) {
      throw new Error("Connection string was not set.");
    }
    db = await Driver.MongoClient.connect(str || CONN_STR);
  }
  return db;
}
