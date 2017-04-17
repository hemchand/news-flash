/* @flow */
import { defTopic, defPattern, defHook, init, enterTopic, exitTopic } from "wild-yak";
import * as common from "./common";
import * as libNews from "../domain/news";
import * as libUser from "../domain/user";

const globalTopic: any = defTopic(
  "global",
  async () => {},
  {
    hooks: [
      common.getOptinHook(globalTopic),
      common.getStartOverHook(globalTopic),
      defPattern(
       globalTopic,
       "top stories",
       [/^top stories$/i, /^headlines?$/i, /^head lines?$/i, /^trending/i],
       async (state) => {
         await libUser.save(state.session);
         const articles = await libNews.getTopStories();
         return [libNews.formatResults(articles)];
       }),
       defPattern(
        globalTopic,
        "Stories for you",
        [/^Stories for you$/i],
        async (state) => {
          await libUser.save(state.session);
          const articles = await libNews.getYourStories();
          return [libNews.formatResults(articles)];
      }),
      defHook(
       globalTopic,
       "Get a summary",
       async (state, message) => {
         const rex = /^Get a summary ([a-z0-9]+)$/i;
         const match = rex.exec(message.text);
         if (match != null) {
           return match[1];
         }
       },
       async (state, articleId) => {
         await libUser.save(state.session);
         const article = await libNews.getArticleById(articleId);
         if (article) {
           return [
             article.summary.length > 640 ? article.summary.substring(0, 637) + '...' : article.summary,
             {
             "type":"options",
             "text": 'What next?”',
             "values": [
               {"text": "Read this story", "url":article.link },
               "Top stories",
               "Stories for you"
             ]
            }
          ];
         }
       }
      ),
      defPattern(
       globalTopic,
       "Ask News minute",
       [/Ask News minute/i],
       async (state) => {
         await libUser.save(state.session);
         return ['What’re you looking for? Use one or two  words to tell me what you want to know more about. For example, you could type “politics” or “space.”'];
     }),
      defHook(
        globalTopic,
        "default search",
        async (state, message) => message,
        async (state, message) => {
          await libUser.save(state.session);
          const articles = await libNews.searchNews(message.text);
          if (articles && articles.length > 0) {
            return [`Here’s something about ${message.text}`, libNews.formatResults(articles)];
          } else {
            return ['¯\_(ツ)_/¯  Try again? Use a few words to tell me what you want to know more about... For example, you could type “headlines,” “Rio Olympics,” or “politics.”'];
          }
        }
      )
    ]
  }
);

export default {
  messaging: [
    globalTopic
  ],
  feed: []
};
