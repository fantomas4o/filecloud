# FileCloud ☁️

![FileCloud Screenshot](public/screenshot.png)

> A modern, lightweight, self-hosted file manager built with Node.js and Vanilla JavaScript.
> *Съвременен, лек, self-hosted файлов мениджър, изграден с Node.js и Vanilla JavaScript.*

## 🌟 Overview / Преглед

**FileCloud** is a robust web-based file management solution designed for personal servers. It offers a premium, app-like experience with a focus on aesthetics, speed, and usability. Influenced by tools like *Droppy.js*, it brings modern features like drag-and-drop uploads, code editing, and full internationalization (EN/BG).

**FileCloud** е мощно уеб-базирано решение за управление на файлове, предназначено за лични сървъри. Предлага преживяване като в приложение с фокус върху естетиката, бързината и удобството.

---

## ✨ Key Features / Основни функции

*   **📂 File Management**: Create folders, delete items, and download files with ease.
*   **✏️ Rename & Organize**: Fix typos or restructure your files with a custom, sleek renaming modal.
*   **🎨 Folder Customization**: **[NEW]** Highlight important folders by changing their color directly from the UI. Your choice is saved permanently!
*   **🌍 Internationalization (i18n)**: Fully translated interface in **English** and **Bulgarian (Български)**. Switch instantly.
*   **🚀 Drag & Drop**: Upload files simply by dragging them into the window.
*   **📝 Built-in Editor**: Edit text, code (`.js`, `.css`, `.py`, etc.), and config files directly in the browser.
*   **👁️ Media Preview**: Preview images instantly without downloading.
*   **💎 Premium UI**: Dark mode by default, smooth animations, glassmorphism effects, and rich file icons.

---

## 🛠️ Installation & Setup / Инсталация

### Prerequisites
*   Node.js (v14 or higher)
*   NPM

### Local Development
1.  **Clone the repository**:
    ```bash
    git clone git@github.com:fantomas4o/filecloud.git
    cd filecloud
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the server**:
    ```bash
    npm start
    ```
    Access the app at `http://localhost:3000` or `http://ip:3000`.

### Server Deployment (Ubuntu/Systemd)
To run FileCloud as a background service:

1.  Copy the project to `/opt/filecloud`.
2.  Create a systemd service file:
    ```ini
    [Unit]
    Description=FileCloud Service
    After=network.target

    [Service]
    ExecStart=/usr/bin/node /opt/filecloud/server.js
    WorkingDirectory=/opt/filecloud
    Restart=always
    User=root
    Environment=NODE_ENV=production

    [Install]
    WantedBy=multi-user.target
    ```
3.  Enable and start:
    ```bash
    sudo systemctl enable filecloud
    sudo systemctl start filecloud
    ```

---

## 💻 Tech Stack / Технологии

*   **Backend**: Node.js, Express.js, Multer, FS-Extra.
*   **Frontend**: HTML5, CSS3 (Custom Properties, Flexbox/Grid), Vanilla JavaScript (ES6+).
*   **Icons**: Google Material Icons.
*   **Fonts**: Google Fonts (One Sans).

---

## ❤️ Credits

Created with ❤️ by **Fedya Serafiev**.

*2026 FileCloud Project*

💝 If you found this helpful, please consider supporting my work:

* [☕ PayPal](https://www.paypal.com/donate/?hosted_button_id=UESCPAJUGUN2A)
* [💳 Revolut](https://revolut.me/fedya2s8q)