import { db } from '../firebaseConfig';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  setDoc,
} from 'firebase/firestore';

const productsCollection = collection(db, 'products');

export const addProduct = async (productData) => {
  try {
    const docRef = await addDoc(productsCollection, productData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding product: ', error);
    return null;
  }
};

export const getProducts = async () => {
  try {
    const querySnapshot = await getDocs(productsCollection);
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return products;
  } catch (error) {
    console.error('Error getting products: ', error);
    return [];
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const productDoc = doc(db, 'products', productId);
    await updateDoc(productDoc, productData);
    return true;
  } catch (error) {
    console.error('Error updating product: ', error);
    return false;
  }
};

export const deleteProduct = async (productId) => {
  try {
    const productDoc = doc(db, 'products', productId);
    await deleteDoc(productDoc);
    return true;
  } catch (error) {
    console.error('Error deleting product: ', error);
    return false;
  }
};

const tasksCollection = collection(db, 'tasks');

export const addTask = async (taskData) => {
  try {
    const docRef = await addDoc(tasksCollection, taskData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding task: ', error);
    return null;
  }
};

export const getTasksByUser = async (userId) => {
  try {
    const q = query(tasksCollection, where('affiliateUserId', '==', userId));
    const querySnapshot = await getDocs(q);
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    return tasks;
  } catch (error) {
    console.error('Error getting tasks: ', error);
    return [];
  }
};

export const updateTask = async (taskId, taskData) => {
  try {
    const taskDoc = doc(db, 'tasks', taskId);
    await updateDoc(taskDoc, taskData);
    return true;
  } catch (error) {
    console.error('Error updating task: ', error);
    return false;
  }
};

const usersCollection = collection(db, 'users');

export const addUser = async (userId, userData) => {
  try {
    await setDoc(doc(db, 'users', userId), userData);
    return true;
  } catch (error) {
    console.error('Error adding user: ', error);
    return false;
  }
};

export const getUser = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user: ', error);
    return null;
  }
};

export const listUsers = async () => {
  try {
    const querySnapshot = await getDocs(usersCollection);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error('Error getting users: ', error);
    return [];
  }
};

export const approveUser = async (userId) => {
  try {
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, { status: 'approved' });
    return true;
  } catch (error) {
    console.error('Error approving user: ', error);
    return false;
  }
};

export const rejectUser = async (userId) => {
  try {
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, { status: 'rejected' });
    return true;
  } catch (error) {
    console.error('Error rejecting user: ', error);
    return false;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, userData);
    return true;
  } catch (error) {
    console.error('Error updating user: ', error);
    return false;
  }
};
