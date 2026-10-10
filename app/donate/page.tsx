import { Suspense } from "react";
import DonateClient from "./DonateClient";

export const metadata = { title: "기후난민지원 캠페인 | 기후연대" };

export default function DonatePage() {
  return (
    <Suspense>
      <DonateClient />
    </Suspense>
  );
}
