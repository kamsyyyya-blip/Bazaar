"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Destination = "home" | "cart" | "sell" | "messages" | "profile";

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
    case "cart":
      return <svg {...common}><path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>;
    case "sell":
      return <svg {...common} width={25} height={25} strokeWidth={2.1}><path d="M12 5v14M5 12h14" /></svg>;
    case "messages":
      return <svg {...common}><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" /></svg>;
    case "profile":
      return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
  }
}

function activeFor(name: Destination, pathname: string): boolean {
  if (name === "home") return pathname === "/";
  if (name === "messages") return pathname.startsWith("/messages");
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
  const active = activeFor(name, pathname);

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
      <NavLink name="cart" href="/cart" label="Cart" />
      <NavLink name="sell" href="/sell" label="Sell" emphasized />
      <NavLink name="messages" href="/messages" label="Messages" />
      <NavLink name="profile" href="/profile" label="Profile" />
    </nav>
  );
}
