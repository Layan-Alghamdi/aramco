import { Router } from 'express';

const router = Router();

router.post('/links', (req, res) => {
  res.status(201).json({ id: 'share1', token: 'abc123', ...req.body });
});

router.get('/links/:id', (req, res) => {
  res.json({ id: req.params.id, token: 'abc123', role: 'viewer' });
});

export default router;


