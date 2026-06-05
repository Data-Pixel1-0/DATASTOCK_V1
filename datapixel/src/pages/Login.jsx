import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const ingresar = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado izquierdo */}
      <div className="w-1/2 bg-blue-950 flex flex-col justify-center items-center p-10">
        <img
          src={logo}
          alt="Data Stock"
          className="w-80"
        />

        <h2 className="text-white text-4xl font-bold mt-8 text-center">
          Tu inventario bajo control
        </h2>

        <p className="text-gray-300 mt-4 text-center max-w-md">
          Gestiona productos, controla existencias y genera reportes desde una sola plataforma.
        </p>
      </div>

      {/* Lado derecho */}
      <div className="w-1/2 flex justify-center items-center bg-white">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
          <h1 className="text-4xl font-bold text-blue-950 mb-2">
            Bienvenido
          </h1>

          <p className="text-gray-500 mb-8">
            Inicia sesión en Data Stock
          </p>

          <input
            type="text"
            placeholder="Usuario"
            className="w-full border p-3 rounded-lg mb-4"
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full border p-3 rounded-lg mb-6"
          />

          <button
            onClick={ingresar}
            className="w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg font-semibold transition"
          >
            Ingresar
          </button>
        </div>
      </div>
    </div>
  );
}