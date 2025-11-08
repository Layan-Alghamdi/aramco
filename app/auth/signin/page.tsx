import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default async function SignInPage() {
  const session = await getServerSession();
  if (session?.user) redirect('/dashboard');
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="w-full max-w-md bg-white shadow rounded-xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <Image src="/logo.svg" alt="Logo" width={32} height={32} />
          <h1 className="text-xl font-semibold text-dark">Smart Slides</h1>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Sign in with your company email (<span className="font-medium">@{process.env.COMPANY_DOMAIN || 'adc.com'}</span>)
        </p>
        <form action="/api/auth/signin/google" method="post">
          <button className="btn-primary w-full" type="submit">Continue with Google</button>
        </form>
        <div className="text-xs text-gray-500 mt-4">
          By continuing, you agree to our internal policies. Access is restricted to employees.
        </div>
        <div className="mt-6 text-center">
          <Link href="/" className="text-primary hover:underline">Back</Link>
        </div>
      </div>
    </div>
  );
}

