// app/(auth)/register/page.jsx
import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <div className="hidden lg:flex flex-col items-center justify-center">
            <div className="relative">
              <Image
                src="/ular.png"  // atau /logo-doodle.svg
                alt="Logo Perpustakaan"
                width={420}
                height={420}
                className="drop-shadow-lg"
                priority
              />
            </div>
            <h2 className="mt-8 text-3xl font-bold text-gray-800 text-center">
              Puskata Library
            </h2>
            <p className="mt-2 text-gray-600 text-center">
              Let's sign you up!
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Account</h1>

            <RegisterForm />

            <div className="mt-8 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">Or login with</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Google & Apple (hanya tampilan) */}
            <div className="mt-6 flex gap-4">
              <button className="flex-1 flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="..." /> {/* Google icon SVG */}
                  <span className="text-sm font-medium">Google</span>
                </svg>
              </button>
              <button className="flex-1 flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#000" d="..." /> {/* Apple icon SVG */}
                  <span className="text-sm font-medium">Apple</span>
                </svg>
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}