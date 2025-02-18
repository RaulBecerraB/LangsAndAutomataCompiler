"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import links from "./navlinks.json";
import "../styles/navbar.css";

export default function NavBar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="navbar-container">
            <div className="navbar">
                <div className="navbar-content">
                    {/* Hamburger button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="hamburger-button"
                        aria-label="Menu"
                    >
                        <div className="hamburger-line"></div>
                        <div className="hamburger-line"></div>
                        <div className="hamburger-line"></div>
                    </button>

                    {/* Navigation links */}
                    <div className={`nav-links ${isMenuOpen ? 'menu-open' : ''}`}>
                        <div className="links-container">
                            {links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <h2 className={`nav-link ${pathname === link.href ? 'active' : ''}`}>
                                        {link.name}
                                    </h2>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
