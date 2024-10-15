class RichTextEditor {
    constructor() {
        this.tabList = document.getElementById('tab-list');
        this.tabContent = document.getElementById('tab-content');
        this.newTabButton = document.getElementById('new-tab');
        this.tabs = [];
        this.currentTab = null;

        // Управление текстом
        this.optionsButtons = document.querySelectorAll('.option-button');
        this.advancedOptionButtons = document.querySelectorAll('.adv-option-button');
        this.fontName = document.getElementById('fontName');
        this.fontSizeRef = document.getElementById('fontSize');
        this.foreColorInput = document.getElementById('foreColor');
        this.backColorInput = document.getElementById('backColor');
        this.fontList = ['Arial', 'Verdana', 'Times New Roman', 'Garamond', 'Georgia', 'Courier New', 'cursive'];

        // Сохраняем последние использованные стили
        this.lastFontName = this.fontList[0]; // Шрифт по умолчанию
        this.lastFontSize = 3; // Размер шрифта по умолчанию
        this.lastBold = false;

        this.initialize();
    }

    initialize() {
        this.setupFontOptions();
        this.setupEventListeners();
        this.newTabButton.addEventListener('click', () => this.createNewTab());
        this.createNewTab(); // Создаем первую вкладку по умолчанию
    }

    setupFontOptions() {
        this.fontList.forEach((font) => {
            const option = document.createElement('option');
            option.value = font;
            option.innerHTML = font;
            this.fontName.appendChild(option);
        });

        for (let i = 1; i <= 7; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.innerHTML = i;
            this.fontSizeRef.appendChild(option);
        }

        this.fontSizeRef.value = 3;
    }

    setupEventListeners() {
        this.optionsButtons.forEach((button) => {
            button.addEventListener('click', () => {
                this.modifyText(button.id, false, null);
            });
        });

        this.advancedOptionButtons.forEach((button) => {
            if (button.id !== 'foreColor' && button.id !== 'backColor') {
                button.addEventListener('change', () => {
                    this.modifyText(button.id, false, button.value);
                });
            }
        });

        this.foreColorInput.addEventListener('input', () => {
            this.modifyText('foreColor', false, this.foreColorInput.value);
        });

        this.backColorInput.addEventListener('input', () => {
            this.modifyText('backColor', false, this.backColorInput.value);
        });
    }

    createNewTab() {
        const tabId = `tab-${this.tabs.length + 1}`;
        const tabButton = document.createElement('button');
        tabButton.classList.add('tab');
        tabButton.textContent = `Tab ${this.tabs.length + 1}`;
        tabButton.dataset.tabId = tabId;
        tabButton.addEventListener('click', () => this.switchToTab(tabId));

        // Добавление кнопки "Закрыть" для удаления вкладки
        const closeButton = document.createElement('span');
        closeButton.textContent = '✖'; // Символ закрытия
        closeButton.classList.add('close-tab');
        closeButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Останавливаем всплытие события
            this.removeTab(tabId);
        });

        tabButton.appendChild(closeButton);
        this.tabList.appendChild(tabButton);

        const textArea = document.createElement('div');
        textArea.id = tabId;
        textArea.classList.add('text-area');
        textArea.contentEditable = 'true';

        // Добавляем обработчик ввода для обновления стилей
        textArea.addEventListener('input', (event) => {
            const selection = window.getSelection();
            if (!selection.isCollapsed) {
                this.lastFontName = this.fontName.value;
                this.lastFontSize = this.fontSizeRef.value;
                this.lastBold = document.queryCommandState("bold");
            }

            // Применяем шрифт из меню перед добавлением нового текста
            this.modifyText("fontName", false, this.fontName.value);
            this.applyFontSizeToSelection(textArea);

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
        this.tabs.forEach(tab => {
            tab.textArea.style.display = (tab.tabId === tabId) ? 'block' : 'none';
            tab.tabButton.classList.toggle('active', tab.tabId === tabId);
        });
        this.currentTab = this.tabs.find(tab => tab.tabId === tabId);
    }

    removeTab(tabId) {
        const tabToRemove = this.tabs.find(tab => tab.tabId === tabId);
        if (tabToRemove) {
            // Удаляем текстовую область и кнопку вкладки
            this.tabContent.removeChild(tabToRemove.textArea);
            this.tabList.removeChild(tabToRemove.tabButton);
            // Удаляем вкладку из массива
            this.tabs = this.tabs.filter(tab => tab.tabId !== tabId);
            // Если текущая вкладка была удалена, переключаемся на другую
            if (this.currentTab && this.currentTab.tabId === tabId && this.tabs.length > 0) {
                this.switchToTab(this.tabs[0].tabId); // Переключаемся на первую оставшуюся вкладку
            } else if (this.tabs.length === 0) {
                this.currentTab = null; // Сбрасываем текущую вкладку
            }
        }
    }

    modifyText(command, defaultUi, value) {
        document.execCommand(command, defaultUi, value);
    }

    applyFontSizeToSelection(textArea) {
        const selectedFontSize = this.fontSizeRef.value;
        textArea.focus(); // Убедимся, что текстовое поле в фокусе перед выполнением команды
        document.execCommand("fontSize", false, selectedFontSize);
    }

    applyLastStyles(textArea) {
        if (this.lastFontName) {
            this.modifyText("fontName", false, this.lastFontName);
        }
        if (this.lastFontSize) {
            this.modifyText("fontSize", false, this.lastFontSize);
        }
        if (this.lastBold) {
            this.modifyText("bold", false, null);
        }
    }
}

window.onload = () => new RichTextEditor();
