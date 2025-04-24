/**
 * Books Widget Script
 * --------------------
 * This script dynamically fetches and displays a list of books based on configurable attributes.
 *
 * Usage:
 * 1. Include this script in your HTML file:
 *    <script src="path/to/books.js" 
 *            data-url="https://example.com/books.json" 
 *            data-tags-include="tech,fiction" 
 *            data-tags-exclude="children" 
 *            data-target-id="custom-book-list"></script>
 *
 * 2. Attributes:
 *    - data-url (optional): URL of the JSON file containing book data. Defaults to:
 *      "https://cdn.davecross.co.uk/data/books.json".
 *    - data-tags-include (optional): Comma-separated list of tags to include. Defaults to no filtering.
 *    - data-tags-exclude (optional): Comma-separated list of tags to exclude. Defaults to no filtering.
 *    - data-target-id (optional): ID of the target element where the book list will be inserted.
 *      Defaults to "book-list".
 *
 * 3. Example HTML:
 *    <div id="custom-book-list"></div>
 *    <script src="path/to/books.js" 
 *            data-url="https://example.com/books.json" 
 *            data-tags-include="tech" 
 *            data-tags-exclude="children" 
 *            data-target-id="custom-book-list"></script>
 *
 * Notes:
 * - If the target element is not found, an error will be logged to the console.
 * - If the JSON file cannot be fetched, an error will be logged to the console.
 */
document.addEventListener("DOMContentLoaded", () => {
  // Get the current script tag
  const scriptTag = document.currentScript;
  const url = scriptTag?.getAttribute("data-url") || "https://cdn.davecross.co.uk/data/books.json";

  console.log("ScriptTag:", scriptTag);
  console.log("Include:", scriptTag.getAttribute("data-tags-include"));
  console.log("Exclude:", scriptTag.getAttribute("data-tags-exclude"));

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
      console.log("Books:", books);
      console.log("Include Tags:", includeTags);
      console.log("Exclude Tags:", excludeTags);
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
