// Getting the invisible box
const invisibleBox = document.querySelector(".invisible-box");

// Setting the number of small boxes (per row and column)
const numberOfSmallBoxes = 50;

// Adding grid-cols-rows to the invisible box
invisibleBox.style.gridTemplateColumns = `repeat(${numberOfSmallBoxes}, 1fr)`;
invisibleBox.style.gridTemplateRows = `repeat(${numberOfSmallBoxes}, 1fr)`;

// Adding small boxes to the invisible box
for (let i = 0; i < Math.pow(numberOfSmallBoxes, 2); i++) {
  const smallBox = document.createElement("div");
  smallBox.classList.add("small-box");

  // Creating a random delay for each small box
  const delay = Math.floor(Math.random() * 1000);
  smallBox.style.animationDelay = `${delay}ms`;
  invisibleBox.appendChild(smallBox);
}

// Removing the invisible box after 2 seconds
setTimeout(() => {
  invisibleBox.style.display = "none";
}, 2000);
