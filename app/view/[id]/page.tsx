import { prisma } from '@/lib/prisma';

export default async function ViewPage({ params }: { params: { id: string } }) {
  const p = await prisma.presentation.findUnique({
    where: { id: params.id },
    include: { slides: { include: { elements: true }, orderBy: { index: 'asc' } } }
  });
  if (!p) return <div className="p-6">Not found</div>;
  const slide = p.slides[0];
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-3 text-sm text-gray-600">{p.title}</div>
        <div className="aspect-video bg-white border rounded p-6">
          <div className="text-gray-500 text-sm">Read-only preview (MVP)</div>
          <ul className="mt-2 text-sm list-disc list-inside">
            {slide?.elements?.map((el) => (
              <li key={el.id}>{el.type}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

