import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import slides from './routes/slides';
import templates from './routes/templates';
import locks from './routes/locks';
import comments from './routes/comments';
import versions from './routes/versions';
import ai from './routes/ai';
import sharing from './routes/sharing';
import exportsRoute from './routes/exports';

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/slides', slides);
app.use('/templates', templates);
app.use('/locks', locks);
app.use('/comments', comments);
app.use('/versions', versions);
app.use('/ai', ai);
app.use('/sharing', sharing);
app.use('/exports', exportsRoute);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`[api] listening on :${port}`);
});


