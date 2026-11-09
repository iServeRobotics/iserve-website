import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/**
 * Unlisted: reachable by anyone with the link, kept out of search engines and
 * out of the site nav. Shared directly with partners while the work is early.
 */
export const metadata: Metadata = {
  title: "Experiments — iServe Robotics",
  description: "Research notes from work in progress at iServe Robotics.",
  robots: { index: false, follow: false, nocache: true },
};

export default function Experiments() {
  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <SiteHeader />
      <main id="content" tabIndex={-1}>
        <section className="experiments">
          <p className="kicker">Experiments</p>
          <h1 className="experiments-title">Work in progress.</h1>
          <p className="lede experiments-lede">
            Research runs we are willing to show before they are finished. These
            are simulation results, not product behaviour and not a measure of
            performance on a customer site.
          </p>

          <article className="experiment" aria-labelledby="blind-bin-title">
            <div className="experiment-media">
              <video
                className="experiment-video"
                src="/media/experiments/blind-bin-transfer.mp4"
                poster="/media/experiments/blind-bin-transfer-poster.jpg"
                controls
                muted
                playsInline
                preload="metadata"
                aria-describedby="blind-bin-note"
              />
            </div>
            <div className="experiment-copy">
              <p className="kicker">01 — Tactile manipulation</p>
              <h2 id="blind-bin-title">Blind bin transfer.</h2>
              <p>
                A manipulator clears parts from one bin to another without using
                vision during the grasp. The policy works from tactile sensing and
                proprioception — what the fingers feel and where the arm knows
                itself to be — with only a rough prior about where to reach.
              </p>
              <p>
                The overlay shows what the policy actually has to work with:
                per-fingertip taxel pressure on an 8×6 grid, normal force at the
                thumb and index over the last six seconds, and the stage it
                believes it is in. Parts are counted as they move between bins.
              </p>
              <p id="blind-bin-note" className="experiment-note">
                Simulation, 1× real time. Blind policy: tactile and proprioception
                with a rough pick prior. Not a customer product, and not a measure
                of performance.
              </p>
            </div>
          </article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
