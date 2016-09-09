/* @flow */
import koa from "koa";
import router from "koa-route";
import bodyParser from 'koa-bodyparser';
import request from "request-promise";
import { init } from "paddock";

import sessionMiddleware from "./middleware/session";
import topics from "./topics/topics";
import * as news from "./domain/news";

function getSessionId(session) {
  return (session.type === "simple") ? session.id :
    (session.type === "facebook") ? session.user.id :
    "null";
}

const pageAccessTokens = {
  "553466188175383": "EAARJTz6poOcBAKIvjPFWAdCrWSVZAo8zt41QRgEoTdk3qzPwUFnMEO4pggm44xMcBUCQDuGGaCvkax4ZByziZBffIwwWwfg6VfvquZBeBckKJsAmKot4x2P0DpFkXouvuwGPu1vrAZB7RRsSPJD1nfukISrrqr7Fd59sdQfVyTwZDZD"
};

function getSessionType(session) {
  return session.type;
}

export default function(port: number) {
  const paddock = init(
    topics,
    { getSessionId, getSessionType },
    {
      facebook: {
        verifyToken: "kattangal",
        pageAccessTokens,
        request
      },
      simple: {}
    }
  );

  const __temp_session = { sessionId: "abcd", type: "simple" }

  const app = new koa();

  app.use(bodyParser());
  app.use(sessionMiddleware);

  const routes = [
    router.get("/api/fb/webhook", async (ctx) => {
      const result = await paddock.facebook.verify(ctx.request);
      ctx.body = result.text;
    }),
    router.post("/api/fb/webhook", async (ctx) => {
      console.log(JSON.stringify(ctx.request.body));
      try {
        const batches = paddock.facebook.getMessageBatches(ctx.request.body);
        for (let i=0; i<batches.length; i++) {
          for (let userId in batches[i].userBatches) {
            let session = {user: {id: userId}, pageId:batches[i].pageId, type:"facebook"};
            for (let conversationType in batches[i].userBatches[userId]) {
                for (let conversationId in batches[i].userBatches[userId][conversationType]) {
                let messages = batches[i].userBatches[userId][conversationType][conversationId];
                await paddock.facebook.hook(conversationId, conversationType, { session, body: messages });
              }
            }
          }
        }
      } finally {
        ctx.status = 200;
        ctx.body = "ok";
      }
    }),
    router.post("/api/web/webhook", async (ctx) => {
      const result = await paddock.simple.hook('web', 'messaging', { session: ctx.session, body: ctx.request.body });
      ctx.body = result;
    }),
    router.get("/api/news/refresh/", async (ctx) => {
      // const result = await rss.getNews();
      const result = await news.refresh(pageAccessTokens);
      ctx.body = result;
    }),
    router.get("/api/news/push", async (ctx) => {
      // const result = await rss.getNews();
      const result = await news.sendUpdates(paddock);
      ctx.body = result;
    }),
    // router.get("/api/web/getnews/:page", async (ctx) => {
    //   const result = await rss.getNews(page);
    //   ctx.body = result;
    // }),
    router.get("/yak", async (ctx) => {
      ctx.body = "Hello, World!";
    })
  ];
  routes.forEach(r => app.use(r));

  return app.listen(port || 0);
}
