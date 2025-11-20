// app/home/page.jsx
export default function HomeUser() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-lg">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Selamat Datang, User! 
        </h1>
        <p className="text-xl text-gray-600">Kamu bisa pinjam buku di sini</p>
        <div className="mt-8">
          <a href="/" className="text-blue-600 underline">Logout</a>
        </div>
      </div>
    </div>
  );
}