"use client";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-white py-5">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">

          {/* Left: Social Icons */}
          <div className="flex items-center space-x-4">
            <a href="/" aria-label="Facebook" className="text-body-color hover:text-primary">
              <svg width="16" height="16" viewBox="0 0 22 22" fill="currentColor">
                <path d="M12.1 10.4939V7.42705C12.1 6.23984 13.085 5.27741 14.3 5.27741H16.5V2.05296L13.5135 1.84452C10.9664 1.66676 8.8 3.63781 8.8 6.13287V10.4939H5.5V13.7183H8.8V20.1667H12.1V13.7183H15.4L16.5 10.4939H12.1Z" />
              </svg>
            </a>
            <a href="/" aria-label="X" className="text-body-color hover:text-primary">
              <svg width="16" height="16" viewBox="0 0 22 22" fill="currentColor">
                <path d="M13.9831 19.25L9.82094 13.3176L4.61058 19.25H2.40625L8.843 11.9233L2.40625 2.75H8.06572L11.9884 8.34127L16.9034 2.75H19.1077L12.9697 9.73737L19.6425 19.25H13.9831Z" />
              </svg>
            </a>
            <a
              href="/"
              aria-label="LinkedIn"
              className="text-body-color hover:text-primary"
            >
              <svg width="16" height="16" viewBox="0 0 17 16" fill="currentColor">
                <path d="M5.44852 13.1089H3.17444V5.7709H5.44852V13.1089Z" />
                <path d="M4.29899 4.75104C3.54929 4.75104 2.97452 4.15405 2.97452 3.43269C2.97452 2.71133 3.57428 2.11434 4.29899 2.11434C5.02369 2.11434 5.62345 2.71133 5.62345 3.43269C5.62345 4.15405 5.07367 4.75104 4.29899 4.75104Z" />
                <path d="M14.07 13.1089H11.796V9.55183C11.796 8.7061 11.771 7.58674 10.5964 7.58674C9.39693 7.58674 9.222 8.53198 9.222 9.47721V13.1089H6.94792V5.7709H9.17202V6.79076H9.19701C9.52188 6.19377 10.2466 5.59678 11.3711 5.59678C13.6952 5.59678 14.12 7.08925 14.12 9.12897V13.1089H14.07Z" />
              </svg>
            </a>
          </div>

          {/* Center: Logo + Text (TIGHT) */}
          <div className="flex items-center gap-3">
            <Link href="/">
              <Image
                src="/images/logo/logo-2.svg"
                alt="logo"
                width={110}
                height={24}
              />
            </Link>
            <span className="text-xs text-body-color">
              Tagline Tagline Tagline Tagline
            </span>
          </div>

          {/* Right: Useful Links (Horizontal) */}
          <div className="flex items-center gap-4 text-xs">
            <Link href="/about" className="hover:text-primary">
              About
            </Link>
            <Link href="/contact" className="hover:text-primary">
              Contact
            </Link>
            <Link href="/teams" className="hover:text-primary">
              Teams
            </Link>
            <Link href="/project" className="hover:text-primary">
              Project
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
