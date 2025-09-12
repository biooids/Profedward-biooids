// src/app/auth/login/page.tsx

import { Suspense } from "react"; // 1. Import Suspense from React
import LogIn from "@/components/auth/LogIn";

function Loading() {
  // You can add a skeleton screen or a spinner here
  return <div>Loading...</div>;
}

export default function page() {
  return (
    <Suspense fallback={<Loading />}>
      <LogIn />
    </Suspense>
  );
}
