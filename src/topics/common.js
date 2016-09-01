/* @flow */
import { defTopic, defPattern, defHook, enterTopic, clearConversation } from "wild-yak";

const defautMenu = [
  "Top stories",
  "Stories for you",
  "Ask News Minute"
];

export function getOptinHook(topic: any) : any {
  return defPattern(
   topic,
   "optin",
   [/^optin$/i],
   async (state) => {
     await clearConversation(state);
     saveUser();
     return [
     {
       "type":"options",
       "text": 'Hi there, let’s get started. I’ll send you top stories every day. If you get lost, just type help. Or, use a few words to tell me what you want to know more about. For example, you could type “headlines,” “Rio Olympics,” or “politics.”',
       "values": defautMenu
     }
   ]
 });
}

export function getStartOverHook(topic: any, mainTopic: any) : any {
  return defPattern(
   topic,
   "startover",
   [/^hello$/i, /^hi$/i, /^go back$/i, /^restart$/i],
   async (state) => {
     await clearConversation(state);
    //  if (state.context.topic.name !== 'main') {
    //    await enterTopic(state.context.topic, state, main.topic);
    //  }
     return [
     'Hi there, let’s get started.',
     {
       "type":"options",
       "text": "Pick an option below to get going",//Select from one of the below options:",
       "values": defautMenu
     }
   ]
 });
}
