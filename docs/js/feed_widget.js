async function make_feed_widget(feeds, element) {
  let allFeedsHtml = '';
  for (const feed of feeds) {
    allFeedsHtml += await do_one_feed(feed);
  }
  const container = document.querySelector(`#${element}`);
  if (container) {
    container.insertAdjacentHTML('beforeend', allFeedsHtml);
  }
}

async function do_one_feed(feed) {
  try {
    const response = await fetch(feed.url, {
      headers: {
        Accept: `application/${feed.type}xml`,
      },
    });
    if (!response.ok) {
      throw new Error(`Network response was not ok for ${feed.url}`);
    }
    const textData = await response.text();
    const parser = new DOMParser();
    const data = parser.parseFromString(textData, "text/xml");
    let feed_html = '';

    const items = data.querySelectorAll("entry, item");
    const count = feed.count || 10; // Default to 10 if feed.count is not set

    for (let i = 0; i < Math.min(items.length, count); i++) {
      feed_html += get_item(items[i]);
    }

    return `<h2 class="feed_title">${feed.desc}</h2><ul class="feed_list">${feed_html}</ul>`;
  } catch (error) {
    console.error(`Error fetching feed: ${error}`);
    return ''; // Return an empty string to avoid breaking the layout
  }
}

function get_item(elem) {
  const linkElement = elem.querySelector("link");
  const link_href = linkElement ? (linkElement.getAttribute("href") || linkElement.textContent) : '#';
  const titleElement = elem.querySelector("title");
  const titleText = titleElement ? titleElement.textContent : 'No title';

  return `
    <li class="feed_item">
      <a class="feed_item_link" href="${link_href}" target="_blank" rel="noopener">
        ${titleText}
      </a>
    </li>
  `;
}
