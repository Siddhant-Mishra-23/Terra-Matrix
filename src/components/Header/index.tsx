"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";

const Header = () => {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleSticky = () => setSticky(window.scrollY >= 80);
    window.addEventListener("scroll", handleSticky);
    return () => window.removeEventListener("scroll", handleSticky);
  }, [window.scrollY]);

  return (
    <header
      className={`header top-0 left-0 z-40 w-full ${
        sticky
          ? "shadow-sticky dark:bg-gray-dark dark:shadow-sticky-dark fixed bg-white/80 backdrop-blur-xs transition"
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
              className="dark:hidden"
            />
            <Image
              src="/images/logo/logo.svg"
              alt="logo"
              width={140}
              height={30}
              className="hidden dark:block"
            />
          </Link>

          {/* Desktop Navigation (LEFT aligned like before) */}
          <nav className="hidden lg:block">
            <ul className="flex space-x-12">
              {menuData.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.path}
                    className={`py-6 text-base ${
                      pathname === item.path
                        ? `${pathname === "/" && !sticky ? "text-white" : "text-primary"} dark:text-white`
                        : `${pathname === "/" && !sticky ? "text-gray-light/70" : "text-dark"} hover:text-primary dark:text-white/70 dark:hover:text-white`
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
            {/* Desktop toggle */}
            <div className="hidden lg:block">
              <ThemeToggler isSticky={sticky} />
            </div>

            {/* Mobile toggle + hamburger */}
            <div className="flex items-center gap-3 lg:hidden">
              <ThemeToggler isSticky={sticky} />

              <button
                onClick={() => setNavbarOpen(!navbarOpen)}
                aria-label="Mobile Menu"
                className="focus:ring-primary rounded-lg px-2 py-2 focus:ring-2"
              >
                <span
                  className={`my-1.5 block h-0.5 w-[22px] transition-all ${
                    sticky ? "bg-black dark:bg-white" : "bg-white"
                  } ${navbarOpen ? "translate-y-[6px] rotate-45" : ""}`}
                />
                <span
                  className={`my-1.5 block h-0.5 w-[22px] transition-all ${
                    sticky ? "bg-black dark:bg-white" : "bg-white"
                  } ${navbarOpen ? "opacity-0" : ""}`}
                />
                <span
                  className={`my-1.5 block h-0.5 w-[22px] transition-all ${
                    sticky ? "bg-black dark:bg-white" : "bg-white"
                  } ${navbarOpen ? "-translate-y-[6px] -rotate-45" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <nav
          className={`lg:hidden ${
            navbarOpen ? "block" : "hidden"
          } dark:bg-dark absolute top-full left-0 w-full bg-white shadow-md`}
        >
          <ul className="flex flex-col space-y-4 px-6 py-6">
            {menuData.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.path}
                  onClick={() => setNavbarOpen(false)}
                  className={`block text-base ${
                    pathname === item.path
                      ? "text-primary dark:text-white"
                      : "text-dark hover:text-primary dark:text-white/70 dark:hover:text-white"
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
