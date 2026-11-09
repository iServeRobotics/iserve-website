import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { discussMailto, publishedContact } from "@/lib/site";

export function Contact() {
  return (
    <section className="contact" id="contact" data-testid="contact" aria-labelledby="contact-title">
      <p className="kicker">Contact</p>
      <h2 id="contact-title">Discuss your deployment.</h2>
      <p className="lede contact-lede">
        A useful first note covers the robot, the site, the work the day has to
        include, and the support you want after the pilot.
      </p>
      <div className="contact-actions">
        <a className={cn(buttonVariants({ variant: "default" }), "header-cta")} href={discussMailto}>
          Email {publishedContact.primary}
        </a>
      </div>
    </section>
  );
}
