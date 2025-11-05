import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json([{ id: 't1', name: 'Corporate', version: 1 }]);
});

router.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Corporate', version: 1 });
});

router.post('/', (req, res) => {
  res.status(201).json({ id: 'new-template', ...req.body });
});

router.put('/:id', (req, res) => {
  res.json({ id: req.params.id, ...req.body });
});

router.delete('/:id', (req, res) => {
  res.status(204).send();
});

router.post('/apply/:templateId/:deckId', (req, res) => {
  res.json({ ok: true, templateId: req.params.templateId, deckId: req.params.deckId });
});

export default router;


