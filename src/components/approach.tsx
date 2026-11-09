import { approachSteps } from "@/lib/site";

export function Approach() {
  return (
    <section className="approach" id="approach" aria-labelledby="approach-title">
      <div className="approach-grid">
        <div className="approach-intro">
          <p className="kicker">The work</p>
          <h2 id="approach-title">Deployed in weeks, not quarters.</h2>
          <p className="lede">
            Most of the industry still measures deployment in months — discovery,
            pilot, then a long tail of tuning before a robot is useful. That
            calendar exists because the machine has to be taught each site by hand.
            Ours reads the place and decides for itself, so the same four steps run
            in a fraction of the time — and every site it reads sharpens how it
            reads the next. The flywheel turns on deployments, so getting through
            them quickly is what compounds.
          </p>
        </div>
        <ol className="steps">
          {approachSteps.map((step) => (
            <li key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
