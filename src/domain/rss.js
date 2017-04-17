//import * as mongo from "../db";
import request from "request-promise";
import striptags from "striptags";
import promisify from "promisify-node";

const summaryTool = promisify("node-summary");

const rex = /\<div[^\<]*?field-type-text-with-summary[^\<]*?\>([\s\S]*?)\<\/div\>/im;
const imagex = /\<span class="file"\>\<img class="file-icon"[^\<]*?\>\<a[^\<]*?href="([^"]*)"[^\<]*?\>/im;
const blurbex = /\<div[^\<]*?field-name-field-blurb-news[^\<]*?\>\<div[^\<]*?\>\<div[^\<]*?\>([^\<]*?)\<\/div\>\<\/div\>/im;
const tagsrex = /<div[^\<]*?field-name-field-bread-crumb-news[^\<]*?\>([\s\S]*?)\<\/div>/im;

const metaDescRex = /\<meta property="og\:description" content="([^"]*)" \/\>/im;
const metaImageRex = /\<meta property="og\:image" content="([^"]*)" \/\>/im;
const htmlBlurbex = /\<div class="views-field views-field-field-blurb-news"\>\s+\<span class="field-content"\>([^\<]*?)\<\/span\>/im;


const rssFeeds = {
  "India and World":	'http://www.thenewsminute.com/news.xml',
  "Andhra Pradesh":	'http://www.thenewsminute.com/andhra.xml',
  "Karnataka":	'http://www.thenewsminute.com/karnataka.xml',
  "Kerala":	'http://www.thenewsminute.com/kerala.xml',
  "Tamil Nadu":	'http://www.thenewsminute.com/tamil.xml',
  "Telangana":	'http://www.thenewsminute.com/telangana.xml',
  "Features": 'http://www.thenewsminute.com/features.xml',
  "Flix": 'http://www.thenewsminute.com/flix.xml',
  "Voices": 'http://www.thenewsminute.com/voices.xml',
  "Culture":	'http://www.thenewsminute.com/culture.xml',
  "Social":	'http://www.thenewsminute.com/social.xml',
  "Atom":	'http://www.thenewsminute.com/atom.xml'
};

function getHashCode(s){
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
}

function getArticleInfo(rss) {

}

//api_key=io1euaimql6h0btxa96esvcfahbdmeyhjuvhckkg&
export async function getNews() {
  let articles = [];
  for (let category in rssFeeds) {
    let url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssFeeds[category])}`;
    console.log(url);
    const rssJson = await request({url: url, json: true});
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
        tags = [category];
        entry = rssJson.items[i];
        imageUrl = null;
        textContent = '';
        subtitle = '';
        if (entry.content.length > 0) {
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
          match = tagsrex.exec(entry.content);
          if (match != null) {
            tags.push(striptags(match[1]));
          }
        } else {
          console.log(`No content in RSS. loading page: ${entry.link}`);
          const pageHtml = await request({url:entry.link, gzip:true});
          let match2 = metaDescRex.exec(pageHtml);
          if (match2 != null) {
            textContent = match2[1];
          }

          match2 = metaImageRex.exec(pageHtml);
          if (match2 != null) {
            imageUrl = match2[1];
          }

          match2 = htmlBlurbex.exec(pageHtml);
          if (match2 != null) {
            subtitle = match2[1].trim();
          }
        }
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
  console.log(`Total: ${articles.length}`);
  return articles;
}
