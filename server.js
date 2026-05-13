const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public')); // Serve the public directory

const uploadDir = path.join(__dirname, 'public', 'uploads');
const configDir = path.join(__dirname, 'public', 'configs');

// Ensure storage directories exist
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({ storage });

app.post('/api/upload-model', upload.single('modelFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    res.json({ 
        message: 'Model saved locally!', 
        filename: req.file.filename, 
        url: `/uploads/${req.file.filename}` 
    });
});

app.post('/api/save-config', (req, res) => {
    const { modelName, configData } = req.body;
    
    if (!modelName || !configData) {
        return res.status(400).json({ error: 'Missing model name or config data.' });
    }

    const configPath = path.join(configDir, `${modelName}.json`);
    fs.writeFile(configPath, JSON.stringify(configData, null, 2), (err) => {
        if (err) return res.status(500).json({ error: 'Failed to save configuration.' });
        res.json({ message: 'Configuration saved successfully!' });
    });
});

// API: Save a Model Variant (Duplicates the model and saves its specific config)
app.post('/api/save-model-variant', (req, res) => {
    const { originalModel, newModelName, configData } = req.body;
    
    if (!originalModel || !newModelName || !configData) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    const newFilename = newModelName.toLowerCase().endsWith('.glb') || newModelName.toLowerCase().endsWith('.gltf') 
        ? newModelName 
        : `${newModelName}.glb`;
    
    const origPath = path.join(uploadDir, originalModel);
    const newPath = path.join(uploadDir, newFilename);
    const configPath = path.join(configDir, `${newFilename}.json`);

    if (!fs.existsSync(origPath)) {
        return res.status(404).json({ error: 'Original model not found on server.' });
    }

    fs.copyFile(origPath, newPath, (err) => {
        if (err) return res.status(500).json({ error: 'Failed to copy model file.' });
        
        fs.writeFile(configPath, JSON.stringify(configData, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Failed to save configuration.' });
            res.json({ message: 'Model variant saved successfully!', filename: newFilename });
        });
    });
});

// API: Get all saved 3D models
app.get('/api/models', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) return res.status(500).json({ error: 'Failed to read directory.' });
        const models = files.filter(f => f.toLowerCase().endsWith('.glb') || f.toLowerCase().endsWith('.gltf'));
        res.json(models);
    });
});

// API: Get configuration for a specific model
app.get('/api/config/:modelName', (req, res) => {
    const configPath = path.join(configDir, `${req.params.modelName}.json`);
    if (fs.existsSync(configPath)) {
        res.sendFile(configPath);
    } else {
        res.status(404).json({ error: 'Config not found.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});