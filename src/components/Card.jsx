function Card({ titulo, valor }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-gray-500 text-sm">
        {titulo}
      </h3>

      <p className="text-3xl font-bold text-blue-950 mt-2">
        {valor}
      </p>
    </div>
  );
}

export default Card;