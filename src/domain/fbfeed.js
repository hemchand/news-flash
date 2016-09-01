import request from "request-promise";

const access_token = 'EAAPDWLpVIgABALp6DOod5yJf5GX3K6b2AbmnpAaPm5h5MmHudHL3AFZCAtejv8aBG2wzD2v5YTuPmdtpFbIfPvwco0Qld7bFxJp79g0Uz21vwOtnEJZA9EkuoYuQUdNSYpPzO2Fft93450GrgAzYEICpkpSsRwLBFXp1RUbQZDZD';

export async function getFeed(pageAccessTokens) {
  let posts = {};
  for (let pageId in pageAccessTokens) {
    //TODO: Replace 'thenewsminute' with ${pageId} in the below line
    let url = `https://graph.facebook.com/v2.7/thenewsminute/posts?limit=100&fields=created_time,link,likes.limit(0).summary(true),shares,comments.filter(stream).limit(0).summary(true)&access_token=${pageAccessTokens[pageId]}`;
    while (Object.keys(posts).length < 1000) {
      let feed = await request({
        uri: url,
        json: true
      });
      for (let i=0; i<feed.data.length; i++) {
        let post = feed.data[i];
        if (post.link) {
          let shares = post.shares ? post.shares.count : 0;
          let likes = post.likes.summary.total_count;
          let comments = post.comments.summary.total_count;
          if (post.link in posts) {
            let oldPost = posts[post.link];
            oldPost['likes'] += likes,
            oldPost['comments'] += comments,
            oldPost['shares'] += shares,
            oldPost['value'] = oldPost['shares'] * 3 + oldPost['comments'] * 2 + oldPost['likes']
          } else {
            posts[post.link] = {link:post.link, likes, comments, shares, value: shares * 3 + comments * 2 + likes };
          }
        }
      }
      if (feed.paging && feed.paging.next) {
        url = feed.paging.next;
      } else {
        break;
      }
    }
  }
  console.log(`Got ${Object.keys(posts).length} posts.`);
  return posts;
}
