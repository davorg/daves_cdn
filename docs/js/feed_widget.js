function make_feed_widget (feeds, element) {

  feeds.forEach(function(item, index) {
    do_one_feed(item, element);
  });
}

function do_one_feed(feed, element) {
  $.ajax(feed.url, {
    accepts: {
      xml: "application/" + feed.type + "xml"
    },

    dataType: "xml",

    success: function(data) {
      var feed_html = '';

      $(data)
        .find("entry,item")
        .each(function() {
          feed_html = feed_html + get_item($(this));
        });

      var html = '<h2 class="feed_title">' + feed.desc + '</h2>' +
                 '<ul class="feed_list">' + feed_html + '</ul>';

      $('#' + element).append(html);
    }
  });
}

function get_item(elem) {
  if (elem.find("link").attr("href")) {
    link_href = elem.find("link").attr("href");
  } else {
    link_href = elem.find("link").text();
  }

  return `
    <li class="feed_item">
      <a class="feed_item_link" href="${link_href}" target="_blank" rel="noopener">
        ${elem.find("title").text()}
      </a>
    </li>
  `;
}
