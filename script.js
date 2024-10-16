class RichTextEditor {
  constructor() {
    // Получаем элементы вкладок, контента, кнопки для создания новой вкладки
    this.tabList = document.getElementById("tab-list");
    this.tabContent = document.getElementById("tab-content");
    this.newTabButton = document.getElementById("new-tab");
    this.tabs = []; // Массив для хранения всех созданных вкладок
    this.currentTab = null; // Текущая активная вкладка

    // Управление текстом: Получаем все кнопки опций и расширенных опций (шрифты, цвета и т.д.)
    this.optionsButtons = document.querySelectorAll(".option-button");
    this.advancedOptionButtons = document.querySelectorAll(".adv-option-button");
    this.fontName = document.getElementById("fontName"); // Выпадающий список шрифтов
    this.fontSizeRef = document.getElementById("fontSize"); // Выпадающий список размеров шрифта
    this.foreColorInput = document.getElementById("foreColor"); // Ввод цвета текста
    this.backColorInput = document.getElementById("backColor"); // Ввод цвета фона текста
    this.fontList = [
      "Arial", "Verdana", "Times New Roman", "Garamond", 
      "Georgia", "Courier New", "cursive"
    ]; // Список доступных шрифтов

    // Сохраняем последние использованные стили
    this.lastFontName = this.fontList[0]; // Шрифт по умолчанию
    this.lastFontSize = 3; // Размер шрифта по умолчанию
    this.lastBold = false; // Состояние "жирного" шрифта
    this.isModifying = false; // Флаг для предотвращения повторного выполнения команды

    this.initialize(); // Инициализация редактора
  }

  initialize() {
    this.setupFontOptions(); // Настраиваем опции шрифта
    this.setupEventListeners(); // Настраиваем обработчики событий
    this.newTabButton.addEventListener("click", () => this.createNewTab()); // Создаем новую вкладку при клике на "+"

    // Обработчик для кнопки скачивания документа
    const downloadButton = document.getElementById("download-doc");
    downloadButton.addEventListener("click", () => this.fncDoc());

    // Обработчик для открытия файла
    const openFileButton = document.getElementById("open-file-button");
    openFileButton.addEventListener("click", () => this.openFile());

    this.createNewTab(); // Создаем первую вкладку по умолчанию
  }

  setupFontOptions() {
    // Добавляем шрифты в выпадающий список
    this.fontList.forEach((font) => {
      const option = document.createElement("option");
      option.value = font;
      option.innerHTML = font;
      this.fontName.appendChild(option);
    });

    // Добавляем размеры шрифтов (от 1 до 7) в выпадающий список
    for (let i = 1; i <= 7; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.innerHTML = i;
      this.fontSizeRef.appendChild(option);
    }

    this.fontSizeRef.value = 3; // Устанавливаем начальный размер шрифта по умолчанию
  }

  setupEventListeners() {
    // Применяем форматирование текста при клике на каждую из кнопок
    this.optionsButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.modifyText(button.id, false, null); // Выполняем команду форматирования
        this.updateButtonStates(); // Обновляем состояние кнопок (например, активирован ли жирный текст)
      });
    });

    // Применяем расширенные опции (шрифт, цвет) при их изменении
    this.advancedOptionButtons.forEach((button) => {
      if (button.id !== "foreColor" && button.id !== "backColor") {
        button.addEventListener("change", () => {
          this.modifyText(button.id, false, button.value); // Применяем значение из выпадающего списка
          this.updateButtonStates();
        });
      }
    });

    // Обрабатываем изменение цвета текста
    this.foreColorInput.addEventListener("input", () => {
      if (!this.isModifying) { // Проверяем флаг, чтобы избежать рекурсии
        this.modifyText("foreColor", false, this.foreColorInput.value);
      }
    });

    // Обрабатываем изменение цвета фона текста
    this.backColorInput.addEventListener("input", () => {
      if (!this.isModifying) {
        this.modifyText("backColor", false, this.backColorInput.value);
      }
    });
  }

  createNewTab() {
    const tabId = `tab-${this.tabs.length + 1}`; // Генерируем уникальный ID для новой вкладки
    const tabButton = document.createElement("button"); // Создаем кнопку для новой вкладки
    tabButton.classList.add("tab");
    tabButton.textContent = `Tab ${this.tabs.length + 1}`; // Текст для вкладки
    tabButton.dataset.tabId = tabId; // Присваиваем вкладке её ID
    tabButton.addEventListener("click", () => this.switchToTab(tabId)); // Переключаемся на вкладку по клику

    // Добавляем кнопку для закрытия вкладки
    const closeButton = document.createElement("span");
    closeButton.textContent = "✖"; // Символ закрытия
    closeButton.classList.add("close-tab");
    closeButton.addEventListener("click", (event) => {
      event.stopPropagation(); // Предотвращаем переключение вкладки при закрытии
      this.removeTab(tabId); // Удаляем вкладку
    });

    tabButton.appendChild(closeButton); // Добавляем кнопку закрытия к вкладке
    this.tabList.appendChild(tabButton); // Добавляем вкладку в список вкладок

    const textArea = document.createElement("div"); // Создаем текстовую область для вкладки
    textArea.id = tabId;
    textArea.classList.add("text-area");
    textArea.contentEditable = "true"; // Делаем её редактируемой

    // Обработчик ввода текста в текстовой области
    textArea.addEventListener("input", (event) => {
      const selection = window.getSelection(); // Получаем выделение
      if (!selection.isCollapsed) { // Если есть выделение, сохраняем текущие стили
        this.lastFontName = this.fontName.value;
        this.lastFontSize = this.fontSizeRef.value;
        this.lastBold = document.queryCommandState("bold"); // Проверяем, включён ли жирный шрифт
      }

      // Применяем шрифт из меню перед добавлением нового текста
      this.modifyText("fontName", false, this.fontName.value);
      this.applyFontSizeToSelection(textArea); // Применяем размер шрифта

      // Обновляем состояния кнопок (например, активны ли опции жирного или курсивного текста)
      this.updateButtonStates();

      // Если текстовое поле пустое, применяем последние сохранённые стили
      if (textArea.innerHTML === "") {
        this.applyLastStyles(textArea);
      }
    });

    this.tabContent.appendChild(textArea); // Добавляем текстовую область в контейнер вкладок
    this.tabs.push({ tabId, tabButton, textArea }); // Сохраняем информацию о вкладке
    this.switchToTab(tabId); // Переключаемся на новую вкладку
  }

  switchToTab(tabId) {
    this.tabs.forEach((tab) => {
      tab.textArea.style.display = tab.tabId === tabId ? "block" : "none"; // Показываем только активную вкладку
      tab.tabButton.classList.toggle("active", tab.tabId === tabId); // Обновляем статус активной вкладки
    });

    this.currentTab = this.tabs.find((tab) => tab.tabId === tabId); // Устанавливаем текущую вкладку
    this.applyLastStyles(this.currentTab.textArea); // Применяем последние стили к текстовому полю
  }

  removeTab(tabId) {
    const index = this.tabs.findIndex((tab) => tab.tabId === tabId); // Находим вкладку по её ID
    if (index !== -1) {
      const tabToRemove = this.tabs[index]; // Получаем вкладку для удаления
      tabToRemove.tabButton.remove(); // Удаляем кнопку вкладки
      tabToRemove.textArea.remove(); // Удаляем её содержимое
      this.tabs.splice(index, 1); // Удаляем вкладку из массива
      if (this.tabs.length > 0) {
        this.switchToTab(this.tabs[0].tabId); // Переключаемся на первую оставшуюся вкладку
      } else {
        this.currentTab = null; // Если вкладок не осталось, текущая вкладка сбрасывается
      }
    }
  }

  applyLastStyles(textArea) {
    // Применяем последний использованный шрифт и размер шрифта
    this.modifyText("fontName", false, this.lastFontName);
    this.modifyText("fontSize", false, this.lastFontSize);
    if (this.lastBold) { // Если последний стиль был жирным, применяем его
      this.modifyText("bold", false, null);
    }
  }

  applyFontSizeToSelection(textArea) {
    const fontSize = this.fontSizeRef.value; // Получаем текущий размер шрифта из выпадающего списка
    this.modifyText("fontSize", false, fontSize); // Применяем размер шрифта
  }

  modifyText(command, arg, value) {
    if (this.isModifying) return; // Если идёт модификация, прерываем, чтобы избежать рекурсии
    this.isModifying = true; // Устанавливаем флаг модификации

    try {
      document.execCommand(command, arg, value); // Выполняем команду модификации текста
    } finally {
      this.isModifying = false; // Сбрасываем флаг после выполнения команды
    }
  }

  updateButtonStates() {
    this.optionsButtons.forEach((button) => {
      if (button.id === "bold") {
        button.classList.toggle("active", document.queryCommandState("bold")); // Обновляем состояние кнопки жирного текста
      }
      // Можно добавить обновление других кнопок, если нужно
    });
  }

  openFile() {
    const input = document.querySelector(".fileInput");
    input.accept = ".txt,.doc,.docx"; // Разрешаем выбор файлов форматов txt, doc и docx
    input.click();

    input.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileType = file.name.split('.').pop(); // Получаем расширение файла

            if (fileType === 'txt') {
                // Обработка текстового файла
                const reader = new FileReader();
                reader.readAsText(file);
                reader.onload = () => {
                    this.currentTab.textArea.innerText = reader.result;
                };
            } else if (fileType === 'doc' || fileType === 'docx') {
                // Обработка файла DOC/DOCX с использованием Mammoth.js
                const reader = new FileReader();
                reader.onload = (e) => {
                    const arrayBuffer = reader.result;
                    mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
                        .then((result) => {
                            this.currentTab.textArea.innerHTML = result.value; // Вставляем HTML в текстовое поле
                        })
                        .catch((error) => {
                            console.error("Ошибка при чтении файла DOC/DOCX:", error);
                        });
                };
                reader.readAsArrayBuffer(file); // Читаем файл как ArrayBuffer для Mammoth.js
            } else {
                alert("Неподдерживаемый формат файла. Пожалуйста, выберите .txt, .doc или .docx файл.");
            }
        }
    });
}


  fncDoc() {
    if (this.currentTab) {
      const text = this.currentTab.textArea.innerText; // Получаем текст из активной вкладки
      const blob = new Blob([text], { type: "application/msword" }); // Создаём Blob для скачивания
      const link = document.createElement("a"); // Создаём элемент ссылки

      link.href = URL.createObjectURL(blob); // Создаём URL для Blob
      link.download = "document.doc"; // Имя скачиваемого файла
      link.click(); // Автоматически запускаем скачивание
      URL.revokeObjectURL(link.href); // Очищаем URL после завершения скачивания
    }
  }
}

// Инициализация редактора
document.addEventListener("DOMContentLoaded", () => {
  new RichTextEditor(); // Создаем экземпляр редактора, когда страница загружена
});
