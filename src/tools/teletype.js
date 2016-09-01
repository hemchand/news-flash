/* @flow */
import { init } from "paddock";
import request from "request-promise";

import topics from "../topics/topics";

function getSessionId(session) {
  return (session.type === "web") ? session.sessionId :
    (session.type === "facebook") ? session.user.id :
    "null";
}

function getSessionType(session) {
  return session.type;
}

const paddock = init(
  topics,
  { getSessionId, getSessionType },
  {
    facebook: {
      verifyToken: "abcd",
      pageAccessToken: "xyz1",
      request
    },
    web: {}
  }
);
