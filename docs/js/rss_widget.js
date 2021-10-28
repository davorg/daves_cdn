function make_rss_widget (feeds, element) {
  var html = '';

  feeds.forEach(function(item, index) {
    do_one_feed(item, element);
  });

}

function do_one_feed(feed, element) {
  $.ajax(feed.url, {
    accepts: {
      xml: "application/rss+xml"
    },

    dataType: "xml",

    success: function(data) {
      var feed_html = '';

      $(data)
        .find("item")
        .each(function() {
          const el = $(this);

          const template = `
            <li class="rss_item">
              <a class="rss_item_link" href="${el
                .find("link")
                .text()}" target="_blank" rel="noopener">
                ${el.find("title").text()}
              </a>
            </li>
          `;

          feed_html = feed_html + template;
        });

      $('#' + element).append('<h2 class="rss_title">' + feed.desc + '</h2>');
      $('#' + element).append('<ul class="rss_feed">' + feed_html + '</ul>');
    }
  });
}
