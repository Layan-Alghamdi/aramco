import { Router } from 'express';

const router = Router();

router.get('/:deckId', (req, res) => {
  res.json([{ id: 'v1', deckId: req.params.deckId, createdAt: new Date().toISOString(), authorId: 'u1' }]);
});

router.post('/restore/:versionId', (req, res) => {
  res.json({ ok: true, restoredVersionId: req.params.versionId });
});

export default router;


