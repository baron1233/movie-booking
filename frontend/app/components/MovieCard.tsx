export default function MovieCard({ movie, onSelect }: Props) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <img src={movie.poster} alt={movie.title} />
      <div className="p-4">
        <h2 className="text-xl font-semibold">{movie.title}</h2>
        <button
          onClick={() => onSelect(movie.id)}
          className="mt-4 w-full bg-yellow-500 text-black py-2 rounded"
        >
          เลือก
        </button>
      </div>
    </div>
  );
}
