import { Router } from 'express';

const router = Router();

// GET slide by id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({ id, deckId: 'demo-deck', index: 0, sceneJson: { boxes: [] }, notes: '' });
});

// Create slide
router.post('/', (req, res) => {
  const slide = req.body;
  res.status(201).json({ ...slide, id: 'new-slide-id' });
});

// Update slide (autosave target)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const update = req.body;
  // TODO: enforce locks; record version
  res.json({ id, ...update });
});

// Delete slide
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.status(204).send();
});

export default router;


