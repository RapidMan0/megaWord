class RichTextEditor {
  constructor() {
    this.tabList = document.getElementById("tab-list");
    this.tabContent = document.getElementById("tab-content");
    this.newTabButton = document.getElementById("new-tab");
    this.tabs = [];
    this.currentTab = null;

    // Управление текстом
    this.optionsButtons = document.querySelectorAll(".option-button");
    this.advancedOptionButtons =
      document.querySelectorAll(".adv-option-button");
    this.fontName = document.getElementById("fontName");
    this.fontSizeRef = document.getElementById("fontSize");
    this.foreColorInput = document.getElementById("foreColor");
    this.backColorInput = document.getElementById("backColor");
    this.fontList = [
      "Arial",
      "Verdana",
      "Times New Roman",
      "Garamond",
      "Georgia",
      "Courier New",
      "cursive",
    ];

    // Сохраняем последние использованные стили
    this.lastFontName = this.fontList[0]; // Шрифт по умолчанию
    this.lastFontSize = 3; // Размер шрифта по умолчанию
    this.lastBold = false;
    this.isModifying = false; // Флаг для предотвращения рекурсивного вызова

    this.initialize();
  }

  initialize() {
    this.setupFontOptions();
    this.setupEventListeners();
    this.newTabButton.addEventListener("click", () => this.createNewTab());

    // Добавляем обработчик для кнопки скачивания
    const downloadButton = document.getElementById("download-doc");
    downloadButton.addEventListener("click", () => this.fncDoc());

    // Добавляем обработчик для открытия файла
    const openFileButton = document.getElementById("open-file-button");
    openFileButton.addEventListener("click", () => this.openFile());

    this.createNewTab(); // Создаем первую вкладку по умолчанию
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
        this.updateButtonStates(); // Обновляем состояние кнопок
      });
    });

    this.advancedOptionButtons.forEach((button) => {
      if (button.id !== "foreColor" && button.id !== "backColor") {
        button.addEventListener("change", () => {
          this.modifyText(button.id, false, button.value);
          this.updateButtonStates(); // Обновляем состояние кнопок
        });
      }
    });

    this.foreColorInput.addEventListener("input", () => {
      if (!this.isModifying) {
        // Проверяем флаг
        this.modifyText("foreColor", false, this.foreColorInput.value);
      }
    });

    this.backColorInput.addEventListener("input", () => {
      if (!this.isModifying) {
        // Проверяем флаг
        this.modifyText("backColor", false, this.backColorInput.value);
      }
    });
  }

  createNewTab() {
    const tabId = `tab-${this.tabs.length + 1}`;
    const tabButton = document.createElement("button");
    tabButton.classList.add("tab");
    tabButton.textContent = `Tab ${this.tabs.length + 1}`;
    tabButton.dataset.tabId = tabId;
    tabButton.addEventListener("click", () => this.switchToTab(tabId));

    // Добавление кнопки "Закрыть" для удаления вкладки
    const closeButton = document.createElement("span");
    closeButton.textContent = "✖"; // Символ закрытия
    closeButton.classList.add("close-tab");
    closeButton.addEventListener("click", (event) => {
      event.stopPropagation(); // Останавливаем всплытие события
      this.removeTab(tabId);
    });

    tabButton.appendChild(closeButton);
    this.tabList.appendChild(tabButton);

    const textArea = document.createElement("div");
    textArea.id = tabId;
    textArea.classList.add("text-area");
    textArea.contentEditable = "true";

    // Добавляем обработчик ввода для обновления стилей
    textArea.addEventListener("input", (event) => {
      const selection = window.getSelection();
      if (!selection.isCollapsed) {
        this.lastFontName = this.fontName.value;
        this.lastFontSize = this.fontSizeRef.value;
        this.lastBold = document.queryCommandState("bold");
      }

      // Применяем шрифт из меню перед добавлением нового текста
      this.modifyText("fontName", false, this.fontName.value);
      this.applyFontSizeToSelection(textArea);

      // Обновляем состояния кнопок
      this.updateButtonStates();

      // Если поле пустое, восстанавливаем последний стиль
      if (textArea.innerHTML === "") {
        this.applyLastStyles(textArea);
      }
    });

    this.tabContent.appendChild(textArea);
    this.tabs.push({ tabId, tabButton, textArea });
    this.switchToTab(tabId); // Переключаемся на новую вкладку
  }

  switchToTab(tabId) {
    this.tabs.forEach((tab) => {
      tab.textArea.style.display = tab.tabId === tabId ? "block" : "none";
      tab.tabButton.classList.toggle("active", tab.tabId === tabId);
    });

    this.currentTab = this.tabs.find((tab) => tab.tabId === tabId);
    this.applyLastStyles(this.currentTab.textArea);
  }

  removeTab(tabId) {
    const index = this.tabs.findIndex((tab) => tab.tabId === tabId);
    if (index !== -1) {
      const tabToRemove = this.tabs[index];
      tabToRemove.tabButton.remove();
      tabToRemove.textArea.remove();
      this.tabs.splice(index, 1);
      if (this.tabs.length > 0) {
        this.switchToTab(this.tabs[0].tabId);
      } else {
        this.currentTab = null;
      }
    }
  }

  applyLastStyles(textArea) {
    this.modifyText("fontName", false, this.lastFontName);
    this.modifyText("fontSize", false, this.lastFontSize);
    if (this.lastBold) {
      this.modifyText("bold", false, null);
    }
  }

  applyFontSizeToSelection(textArea) {
    const fontSize = this.fontSizeRef.value;
    this.modifyText("fontSize", false, fontSize);
  }

  modifyText(command, arg, value) {
    if (this.isModifying) return; // Проверяем флаг
    this.isModifying = true; // Устанавливаем флаг

    try {
      document.execCommand(command, arg, value);
    } finally {
      this.isModifying = false; // Сбрасываем флаг
    }
  }

  updateButtonStates() {
    this.optionsButtons.forEach((button) => {
      if (button.id === "bold") {
        button.classList.toggle("active", document.queryCommandState("bold"));
      }
      // Обновите другие кнопки, если необходимо
    });
  }

  openFile() {
    const input = document.querySelector(".fileInput"); // Изменено на класс .fileInput
    input.click();

    input.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
          this.currentTab.textArea.innerText = reader.result; // Загружаем текст в активную вкладку
        };
      }
    });
  }

  fncDoc() {
    if (this.currentTab) {
      const text = this.currentTab.textArea.innerText; // Получаем текст из активной вкладки
      const blob = new Blob([text], { type: "application/msword" });
      const link = document.createElement("a");

      link.href = URL.createObjectURL(blob);
      link.download = "document.doc"; // Имя скачиваемого файла
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }
}

// Инициализация редактора
document.addEventListener("DOMContentLoaded", () => {
  new RichTextEditor();
});
