"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import menuData from "./menuData";

const Header = () => {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleSticky = () => setSticky(window.scrollY >= 80);
    window.addEventListener("scroll", handleSticky);
    return () => window.removeEventListener("scroll", handleSticky);
  }, []);

  return (
    <header
      className={`header top-0 left-0 z-40 w-full ${sticky
        ? "shadow-sticky fixed bg-white/80 backdrop-blur-xs transition"
        : "absolute bg-transparent"
        }`}
    >
      <div className="container">
        <div className="flex items-center px-4">
          <Link
            href="/"
            className={`mr-10 block ${sticky ? "py-5 lg:py-2" : "py-8"}`}
          >
            <Image
              src="/images/logo/logo-2.svg"
              alt="logo"
              width={140}
              height={30}
            />
          </Link>

          {/* Desktop Navigation (LEFT aligned like before) */}
          <nav className="hidden lg:block">
            <ul className="flex space-x-12">
              {menuData.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.path}
                    className={`py-6 text-base ${pathname === item.path
                      ? "text-primary font-semibold"
                      : "text-primary/70 hover:text-primary"
                      }`}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* RIGHT side controls */}
          <div className="ml-auto flex items-center gap-4 pr-0 lg:pr-0">
            {/* Mobile hamburger */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setNavbarOpen(!navbarOpen)}
                aria-label="Mobile Menu"
                className="focus:ring-primary rounded-lg px-2 py-2 focus:ring-2"
              >
                <span
                  className={`my-1.5 block h-0.5 w-[22px] transition-all bg-primary ${navbarOpen ? "translate-y-[6px] rotate-45" : ""}`}
                />
                <span
                  className={`my-1.5 block h-0.5 w-[22px] transition-all bg-primary ${navbarOpen ? "opacity-0" : ""}`}
                />
                <span
                  className={`my-1.5 block h-0.5 w-[22px] transition-all bg-primary ${navbarOpen ? "-translate-y-[6px] -rotate-45" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <nav
          className={`lg:hidden ${navbarOpen ? "block" : "hidden"
            } absolute top-full left-0 w-full bg-white shadow-md`}
        >
          <ul className="flex flex-col space-y-4 px-6 py-6">
            {menuData.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.path}
                  onClick={() => setNavbarOpen(false)}
                  className={`block text-base ${pathname === item.path
                    ? "text-primary"
                    : "text-dark hover:text-primary"
                    }`}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
