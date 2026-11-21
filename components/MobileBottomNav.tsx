"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Destination = "home" | "search" | "sell" | "saved" | "profile";

function Icon({ name }: { name: Destination }) {
  const common = {
    "aria-hidden": true as const,
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "home":
      return <svg {...common}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>;
    case "search":
      return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
    case "saved":
      return <svg {...common}><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" /></svg>;
    case "sell":
      return <svg {...common} width={25} height={25} strokeWidth={2.1}><path d="M12 5v14M5 12h14" /></svg>;
    case "profile":
      return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
  }
}

function activeFor(name: Destination, pathname: string, hash: string): boolean {
  if (name === "home") return pathname === "/" && hash !== "#search";
  if (name === "search") return pathname === "/" && hash === "#search";
  if (name === "saved") return pathname === "/favorites";
  if (name === "profile") return ["/profile", "/signin", "/settings"].includes(pathname);
  return pathname === `/${name}`;
}

function NavLink({ name, href, label, emphasized = false }: {
  name: Destination;
  href: string;
  label: string;
  emphasized?: boolean;
}) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  const active = activeFor(name, pathname, hash);

  return (
    <Link
      href={href}
      prefetch={false}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      data-active={active ? "true" : undefined}
      className={emphasized ? "mobile-bottom-nav__sell" : "mobile-bottom-nav__link"}
    >
      <span className={emphasized ? "mobile-bottom-nav__sell-icon" : "mobile-bottom-nav__icon"}>
        <Icon name={name} />
      </span>
      <span className="mobile-bottom-nav__label">{label}</span>
    </Link>
  );
}

export default function MobileBottomNav() {
  return (
    <nav className="mobile-bottom-nav md:hidden" aria-label="Primary navigation">
      <NavLink name="home" href="/" label="Home" />
      <NavLink name="search" href="/#search" label="Search" />
      <NavLink name="sell" href="/sell" label="Sell" emphasized />
      <NavLink name="saved" href="/favorites" label="Saved" />
      <NavLink name="profile" href="/profile" label="Profile" />
    </nav>
  );
}
