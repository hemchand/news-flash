//import * as mongo from "../db";
import request from "request-promise";
import striptags from "striptags";
import promisify from "promisify-node";
import {tidy} from "htmltidy";

const summaryTool = promisify("node-summary");

const rex = /\<div[^\<]*?field-type-text-with-summary[^\<]*?\>([\s\S]*?)\<\/div\>/im;
const imagex = /\<span class="file"\>\<img class="file-icon"[^\<]*?\>\<a[^\<]*?href="([^"]*)"[^\<]*?\>/im;
const blurbex = /\<div[^\<]*?field-name-field-blurb-news[^\<]*?\>\<div[^\<]*?\>\<div[^\<]*?\>([^\<]*?)\<\/div\>\<\/div\>/im;
const tagsrex = /<div[^\<]*?field-name-field-bread-crumb-news[^\<]*?\>([\s\S]*?)\<\/div>/im;


const rssFeeds = {
  "India and World":	'http://www.thenewsminute.com/news.xml',
  // "Karnataka":	'http://www.thenewsminute.com/karnataka.xml',
  // "Kerala":	'http://www.thenewsminute.com/kerala.xml',
  // "Tamil Nadu":	'http://www.thenewsminute.com/tamil.xml',
  // "Andhra Pradesh":	'http://www.thenewsminute.com/andhra.xml',
  // "Telangana":	'http://www.thenewsminute.com/telangana.xml',
  // "Culture":	'http://www.thenewsminute.com/culture.xml',
  // "Media":	'http://www.thenewsminute.com/media.xml',
  // "Blog":	'http://www.thenewsminute.com/blog.xml',
  // "Opinion":	'http://www.thenewsminute.com/opinion.xml'
};

function getHashCode(s){
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
}
//api_key=io1euaimql6h0btxa96esvcfahbdmeyhjuvhckkg&
export async function getNews() {
  let articles = [];
  for (let category in rssFeeds) {
    let url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssFeeds[category])}`;
    console.log(url);
    const rssJson = await request({
        url: url,
        json: true
    });
    if (rssJson.status == "ok") {
      let entry = null;
      let imageUrl = null;
      let textContent = null;
      let subtitle = null;
      let tags = null;
      if (rssJson.items.length == 0) {
        console.log("0 count:", rssJson);
      }
      for (let i=0; i<rssJson.items.length; i++) {
        entry = rssJson.items[i];
        imageUrl = null;
        textContent = '';
        subtitle = '';
        let matches = [];
        let match = rex.exec(entry.content);
        if (match != null) {
          textContent = striptags(match[1]);
        }
        match = imagex.exec(entry.content);
        if (match != null) {
          imageUrl = match[1];
        }
        match = blurbex.exec(entry.content);
        if (match != null) {
          subtitle = match[1];
        }
        tags = [category];
        match = tagsrex.exec(entry.content);
        if (match != null) {
          tags.push(striptags(match[1]));
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
        let pubTime = new Date(entry.pubDate);
        // console.log(`${pubTime}|${entry.link}`, "hash:", getHashCode(`${pubTime}|${entry.link}`));
        let formattedEntry = {title:entry.title, link:entry.link, pubTime, author:entry.author, subtitle, summary, content:textContent, image:imageUrl, tags, value:0};
        // console.log(formattedEntry);
        articles.push(formattedEntry);
      }
      console.log(`Feed:${category} - articles:${rssJson.items.length}`);
    } else {
      // console.log("errors:", rssJson);
    }
  }
  // let yesterday = new Date();
  // yesterday.setDate(yesterday.getDate() - 1);
  // console.log(yesterday);
  // console.log("before filter:", articles.length);
  // articles.filter(x => x.pubTime > yesterday).sort((x,y) => y.pubTime - x.pubTime);
  // console.log("after filter:", articles.length);
  console.log(articles);
  return articles;
}

getNews();
