const state = {
    currentPath: '',
    editingFile: null,
    lang: localStorage.getItem('lang') || (navigator.language.startsWith('bg') ? 'bg' : 'en'),
    inputCallback: null,
    colorFolder: null // Folder currently being colored
};

const dictionaries = {
    en: {
        upload: 'Upload',
        newFolder: 'New Folder',
        name: 'Name',
        size: 'Size',
        date: 'Date',
        save: 'Save',
        close: 'Close',
        emptyFolder: 'This folder is empty',
        delete: 'Delete',
        edit: 'Edit',
        rename: 'Rename',
        color: 'Color',
        preview: 'Preview',
        download: 'Download',
        confirm: 'Confirm',
        confirmDelete: 'Are you sure you want to delete "{name}"?',
        folderNamePrompt: 'Folder name',
        renamePrompt: 'Enter new name for "{name}"',
        uploadFailed: 'Upload failed',
        createFolderFailed: 'Failed to create folder',
        deleteFailed: 'Delete failed',
        saveFailed: 'Save failed',
        renameFailed: 'Rename failed',
        colorUpdated: 'Color updated',
        fileSaved: 'File saved!',
        renamed: 'Renamed successfully',
        openFailed: 'Failed to open file',
        selectColor: 'Select Color',
        resetColor: 'Reset',
        footerCredit: 'Created with ❤️ by Fedya Serafiev'
    },
    bg: {
        upload: 'Качване',
        newFolder: 'Нова папка',
        name: 'Име',
        size: 'Размер',
        date: 'Дата',
        save: 'Запази',
        close: 'Затвори',
        emptyFolder: 'Тази папка е празна',
        delete: 'Изтрий',
        edit: 'Редактирай',
        rename: 'Преименуване',
        color: 'Цвят',
        preview: 'Преглед',
        download: 'Свали',
        confirm: 'Потвърди',
        confirmDelete: 'Сигурни ли сте, че искате да изтриете "{name}"?',
        folderNamePrompt: 'Име на папката',
        renamePrompt: 'Въведете ново име за "{name}"',
        uploadFailed: 'Качването неуспешно',
        createFolderFailed: 'Грешка при създаване на папка',
        deleteFailed: 'Грешка при изтриване',
        saveFailed: 'Грешка при запис',
        renameFailed: 'Грешка при преименуване',
        colorUpdated: 'Цветът е обновен',
        fileSaved: 'Файлът е запазен!',
        renamed: 'Преименувано успешно',
        openFailed: 'Грешка при отваряне на файл',
        selectColor: 'Изберете Цвят',
        resetColor: 'Изчисти',
        footerCredit: 'Създадено с ❤️ от Федя Серафиев'
    }
};

const t = (key, params = {}) => {
    let text = dictionaries[state.lang][key] || key;
    Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
    });
    return text;
};

// Elements
const fileListEl = document.getElementById('fileList');
const breadcrumbEl = document.getElementById('breadcrumb');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const createFolderBtn = document.getElementById('createFolderBtn');
const dropZone = document.getElementById('dropZone');
const emptyState = document.getElementById('emptyState');
const langSelect = document.getElementById('langSelect');

// Modals
const editorModal = document.getElementById('editorModal');
const fileEditor = document.getElementById('fileEditor');
const editorFileName = document.getElementById('editorFileName');
const saveFileBtn = document.getElementById('saveFileBtn');
const closeEditorBtn = document.getElementById('closeEditorBtn');

const previewModal = document.getElementById('previewModal');
const previewBody = document.getElementById('previewBody');
const previewFileName = document.getElementById('previewFileName');
const closePreviewBtn = document.getElementById('closePreviewBtn');

const inputModal = document.getElementById('inputModal');
const inputModalTitle = document.getElementById('inputModalTitle');
const inputModalValue = document.getElementById('inputModalValue');
const inputModalConfirm = document.getElementById('inputModalConfirm');
const inputModalCancel = document.getElementById('inputModalCancel');

const colorModal = document.getElementById('colorModal');
const colorModalClose = document.getElementById('colorModalClose');
const colorModalClear = document.getElementById('colorModalClear');

// Utils
const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(state.lang === 'bg' ? 'bg-BG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
};

const getIcon = (filename, isDir) => {
    if (isDir) return 'folder';
    const ext = getExtension(filename);
    const map = {
        'txt': 'description',
        'md': 'description',
        'js': 'code',
        'html': 'code',
        'css': 'code',
        'json': 'data_object',
        'py': ' terminal', // Custom space to ensure class check works if needed, but here simple string
        'zip': 'folder_zip',
        'rar': 'folder_zip',
        '7z': 'folder_zip',
        'tar': 'folder_zip',
        'gz': 'folder_zip',
        'pdf': 'picture_as_pdf',
        'jpg': 'image',
        'jpeg': 'image',
        'png': 'image',
        'gif': 'image',
        'svg': 'image',
        'mp3': 'audiotrack',
        'wav': 'audiotrack',
        'mp4': 'movie',
        'mkv': 'movie',
        'mov': 'movie'
    };
    return map[ext] || 'insert_drive_file';
};

const isTextFile = (ext) => {
    return ['txt', 'md', 'js', 'json', 'css', 'html', 'xml', 'yml', 'yaml', 'log', 'ini', 'conf', 'sh', 'bat', 'py'].includes(ext);
};

const isImageFile = (ext) => {
    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext);
};

const updateLanguage = () => {
    langSelect.value = state.lang;
    document.documentElement.lang = state.lang === 'bg' ? 'bg' : 'en';

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (el.children.length > 0) {
            const icon = el.querySelector('.material-icons');
            if (icon) {
                el.innerHTML = '';
                el.appendChild(icon);
                el.append(' ' + t(key));
            } else {
                el.innerText = t(key);
            }
        } else {
            el.innerText = t(key);
        }
    });

    if (state.currentPath) fetchFiles(state.currentPath);
};

// Input Modal Logic
const openInputModal = (title, initialValue, callback) => {
    inputModalTitle.innerText = title;
    inputModalValue.value = initialValue;
    state.inputCallback = callback;
    inputModal.classList.remove('hidden');
    inputModalValue.focus();
};

const closeInputModal = () => {
    inputModal.classList.add('hidden');
    state.inputCallback = null;
    inputModalValue.value = '';
};

// Color Modal Logic
const openColorModal = (folderName) => {
    state.colorFolder = folderName;
    colorModal.classList.remove('hidden');
};

const setFolderColor = async (color) => {
    if (!state.colorFolder) return;
    const path = state.currentPath ? `${state.currentPath}/${state.colorFolder}` : state.colorFolder;

    try {
        await fetch('/api/color', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: path, color })
        });
        colorModal.classList.add('hidden');
        fetchFiles(state.currentPath);
    } catch (err) {
        console.error('Color update failed:', err);
    }
};

// API calls & Operations
const fetchFiles = async (path = '') => {
    try {
        const res = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const files = await res.json();
        renderFiles(files);
        renderBreadcrumbs(path);
        state.currentPath = path;
    } catch (err) {
        console.error('Error fetching files:', err);
    }
};

const uploadFiles = async (files) => {
    try {
        for (const file of files) {
            const data = new FormData();
            data.append('file', file);
            await fetch(`/api/upload?path=${encodeURIComponent(state.currentPath)}`, {
                method: 'POST',
                body: data
            });
        }
        fetchFiles(state.currentPath);
    } catch (err) {
        console.error('Upload failed:', err);
        alert(t('uploadFailed'));
    }
};

const createFolder = () => {
    openInputModal(t('folderNamePrompt'), '', async (name) => {
        if (!name) return;
        try {
            await fetch('/api/folder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: state.currentPath, name })
            });
            fetchFiles(state.currentPath);
        } catch (err) {
            console.error('Create folder failed:', err);
            alert(t('createFolderFailed'));
        }
    });
};

const renameItem = (oldName) => {
    openInputModal(t('renamePrompt', { name: oldName }), oldName, async (newName) => {
        if (!newName || newName === oldName) return;
        try {
            await fetch('/api/rename', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: state.currentPath, oldName, newName })
            });
            fetchFiles(state.currentPath);
        } catch (err) {
            console.error('Rename failed:', err);
            alert(t('renameFailed'));
        }
    });
};

const deleteItem = async (name) => {
    if (!confirm(t('confirmDelete', { name }))) return;

    try {
        await fetch('/api/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: state.currentPath ? `${state.currentPath}/${name}` : name })
        });
        fetchFiles(state.currentPath);
    } catch (err) {
        console.error('Delete failed:', err);
        alert(t('deleteFailed'));
    }
};

const downloadItem = (name) => {
    const path = state.currentPath ? `${state.currentPath}/${name}` : name;
    window.location.href = `/api/download?path=${encodeURIComponent(path)}`;
};

const openEditor = async (name) => {
    const path = state.currentPath ? `${state.currentPath}/${name}` : name;
    try {
        const res = await fetch(`/api/content?path=${encodeURIComponent(path)}`);
        const data = await res.json();

        state.editingFile = name;
        editorFileName.innerText = name;
        fileEditor.value = data.content;
        editorModal.classList.remove('hidden');
    } catch (err) {
        console.error('Failed to open file:', err);
        alert(t('openFailed'));
    }
};

const saveFile = async () => {
    if (!state.editingFile) return;
    const content = fileEditor.value;
    const path = state.currentPath ? `${state.currentPath}/${state.editingFile}` : state.editingFile;

    try {
        const res = await fetch('/api/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path, content })
        });
        if (!res.ok) throw new Error('Failed to save');
        alert(t('fileSaved'));
        editorModal.classList.add('hidden');
        state.editingFile = null;
    } catch (err) {
        console.error('Save failed:', err);
        alert(t('saveFailed'));
    }
};

const openPreview = (name) => {
    const path = state.currentPath ? `${state.currentPath}/${name}` : name;
    const url = `/api/download?path=${encodeURIComponent(path)}`;

    previewFileName.innerText = name;
    previewBody.innerHTML = `<img src="${url}" alt="${name}">`;
    previewModal.classList.remove('hidden');
};

// Rendering
const renderFiles = (files) => {
    fileListEl.innerHTML = '';

    if (files.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
    }

    files.sort((a, b) => {
        if (a.isDirectory === b.isDirectory) {
            return a.name.localeCompare(b.name);
        }
        return a.isDirectory ? -1 : 1;
    });

    files.forEach(file => {
        const item = document.createElement('div');
        item.className = 'file-item';

        const isDir = file.isDirectory;
        const iconName = getIcon(file.name, isDir);
        let iconColorStyle = '';

        // Custom Folder Color
        if (isDir && file.color) {
            iconColorStyle = `color: ${file.color} !important;`;
        } else if (isDir) {
            iconColorStyle = 'color: #facc15 !important;'; // Default yellow
        }

        const size = isDir ? '-' : formatSize(file.size);

        // Additional Actions
        let extraActions = '';
        if (isDir) {
            extraActions = `<button class="action-btn color-btn" title="${t('color')}"><span class="material-icons" style="font-size: 18px;">palette</span></button>`;
        }

        item.innerHTML = `
            <div class="col-icon"><span class="material-icons" style="${iconColorStyle}">${iconName}</span></div>
            <div class="col-name">${file.name}</div>
            <div class="col-size">${size}</div>
            <div class="col-date">${formatDate(file.mtime)}</div>
            <div class="col-actions">
                ${extraActions}
                <button class="action-btn rename-btn" title="${t('rename')}"><span class="material-icons" style="font-size: 18px;">edit</span></button>
                <button class="action-btn delete-btn" title="${t('delete')}"><span class="material-icons" style="font-size: 18px;">delete</span></button>
            </div>
        `;

        item.querySelector('.col-name').addEventListener('click', () => {
            if (isDir) {
                const newPath = state.currentPath ? `${state.currentPath}/${file.name}` : file.name;
                fetchFiles(newPath);
            } else {
                const ext = getExtension(file.name);
                if (isTextFile(ext)) {
                    openEditor(file.name);
                } else if (isImageFile(ext)) {
                    openPreview(file.name);
                } else {
                    downloadItem(file.name);
                }
            }
        });

        if (isDir) {
            item.querySelector('.color-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                openColorModal(file.name);
            });
        }

        item.querySelector('.rename-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            renameItem(file.name);
        });

        item.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteItem(file.name);
        });

        fileListEl.appendChild(item);
    });
};

const renderBreadcrumbs = (path) => {
    const parts = path.split('/').filter(p => p);
    let html = `<span class="breadcrumb-item" data-path="">Home</span>`;

    let current = '';
    parts.forEach((part, index) => {
        current += (index === 0 ? '' : '/') + part;
        html += ` <span class="material-icons" style="font-size: 14px; color: #666;">chevron_right</span> <span class="breadcrumb-item" data-path="${current}">${part}</span>`;
    });

    breadcrumbEl.innerHTML = html;

    breadcrumbEl.querySelectorAll('.breadcrumb-item').forEach(el => {
        el.addEventListener('click', () => {
            fetchFiles(el.dataset.path);
        });
    });
};

// Event Listeners
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        uploadFiles(e.target.files);
        fileInput.value = '';
    }
});

createFolderBtn.addEventListener('click', createFolder);

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files);
    }
});

// Modal Listeners
saveFileBtn.addEventListener('click', saveFile);
closeEditorBtn.addEventListener('click', () => editorModal.classList.add('hidden'));
closePreviewBtn.addEventListener('click', () => previewModal.classList.add('hidden'));

// Input Modal
inputModalConfirm.addEventListener('click', () => {
    if (state.inputCallback) {
        state.inputCallback(inputModalValue.value);
    }
    closeInputModal();
});
inputModalCancel.addEventListener('click', closeInputModal);
inputModalValue.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        inputModalConfirm.click();
    }
});

// Color Picker
document.querySelectorAll('.color-swatch').forEach(el => {
    el.addEventListener('click', () => {
        setFolderColor(el.dataset.color);
    });
});
colorModalClose.addEventListener('click', () => colorModal.classList.add('hidden'));
colorModalClear.addEventListener('click', () => setFolderColor(null));

// Language Selector
langSelect.addEventListener('change', (e) => {
    state.lang = e.target.value;
    localStorage.setItem('lang', state.lang);
    updateLanguage();
});

// Close modals on overlay
window.addEventListener('click', (e) => {
    if (e.target === editorModal) editorModal.classList.add('hidden');
    if (e.target === previewModal) previewModal.classList.add('hidden');
    if (e.target === inputModal) closeInputModal();
    if (e.target === colorModal) colorModal.classList.add('hidden');
});

// Init
updateLanguage();
fetchFiles();

