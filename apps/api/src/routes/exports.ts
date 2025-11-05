import { Router } from 'express';

const router = Router();

router.post('/pdf', (req, res) => {
  res.status(202).json({ jobId: 'job-pdf-1', status: 'queued' });
});

router.post('/pptx', (req, res) => {
  res.status(202).json({ jobId: 'job-pptx-1', status: 'queued' });
});

router.get('/jobs/:jobId', (req, res) => {
  res.json({ jobId: req.params.jobId, status: 'completed', url: 'https://example.com/download.pdf' });
});

export default router;


