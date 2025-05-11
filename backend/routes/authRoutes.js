import express from 'express';
import { 
  addDoc, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  Timestamp
} from 'firebase/firestore';

import { db, auth } from '../firebase.js';
import { getAuth } from 'firebase/auth';
const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      studentId 
    } = req.body;
    console.log('Registration request:', req.body);

    const userData = {
      firstName,
      lastName,
      email,
      studentId,
      password,
      createdAt: Timestamp.now(),
    };
    const existingUserQuery = query(
      collection(db, "users"),
      where('email', '==', email)
    );

    const existingUserSnapshot = await getDocs(existingUserQuery);
    if (!existingUserSnapshot.empty) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const result = await addDoc(collection(db, "users"), userData);
    res.status(201).json({
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(400).json({error});
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    console.log('Login request:', req.body);

    const userQuery = query(
      collection(db, "users"),
      where('email', '==', email),
      where('password', '==', password)
    );

    const querySnapshot = await getDocs(userQuery);
    if (querySnapshot.empty) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: userDoc.id,
        ...userData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(400).json({ error: error.message });
  }
});

router.post('/auth/google', async (req, res) => {
  try {
    console.log('Google login request:', req.body);
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Missing ID token' });
    }

    const decodedToken = await getAuth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    console.log('Decoded token:', decodedToken);

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);


    if (!userSnap.exists()) {
      const [firstName, lastName] = name.split(' ');
      await setDoc(userRef, {
        email,
        firstName,
        lastName,
        profileImage: picture,
        createdAt: Timestamp.now()
      });
    }
    console.log('User data:', userSnap.data());
    // Return user info
    res.status(200).json({
      message: 'Google login successful',
      user: { uid, email, name, picture }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Invalid token or server error' });
  }
});

export default router;