import "../styles/globals.css";
import NavBar from "@/components/NavBar";
export const metadata = {
  title: "Compilador (Lenguajes y autómatas II)",
  description: "Compilador (Lenguajes y autómatas II)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <NavBar />
        {children}
      </body>
    </html>
  );
}
