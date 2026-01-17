const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const mime = require('mime-types');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(process.cwd()); // Serve files relative to where the script is run, or define a specific root

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve frontend files

// Configure Multer for uploads
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = req.query.path ? path.join(ROOT_DIR, req.query.path) : ROOT_DIR;
            // Basic security check to prevent directory traversal
            if (!uploadPath.startsWith(ROOT_DIR)) {
                return cb(new Error('Invalid path'));
            }
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    })
});

// Helper: Get file stats
const getFileStats = async (filePath) => {
    try {
        const stats = await fs.stat(filePath);
        let color = null;
        if (stats.isDirectory()) {
            try {
                // Check for hidden .folder_color file
                const colorPath = path.join(filePath, '.folder_color');
                if (await fs.pathExists(colorPath)) {
                    color = await fs.readFile(colorPath, 'utf8');
                }
            } catch (ignore) { }
        }

        return {
            name: path.basename(filePath),
            isDirectory: stats.isDirectory(),
            size: stats.size,
            mtime: stats.mtime,
            color: color ? color.trim() : null
        };
    } catch (err) {
        return null;
    }
};

// API: List files
app.get('/api/files', async (req, res) => {
    const requestPath = req.query.path || '';
    const fullPath = path.join(ROOT_DIR, 'files', requestPath); // Serve from a 'files' subdirectory for safety

    // Ensure the 'files' directory exists
    await fs.ensureDir(path.join(ROOT_DIR, 'files'));

    // Security check
    if (!fullPath.startsWith(path.join(ROOT_DIR, 'files'))) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const files = await fs.readdir(fullPath);
        const fileList = await Promise.all(files.map(async file => {
            const stats = await getFileStats(path.join(fullPath, file));
            return stats;
        }));
        // Filter out nulls (if any errors occurred)
        res.json(fileList.filter(f => f));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Set Folder Color
app.post('/api/color', async (req, res) => {
    const { path: relativePath, color } = req.body;
    const folderPath = path.join(ROOT_DIR, 'files', relativePath);

    if (!folderPath.startsWith(path.join(ROOT_DIR, 'files'))) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const colorFile = path.join(folderPath, '.folder_color');
        if (color) {
            await fs.writeFile(colorFile, color, 'utf8');
        } else {
            if (await fs.pathExists(colorFile)) {
                await fs.remove(colorFile);
            }
        }
        res.json({ message: 'Color updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Upload file
app.post('/api/upload', (req, res) => {
    const requestPath = req.query.path || '';
    const uploadDir = path.join(ROOT_DIR, 'files', requestPath);

    // Ensure dir exists
    fs.ensureDirSync(uploadDir);

    // Initial multer configuration didn't have access to dynamic path properly in middleware context easily without wrapping
    // So we'll use a custom middleware wrapper or just handle writing differently. 
    // Actually, let's redefine upload middleware per request or use a localized strategy.
    // For simplicity, let's just save to temp or handle it here. 
    // BETTER APPROACH: Use multer with a function for destination that checks req.query

    const uploader = multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                const p = path.join(ROOT_DIR, 'files', req.query.path || '');
                if (!p.startsWith(path.join(ROOT_DIR, 'files'))) {
                    return cb(new Error('Access Denied'));
                }
                cb(null, p);
            },
            filename: (req, file, cb) => {
                cb(null, file.originalname);
            }
        })
    }).single('file');

    uploader(req, res, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Uploaded successfully' });
    });
});

// API: Create Folder
app.post('/api/folder', async (req, res) => {
    const { path: relativePath, name } = req.body;
    const folderPath = path.join(ROOT_DIR, 'files', relativePath || '', name);

    if (!folderPath.startsWith(path.join(ROOT_DIR, 'files'))) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        await fs.ensureDir(folderPath);
        res.json({ message: 'Folder created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Delete
app.delete('/api/delete', async (req, res) => {
    const { path: relativePath } = req.body;
    const itemPath = path.join(ROOT_DIR, 'files', relativePath);

    if (!itemPath.startsWith(path.join(ROOT_DIR, 'files'))) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        await fs.remove(itemPath);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Download
app.get('/api/download', (req, res) => {
    const relativePath = req.query.path;
    const filePath = path.join(ROOT_DIR, 'files', relativePath);

    if (!filePath.startsWith(path.join(ROOT_DIR, 'files'))) {
        return res.status(403).send('Access denied');
    }

    res.download(filePath);
});

// API: Get File Content (Text)
app.get('/api/content', async (req, res) => {
    const relativePath = req.query.path;
    const filePath = path.join(ROOT_DIR, 'files', relativePath);

    if (!filePath.startsWith(path.join(ROOT_DIR, 'files'))) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const content = await fs.readFile(filePath, 'utf8');
        res.json({ content });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Save File Content
app.post('/api/content', async (req, res) => {
    const { path: relativePath, content } = req.body;
    const filePath = path.join(ROOT_DIR, 'files', relativePath);

    if (!filePath.startsWith(path.join(ROOT_DIR, 'files'))) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        await fs.writeFile(filePath, content, 'utf8');
        res.json({ message: 'Saved successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Rename
app.post('/api/rename', async (req, res) => {
    const { path: relativePath, oldName, newName } = req.body;
    const oldPath = path.join(ROOT_DIR, 'files', relativePath ? relativePath + '/' + oldName : oldName);
    const newPath = path.join(ROOT_DIR, 'files', relativePath ? relativePath + '/' + newName : newName);

    if (!oldPath.startsWith(path.join(ROOT_DIR, 'files')) || !newPath.startsWith(path.join(ROOT_DIR, 'files'))) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        await fs.rename(oldPath, newPath);
        res.json({ message: 'Renamed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Serving files from ${path.join(ROOT_DIR, 'files')}`);
});
