class RichTextEditor {
  constructor() {
    // Получаем элементы вкладок, контента, кнопки для создания новой вкладки
    this.tabList = document.getElementById("tab-list");
    this.tabContent = document.getElementById("tab-content");
    this.newTabButton = document.getElementById("new-tab");
    this.tabs = [];
    this.currentTab = null;

    // Управление текстом: Получаем все кнопки опций и расширенных опций (шрифты, цвета и т.д.)
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

    this.lastFontName = this.fontList[0];
    this.lastFontSize = 3;
    this.lastBold = false;
    this.isModifying = false;

    // Элементы для поиска и замены текста
    this.searchButton = document.getElementById("search-text");
    this.replaceButton = document.getElementById("replace-text");

    this.initialize();
  }

  initialize() {
    this.setupFontOptions();
    this.setupEventListeners();

    // Обработчик для кнопки скачивания документа
    const downloadButton = document.getElementById("download-doc");
    downloadButton.addEventListener("click", () => this.fncDoc());

    this.newTabButton.addEventListener("click", () => this.createNewTab());
    const openFileButton = document.getElementById("open-file-button");
    openFileButton.addEventListener("click", () => this.openFile());

    document
      .getElementById("search-text")
      .addEventListener("click", () => this.searchText());
    document
      .getElementById("replace-text")
      .addEventListener("click", () => this.replaceText());

    // Добавляем обработчик нажатия Enter в поле поиска
    const searchInput = document.createElement("input");
    searchInput.id = "search-input";
    searchInput.placeholder = "Введите текст для поиска";
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.searchText();
      }
    });

    this.createNewTab();
  }

  searchText() {
    const searchText = prompt("Введите текст для поиска:");
    if (!searchText) return;
    this.clearHighlightText(this.currentTab.textArea); // Убираем предыдущие выделения, если они есть
    this.highlightText(this.currentTab.textArea, searchText); // Выделяем новый текст
  }

  // Метод для удаления выделения текста
  clearHighlightText(element) {
    const marks = element.querySelectorAll("mark");
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      parent.replaceChild(document.createTextNode(mark.textContent), mark); // Заменяем <mark> на обычный текст
      parent.normalize(); // Объединяем текстовые узлы, если они разделены
    });
  }

  // Метод для замены текста
  replaceText() {
    const searchText = prompt("Введите текст для поиска:");
    const replaceText = prompt("Введите текст для замены:");
    if (!searchText || !replaceText) return;
    this.clearHighlightText(this.currentTab.textArea); // Убираем выделение перед заменой
    this.replaceTextInNode(this.currentTab.textArea, searchText, replaceText); // Заменяем текст
  }

  highlightText(element, searchText) {
    const regex = new RegExp(searchText, "gi");
    const walk = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    const textNodes = [];
    let node;

    while ((node = walk.nextNode())) {
      textNodes.push(node);
    }

    textNodes.forEach((textNode) => {
      const matches = textNode.nodeValue.match(regex);
      if (matches) {
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        textNode.nodeValue.replace(regex, (match, offset) => {
          fragment.appendChild(
            document.createTextNode(textNode.nodeValue.slice(lastIndex, offset))
          );
          const mark = document.createElement("mark");
          mark.textContent = match;
          fragment.appendChild(mark);
          lastIndex = offset + match.length;
        });
        fragment.appendChild(
          document.createTextNode(textNode.nodeValue.slice(lastIndex))
        );
        textNode.parentNode.replaceChild(fragment, textNode);
      }
    });
  }

  // Функция для замены текста в узлах
  replaceTextInNode(element, searchText, replaceText) {
    const walk = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    let node;
    while ((node = walk.nextNode())) {
      const regex = new RegExp(`(${searchText})`, "gi");
      node.nodeValue = node.nodeValue.replace(regex, replaceText);
    }
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
        this.updateButtonStates();
      });
    });

    this.advancedOptionButtons.forEach((button) => {
      if (button.id !== "foreColor" && button.id !== "backColor") {
        button.addEventListener("change", () => {
          this.modifyText(button.id, false, button.value);
          this.updateButtonStates();
        });
      }
    });

    this.foreColorInput.addEventListener("input", () => {
      if (!this.isModifying) {
        this.modifyText("foreColor", false, this.foreColorInput.value);
      }
    });

    this.backColorInput.addEventListener("input", () => {
      if (!this.isModifying) {
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

    const closeButton = document.createElement("span");
    closeButton.textContent = "✖";
    closeButton.classList.add("close-tab");
    closeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.removeTab(tabId);
    });

    tabButton.appendChild(closeButton);
    this.tabList.appendChild(tabButton);

    const textArea = document.createElement("div");
    textArea.id = tabId;
    textArea.classList.add("text-area");
    textArea.contentEditable = "true";

    textArea.addEventListener("input", (event) => {
      const selection = window.getSelection();
      if (!selection.isCollapsed) {
        this.lastFontName = this.fontName.value;
        this.lastFontSize = this.fontSizeRef.value;
        this.lastBold = document.queryCommandState("bold");
      }

      this.modifyText("fontName", false, this.fontName.value);
      this.applyFontSizeToSelection(textArea);
      this.updateButtonStates();

      if (textArea.innerHTML === "") {
        this.applyLastStyles(textArea);
      }
    });

    this.tabContent.appendChild(textArea);
    this.tabs.push({
      tabId,
      tabButton,
      textArea,
    });
    this.switchToTab(tabId);
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
    if (this.isModifying) return;
    this.isModifying = true;

    try {
      document.execCommand(command, arg, value);
    } finally {
      this.isModifying = false;
    }
  }

  updateButtonStates() {
    this.optionsButtons.forEach((button) => {
      if (button.id === "bold") {
        button.classList.toggle("active", document.queryCommandState("bold"));
      }
    });
  }

  openFile() {
    const input = document.querySelector(".fileInput");
    input.accept = ".txt,.doc,.docx,.rtf"; // Add .rtf to the allowed file types
    input.click();
    input.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const fileType = file.name.split(".").pop(); // Get file extension
        const reader = new FileReader();

        if (fileType === "txt") {
          // Process text file
          reader.readAsText(file);
          reader.onload = () => {
            this.currentTab.textArea.innerText = reader.result;
          };
        } else if (fileType === "doc" || fileType === "docx") {
          // Process DOC/DOCX file using Mammoth.js
          reader.onload = (e) => {
            const arrayBuffer = reader.result;
            mammoth
              .convertToHtml({ arrayBuffer: arrayBuffer })
              .then((result) => {
                this.currentTab.textArea.innerHTML = result.value; // Insert HTML into textarea
              })
              .catch((error) => {
                console.error("Error reading DOC/DOCX file:", error);
              });
          };
          reader.readAsArrayBuffer(file); // Read file as ArrayBuffer for Mammoth.js
        } else if (fileType === "rtf") {
          // Process RTF file
          reader.readAsText(file);
          reader.onload = () => {
            const rtf = reader.result;
            const plainText = this.parseRTF(rtf);
            this.currentTab.textArea.innerHTML = plainText; // Insert parsed HTML into textarea
          };
        } else {
          alert(
            "Unsupported file format. Please select a .txt, .doc, .docx, or .rtf file."
          );
        }
      }
    });
  }

  parseRTF(rtfContent) {
    // Карта для замены RTF команд на HTML теги
    const tagMap = {
      "\\b": "<b>", // Жирный шрифт
      "\\b0": "</b>", // Завершение жирного шрифта
      "\\i": "<i>", // Курсив
      "\\i0": "</i>", // Завершение курсива
      "\\ul": "<u>", // Подчеркивание
      "\\ulnone": "</u>", // Завершение подчеркивания
      "\\par": "<br>", // Перевод строки
    };

    // Пример цветовой карты
    const colorMap = {
      "\\cf1": '<span style="color:red;">', // Пример красного цвета
      "\\cf2": '<span style="color:green;">', // Пример зеленого цвета
      "\\cf0": "</span>", // Сброс цвета
    };

    // Заменяем цвета
    rtfContent = rtfContent.replace(
      /\\cf\d+/g,
      (match) => colorMap[match] || ""
    );

    // Заменяем текстовые стили на основе tagMap
    rtfContent = rtfContent.replace(
      /\\[a-z]+\d*/g,
      (match) => tagMap[match] || ""
    );

    // Удаляем лишние RTF-команды, которые не обрабатываются
    rtfContent = rtfContent.replace(/\\[\w]+|{|}/g, "");

    // Заменяем специальные символы RTF на текст
    rtfContent = rtfContent
      .replace(/\\'[0-9a-f]{2}/gi, (match) =>
        String.fromCharCode(parseInt(match.slice(2), 16))
      )
      .replace(/\\n/g, "<br>") // Замена перевода строки на <br>
      .replace(/\n|\r/g, ""); // Удаление пробелов

    // Возвращаем преобразованный текст
    return rtfContent;
  }

  htmlToRtf(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    let rtf = "{\\rtf1\\ansi\\deff0 {\\fonttbl;}\n";
    let fontTable = "{\\fonttbl";
    let colorTable = "{\\colortbl ;";
    let sizeTable = "{\\*\\sizetbl ";
    let colors = [];
    let fonts = [];
    let sizes = [];

    const addFontToTable = (font) => {
      if (!font) return "";
      if (!fonts.includes(font)) {
        fonts.push(font);
        fontTable += `{\\f${fonts.length - 1} ${font};}`; // Добавление шрифта
      }
      return fonts.indexOf(font);
    };

    const addColorToTable = (hex) => {
      if (!hex) return "";
      if (!colors.includes(hex)) {
        colors.push(hex);
      }
      return colors.indexOf(hex) + 1;
    };

    const addSizeToTable = (size) => {
      if (!size) return "";
      if (!sizes.includes(size)) {
        sizes.push(size);
        sizeTable += `\\fs${size * 2} `; // Умножаем на 2 для RTF
      }
      return sizes.indexOf(size);
    };

    const colorToRtf = (hex) => {
      const r = parseInt(hex.substring(1, 3), 16);
      const g = parseInt(hex.substring(3, 5), 16);
      const b = parseInt(hex.substring(5, 7), 16);
      return `\\red${r}\\green${g}\\blue${b};`;
    };

    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        rtf += node.nodeValue;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        switch (node.tagName.toLowerCase()) {
          case "b":
            rtf += "\\b ";
            processChildren(node);
            rtf += "\\b0 ";
            break;
          case "i":
            rtf += "\\i ";
            processChildren(node);
            rtf += "\\i0 ";
            break;
          case "u":
            rtf += "\\ul ";
            processChildren(node);
            rtf += "\\ulnone ";
            break;
          case "font":
            const fontFamily = node.getAttribute("face");
            if (fontFamily) {
              const fontIndex = addFontToTable(fontFamily);
              rtf += `\\f${fontIndex} `;
            }
            const fontColor = node.getAttribute("color");
            if (fontColor) {
              const colorIndex = addColorToTable(fontColor);
              rtf += `\\cf${colorIndex} `;
            }
            const fontSize = node.getAttribute("size");
            if (fontSize) {
              const sizeIndex = addSizeToTable(fontSize);
              rtf += `\\fs${sizeIndex * 2} `; // RTF требует размер в половинных пунктах
            }
            processChildren(node);
            rtf += "\\f0 \\cf0 \\fs24 "; // Сброс стиля
            break;
          case "span":
            const bgColor = node.style.backgroundColor;
            const textColor = node.style.color;
            const fontSizeSpan = window.getComputedStyle(node).fontSize;
            if (bgColor) {
              const bgColorIndex = addColorToTable(rgbToHex(bgColor));
              rtf += `\\highlight${bgColorIndex} `;
            }
            if (textColor) {
              const textColorIndex = addColorToTable(rgbToHex(textColor));
              rtf += `\\cf${textColorIndex} `;
            }
            if (fontSizeSpan) {
              const sizeIndex = addSizeToTable(parseInt(fontSizeSpan));
              rtf += `\\fs${sizeIndex * 2} `;
            }
            processChildren(node);
            if (bgColor) {
              rtf += "\\highlight0 "; // Сброс фона
            }
            if (textColor) {
              rtf += "\\cf0 "; // Сброс цвета
            }
            break;
          default:
            processChildren(node);
            break;
        }
      }
    };

    const processChildren = (parentNode) => {
      Array.from(parentNode.childNodes).forEach((child) => processNode(child));
    };

    processChildren(tempDiv);

    // Завершение таблиц
    fontTable += "}\n";
    sizeTable += "}\n";
    colors.forEach((color) => {
      colorTable += colorToRtf(color);
    });
    colorTable += "}\n";

    rtf = rtf.replace(
      "{\\rtf1",
      `{\\rtf1${fontTable}${colorTable}${sizeTable}`
    );
    rtf += "}";

    return rtf;
  }

  // Пример функции для преобразования HEX цвета в формат RTF
  colorToRtf(hex) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `\\red${r}\\green${g}\\blue${b};`;
  }

  fncDoc() {
    if (this.currentTab) {
      const content = this.currentTab.textArea.innerHTML; // Получаем HTML содержимое текстового поля
      const rtfContent = this.htmlToRtf(content); // Преобразуем HTML в RTF
      const blob = new Blob([rtfContent], { type: "application/rtf" }); // Создаем blob с типом RTF
      const link = document.createElement("a"); // Создаем ссылку для скачивания

      // Генерируем URL для блоба
      link.href = URL.createObjectURL(blob);
      link.download = "file.rtf"; // Имя файла для скачивания
      link.click(); // Программно вызываем клик по ссылке
      URL.revokeObjectURL(link.href); // Освобождаем ресурсы после скачивания
    }
  }
}

// Инициализация редактора
document.addEventListener("DOMContentLoaded", () => {
  new RichTextEditor(); // Создаем экземпляр редактора, когда страница загружена
});
