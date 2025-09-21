import { Router } from 'express';
import { getItems, getItemById, createItem, updateItem, deleteItem } from '../controllers/index';

const router = Router();

router.get('/items', getItems);
router.get('/items/:id', getItemById);
router.post('/items', createItem);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);

export default router;