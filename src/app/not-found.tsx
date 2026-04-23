"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center text-center p-4">
      <Image src="/icons/Icon-Only-Color.svg" alt="404" width={100} height={100} />
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
        Please check the URL or return to the homepage.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/">
            Return Home
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/contact">
            Contact Support
          </Link>
        </Button>
      </div>
    </div>
  );
} 