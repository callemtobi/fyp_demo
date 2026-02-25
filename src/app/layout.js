import { Inter } from "next/font/google";
import Metadata from "next";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "thirdweb SDK + Next starter",
  description:
    "Starter template for using thirdweb SDK with Next.js App router",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThirdwebProvider>{children}</ThirdwebProvider>
      </body>
    </html>
  );
}

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <div className="flex h-screen bg-neutral-50">
//           <Sidebar />
//           <main className="flex-1 overflow-auto">
//             <ThirdwebProvider>{children}</ThirdwebProvider>
//           </main>
//         </div>
//       </body>
//     </html>
//   );
// }
