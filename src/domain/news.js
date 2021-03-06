import * as rss from "./rss";
import * as fbfeed from "./fbfeed";
import * as libDBO from "./dbo";

const collName = 'articles';

export function formatResults(results) {
  if (results && results.length > 0) {
    return {
      "type": "elements",
      "values": results.slice(0,10).map((x) => ({
        "title":x.title,
        "subtitle": x.subtitle,
        "image_url":x.image,
        "options": [
          {"text": "Read story", "url":x.link },
          {"text": "Get a summary", "payload":`Get a summary ${x._id}` },
          'Ask News minute,'
        ]
      }))
    };
  } else {
    return ["Service unavailable at this time. Please try in a few minutes."];
  }
}

export async function getTopStories(lastId) {
  const filter = lastId ? {_id : { "$lt" : lastId }} : {};
  return await (await libDBO.findManyCursor(collName, filter)).sort({value: -1}).limit(5).toArray();
}

export async function getYourStories(lastId) {
  const filter = lastId ? {_id : { "$lt" : lastId }} : {};
  return await (await libDBO.findManyCursor(collName, {})).sort({pubTime: -1}).limit(5).toArray();
}

export async function getArticleById(articleId) {
  return await libDBO.get(collName, articleId);
}

export async function searchNews(text) {
  const searchTerm = new RegExp(text.match(/\S+/g)
    .map((x) => x.replace(/[^a-zA-Z0-9]+$/, '').replace(/^[^a-zA-Z0-9]+/,'')).join('|'), 'i');
  const filter = {$or : [{title: searchTerm}, {subtitle: searchTerm}, {summary: searchTerm}, { tags : { $elemMatch:{$eq:searchTerm} } }]};
  return await (await libDBO.findManyCursor(collName, filter)).sort({value: -1}).limit(5).toArray();
}

export async function refresh(pageAccessTokens) {
  var twoWeeksBack = new Date();
  twoWeeksBack.setDate(twoWeeksBack.getDate()-14);
  await libDBO.deleteMany(collName, {'pubTime': {$lt: twoWeeksBack}});

  let newArticles = 0;
  const articles = await rss.getNews();
  if (articles.length == 0) { return {articles:0}; }

  let links = articles.map(x => x.link);
  let results = await libDBO.findMany(collName, {link: {$in: links}}, ['link']);
  let oldLinks = results.map(x => x.link);
  for (let i=0; i<articles.length; i++) {
    if (!oldLinks.includes(articles[i].link)) {
      await libDBO.createNew(collName, articles[i]);
      newArticles++;
    }
  }

  let statsUpdates = 0;
  const fbPosts = await fbfeed.getFeed(pageAccessTokens);
  results = await libDBO.findMany(collName, {link: {$in: Object.keys(fbPosts)}}, ['link']);
  oldLinks = results.map(x => x.link);
  for (let link in fbPosts) {
    if (oldLinks.includes(link)) {
      await libDBO.updateOne(collName, { link }, fbPosts[link]);
      statsUpdates++;
    }
  }

  const result = {articles:articles.length, newArticles, postStats:Object.keys(fbPosts).length, statsUpdates};
  console.log(result);
  return result;
}

export async function sendUpdates(paddock) {
  let users = await libDBO.findMany("users", {}, ['userId', 'pageId']);
  let contexts = users.map(usr => { return {session:{user: { id: usr.userId }, pageId: usr.pageId}}; });
  const articles = await getYourStories();
  let messages = [{type:'string', text:'Here are the top stories of the day'}, formatResults(articles)];
  await paddock.facebook.sendBatchMessages(contexts, messages, 'messaging');
  return `Top stories sent to ${users.length} users.`;
}
