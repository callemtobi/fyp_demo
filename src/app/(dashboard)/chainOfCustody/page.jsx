import { Suspense } from "react";
import ChainOfCustodyPage from "./chainOfCustodyContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChainOfCustodyPage />
    </Suspense>
  );
}
