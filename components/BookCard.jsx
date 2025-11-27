// components/BookCard.jsx
import Image from "next/image";

export default function BookCard({ book, size = "large" }) {
  const isSmall = size === "small";

  const statusConfig = {
    BORROWED:    { color: "bg-yellow-400", text: "BORROWED" },
    AVAILABLE:   { color: "bg-green-500",  text: "AVAILABLE" },
    UNAVAILABLE: { color: "bg-red-500",    text: "UNAVAILABLE" },
  };

  const status = statusConfig[book.status] || statusConfig.AVAILABLE;

  return (
    <div className={`group cursor-pointer ${isSmall ? "w-32" : "w-full"}`}>
      <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
        <div className="aspect-[2/3] relative bg-gray-100 rounded-xl overflow-hidden">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={book.title}
              fill
              sizes={isSmall ? "128px" : "300px"}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-xs text-center px-2">Tanpa Cover</span>
            </div>
          )}
        </div>

        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${status.color}`}>
            {status.text}
          </span>
        </div>
      </div>

      {!isSmall && (
        <div className="mt-4">
          <h3 className="font-medium text-gray-900 line-clamp-2 leading-tight">
            {book.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{book.author}</p>
        </div>
      )}
    </div>
  );
}