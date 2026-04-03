function init() {
  const arcadeButton = document.getElementById("btn-arcade");
  const selectionButton = document.getElementById("btn-selection");

  if (arcadeButton) {
    arcadeButton.addEventListener("click", () => {
      console.log("Arcade selecionado");
    });
  }

  if (selectionButton) {
    selectionButton.addEventListener("click", () => {
      console.log("Selection selecionado");
    });
  }
}

init();
