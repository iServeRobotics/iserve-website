import { Approach } from "@/components/approach";
import { Contact } from "@/components/contact";
import { Partners } from "@/components/partners";
import { RouteJourney } from "@/components/route-journey";
import { ScrollFilm } from "@/components/scroll-film";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { films } from "@/lib/site";

export default function Home() {
  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <SiteHeader />
      <main id="content" tabIndex={-1}>
        <RouteJourney />
        {films.map((film) => (
          <ScrollFilm key={film.id} film={film} />
        ))}
        <Approach />
        <Partners />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
