import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  const { deckId, slideId } = req.query;
  res.json([{ id: 'c1', deckId, slideId, body: 'Looks good!', authorId: 'u1', resolved: false }]);
});

router.post('/', (req, res) => {
  res.status(201).json({ id: 'new-comment', ...req.body });
});

router.patch('/:id', (req, res) => {
  res.json({ id: req.params.id, ...req.body });
});

router.delete('/:id', (req, res) => {
  res.status(204).send();
});

export default router;


