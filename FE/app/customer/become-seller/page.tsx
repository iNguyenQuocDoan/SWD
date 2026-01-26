"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Redirect to /seller/register - consolidated seller registration page
export default function BecomeSellerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reregister = searchParams.get("reregister");

  useEffect(() => {
    // Preserve reregister param if present
    const targetUrl = reregister === "true"
      ? "/seller/register?reregister=true"
      : "/seller/register";
    router.replace(targetUrl);
  }, [router, reregister]);

  return null;
}
