"use client";

import { useEffect, useRef, useState } from "react";

import { partners } from "@/lib/site";

/**
 * Partners & customers, carried over from iserve.ai. One combined group, as the
 * published site has it: it does not say which names are partners and which are
 * customers, so neither does this.
 *
 * The row sits still while the logos fit. Once there are enough of them to
 * overflow the container it starts rolling, and a duplicate run is rendered so
 * the loop is seamless. Nothing to change by hand when a logo is added.
 */
export function Partners() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    const marquee = marqueeRef.current;
    const track = trackRef.current;
    if (!marquee || !track) return;

    const measure = () => {
      // Measure the first run only: with the duplicate rendered the track is
      // twice as wide, so comparing the whole track would latch on once true.
      const items = [...track.children].slice(0, partners.length);
      const run = items.reduce((total, item) => total + item.getBoundingClientRect().width, 0);
      const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
      const runWidth = run + gap * Math.max(0, partners.length - 1);
      setRolling(runWidth > marquee.clientWidth);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(marquee);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="partners" id="partners" aria-labelledby="partners-title">
      <h2 id="partners-title" className="kicker partners-kicker">
        Partners &amp; customers
      </h2>
      <div className="partner-marquee" ref={marqueeRef} data-rolling={rolling}>
        <ul className="partner-track" ref={trackRef}>
          {partners.map((partner) => (
            <li key={partner.name}>
              <a
                className="partner-item"
                href={partner.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="partner-logo"
                  src={partner.logo}
                  alt={partner.name}
                  loading="lazy"
                />
              </a>
            </li>
          ))}
          {/* Second run exists only while rolling, so the loop has something to
              scroll into. Hidden from assistive tech to avoid double reading. */}
          {rolling
            ? partners.map((partner) => (
                <li key={`dup-${partner.name}`} aria-hidden="true">
                  <a className="partner-item" href={partner.href} tabIndex={-1}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="partner-logo" src={partner.logo} alt="" loading="lazy" />
                  </a>
                </li>
              ))
            : null}
        </ul>
      </div>
    </section>
  );
}
