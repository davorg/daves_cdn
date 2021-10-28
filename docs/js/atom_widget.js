function make_atom_widget (feeds, element) {
  var html = '';

  feeds.forEach(function(item, index) {
    do_one_feed(item, element);
  });

}

function do_one_feed(feed, element) {
  $.ajax(feed.url, {
    accepts: {
      xml: "application/atom+xml"
    },

    dataType: "xml",

    success: function(data) {
      var feed_html = '';

      $(data)
        .find("entry")
        .each(function() {
          const el = $(this);

          const template = `
            <li class="atom_item">
              <a class="atom_item_link" href="${el
                .find("link")
                .attr('href')}" target="_blank" rel="noopener">
                ${el.find("title").text()}
              </a>
            </li>
          `;

          feed_html = feed_html + template;
        });

      $('#' + element).append('<h2 class="atom_title">' + feed.desc + '</h2>');
      $('#' + element).append('<ul class="atom_feed">' + feed_html + '</ul>');
    }
  });
}
