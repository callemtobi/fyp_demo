import { redirect } from "next/navigation";
import { ConnectButton } from "thirdweb/react";

export default function RootPage() {
  redirect("/dashboard");
}

// export default function Home() {
//   return (
//     <main className="">
//       {/* <Sidebar /> */}
//       {/* <h1 className="display-4 mb-4">Thirdweb App</h1>
//       <ConnectButton
//         client={client}
//         appMetadata={{
//           name: "Example App",
//           url: "https://example.com",
//         }}
//       /> */}
//     </main>
//   );
// }
