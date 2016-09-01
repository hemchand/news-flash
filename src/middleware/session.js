import * as libSession from "../domain/session";

export default async function(ctx, next) {
  const sessionId = ctx.query.session_id || ctx.cookies.get("session_id");
  if (sessionId) {
    ctx.session = await libSession.get(sessionId) || { id: sessionId, type: "simple"}
  } else {
    ctx.session = { id: "0", type: "simple" }
  }
  await next();
  if (ctx.session && ctx.session.id) {
    await libSession.save(ctx.session);
  }
}
