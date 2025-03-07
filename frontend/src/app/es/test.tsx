export default function TestPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">¡Hola desde la página de prueba en español!</h1>
      <p className="text-xl">Esta página confirma que la ruta en español funciona correctamente.</p>
      <a href="/" className="mt-8 text-blue-500 hover:underline">Volver a la página principal en inglés</a>
    </div>
  );
} 