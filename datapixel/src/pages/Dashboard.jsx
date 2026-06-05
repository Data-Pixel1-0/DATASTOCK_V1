import MainLayout from "../layouts/MainLayout";
import Card from "../components/Card";

function Dashboard() {
  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-6">
        <Card titulo="Productos" valor="150" />
        <Card titulo="Stock Bajo" valor="12" />
        <Card titulo="Usuarios" valor="8" />
        <Card titulo="Reportes" valor="25" />
      </div>
    </MainLayout>
  );
} 

export default Dashboard;