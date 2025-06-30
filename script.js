async function findVideos() {
  const apiKey = "AIzaSyCM8RI5sm03w5WEhVvpGmN_kh5cppcxyT0";
  const keyword = document.getElementById('keyword').value;
  const minSubs = +document.getElementById('minSubs').value || 0;
  const maxSubs = +document.getElementById('maxSubs').value || 999999999;
  const minViews = +document.getElementById('minViews').value || 0;
  const maxViews = +document.getElementById('maxViews').value || 999999999;
  const daysAgo = +document.getElementById('daysAgo').value || 3650;
  const country = document.getElementById('country').value;

  const publishedAfter = new Date(Date.now() - daysAgo*24*60*60*1000).toISOString();
  let query = keyword || "a"; // avoid blank

  let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}&publishedAfter=${publishedAfter}&key=${apiKey}`;
  let res = await fetch(url);
  let data = await res.json();

  const tbody = document.querySelector('#resultsTable tbody');
  tbody.innerHTML = "";

  for (let item of data.items) {
    let vidId = item.id.videoId;
    let channelId = item.snippet.channelId;

    let chRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${apiKey}`);
    let chData = await chRes.json();
    let ch = chData.items[0];

    let subs = +ch.statistics.subscriberCount;
    let title = item.snippet.title;
    let viewsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${vidId}&key=${apiKey}`);
    let viewsData = await viewsRes.json();
    let views = +viewsData.items[0].statistics.viewCount;

    if(subs<minSubs || subs>maxSubs || views<minViews || views>maxViews) continue;

    let monet = subs>1000 ? "🟢 $" : "🔴 $";
    let boost = ((views / (subs||1))*100).toFixed(1) + "%";

    let firstUpload = ch.snippet.publishedAt.split("T")[0];
    let uploadDate = item.snippet.publishedAt.split("T")[0];
    let thumb = item.snippet.thumbnails.default.url;
    let channelTitle = ch.snippet.title;

    tbody.innerHTML += `<tr>
      <td><a href="https://youtu.be/${vidId}" target="_blank"><img src="${thumb}"></a></td>
      <td>${title}<br><a href="https://youtube.com/channel/${channelId}" target="_blank">${channelTitle}</a></td>
      <td>${subs}</td>
      <td>${views}</td>
      <td>${uploadDate}</td>
      <td>${firstUpload}</td>
      <td>${monet}</td>
      <td>${boost}</td>
    </tr>`;
  }
}
