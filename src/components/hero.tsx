import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { discussMailto } from "@/lib/site";

export function Hero() {
  return (
    <section className="hero" id="top" data-testid="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="kicker">iServe Robotics</p>
        <h1 id="hero-title">
          Deploy robots.
          <br />
          Scale fleets.
        </h1>
        <p className="lede">
          iServe bridges pilot deployment, site integration, daily operations, and
          ongoing support — connecting robotics technology to real sites and keeping
          it working.
        </p>
        <div className="hero-actions">
          <a className={cn(buttonVariants({ variant: "default" }), "header-cta")} href={discussMailto}>
            Discuss your deployment
          </a>
          <a className="text-link" href="#patrol">
            See the sequence
          </a>
        </div>
        <svg className="hero-route" viewBox="0 0 640 96" fill="none" aria-hidden="true">
          <path
            className="route-draw"
            pathLength={1}
            d="M0 62C80 62 120 28 210 32C320 37 350 78 470 70C560 64 590 58 640 52"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="hero-media">
        <Image
          src="/media/patrol-poster.jpg"
          alt="Concept visual of a commercial street in daylight. A patrol robot is still on the paving, with a cobalt route. People sit at a cafe, talk, and walk with bags. They are not staged as operators."
          fill
          priority
          quality={90}
          sizes="(max-width: 860px) 100vw, 58vw"
          className="hero-photo"
        />
        <p className="concept-tag">Concept visual</p>
      </div>
    </section>
  );
}
