import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

async function fetchPresentations() {
  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/presentations`, {
    cache: 'no-store'
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session?.user) redirect('/auth/signin');
  const list = await fetchPresentations();

  return (
    <div className="min-h-screen">
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" width={28} height={28} alt="logo"/>
            <span className="font-semibold">Smart Slides</span>
          </div>
          <div className="flex items-center gap-3">
            <form action="/api/presentations" method="post">
              <button className="btn-primary" type="submit">New Presentation</button>
            </form>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Presentations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {list.map((p: any) => (
            <Link key={p.id} href={`/editor/${p.id}`} className="group border rounded-lg p-4 hover:border-primary transition">
              <div className="aspect-video bg-gray-50 rounded mb-3 grid place-items-center text-gray-400">
                thumbnail
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium group-hover:text-primary">{p.title}</div>
                  <div className="text-xs text-gray-500">v{p.version} • {new Date(p.updatedAt).toLocaleString()}</div>
                </div>
                <button
                  formAction={`/api/presentations/${p.id}`}
                  formMethod="post"
                  className="hidden"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

