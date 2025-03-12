import * as tf from '@tensorflow/tfjs-node';
import path from 'path';
import fs from 'fs';
import config from '../config';

class MlService
{
    private model: tf.LayersModel | null = null;
    private modelPath: string;
    private classLabels: string[] = [
        'Melanoma',
        'Basal Cell Carcinoma',
        'Squamous Cell Carcinoma',
        'Actinic Keratosis',
        'Benign Keratosis',
        'Dermatofibroma',
        'Vascular Lesion'
    ];

    constructor()
    {
        this.modelPath = path.join(__dirname, '../../models/skin_lesion_model');
        this.initModel();
    }

    /**
     * Initialize the TensorFlow model
     */
    async initModel()
    {
        try
        {
            // Check if model directory exists
            if (fs.existsSync(this.modelPath))
            {
                console.log('Loading model from disk...');
                this.model = await tf.loadLayersModel(`file://${this.modelPath}/model.json`);
                console.log('Model loaded successfully');
            } else
            {
                console.warn('Model not found at path:', this.modelPath);
                console.log('Server will run without ML capabilities until model is available');
            }
        } catch (error)
        {
            console.error('Error loading model:', error);
            console.log('Server will run without ML capabilities');
        }
    }

    /**
     * Check if model is ready
     */
    isModelReady(): boolean
    {
        return this.model !== null;
    }

    /**
     * Preprocess image for model input
     * @param imageBuffer Image buffer to process
     * @returns Tensor suitable for model input
     */
    preprocessImage(imageBuffer: Buffer): tf.Tensor4D
    {
        // Convert image buffer to tensor
        const image = tf.node.decodeImage(imageBuffer, 3);

        // Resize to model input shape (typically 224x224 for many models)
        const resized = tf.image.resizeBilinear(image as tf.Tensor3D, [224, 224]);

        // Normalize pixel values to [0,1]
        const normalized = resized.div(tf.scalar(255));

        // Expand dimensions to create batch size of 1
        const batched = normalized.expandDims(0) as tf.Tensor4D;

        // Dispose temporary tensors to prevent memory leak
        image.dispose();
        resized.dispose();
        normalized.dispose();

        return batched;
    }

    /**
     * Run prediction on preprocessed image
     * @param imageTensor Preprocessed image tensor
     * @returns Prediction results
     */
    async predict(imageBuffer: Buffer)
    {
        if (!this.isModelReady())
        {
            throw new Error('Model not initialized');
        }

        try
        {
            // Preprocess image
            const imageTensor = this.preprocessImage(imageBuffer);

            // Run prediction
            const predictions = await this.model!.predict(imageTensor) as tf.Tensor;

            // Convert to array
            const predictionArray = await predictions.data();

            // Dispose tensors to prevent memory leak
            imageTensor.dispose();
            predictions.dispose();

            // Format results
            const results = Array.from(predictionArray).map((probability, index) => ({
                name: this.classLabels[index] || `Class ${index}`,
                probability: probability
            }));

            // Sort by probability (descending)
            results.sort((a, b) => b.probability - a.probability);

            const topPrediction = results[0];

            // Generate recommendation based on diagnosis
            let recommendation = this.generateRecommendation(topPrediction.name, topPrediction.probability);

            return {
                diagnosis: topPrediction.name,
                confidence: topPrediction.probability,
                possibleConditions: results,
                recommendations: recommendation
            };
        } catch (error)
        {
            console.error('Error during prediction:', error);
            throw new Error('Failed to run prediction');
        }
    }

    /**
     * Generate recommendation based on diagnosis
     * @param diagnosis Diagnosis name
     * @param confidence Confidence score
     * @returns Recommendation text
     */
    private generateRecommendation(diagnosis: string, confidence: number): string
    {
        // High risk conditions that need immediate attention
        const highRiskConditions = ['Melanoma', 'Basal Cell Carcinoma', 'Squamous Cell Carcinoma'];

        // Medium risk conditions that need medical attention
        const mediumRiskConditions = ['Actinic Keratosis'];

        if (highRiskConditions.includes(diagnosis))
        {
            if (confidence > 0.7)
            {
                return 'URGENT: Please consult a dermatologist immediately. This lesion has high-risk features associated with skin cancer.';
            } else
            {
                return 'Based on the analysis, this lesion shows some concerning features. Please consult a dermatologist for proper evaluation as soon as possible.';
            }
        } else if (mediumRiskConditions.includes(diagnosis))
        {
            return 'This lesion may be pre-cancerous. Recommend a dermatologist visit for evaluation and treatment options.';
        } else
        {
            if (confidence < 0.5)
            {
                return 'The analysis is inconclusive. We recommend consulting a healthcare professional for proper diagnosis.';
            } else
            {
                return 'The lesion appears to be benign, but monitor for any changes in size, shape, or color. If you notice changes, please consult a healthcare professional.';
            }
        }
    }
}

export default new MlService();