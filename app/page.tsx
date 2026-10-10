import { Suspense } from "react";
import ChatClient from "./ChatClient";

export default function Home() {
  return (
    <Suspense>
      <ChatClient />
    </Suspense>
  );
}
