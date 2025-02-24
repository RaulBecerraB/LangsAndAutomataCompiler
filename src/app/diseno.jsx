import "../estilos/globales.css";
import BarraNavegacion from "@/components/NavBar";

export const metadatos = {
  titulo: "Compilador (Lenguajes y autómatas II)",
  descripcion: "Compilador (Lenguajes y autómatas II)",
};

export default function DiseñoRaiz({ children }) {
  return (
    <html lang="es">
      <body className={`antialiased`}>
        <BarraNavegacion />
        {/* Aquí se renderiza el contenido de la página seleccionada */}
        {children}
      </body>
    </html>
  );
} 