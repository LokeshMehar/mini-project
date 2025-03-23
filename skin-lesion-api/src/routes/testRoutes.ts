import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Store image in memory (you can switch to disk if needed)
const upload = multer({
    storage,
    fileFilter: (req, file, cb) =>
    {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype)
        {
            return cb(null, true);
        } else
        {
            cb(new Error('Only images are allowed (jpeg, jpg, png)'));
        }
    }
});

// GET /test route
router.get('/test1', (req: Request, res: Response) =>
{
    res.send('this is the result from the ml model');
});

// POST /test route
router.post('/test1', upload.single('image'), async (req: Request, res: Response) =>
{
    try
    {
        if (!req.file)
        {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        // Access the image buffer
        const imageBuffer = req.file.buffer;
        const imageName = req.file.originalname;

        // Log for now (or process with ML model)
        console.log(`Received image: ${imageName}, size: ${imageBuffer.length} bytes`);

        // You could process the image here with TensorFlow.js or another method

        res.status(200).json({ message: 'Image received successfully' });
    } catch (error: any)
    {
        console.error('Error handling image:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
