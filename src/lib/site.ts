/**
 * info@iserve.ai is the only address this site publishes.
 * Personal addresses are deliberately not listed here.
 */
export const publishedContact = {
  primary: "info@iserve.ai",
  site: "https://iserve.ai",
} as const;

export const discussMailto = `mailto:${publishedContact.primary}?subject=${encodeURIComponent(
  "Discuss your deployment",
)}&body=${encodeURIComponent(
  "Robot:\nSite:\nThe work a day needs to include:\nSupport after the pilot:\n",
)}`;

export type Beat = {
  id: string;
  label: string;
  title: string;
  body: string;
};

export type FilmSpec = {
  id: string;
  kicker: string;
  title: string;
  beats: Beat[];
  src: string;
  poster: string;
  frames: string;
  captions: string;
  routeAlt: string;
  posterAlt: string;
  videoLabel: string;
  note: string;
  /** Draw the boustrophedon sweep overlay (floor coverage, not a single path). */
  sweep?: boolean;
};

export const films: FilmSpec[] = [
  {
    id: "patrol",
    kicker: "01  —  Commercial patrol",
    title: "A route through a street already in use.",
    beats: [
      {
        id: "plan",
        label: "Plan",
        title: "Plan",
        body: "Name the work before the route exists. The cobalt line is what the street has to be covered for, not a track the robot is pinned to.",
      },
      {
        id: "deploy",
        label: "Deploy",
        title: "Deploy",
        body: "Frontage, open ground, and the life of the street are conditions, not obstacles on a map. The machine reads them on site and settles its own way through.",
      },
      {
        id: "operate",
        label: "Operate",
        title: "Operate / scale",
        body: "People keep walking, sitting, and shopping, and the day does not pause for the robot. It judges what has changed and keeps working — which is what makes the next street a deployment rather than a rebuild.",
      },
    ],
    src: "/media/patrol.mp4",
    poster: "/media/patrol-poster.jpg",
    frames: "/media/patrol-frames/f-",
    captions: "/media/patrol.vtt",
    routeAlt:
      "Concept visual of a commercial street drawn in light lines, with a cobalt route across the ground.",
    posterAlt:
      "Concept visual of a commercial street in daylight. A patrol robot is still on the paving with a cobalt route. People sit at a cafe, talk, and walk with bags. They are not staged as operators.",
    videoLabel:
      "Concept film, commercial patrol. A cobalt route, then the street as structure, then a still daylight scene. Not live deployment footage.",
    note: "Concept visual. The daylight scene shows an original concept patrol robot — cream body, sensor mast, no weapons — on the paving. It is not a customer product, and not a measure of performance.",
  },
  {
    id: "cleaning",
    kicker: "02  —  Indoor cleaning",
    title: "A route across a floor people share.",
    beats: [
      {
        id: "plan",
        label: "Plan",
        title: "Plan",
        body: "Mark the floor to be covered, on ground people already use. What gets cleaned is the work; how the hall is crossed is the machine's to resolve.",
      },
      {
        id: "deploy",
        label: "Deploy",
        title: "Deploy",
        body: "Columns, glass, and daylight describe a hall that was built for people. The machine reads it as built and works out where the cleaning fits.",
      },
      {
        id: "operate",
        label: "Operate",
        title: "Operate / scale",
        body: "People pass, talk, and sit, and the building stays open while the work happens. The machine gives way, resumes, and finishes — the same judgment every hall asks for, which is why the second one takes less to open.",
      },
    ],
    // ?v2 busts caches holding the earlier cut, which still had the single
    // wandering route line baked into the footage.
    src: "/media/cleaning.mp4?v2",
    poster: "/media/cleaning-poster.jpg?v2",
    frames: "/media/cleaning-frames/f-",
    captions: "/media/cleaning.vtt",
    routeAlt:
      "Concept visual of an interior hall drawn in light lines, with a cobalt route across the floor.",
    posterAlt:
      "Concept visual of a bright interior hall. A floor-cleaning robot is still on the tile with a cobalt route. People walk, stand in conversation, and sit. They are not staged as operators.",
    videoLabel:
      "Concept film, indoor cleaning. A cobalt route, then the hall as structure, then a still daylight scene. Not live deployment footage.",
    note: "Concept visual. The daylight scene shows an original concept floor scrubber — low chassis, deck, and brushes — on the tile. It is not a customer product, and not a measure of performance.",
    sweep: true,
  },
];

/**
 * Partners and customers as published on iserve.ai. The public site lists them
 * as one group without saying which is which, so this keeps them combined.
 */
export const partners = [
  {
    name: "Renesas",
    logo: "/media/partners/Renesas_Electronics_logo.svg",
    href: "https://www.renesas.com/en",
  },
  {
    name: "3NUCR Lab",
    logo: "/media/partners/ucr.png",
    href: "https://www.3nucr.com/research.html",
  },
  {
    name: "Yodolabs",
    logo: "/media/partners/yodolabs.svg",
    href: "https://yodolabs.jp/en",
  },
  {
    name: "Viabot",
    logo: "/media/partners/viabot.png",
    href: "https://viabot.com/",
  },
  {
    name: "Omakase Robotics",
    logo: "/media/partners/omakase.png",
    href: "https://omakaserobotics.ai/",
  },
] as const;

export const approachSteps = [
  {
    title: "Deployment scope",
    body: "Name the work and the conditions already true on the site. That is the whole brief — an outcome, not a script of movements to be written and rewritten.",
  },
  {
    title: "Site integration",
    body: "Hand over access, hours, and the day's handoffs. There is no mapping phase and no site model to build: the machine reads the place on arrival and settles the rest on the ground.",
  },
  {
    title: "Fleet operations",
    body: "The day stays legible while the robots decide for themselves. What is in service, what called for a person, and why — from the first week, not after a tuning cycle.",
  },
  {
    title: "Scaling",
    body: "Every deployment returns data the next one starts from, so the machines get better at reading places the more places they have read. Deploying quickly is what spins that loop — the fleet compounds while the effort to run it flattens.",
  },
] as const;
