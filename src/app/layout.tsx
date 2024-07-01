import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import { Loader } from "@/app/components/LoadingComponent";
import App from "./App";
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: "EShop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning={true}>
            <body suppressHydrationWarning={true}>
                <NextTopLoader  showSpinner={false}/>
                  <Suspense fallback={<Loader/>}>
                      <App>
                          {children}
                      </App>
                  </Suspense>
                  
            </body>

    </html>
  );
}
