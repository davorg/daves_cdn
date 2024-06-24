function make_atom_widget(feeds, elementId) {
  feeds.forEach(feed => {
    do_one_feed(feed, elementId).catch(error => console.error(error));
  });
}

async function do_one_feed(feed, elementId) {
  const container = document.getElementById(elementId);
  if (!container) {
    console.error(`Element with ID ${elementId} not found.`);
    return;
  }

  try {
    const data = await fetchFeedData(feed.url);
    const feedHtml = generateFeedHtml(data, feed.count, feed.desc);
    insertFeedHtml(container, feedHtml);
  } catch (error) {
    console.error(error);
  }
}

async function fetchFeedData(url) {
  const response = await fetch(url, { headers: { Accept: "application/atom+xml" } });
  if (!response.ok) throw new Error('Network response was not ok');
  return await response.text();
}

function generateFeedHtml(data, count = 10, desc) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(data, "application/xml");
  const entries = xmlDoc.querySelectorAll("entry");
  let feedHtml = `<h2 class="atom_title">${desc}</h2><ul class="atom_feed">`;

  for (let i = 0; i < Math.min(entries.length, count); i++) {
    const el = entries[i];
    const link = el.querySelector("link").getAttribute("href");
    const title = el.querySelector("title").textContent;
    feedHtml += `
      <li class="atom_item">
        <a class="atom_item_link" href="${link}" target="_blank" rel="noopener">
          ${title}
        </a>
      </li>
    `;
  }

  feedHtml += `</ul>`;
  return feedHtml;
}

function insertFeedHtml(container, feedHtml) {
  container.insertAdjacentHTML('beforeend', feedHtml);
}