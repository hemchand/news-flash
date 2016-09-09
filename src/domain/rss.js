//import * as mongo from "../db";
import request from "request-promise";
import striptags from "striptags";
import promisify from "promisify-node";
import {tidy} from "htmltidy";

const summaryTool = promisify("node-summary");

const rex = /\<div\>\s*\<div\>\s*\<div\>([\s\S]*?)\<\/div\>\s*\<\/div\>\s*\<\/div\>/igm;
const imagex = /\<div\>\s*<img src="([^"]*)"[^\<]*?\<\/div\>/igm;

const rssFeeds = {
  "India and World":	'http://www.thenewsminute.com/news.xml',
  "Karnataka":	'http://www.thenewsminute.com/karnataka.xml',
  "Kerala":	'http://www.thenewsminute.com/kerala.xml',
  "Tamil Nadu":	'http://www.thenewsminute.com/tamil.xml',
  "Andhra Pradesh":	'http://www.thenewsminute.com/andhra.xml',
  "Telangana":	'http://www.thenewsminute.com/telangana.xml',
  "Culture":	'http://www.thenewsminute.com/culture.xml',
  "Media":	'http://www.thenewsminute.com/media.xml',
  "Blog":	'http://www.thenewsminute.com/blog.xml',
  "Opinion":	'http://www.thenewsminute.com/opinion.xml'
};

function getHashCode(s){
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
}

export async function getNews() {
  let articles = [];
  for (let category in rssFeeds) {
    const rssJson = await request({
      uri: `https://ajax.googleapis.com/ajax/services/feed/load?v=2.0&q=${rssFeeds[category]}&num=`,
      json: true
    });
    let entry = null;
    let imageUrl = null;
    let textContent = null;
    for (let i=0; i<rssJson.responseData.feed.entries.length; i++) {
      entry = rssJson.responseData.feed.entries[i];
      imageUrl = null;
      textContent = '';
      let matches = [];
      let match = rex.exec(entry.content);
      if (match != null) {
        textContent = striptags(match[1]);
      }
      match = imagex.exec(entry.content);
      if (match != null) {
        imageUrl = match[1];
      }
      // while (match != null) {
      //   matches.push(match[1]);
      //   if (imageUrl == null) {
      //     let imageMatch = imagex.exec(match[1]);
      //     if (imageMatch != null) {
      //       imageUrl = imageMatch[1];
      //     }
      //   }
      //   match = rex.exec(entry.content);
      // }
      // let textContent = striptags(matches[matches.length-1]);
      let summary = await summaryTool.summarize(entry.title, textContent);
      let pubTime = Date.parse(entry.publishedDate);
      // console.log(`${pubTime}|${entry.link}`, "hash:", getHashCode(`${pubTime}|${entry.link}`));
      let formattedEntry = {title:entry.title, link:entry.link, pubTime, subtitle:matches[1], summary, image:imageUrl, tags:[category], value:0};
      // console.log(formattedEntry);
      articles.push(formattedEntry);
    }
    console.log(`Feed:${category} - articles:${rssJson.responseData.feed.entries.length}`);
  }
  // let yesterday = new Date();
  // yesterday.setDate(yesterday.getDate() - 1);
  // console.log(yesterday);
  // console.log("before filter:", articles.length);
  // articles.filter(x => x.pubTime > yesterday).sort((x,y) => y.pubTime - x.pubTime);
  // console.log("after filter:", articles.length);
  return articles;
}
