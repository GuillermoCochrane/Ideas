window.addEventListener("load", () => {
  const cards = document.querySelectorAll(".slider-item");
  const lbtn = document.querySelector("#move-left-button");
  const rbtn = document.querySelector("#move-right-button");
  const cardsNumber = cards.length;
  lbtn.addEventListener("click", () => {
    for (let card of cards) {
      let cardOrder = card.style.order;
      if (cardOrder == 1) {
        card.style.order = cardsNumber;
      } else {
        card.style.order = cardOrder - 1;
      }
    }
  });
  rbtn.addEventListener("click", () => {
    for (let card of cards) {
      let cardOrder = card.style.order;
      if (cardOrder == cardsNumber) {
        card.style.order = 1;
      } else {
        card.style.order = parseInt(cardOrder) + 1;
      }
    }
  });
});