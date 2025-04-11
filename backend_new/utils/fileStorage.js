import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory path
const dataDir = path.join(__dirname, '..', process.env.DATA_DIR || './data');

/**
 * Save data to a JSON file
 * @param {string} collection - The collection name (directory)
 * @param {object} data - The data to save
 * @returns {Promise<object>} - The saved data with ID
 */
export const saveData = async (collection, data) => {
  const collectionPath = path.join(dataDir, collection);
  
  // Ensure directory exists
  if (!fs.existsSync(collectionPath)) {
    fs.mkdirSync(collectionPath, { recursive: true });
  }
  
  // Generate ID if not provided
  const dataWithId = { ...data };
  if (!dataWithId._id) {
    dataWithId._id = uuidv4();
  }
  
  // Add timestamps
  if (!dataWithId.createdAt) {
    dataWithId.createdAt = new Date();
  }
  dataWithId.updatedAt = new Date();
  
  // Write to file
  const filePath = path.join(collectionPath, `${dataWithId._id}.json`);
  await fs.promises.writeFile(filePath, JSON.stringify(dataWithId, null, 2));
  
  return dataWithId;
};

/**
 * Get data by ID
 * @param {string} collection - The collection name (directory)
 * @param {string} id - The document ID
 * @returns {Promise<object|null>} - The document or null if not found
 */
export const findById = async (collection, id) => {
  const filePath = path.join(dataDir, collection, `${id}.json`);
  
  try {
    if (fs.existsSync(filePath)) {
      const data = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
};

/**
 * Find documents matching a filter
 * @param {string} collection - The collection name (directory)
 * @param {Function} filterFn - Filter function that returns true for matching documents
 * @returns {Promise<Array>} - Array of matching documents
 */
export const find = async (collection, filterFn = () => true) => {
  const collectionPath = path.join(dataDir, collection);
  
  try {
    if (!fs.existsSync(collectionPath)) {
      return [];
    }
    
    const files = await fs.promises.readdir(collectionPath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const documents = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(collectionPath, file);
        const data = await fs.promises.readFile(filePath, 'utf8');
        return JSON.parse(data);
      })
    );
    
    return documents.filter(filterFn);
  } catch (error) {
    console.error(`Error reading from ${collection}:`, error);
    return [];
  }
};

/**
 * Update a document
 * @param {string} collection - The collection name (directory)
 * @param {string} id - The document ID
 * @param {object} updateData - Data to update
 * @returns {Promise<object|null>} - The updated document or null if not found
 */
export const updateById = async (collection, id, updateData) => {
  const document = await findById(collection, id);
  
  if (!document) {
    return null;
  }
  
  const updatedDocument = { 
    ...document, 
    ...updateData,
    _id: document._id, // Ensure ID doesn't change
    updatedAt: new Date()
  };
  
  const filePath = path.join(dataDir, collection, `${id}.json`);
  await fs.promises.writeFile(filePath, JSON.stringify(updatedDocument, null, 2));
  
  return updatedDocument;
};

/**
 * Delete a document
 * @param {string} collection - The collection name (directory)
 * @param {string} id - The document ID
 * @returns {Promise<boolean>} - True if document was deleted, false otherwise
 */
export const deleteById = async (collection, id) => {
  const filePath = path.join(dataDir, collection, `${id}.json`);
  
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting ${filePath}:`, error);
    return false;
  }
};
