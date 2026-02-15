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
    "Terra Matrix designs and develops scalable, high-performance digital products that help businesses grow and stand out. Expert web development, software consulting, and digital transformation services.",
  keywords: [
    "Terra Matrix", "TerraMatrix",
    "digital solutions", "web development", "software development", "digital transformation",
    "tech consulting", "scalable applications", "high-performance websites", "custom software", "IT services", "business growth", "digital products",
    "Odisha GIS", "Odisha AI Consultant", "Odisha best Consultant", "Dr. Sovan Sankalp", "Sovan Sankalp"
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://terramatrix.in/",
  },

  openGraph: {
    title: "Terra Matrix - Innovative Digital Solutions",
    description:
      "We design and develop scalable, high-performance digital products that help businesses grow and stand out",
    url: "https://terramatrix.in/",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://terramatrix.in/images/TerraMatrix.png",
        width: 1200,
        height: 630,
        alt: "Terra Matrix - Innovative Digital Solutions",
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
    images: ["https://terramatrix.in/images/TerraMatrix.png"],
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
