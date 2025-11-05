type SlideJSON = any;

export async function analyzeDesign(slideJSON: SlideJSON): Promise<{ issue: string; suggestion: string }[]> {
  // Stubbed heuristics without external call for MVP
  const issues: { issue: string; suggestion: string }[] = [];
  const elements = slideJSON?.elements || [];
  if (elements.length > 10) {
    issues.push({ issue: 'Potential clutter', suggestion: 'Reduce number of elements or group related ones.' });
  }
  issues.push({ issue: 'Brand palette enforcement', suggestion: 'Use primary green (#0C7C59) and accent (#00A19A).' });
  return issues;
}

export async function suggestLayout(summary: string): Promise<{ layout: string; notes: string }>{
  return { layout: 'Title + Two Columns', notes: `Emphasize key point: ${summary?.slice(0, 60)}` };
}

export async function extractBrandColors(_: File | Blob): Promise<string[]> {
  // Stub close to primary green variants
  return ['#0C7C59', '#086147', '#00A19A', '#E7F5F0'];
}

