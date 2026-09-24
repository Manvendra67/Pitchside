export type ArticleTopic = 'Fundamentals' | 'Nutrition' | 'Recovery' | 'Teamwork' | 'Warm-ups' | 'Habits';

export type ArticleArt = 'touch' | 'scan' | 'plate' | 'water' | 'sleep' | 'team' | 'warmup' | 'habit';

export interface ArticleSection {
  heading: string;
  body: string[];
  tip?: string;
}

export interface Article {
  slug: string;
  title: string;
  topic: ArticleTopic;
  minutes: number;
  excerpt: string;
  art: ArticleArt;
  sections: ArticleSection[];
  takeaway: string;
}

export const ARTICLES: Article[] = [
  {
    slug: 'your-first-touch',
    title: 'Your first touch is your first chance',
    topic: 'Fundamentals',
    minutes: 3,
    excerpt: 'A good first touch buys you time. Here is how to make every touch count.',
    art: 'touch',
    sections: [
      {
        heading: 'Why it matters',
        body: [
          'Your first touch decides what happens next. A good touch gives you time to look up, pass or shoot. A heavy touch gives the ball to the other team.',
          'The best players make their first touch look easy. That is because they practise it — a lot.',
        ],
      },
      {
        heading: 'Soft like a pillow',
        body: [
          'When the ball arrives, let your foot move back a little, like catching an egg. This takes the speed off the ball.',
          'Try to make the ball stop one step in front of you, ready for your next move.',
        ],
        tip: 'Get your body behind the ball before it arrives. Then your foot only has one job.',
      },
      {
        heading: 'Touch it somewhere useful',
        body: ['A great first touch goes away from defenders and towards space. Before the ball arrives, decide where you want it to go.'],
      },
    ],
    takeaway: 'Cushion the ball, and touch it towards space.',
  },
  {
    slug: 'look-before-you-receive',
    title: 'Look before you get the ball',
    topic: 'Fundamentals',
    minutes: 2,
    excerpt: 'Top players check their shoulder all the time. It is called scanning.',
    art: 'scan',
    sections: [
      {
        heading: 'What is scanning?',
        body: [
          'Scanning means taking quick looks around you before the ball comes to you. Where are your teammates? Where are the defenders? Where is the space?',
        ],
      },
      {
        heading: 'How to practise',
        body: [
          'Every time a pass is coming to you, take one look over your shoulder. Then look back at the ball.',
          'At first it feels strange. After a few weeks, you will do it without thinking.',
        ],
        tip: 'In the Triangle Passing drill, shout out what you saw before each pass.',
      },
    ],
    takeaway: 'Look, then receive. The picture in your head makes the next pass easy.',
  },
  {
    slug: 'fuel-before-training',
    title: 'What to eat before you train',
    topic: 'Nutrition',
    minutes: 3,
    excerpt: 'Food is fuel. The right meal at the right time helps you play your best.',
    art: 'plate',
    sections: [
      {
        heading: 'Fuel, not a diet',
        body: [
          'Your body is growing and training at the same time. That takes lots of energy. Eating well is about giving your body what it needs — not eating less.',
        ],
      },
      {
        heading: 'Two to three hours before',
        body: ['Have a normal meal with carbohydrates, like pasta, rice or a sandwich, plus some protein like chicken, eggs or beans.'],
      },
      {
        heading: 'One hour before',
        body: ['Something small and easy, like a banana or a slice of toast. Too much food right before you play can make you feel heavy.'],
        tip: 'Everyone is different. If a food makes your tummy feel funny before training, try something else.',
      },
      {
        heading: 'After training',
        body: [
          'Within an hour, have a snack with protein and carbs — milk, yogurt with fruit, or a wrap. This helps your muscles recover.',
        ],
      },
    ],
    takeaway: 'Eat a proper meal a few hours before, and refuel within an hour after.',
  },
  {
    slug: 'water-is-part-of-your-kit',
    title: 'Water is part of your kit',
    topic: 'Nutrition',
    minutes: 2,
    excerpt: 'You would not train without boots. Do not train without water.',
    art: 'water',
    sections: [
      {
        heading: 'Why water matters',
        body: [
          'When you run, you sweat. Sweat is water leaving your body. If you do not replace it, you get tired faster and it is harder to concentrate.',
        ],
      },
      {
        heading: 'Easy water habits',
        body: [
          'Bring your own bottle to every session. Take a few sips at every break.',
          'Drink across the whole day, not just at training.',
        ],
        tip: 'If you feel thirsty, you are already a little behind. Sip early.',
      },
    ],
    takeaway: 'Bring a bottle. Sip at every break.',
  },
  {
    slug: 'sleep-secret-training',
    title: 'Sleep: your secret training session',
    topic: 'Recovery',
    minutes: 3,
    excerpt: 'Your body gets stronger while you sleep. Here is why rest is part of training.',
    art: 'sleep',
    sections: [
      {
        heading: 'Rest makes you better',
        body: [
          'When you train, your muscles work hard. When you sleep, your body repairs them and makes them stronger. So sleep is where training turns into progress.',
          'Young players usually need around 9 to 12 hours of sleep a night.',
        ],
      },
      {
        heading: 'Better sleep habits',
        body: ['Go to bed at the same time each night. Put screens away before bed. A dark, cool room helps.'],
        tip: 'Rest days count on Pitchside. Check in on them to keep your streak alive.',
      },
    ],
    takeaway: 'Sleep and rest days are part of training, not a break from it.',
  },
  {
    slug: 'great-teammate',
    title: 'How to be a great teammate',
    topic: 'Teamwork',
    minutes: 2,
    excerpt: 'Football is a team game. The best teammates make everyone better.',
    art: 'team',
    sections: [
      {
        heading: 'Talk to each other',
        body: ['Call for the ball. Tell a teammate "man on" if a defender is coming. Say "well done" when someone tries something brave.'],
      },
      {
        heading: 'Mistakes are part of the game',
        body: ['Everyone makes mistakes, even professionals. When a teammate gets it wrong, help them feel ready for the next chance.'],
        tip: 'Clap, encourage, go again. That is what great teams do.',
      },
    ],
    takeaway: 'Talk, encourage, and help your teammates go again.',
  },
  {
    slug: 'why-warm-ups-matter',
    title: 'Why warm-ups matter',
    topic: 'Warm-ups',
    minutes: 2,
    excerpt: 'Five minutes of warming up helps you play better and stay safe.',
    art: 'warmup',
    sections: [
      {
        heading: 'Wake your body up',
        body: ['A warm-up gets your heart pumping and your muscles ready to move. Warm muscles are quicker and less likely to get hurt.'],
      },
      {
        heading: 'A simple five-minute warm-up',
        body: [
          'Jog for a minute. Skip for a minute. Side-steps both ways. Then a few leg swings and arm circles. Finish with some quick touches on the ball.',
        ],
        tip: 'Every Pitchside session starts with a 5-minute warm-up for a reason.',
      },
    ],
    takeaway: 'Never skip the warm-up. Five minutes is all it takes.',
  },
  {
    slug: 'build-a-training-habit',
    title: 'Build a training habit',
    topic: 'Habits',
    minutes: 3,
    excerpt: 'Little and often beats a lot once in a while.',
    art: 'habit',
    sections: [
      {
        heading: 'Small sessions win',
        body: [
          'Fifteen minutes, three times a week, will make you a better player than one long session every now and then.',
          'Pick the same days each week so training becomes part of your routine.',
        ],
      },
      {
        heading: 'Track it, celebrate it',
        body: [
          'Checking in each day helps you see how far you have come. Look back at your calendar every Sunday and notice what you did well.',
        ],
        tip: 'Have fun. Players who enjoy training keep training.',
      },
    ],
    takeaway: 'Little and often. Same days each week. Have fun.',
  },
];

export const ARTICLE_BY_SLUG: Record<string, Article> = Object.fromEntries(ARTICLES.map((a) => [a.slug, a]));
