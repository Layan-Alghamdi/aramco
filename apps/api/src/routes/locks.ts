import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  const { deckId } = req.query;
  res.json([{ id: 'lock1', scope: 'element', subjectId: 'el-1', deckId }]);
});

router.post('/', (req, res) => {
  res.status(201).json({ id: 'new-lock', ...req.body });
});

router.delete('/:id', (req, res) => {
  res.status(204).send();
});

export default router;


