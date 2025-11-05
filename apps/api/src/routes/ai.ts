import { Router } from 'express';

const router = Router();

router.post('/design-check', (req, res) => {
  const { sceneJson } = req.body;
  res.json({ issues: [] });
});

router.post('/extract-colors', (_req, res) => {
  res.json({ palettes: [["#0b3d2e", "#1fa37a", "#f5f7f9"]] });
});

router.post('/suggest-layout', (_req, res) => {
  res.json({ suggestions: [] });
});

router.post('/suggest-copy', (_req, res) => {
  res.json({ suggestions: [] });
});

export default router;


