import express from 'express';
import { db } from '../firebase.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    doc, 
    getDoc, 
    updateDoc, 
    deleteDoc,
    serverTimestamp,
    Timestamp 
} from 'firebase/firestore';

const router = express.Router();

/**
 * @route   POST /api/experiments/results
 * @desc    Store experiment results for a student
 * @access  Public
 */
router.post('/results', async (req, res) => {
    try {
        const { studentId, experimentId, input, output } = req.body;
        
        console.log('Storing experiment results:', req.body);

        if (!studentId || !experimentId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Student ID and Experiment ID are required' 
            });
        }

        // Create a new results document
        const resultsData = {
            studentId,
            experimentId,
            input: input || {},
            output: output || {},
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // Add document to Firestore
        const docRef = await addDoc(collection(db, 'experimentResults'), resultsData);

        res.status(201).json({ 
            success: true, 
            message: 'Experiment results saved successfully',
            resultId: docRef.id 
        });
    } catch (error) {
        console.error('Error storing experiment results:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save experiment results',
            error: error.message 
        });
    }
});

/**
 * @route   GET /api/experiments/results/:studentId/:experimentId
 * @desc    Get experiment results for a specific student and experiment
 * @access  Public
 */
router.get('/results/:studentId/:experimentId', async (req, res) => {
    try {
        const { studentId, experimentId } = req.params;
        
        console.log('Fetching experiment results for student:', studentId, 'experiment:', experimentId);

        // Query for results matching both studentId and experimentId
        const q = query(
            collection(db, 'experimentResults'),
            where('studentId', '==', studentId),
            where('experimentId', '==', experimentId)
        );

        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return res.status(404).json({ 
                success: false, 
                message: 'No results found for this student and experiment' 
            });
        }

        // Convert query results to array of data
        const results = [];
        querySnapshot.forEach(doc => {
            results.push({
                id: doc.id,
                ...doc.data(),
                // Convert timestamps to ISO string for JSON serialization
                createdAt: doc.data().createdAt?.toDate().toISOString() || null,
                updatedAt: doc.data().updatedAt?.toDate().toISOString() || null
            });
        });

        res.status(200).json({ 
            success: true, 
            results 
        });
    } catch (error) {
        console.error('Error fetching experiment results:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch experiment results',
            error: error.message 
        });
    }
});

/**
 * @route   POST /api/experiments/notes
 * @desc    Store or update student notes for an experiment
 * @access  Public
 */
router.post('/notes', async (req, res) => {
    try {
        const { studentId, experimentId, notes, noteId } = req.body;
        
        console.log('Storing/updating experiment notes:', req.body);

        if (!studentId || !experimentId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Student ID and Experiment ID are required' 
            });
        }

        // If noteId is provided, update existing note
        if (noteId) {
            const noteRef = doc(db, 'experimentNotes', noteId);
            const noteDoc = await getDoc(noteRef);

            if (!noteDoc.exists()) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Note not found' 
                });
            }

            // Ensure the note belongs to the user
            if (noteDoc.data().studentId !== studentId) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Not authorized to update this note' 
                });
            }

            await updateDoc(noteRef, {
                notes,
                updatedAt: serverTimestamp()
            });

            res.status(200).json({ 
                success: true, 
                message: 'Notes updated successfully',
                noteId 
            });
        } else {
            // Create a new note
            const noteData = {
                studentId,
                experimentId,
                notes: notes || '',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            // Add document to Firestore
            const docRef = await addDoc(collection(db, 'experimentNotes'), noteData);

            res.status(201).json({ 
                success: true, 
                message: 'Notes saved successfully',
                noteId: docRef.id 
            });
        }
    } catch (error) {
        console.error('Error storing experiment notes:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save notes',
            error: error.message 
        });
    }
});

/**
 * @route   GET /api/experiments/notes/:studentId/:experimentId
 * @desc    Get notes for a specific student and experiment
 * @access  Public
 */
router.get('/notes/:studentId/:experimentId', async (req, res) => {
    try {
        const { studentId, experimentId } = req.params;
        
        console.log('Fetching notes for student:', studentId, 'experiment:', experimentId);

        // Query for notes matching both studentId and experimentId
        const q = query(
            collection(db, 'experimentNotes'),
            where('studentId', '==', studentId),
            where('experimentId', '==', experimentId)
        );

        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return res.json({ 
                success: true, 
                notes: null,
                message: 'No notes found for this student and experiment' 
            });
        }

        // Get the first matching note (there should typically be only one per student-experiment)
        const noteDoc = querySnapshot.docs[0];
        const noteData = {
            id: noteDoc.id,
            ...noteDoc.data(),
            // Convert timestamps to ISO string
            createdAt: noteDoc.data().createdAt?.toDate().toISOString() || null,
            updatedAt: noteDoc.data().updatedAt?.toDate().toISOString() || null
        };

        res.status(200).json({ 
            success: true, 
            notes: noteData 
        });
    } catch (error) {
        console.error('Error fetching experiment notes:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch notes',
            error: error.message 
        });
    }
});

/**
 * @route   DELETE /api/experiments/notes/:noteId/:studentId
 * @desc    Delete a specific note
 * @access  Public
 */
router.delete('/notes/:noteId/:studentId', async (req, res) => {
    try {
        const { noteId, studentId } = req.params;
        
        console.log('Deleting note:', noteId, 'for student:', studentId);
        
        // Get the note
        const noteRef = doc(db, 'experimentNotes', noteId);
        const noteDoc = await getDoc(noteRef);
        
        if (!noteDoc.exists()) {
            return res.status(404).json({ 
                success: false, 
                message: 'Note not found' 
            });
        }
        
        // Security check - ensure student owns the note
        if (noteDoc.data().studentId !== studentId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to delete this note' 
            });
        }
        
        // Delete the note
        await deleteDoc(noteRef);
        
        res.status(200).json({ 
            success: true, 
            message: 'Note deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete note',
            error: error.message 
        });
    }
});

/**
 * @route   GET /api/experiments/results/student/:studentId
 * @desc    Get all experiment results for a specific student
 * @access  Public
 */
router.get('/results/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        
        console.log('Fetching all results for student:', studentId);
        
        const q = query(
            collection(db, 'experimentResults'),
            where('studentId', '==', studentId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return res.json({ 
                success: true, 
                results: [],
                message: 'No experiment results found for this student' 
            });
        }
        
        const results = [];
        querySnapshot.forEach(doc => {
            results.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toISOString() || null,
                updatedAt: doc.data().updatedAt?.toDate().toISOString() || null
            });
        });
        
        res.status(200).json({ 
            success: true, 
            results 
        });
    } catch (error) {
        console.error('Error fetching student results:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch student results',
            error: error.message 
        });
    }
});

/**
 * @route   GET /api/experiments/notes/student/:studentId
 * @desc    Get all notes for a specific student
 * @access  Public
 */
router.get('/notes/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        
        console.log('Fetching all notes for student:', studentId);
        
        const q = query(
            collection(db, 'experimentNotes'),
            where('studentId', '==', studentId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return res.json({ 
                success: true, 
                notes: [],
                message: 'No notes found for this student' 
            });
        }
        
        const notes = [];
        querySnapshot.forEach(doc => {
            notes.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toISOString() || null,
                updatedAt: doc.data().updatedAt?.toDate().toISOString() || null
            });
        });
        
        res.status(200).json({ 
            success: true, 
            notes 
        });
    } catch (error) {
        console.error('Error fetching student notes:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch student notes',
            error: error.message 
        });
    }
});

export default router;