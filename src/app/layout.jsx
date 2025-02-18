import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
