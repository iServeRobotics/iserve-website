const movements = [
  {
    index: "01",
    label: "Plan",
    body: "Draw the work before a robot is asked to run it.",
  },
  {
    index: "02",
    label: "Deploy",
    body: "Fit the route to the site it has to live in.",
  },
  {
    index: "03",
    label: "Operate",
    body: "Keep the day going, then repeat it with support.",
  },
] as const;

export function Movements() {
  return (
    <section className="movements" aria-labelledby="movements-title">
      <p className="kicker">The sequence</p>
      <h2 id="movements-title">Plan. Deploy. Operate.</h2>
      <p className="lede movements-lede">
        A fleet starts as a route on a real site. The films move from that route, to
        the site as a structure, to a still day around the robot. They are concept
        visuals.
      </p>
      <ol className="movement-list">
        {movements.map((item) => (
          <li key={item.index}>
            <span className="movement-index">{item.index}</span>
            <p>
              <strong>{item.label}</strong> {item.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
