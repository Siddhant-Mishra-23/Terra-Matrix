import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { Metadata } from "next";
import "../styles/index.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Terra Matrix - Innovative Digital Solutions",
  description:
    "We design and develop scalable, high-performance digital products that help businesses grow and stand out",
  keywords: ["terra", "metrix"],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/favicon.ico",
    // apple: "/images/apple-icon.png",
  },
  alternates: {
    canonical: "https://terra-matrix.com/",
  },
  openGraph: {
    title: "Terra Matrix - Innovative Digital Solutions",
    description:
      "We design and develop scalable, high-performance digital products that help businesses grow and stand out",
    url: "https://terra-matrix.com/",
    type: "website",
    images: [
      {
        url: "",
        width: 1200,
        height: 630,
        alt: "Terra Matrix",
      },
    ],
    siteName: "Terra Matrix",
  },
  twitter: {
    card: "summary_large_image",
    site: "@terra-matrix",
    creator: "@terra-matrix", //twitter account
    title: "Terra Matrix - Innovative Digital Solutions",
    description:
      "We design and develop scalable, high-performance digital products that help businesses grow and stand out",
    // images: [""],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className={`bg-[#FCFCFC] ${inter.className}`}>
        <Providers>
          <div className="isolate">
            <Header />
            {children}
            <Footer />
          </div>
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}
