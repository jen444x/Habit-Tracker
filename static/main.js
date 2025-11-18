// store references to the <li> elements
const listItems = document.querySelectorAll("li");

// toggles adding and removing done class
function toggleDone(e) {
  if (!e.target.className) {
    e.target.className = "done";
  } else {
    e.target.className = "";
  }
}

// add an event listener to each list item, so when it's clicked
// the done class is toggles
listItems.forEach((item) => {
  item.addEventListener("click", toggleDone);
});
