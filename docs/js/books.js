document.addEventListener("DOMContentLoaded", () => {
  // Get the current script tag
  const scriptTag = document.currentScript;
  const url = scriptTag?.getAttribute("data-url") || "https://cdn.davecross.co.uk/data/books.json";

  // Get include and exclude tags from the attributes, or default to no filtering
  const includeTags = scriptTag?.getAttribute("data-tags-include")?.split(",").map(tag => tag.trim()) || [];
  const excludeTags = scriptTag?.getAttribute("data-tags-exclude")?.split(",").map(tag => tag.trim()) || [];

  // Get the target element ID or default to "book-list"
  const targetId = scriptTag?.getAttribute("data-target-id") || "book-list";

  // Fetch the JSON file
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(books => {
      // Filter books based on the include and exclude tags
      const filteredBooks = books.filter(book =>
        (includeTags.length === 0 || includeTags.every(tag => book.tags.includes(tag))) &&
        (excludeTags.length === 0 || excludeTags.every(tag => !book.tags.includes(tag)))
      );

      // Generate HTML
      const html = filteredBooks.map(book => `
        <a href="https://davecross.co.uk/books/#${book.id}">
          <img class="cover"
            title="${book.title}"
            src="${book.image_url}"
            alt="${book.title}"
          />
        </a>
      `).join("");

      // Insert HTML into the target element
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.innerHTML = `<p>${html}</p>`;
      } else {
        console.error(`Target element with ID "${targetId}" not found.`);
      }
    })
    .catch(error => {
      console.error("Error fetching the JSON file:", error);
    });
});
