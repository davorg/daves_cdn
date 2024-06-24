async function make_rss_widget(feeds, elementId) {
  const container = document.getElementById(elementId);
  if (!container) {
    console.error(`Element with ID ${elementId} not found.`);
    return;
  }

  for (const feed of feeds) {
    try {
      const feedHtml = await do_one_feed(feed);
      container.insertAdjacentHTML('beforeend', feedHtml);
    } catch (error) {
      console.error(`Error fetching feed: ${feed.url}`, error);
      // Optionally insert a fallback message into the container
      container.insertAdjacentHTML('beforeend', `<p>Error loading feed: ${feed.desc}</p>`);
    }
  }
}

async function do_one_feed(feed) {
  const response = await fetch(feed.url, { headers: { Accept: "application/rss+xml" } });
  if (!response.ok) throw new Error(`Network response was not ok for ${feed.url}`);
  const data = await response.text();
  const xmlDoc = new DOMParser().parseFromString(data, "application/xml");

  const items = xmlDoc.querySelectorAll("item");
  if (items.length === 0) throw new Error(`No items found in feed: ${feed.url}`);

  let feedHtml = `<h2 class="rss_title">${feed.desc}</h2><ul class="rss_feed">`;
  const count = feed.count || 10;
  for (let i = 0; i < Math.min(items.length, count); i++) {
    const item = items[i];
    const link = item.querySelector("link").textContent;
    const title = item.querySelector("title").textContent;
    feedHtml += `<li class="rss_item"><a class="rss_item_link" href="${link}" target="_blank" rel="noopener">${title}</a></li>`;
  }
  feedHtml += `</ul>`;
  return feedHtml;
}
