import type { Drill, DrillSource, PositionId } from '@/lib/types';

/**
 * The Pitchside drill library.
 *
 * Every drill is written for players aged 8–13 and reviewed by Coach Ranvir
 * before it ships. To add a drill, append a `defineDrill({...})` entry to
 * `CORE_DRILLS` — or to `FEEDBACK_DRILLS` if players asked for it, so it is
 * labelled "New from player feedback" everywhere in the product.
 *
 * Diagrams use a 100 × 64 box (a mini pitch seen from above).
 */

const ALL: PositionId[] = ['goalkeeper', 'defender', 'midfielder', 'winger', 'striker'];
const OUTFIELD: PositionId[] = ['defender', 'midfielder', 'winger', 'striker'];

const REVIEWER = 'Coach Ranvir';

type DrillInput = Omit<Drill, 'reviewedBy' | 'source'> & { source?: DrillSource };

function defineDrill(input: DrillInput): Drill {
  return { reviewedBy: REVIEWER, source: { type: 'core' }, ...input };
}

export const CORE_DRILLS: Drill[] = [
  defineDrill({
    id: 'toe-tap-rhythm',
    name: 'Toe Tap Rhythm',
    category: 'ball-control',
    positions: ALL,
    level: 'beginner',
    summary: 'Quick taps on top of the ball to wake up your feet.',
    duration: 6,
    equipment: ['Ball'],
    cue: 'Light feet, quick taps.',
    instructions:
      'Stand behind the ball and tap the top of it with the bottom of your foot. Swap feet every tap, like running on the spot. Short bursts, short rests.',
    steps: [
      'Stand tall with the ball just in front of you.',
      'Tap the top of the ball with your right sole, then your left.',
      'Stay on your toes — heels off the ground.',
      'Tap for 30 seconds, then rest for 15.',
      'Do 6 rounds. Try to get a little quicker each time.',
    ],
    keyPoints: ['Touch the ball gently. It should hardly move.', 'Use your arms to help you balance.', 'Look up every few taps.'],
    solo: true,
    diagram: {
      player: [50, 40],
      path: 'M38 32 C 38 22, 62 22, 62 32 S 38 42, 38 32',
    },
  }),
  defineDrill({
    id: 'cone-weave',
    name: 'Cone Weave Dribble',
    category: 'ball-control',
    positions: OUTFIELD,
    level: 'beginner',
    summary: 'Weave through a line of cones with tiny touches.',
    duration: 8,
    equipment: ['Ball', '6 cones'],
    cue: 'Small touches. Eyes up between cones.',
    instructions:
      'Set out 6 cones in a line, two big steps apart. Dribble in and out of every cone, then turn and come back. Use both feet.',
    steps: [
      'Put 6 cones in a straight line, about two big steps apart.',
      'Dribble in and out of the cones using the inside of your foot.',
      'At the end, turn and come back using your other foot.',
      'Do 6 runs. Rest for 20 seconds between runs.',
      'Last 2 runs: use only the outside of your foot.',
    ],
    keyPoints: [
      'Keep the ball close — one touch for every step.',
      'Bend your knees a little so you can change direction.',
      'Peek up between cones like you are checking for teammates.',
    ],
    solo: true,
    diagram: {
      cones: [
        [22, 32],
        [34, 32],
        [46, 32],
        [58, 32],
        [70, 32],
        [82, 32],
      ],
      player: [10, 32],
      path: 'M10 32 C 16 22, 22 22, 28 32 S 40 42, 40 32 S 52 22, 52 32 S 64 42, 64 32 S 76 22, 76 32 S 88 42, 92 32',
    },
  }),
  defineDrill({
    id: 'first-touch-wall',
    name: 'First Touch Wall Rebound',
    category: 'ball-control',
    positions: OUTFIELD,
    level: 'developing',
    summary: 'Pass against a wall and cushion the ball when it comes back.',
    duration: 10,
    equipment: ['Ball', 'A wall'],
    cue: "Cushion it. Don't stop it dead.",
    instructions:
      'Stand about five big steps from a wall. Pass, then control the ball as it comes back so it lands one step in front of you, ready for the next pass.',
    steps: [
      'Stand five big steps away from a wall.',
      'Pass the ball firmly against the wall with your right foot.',
      'As it comes back, let your foot "give" like a pillow.',
      'Your touch should put the ball one step in front of you.',
      'Do 20 passes with each foot, then 20 alternating.',
    ],
    keyPoints: [
      'Get your body behind the ball before it arrives.',
      'Use the inside of your foot for control.',
      'A good touch sets up your next pass.',
    ],
    solo: true,
    diagram: {
      wall: 'right',
      player: [28, 32],
      path: 'M32 35 L90 35 M90 29 L38 29',
    },
  }),
  defineDrill({
    id: 'juggling-ladder',
    name: 'Juggling Ladder',
    category: 'ball-control',
    positions: ALL,
    level: 'developing',
    summary: 'Climb the juggling ladder: 5, then 10, then 15 touches.',
    duration: 8,
    equipment: ['Ball'],
    cue: 'Lock your ankle. Soft touches.',
    instructions:
      'Keep the ball up with your feet, thighs and one bounce if you need it. Each rung of the ladder is a new target. Reach it three times to climb.',
    steps: [
      'Drop the ball onto your foot and keep it up.',
      'First rung: 5 touches in a row, three times.',
      'Second rung: 10 touches in a row, three times.',
      'Third rung: 15 touches. You can let it bounce once.',
      'Write down your best score so you can beat it next time.',
    ],
    keyPoints: [
      'Point your toes and lock your ankle.',
      'Kick the ball just above knee height.',
      'Stay relaxed — tense legs make the ball fly.',
    ],
    solo: true,
    diagram: {
      player: [50, 52],
      path: 'M50 48 C 40 36, 60 26, 50 14 C 42 22, 58 34, 50 48',
    },
  }),
  defineDrill({
    id: 'turn-and-go',
    name: 'Turn & Go',
    category: 'ball-control',
    positions: ['midfielder', 'winger', 'striker'],
    level: 'advanced',
    summary: 'Learn the Cruyff turn and the drag-back, then explode away.',
    duration: 10,
    equipment: ['Ball', '2 cones'],
    cue: 'Fake it, then explode away.',
    instructions:
      'Dribble towards a cone like you are going to pass it. At the last second, turn back the other way and accelerate for three quick touches.',
    steps: [
      'Put 2 cones about 15 big steps apart.',
      'Dribble towards the first cone at jogging speed.',
      'Fake a pass, then drag the ball behind your standing leg (Cruyff turn).',
      'Explode away with three quick touches.',
      'Do 5 Cruyff turns, then 5 drag-backs, then mix them up.',
    ],
    keyPoints: [
      'Sell the fake — shoulders and eyes help.',
      'Turn close to the cone, not early.',
      'The speed after the turn is what beats defenders.',
    ],
    solo: true,
    diagram: {
      cones: [
        [26, 32],
        [74, 32],
      ],
      player: [50, 32],
      path: 'M50 32 L68 32 Q 76 32 70 38 L50 44 M50 44 L32 38 Q 24 32 32 28 L50 26',
    },
  }),
  defineDrill({
    id: 'gate-passing',
    name: 'Gate Passing',
    category: 'passing',
    positions: ALL,
    level: 'beginner',
    summary: 'Pass through a small gate to a friend. Make the gate smaller as you improve.',
    duration: 10,
    equipment: ['Ball', '2 cones', 'A friend'],
    cue: 'Lock your ankle. Follow through to your target.',
    instructions:
      'Make a gate with two cones in the middle. Stand either side, about ten big steps apart, and pass through the gate. Every five good passes, step back one step.',
    steps: [
      'Make a gate with 2 cones, one big step wide.',
      'Stand 10 steps away from your friend, with the gate between you.',
      'Pass through the gate using the inside of your foot.',
      'Control the ball first, then pass back.',
      'After 5 passes in a row through the gate, both take one step back.',
    ],
    keyPoints: [
      'Plant your standing foot next to the ball, pointing at your friend.',
      'Strike the middle of the ball.',
      'Follow through towards your target.',
    ],
    solo: false,
    diagram: {
      cones: [
        [50, 26],
        [50, 38],
      ],
      player: [18, 32],
      partner: [82, 32],
      path: 'M22 32 L78 32',
    },
  }),
  defineDrill({
    id: 'wall-one-two',
    name: 'Wall One-Two',
    category: 'passing',
    positions: ['defender', 'midfielder', 'winger'],
    level: 'developing',
    summary: 'Pass, move, receive. Use a wall as your teammate.',
    duration: 8,
    equipment: ['Ball', 'A wall'],
    cue: 'Pass, move, receive.',
    instructions:
      'Walk along a wall. Pass at an angle so the ball comes back further along, then move to meet it. It is exactly how a one-two works in a match.',
    steps: [
      'Stand a few steps from a long wall.',
      'Pass the ball at an angle towards the wall.',
      'Move forward straight away to meet the ball.',
      'Control it, then pass again — keep moving along the wall.',
      'Go along the wall 4 times, then switch feet.',
    ],
    keyPoints: ['Never stand still after you pass.', 'Aim the pass ahead of you.', 'Use your first touch to keep moving forward.'],
    solo: true,
    diagram: {
      wall: 'top',
      player: [16, 48],
      path: 'M18 46 L32 10 L46 46 L60 10 L74 46 L86 12',
    },
  }),
  defineDrill({
    id: 'triangle-scan',
    name: 'Triangle Passing & Scanning',
    category: 'passing',
    positions: ['defender', 'midfielder'],
    level: 'advanced',
    summary: 'Pass around a triangle and check your shoulder before every touch.',
    duration: 12,
    equipment: ['Ball', '3 cones', '2 friends'],
    cue: 'Check your shoulder before the ball arrives.',
    instructions:
      'Three players stand on the cones of a triangle. Before you receive, look over your shoulder. Your friend holds up fingers — shout the number before you pass.',
    steps: [
      'Set 3 cones in a triangle, about 8 steps apart.',
      'One player on each cone. Pass around the triangle.',
      'Before the ball arrives, look over your shoulder.',
      'The next player holds up 1 to 5 fingers. Shout the number.',
      'After 2 minutes, change direction.',
    ],
    keyPoints: [
      'Look before the ball arrives, not after.',
      'Open your body so you can see more of the pitch.',
      'Two touches: control, then pass.',
    ],
    solo: false,
    diagram: {
      cones: [
        [24, 52],
        [76, 52],
        [50, 12],
      ],
      player: [24, 52],
      partner: [76, 52],
      path: 'M26 50 L48 14 L74 50 L28 52',
    },
  }),
  defineDrill({
    id: 'target-corners',
    name: 'Target Corners',
    category: 'finishing',
    positions: ['midfielder', 'winger', 'striker'],
    level: 'beginner',
    summary: 'Pick a corner, then hit it. Accuracy before power.',
    duration: 10,
    equipment: ['Ball', 'A goal or wall', '2 targets (cones or shirts)'],
    cue: 'Pick your corner before you shoot.',
    instructions:
      'Put a target in each bottom corner of a goal. Shoot from ten steps away. Say which corner you are aiming for before you strike.',
    steps: [
      'Place a target in each bottom corner of the goal.',
      'Put the ball about 10 steps from the goal.',
      'Say "left" or "right" out loud, then shoot.',
      'Score 1 point for the right corner, 2 for hitting the target.',
      'Take 10 shots with each foot. Beat your score next time.',
    ],
    keyPoints: [
      'Choose your corner before you run up.',
      'Keep your head down and your body over the ball.',
      'Side-foot for accuracy, laces for power.',
    ],
    solo: true,
    diagram: {
      goal: 'right',
      player: [40, 32],
      path: 'M44 32 L92 20 M44 32 L92 44',
    },
  }),
  defineDrill({
    id: 'dribble-finish',
    name: 'Dribble & Finish',
    category: 'finishing',
    positions: ['winger', 'striker'],
    level: 'developing',
    summary: 'Beat three cones, then finish early.',
    duration: 12,
    equipment: ['Ball', 'A goal', '3 cones'],
    cue: 'Head up. Shoot early.',
    instructions:
      'Dribble past three cones like they are defenders. After the last cone, take one touch to set yourself, then shoot before a defender could get back.',
    steps: [
      'Set 3 cones in a zig-zag leading towards the goal.',
      'Dribble past each cone with a skill of your choice.',
      'After the last cone, one touch to set up your shot.',
      'Shoot low into a corner.',
      'Do 8 runs. Alternate which foot you shoot with.',
    ],
    keyPoints: [
      'Look at the goal before you shoot.',
      'Shoot early — defenders will not wait for you.',
      'Low shots are harder for goalkeepers.',
    ],
    solo: true,
    diagram: {
      goal: 'right',
      cones: [
        [34, 32],
        [48, 24],
        [62, 38],
      ],
      player: [12, 32],
      path: 'M14 32 C 26 24, 32 40, 42 30 S 56 30, 64 30 L 92 26',
    },
  }),
  defineDrill({
    id: 'half-volley-drop',
    name: 'Half-Volley Drop',
    category: 'finishing',
    positions: ['midfielder', 'striker'],
    level: 'advanced',
    summary: 'Drop, bounce, strike. Keep it low and on target.',
    duration: 10,
    equipment: ['Ball', 'A goal or wall'],
    cue: 'Eyes on the ball. Knee over it.',
    instructions:
      'Hold the ball, drop it, and strike it just after it bounces. This is a half-volley. Keeping your knee over the ball keeps the shot low.',
    steps: [
      'Stand 12 steps from the goal, holding the ball.',
      'Drop the ball in front of your kicking foot.',
      'Strike it just as it comes up from the bounce.',
      'Keep your knee over the ball and your ankle locked.',
      '10 shots with each foot. Count how many stay below the bar.',
    ],
    keyPoints: ['Watch the ball onto your laces.', 'Short backswing — timing beats power.', 'Land on your kicking foot after the strike.'],
    solo: true,
    diagram: {
      goal: 'right',
      player: [52, 32],
      path: 'M56 32 Q 70 18, 92 30',
    },
  }),
  defineDrill({
    id: 'quick-feet-ladder',
    name: 'Quick Feet Ladder',
    category: 'speed-agility',
    positions: ALL,
    level: 'beginner',
    summary: 'Fast feet through a chalk ladder or a line of cones.',
    duration: 6,
    equipment: ['Chalk or 5 cones'],
    cue: 'Fast feet. Tall body.',
    instructions:
      'Draw a ladder with chalk or line up five cones. Move through it with quick, light steps. Rest properly between runs so every run is fast.',
    steps: [
      'Draw a ladder with 8 boxes, or line up 5 cones.',
      'Run through with one foot in each box.',
      'Next: two feet in each box.',
      'Next: sideways, two feet in each box.',
      'Do each pattern 3 times. Walk back to rest.',
    ],
    keyPoints: ['Stay on the balls of your feet.', 'Pump your arms.', 'Quality first, then speed.'],
    solo: true,
    diagram: {
      cones: [
        [22, 32],
        [34, 32],
        [46, 32],
        [58, 32],
        [70, 32],
      ],
      player: [12, 32],
      path: 'M12 32 L18 28 L26 36 L30 28 L38 36 L42 28 L50 36 L54 28 L62 36 L66 28 L74 36 L86 32',
    },
  }),
  defineDrill({
    id: 'reaction-sprints',
    name: 'Colour Reaction Sprints',
    category: 'speed-agility',
    positions: ALL,
    level: 'developing',
    summary: 'A friend shouts a colour. You sprint to that cone.',
    duration: 8,
    equipment: ['4 different coloured cones', 'A friend'],
    cue: 'React, then go!',
    instructions:
      'Stand in the middle of four coloured cones. When your friend shouts a colour, sprint to it, touch it, and come back to the middle.',
    steps: [
      'Put 4 coloured cones in a square, 5 big steps from the middle.',
      'Stand in the middle, knees bent, ready.',
      'Your friend shouts a colour — sprint to it and touch it.',
      'Jog back to the middle. Wait for the next colour.',
      '6 sprints, then swap roles.',
    ],
    keyPoints: [
      'Ready position: knees bent, weight forward.',
      'First two steps should be short and fast.',
      'Jog back — each sprint should be full speed.',
    ],
    solo: false,
    diagram: {
      cones: [
        [22, 12],
        [78, 12],
        [22, 52],
        [78, 52],
      ],
      player: [50, 32],
      partner: [50, 58],
      path: 'M50 32 L24 14 M50 32 L76 50',
    },
  }),
  defineDrill({
    id: 'zigzag-shuttle',
    name: 'Zig-Zag Shuttle',
    category: 'speed-agility',
    positions: ALL,
    level: 'advanced',
    summary: 'Sharp cuts between cones. Low hips on every turn.',
    duration: 10,
    equipment: ['6 cones'],
    cue: 'Low hips on every turn.',
    instructions:
      'Set cones in a zig-zag. Sprint to each cone, plant your outside foot, and push off hard to the next. Walk back and rest before the next run.',
    steps: [
      'Put 6 cones in a zig-zag, about 5 steps apart.',
      'Sprint to the first cone.',
      'Plant your outside foot and push off to the next cone.',
      'Keep your hips low as you turn.',
      'Do 6 runs. Rest for 40 seconds between runs.',
    ],
    keyPoints: ['Small steps just before each cone.', 'Push off the outside foot.', 'Rest is part of the drill — do not skip it.'],
    solo: true,
    diagram: {
      cones: [
        [14, 18],
        [30, 46],
        [46, 18],
        [62, 46],
        [78, 18],
        [92, 46],
      ],
      player: [8, 32],
      path: 'M14 18 L30 46 L46 18 L62 46 L78 18 L92 46',
    },
  }),
  defineDrill({
    id: 'jockey-mirror',
    name: 'Jockey Mirror',
    category: 'defending',
    positions: ['defender', 'midfielder'],
    level: 'beginner',
    summary: 'Mirror an attacker side-to-side without diving in.',
    duration: 8,
    equipment: ['4 cones', 'A friend'],
    cue: "Side-on. On your toes. Don't dive in.",
    instructions:
      'Your friend moves side to side along a line. You mirror them from two steps away, staying side-on and ready. No tackling yet — just stay with them.',
    steps: [
      'Make two lines of cones, 3 steps apart.',
      'Your friend moves along their line. You mirror them on yours.',
      'Stay side-on, with one foot slightly in front.',
      'Shuffle your feet — do not cross them.',
      '30 seconds each, then swap. Do 6 rounds.',
    ],
    keyPoints: ['Watch the ball, not the tricks.', 'Stay one arm’s length away.', 'Patience wins the ball.'],
    solo: false,
    diagram: {
      cones: [
        [28, 22],
        [72, 22],
        [28, 42],
        [72, 42],
      ],
      player: [50, 42],
      partner: [50, 22],
      path: 'M34 42 L66 42 M34 22 L66 22',
    },
  }),
  defineDrill({
    id: 'recovery-run',
    name: 'Recovery Run & Block',
    category: 'defending',
    positions: ['defender', 'midfielder'],
    level: 'advanced',
    summary: 'Sprint back, get goal-side, then stay patient.',
    duration: 10,
    equipment: ['Ball', '4 cones', 'A friend'],
    cue: 'Run back. Get goal-side. Stay patient.',
    instructions:
      'Your friend starts dribbling towards a small goal. You start behind them. Sprint back, get between them and the goal, then jockey until they lose the ball or stop.',
    steps: [
      'Make a small goal with 2 cones.',
      'Your friend starts 5 steps ahead of you, with the ball.',
      'On "go", sprint back to get between them and the goal.',
      'Once you are goal-side, slow down and jockey.',
      'Only tackle when the ball is away from their feet. 8 rounds each.',
    ],
    keyPoints: [
      'Sprint on the inside line, towards your goal.',
      'Slow down in control before you arrive.',
      'Stay on your feet — no sliding.',
    ],
    solo: false,
    diagram: {
      goal: 'left',
      player: [78, 44],
      partner: [64, 22],
      path: 'M62 22 L20 30 M78 44 C 56 44, 40 40, 26 32',
    },
  }),
  defineDrill({
    id: 'ready-scoop',
    name: 'Ready Position & Scoop',
    category: 'goalkeeping',
    positions: ['goalkeeper'],
    level: 'beginner',
    summary: 'Get set, then scoop rolling balls safely into your chest.',
    duration: 8,
    equipment: ['Ball', 'A friend or a wall'],
    cue: 'Hands in a W. Body behind the ball.',
    instructions:
      'Learn the goalkeeper ready position, then practise scooping balls that roll along the ground. Get your whole body behind the ball so nothing goes through.',
    steps: [
      'Ready position: feet shoulder-width, knees bent, hands out front.',
      'Your friend rolls the ball towards you.',
      'Step behind the line of the ball.',
      'Scoop it up with both hands and hug it into your chest.',
      '10 scoops, then 10 more with the ball coming a bit faster.',
    ],
    keyPoints: ['Hands make a "W" with your thumbs.', 'Body behind the ball is your second wall.', 'Hug the ball in — keep it safe.'],
    solo: false,
    diagram: {
      goal: 'left',
      player: [16, 32],
      partner: [64, 32],
      path: 'M60 32 L20 32',
    },
  }),
  defineDrill({
    id: 'reaction-saves',
    name: 'Wall Reaction Saves',
    category: 'goalkeeping',
    positions: ['goalkeeper'],
    level: 'developing',
    summary: 'Throw a tennis ball at a wall and catch the rebound.',
    duration: 10,
    equipment: ['Tennis ball', 'A wall'],
    cue: 'Watch it all the way into your hands.',
    instructions:
      'Face a wall from a few steps away. Throw a tennis ball against it and catch it on the rebound. The small ball trains your eyes and hands to react faster.',
    steps: [
      'Stand 3 big steps from a wall, in your ready position.',
      'Throw the tennis ball against the wall with one hand.',
      'Catch it with both hands as it comes back.',
      'Now throw it so it bounces once on the floor first.',
      '3 rounds of 20 catches. Step closer to make it harder.',
    ],
    keyPoints: ['Eyes stay on the ball until it is in your hands.', 'Soft hands — pull the ball in.', 'Stay on your toes between catches.'],
    solo: true,
    diagram: {
      wall: 'right',
      player: [40, 32],
      path: 'M44 32 L90 22 L46 38',
    },
  }),
];

/**
 * Drills built from player requests. They sit in the same library as every
 * other drill, carry the "New from player feedback" label, and link back to
 * the request that started them.
 */
export const FEEDBACK_DRILLS: Drill[] = [
  defineDrill({
    id: 'solo-passing-square',
    name: 'Solo Passing Square',
    category: 'passing',
    positions: ALL,
    level: 'beginner',
    summary: 'A passing workout you can do on your own with a wall.',
    duration: 8,
    equipment: ['Ball', 'A wall', '4 cones'],
    cue: 'Pass to where you are going next.',
    instructions:
      'Make a square of cones in front of a wall. Pass against the wall, then move to a new cone to receive. Every pass sends you somewhere new.',
    steps: [
      'Make a square with 4 cones, 4 steps in front of a wall.',
      'Start on one cone and pass against the wall.',
      'Move to the next cone before the ball comes back.',
      'Control and pass again from the new cone.',
      'Go round the square 5 times each way.',
    ],
    keyPoints: ['Move the moment the ball leaves your foot.', 'Open your body towards the wall.', 'Use both feet.'],
    solo: true,
    source: {
      type: 'player-feedback',
      request: 'Drills I can do on my own',
      requests: 17,
      addedOn: '2026-07-29',
    },
    diagram: {
      wall: 'top',
      cones: [
        [34, 30],
        [66, 30],
        [34, 52],
        [66, 52],
      ],
      player: [34, 52],
      path: 'M36 50 L50 10 L64 30 M64 30 L50 10 L36 32',
    },
  }),
  defineDrill({
    id: 'cone-gate-1v1',
    name: 'Cone Gate 1v1',
    category: 'ball-control',
    positions: ['midfielder', 'winger', 'striker'],
    level: 'developing',
    summary: 'Beat a defender by dribbling through one of three gates.',
    duration: 12,
    equipment: ['Ball', '6 cones', 'A friend'],
    cue: 'Make the defender move first.',
    instructions:
      'Set up three small gates. Dribble at your friend and score by dribbling through any gate. Use a fake, a change of speed or a change of direction.',
    steps: [
      'Make 3 small gates with 6 cones, in a line.',
      'Your friend defends in front of the gates.',
      'Dribble at them and try to get through any gate.',
      'Use a fake or a change of speed to beat them.',
      'First to 5 goals, then swap.',
    ],
    keyPoints: [
      'Dribble at the defender to make them commit.',
      'Change speed after your fake.',
      'Look for the gate they are not covering.',
    ],
    solo: false,
    source: {
      type: 'player-feedback',
      request: 'More 1v1 moves to beat defenders',
      requests: 14,
      addedOn: '2026-08-18',
    },
    diagram: {
      cones: [
        [80, 12],
        [80, 20],
        [80, 28],
        [80, 36],
        [80, 44],
        [80, 52],
      ],
      player: [20, 32],
      partner: [60, 32],
      path: 'M24 32 C 40 32, 48 22, 56 30 S 64 46, 82 48',
    },
  }),
  defineDrill({
    id: 'rebound-rush',
    name: 'Rebound Rush',
    category: 'finishing',
    positions: ['winger', 'striker'],
    level: 'advanced',
    summary: 'Shoot, then attack the rebound. Strikers never stop.',
    duration: 10,
    equipment: ['2 balls', 'A goal', 'A wall or rebounder'],
    cue: 'Shoot, then follow it in.',
    instructions:
      'Take a shot, then sprint straight in for a second ball that bounces back off a wall or is rolled in by a friend. Goals often come from the second chance.',
    steps: [
      'Stand 14 steps from the goal with a ball.',
      'Shoot low at the target.',
      'Straight away, sprint in towards the goal.',
      'Finish the second ball first time.',
      'Do 8 rounds. Rest 30 seconds between rounds.',
    ],
    keyPoints: ['Follow every shot in.', 'Stay on your toes for the second ball.', 'First-time finishes: side-foot, low.'],
    solo: false,
    source: {
      type: 'player-feedback',
      request: 'Harder finishing drills',
      requests: 9,
      addedOn: '2026-09-02',
    },
    diagram: {
      goal: 'right',
      player: [40, 32],
      path: 'M44 32 L92 24 M46 34 L72 36 L92 42',
    },
  }),
  defineDrill({
    id: 'keeper-shuffle-dive',
    name: 'Shuffle to Low Dive',
    category: 'goalkeeping',
    positions: ['goalkeeper'],
    level: 'developing',
    summary: 'Side-shuffle across your goal, then make a safe low save.',
    duration: 10,
    equipment: ['Ball', '2 cones', 'Grass or a soft mat', 'A friend'],
    cue: 'Shuffle, set, save.',
    instructions:
      'Shuffle sideways between two cones, keeping your feet apart. When your friend rolls the ball to one side, set your feet and make a low save onto soft ground.',
    steps: [
      'Put 2 cones 4 steps apart. Practise on grass or a soft mat.',
      'Shuffle sideways between them — do not cross your feet.',
      'Your friend rolls a ball towards one cone.',
      'Set your feet, then go down sideways to collect it.',
      '6 saves each side. Get up quickly after each one.',
    ],
    keyPoints: ['Always practise dives on a soft surface.', 'Land on your side, not your elbow.', 'Hands first, then body behind.'],
    solo: false,
    source: {
      type: 'player-feedback',
      request: 'More goalkeeper drills',
      requests: 11,
      addedOn: '2026-09-10',
    },
    diagram: {
      goal: 'left',
      cones: [
        [14, 18],
        [14, 46],
      ],
      player: [16, 32],
      partner: [62, 32],
      path: 'M16 22 L16 42 M58 32 L18 44',
    },
  }),
];

export const DRILLS: Drill[] = [...CORE_DRILLS, ...FEEDBACK_DRILLS];

export const DRILL_BY_ID: Record<string, Drill> = Object.fromEntries(DRILLS.map((d) => [d.id, d]));

export function isFeedbackDrill(drill: Drill): drill is Drill & {
  source: Extract<DrillSource, { type: 'player-feedback' }>;
} {
  return drill.source.type === 'player-feedback';
}
