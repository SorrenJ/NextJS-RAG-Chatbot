import "./global.css";

export const metadata = {
  title: "F1GPT",
  description: "The place to go for all your Formula One questions!"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
