class RichTextEditor {
  constructor() {
      this.optionsButtons = document.querySelectorAll(".option-button");
      this.advancedOptionButtons = document.querySelectorAll(".adv-option-button");
      this.fontName = document.getElementById("fontName");
      this.fontSizeRef = document.getElementById("fontSize");
      this.writingArea = document.getElementById("text-input");
      this.linkButton = document.getElementById("createLink");
      this.alignButtons = document.querySelectorAll(".align");
      this.spacingButtons = document.querySelectorAll(".spacing");
      this.formatButtons = document.querySelectorAll(".format");
      this.foreColorInput = document.getElementById("foreColor");
      this.backColorInput = document.getElementById("backColor");

      this.fontList = ["Arial", "Verdana", "Times New Roman", "Garamond", "Georgia", "Courier New", "cursive"];

      // Сохраняем последние использованные стили
      this.lastFontName = this.fontList[0]; // Шрифт по умолчанию
      this.lastFontSize = 3; // Размер шрифта по умолчанию
      this.lastBold = false;

      this.initialize();
  }

  initialize() {
      this.setupFontOptions();
      this.applyFontStyleToTextArea();
      this.setupEventListeners();
      this.highlightButtons();
  }

  applyFontStyleToTextArea() {
      this.modifyText("fontName", false, this.fontName.value);
  }

  setupFontOptions() {
      this.fontList.forEach((font) => {
          const option = document.createElement("option");
          option.value = font;
          option.innerHTML = font;
          this.fontName.appendChild(option);
      });

      for (let i = 1; i <= 7; i++) {
          const option = document.createElement("option");
          option.value = i;
          option.innerHTML = i;
          this.fontSizeRef.appendChild(option);
      }

      this.fontSizeRef.value = 3;
  }

  setupEventListeners() {
      this.optionsButtons.forEach((button) => {
          button.addEventListener("click", () => {
              this.modifyText(button.id, false, null);
          });
      });

      this.advancedOptionButtons.forEach((button) => {
          if (button.id !== "foreColor" && button.id !== "backColor") {
              button.addEventListener("change", () => {
                  this.modifyText(button.id, false, button.value);
              });
          }
      });

      this.foreColorInput.addEventListener("input", () => {
          this.modifyText("foreColor", false, this.foreColorInput.value);
      });

      this.backColorInput.addEventListener("input", () => {
          this.modifyText("backColor", false, this.backColorInput.value);
      });

      this.linkButton.addEventListener("click", () => {
          const userLink = prompt("Enter a URL");
          const formattedLink = this.formatLink(userLink);
          this.modifyText(this.linkButton.id, false, formattedLink);
      });

      this.writingArea.addEventListener("input", (event) => {
          const selection = window.getSelection();
          if (!selection.isCollapsed) {
              this.lastFontName = this.fontName.value;
              this.lastFontSize = this.fontSizeRef.value;
              this.lastBold = document.queryCommandState("bold");
          }

          // Если поле пустое, восстанавливаем последний стиль
          if (this.writingArea.innerHTML === "") {
              this.applyLastStyles();
          } else {
              // Если есть текст, то применяем шрифт из меню
              this.modifyText("fontName", false, this.fontName.value);
          }

          this.applyFontSizeToSelection();
      });
  }

  modifyText(command, defaultUi, value) {
      document.execCommand(command, defaultUi, value);
  }

  formatLink(link) {
      return /http/i.test(link) ? link : "http://" + link;
  }

  highlightButtons() {
      this.highlightGroup(this.alignButtons, true);
      this.highlightGroup(this.spacingButtons, true);
      this.highlightGroup(this.formatButtons, false);
  }

  highlightGroup(buttons, needsRemoval) {
      buttons.forEach((button) => {
          button.addEventListener("click", () => {
              if (needsRemoval) {
                  const alreadyActive = button.classList.contains("active");
                  this.removeHighlights(buttons);
                  if (!alreadyActive) {
                      button.classList.add("active");
                  }
              } else {
                  button.classList.toggle("active");
              }
          });
      });
  }

  removeHighlights(buttons) {
      buttons.forEach((button) => {
          button.classList.remove("active");
      });
  }

  applyFontSizeToSelection() {
      const selectedFontSize = this.fontSizeRef.value;
      document.execCommand("fontSize", false, selectedFontSize);
  }

  applyLastStyles() {
      this.modifyText("fontName", false, this.lastFontName || "Arial");
      this.modifyText("fontSize", false, this.lastFontSize || 3);
      if (this.lastBold) {
          this.modifyText("bold", false, null);
      }
  }
}

window.onload = () => new RichTextEditor();
