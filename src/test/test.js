import __polyfill from "babel-polyfill";
import should from "should";
import request from "supertest-as-promised";

import * as mongo from "../db";
import host from "../host";

mongo.setConnectionString("mongodb://localhost:27017/arnabdb");

describe("newsflash", () => {

  before(async () => {
    const db = await mongo.getDb();
    await db.dropDatabase();
  });

  it("starts", async () => {
    const result = await request(host()).get("/yak");
    result.text.should.equal("Hello, World!")
  });

  it("gets news feed from rss", async () => {
    const resp = await request(host()).get("/api/web/getnews");
    resp.body.messages[0].text.should.equal("Welcome to News Minute. How can I help you?");
  });

  // it("responds to messages from the facebook handler", async () => {
  //   const webUrl = "/api/fb/webhook";
  //   const payload = {"object":"page","entry":[{"id":"493118637553868","time":1465737139997,"messaging":[{"sender":{"id":"1276236915720107"},"recipient":{"id":"493118637553868"},"timestamp":1465737139949,"message":{"mid":"mid.1465737139943:363912f3d1f1719f72","seq":176,"text":"restart"}}]}]};
  //   // const payload2 = {"object":"page","entry":[{"id":"493118637553868","time":1465737144508,"messaging":[{"sender":{"id":"1276236915720107"},"recipient":{"id":"493118637553868"},"timestamp":1465737144278,"message":{"mid":"mid.1465737144185:28cac26755a9b5ce09","seq":180,"text":"hello"}}]}]};
  //   // const payload3 = {"object":"page","entry":[{"id":"493118637553868","time":1465737147077,"messaging":[{"sender":{"id":"1276236915720107"},"recipient":{"id":"493118637553868"},"timestamp":1465737147077,"postback":{"payload":"Beauty advice"}}]}]};
  //   await request(host()).post(webUrl).send(payload);
  //   // await request(host()).post(webUrl).send(payload2);
  //   // await request(host()).post(webUrl).send(payload3);
  //   // resp.body.messages[0].text.should.equal("Okay, you’re looking for advice in:");
  // });
  //
  // it("responds to feed change from the facebook handler", async () => {
  //   const webUrl = "/api/fb/webhook";
  //   const payload = {"entry":[{"changes":[{"field":"feed","value":{"parent_id":"493118637553868_498246720374393","sender_name":"Some One","comment_id":"498246720374393_498246903707708","sender_id":1276236915720107,"item":"comment","verb":"add","created_time":1466972372,"post_id":"493118637553868_498246720374393","message":"Test Comment"}}],"id":"493118637553868","time":1466972372}],"object":"page"};
  //   await request(host()).post(webUrl).send(payload);
  //   await settimeout(done, 5000);
  // });
  //
  // it("responds to feed change from the facebook handler", async () => {
  //   const webUrl = "/api/fb/webhook";
  //   const payload = {"entry":[{"changes":[{"field":"feed","value":{"parent_id":"498246720374393_498246903707708","sender_name":"Some One","comment_id":"498246720374393_498246973707701","sender_id":1276236915720107,"item":"comment","verb":"add","created_time":1466972372,"post_id":"493118637553868_498246720374393","message":"Test Reply"}}],"id":"493118637553868","time":1466972372}],"object":"page"};
  //   await request(host()).post(webUrl).send(payload);
  // });
});
