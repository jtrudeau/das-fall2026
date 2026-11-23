/* The spoken words, in running order. One entry per screen state:
     S(sceneId, [ [what the screen shows, what Joel says, a note to Joel after he says it], ... ])
   Edit by hand. This file feeds the speaker view (S in the deck) and the notes strip (N).
   Lines from the AI for Science talk (beat 32, as given on 20 November 2026) are reused where they fit.
   [TO CONFIRM …] marks something only Joel can supply. */
(function () {
  const SCRIPT = (window.SCRIPT = {});
  const S = (id, steps) => { SCRIPT[id] = { steps: steps.map(([cue, say, after]) => ({ cue, say: (say || '').trim(), after: after || '' })) }; };

  S('title', [
    ["Title, while the room settles.",
     `I'm Joel Trudeau. I coordinate SPACE, and I've been working with your executive this year.`,
     "Start when you're ready."],
  ]);

  S('mission', [
    ["Voyager 1 and 2, a drawing of the spacecraft, and the planets.",
     `Voyager 1 and 2 are twin spacecraft. They launched in 1977, about two weeks apart. Each one has a 3.7-metre dish for talking to Earth, cameras and other instruments on a movable platform, and a plutonium power source, because they go too far from the Sun to use solar panels. They were built to last five years.`,
     "The next click draws both paths (about 9 seconds)."],
    ["Both paths draw out past the planets, with the year of each flyby.",
     `The original mission was Jupiter and Saturn only. In the late 1970s the outer planets lined up in a way that happens about once every 175 years, so Voyager 2 could keep going to Uranus and Neptune. It's still the only spacecraft that has visited them. Voyager 1 flew close past Saturn's moon Titan, and that bent its path north, out of the plane of the planets.`,
     ""],
  ]);

  S('voyager', [
    ["\"18 November 2026\", where Voyager 1 is now, and Earth, Neptune and Voyager 1 on a line marked in hours of light travel.",
     `On November 18, Voyager 1 reached one light-day from Earth, about 25.9 billion kilometres. No other spacecraft has been that far.

In 2012 it left the bubble of solar wind that flows out from the Sun, so it's in interstellar space. It hasn't left the solar system, though. That ends beyond the Oort cloud, a huge cloud of small objects still held by the Sun's gravity. At about 17 kilometres a second, Voyager 1 will reach its inner edge in about 300 years, and take about 30,000 years to get past it.`,
     "The next click sends a signal out to Voyager and back (8 seconds)."],
    ["A signal goes out, a reply comes back; the clock runs to 48 hours.",
     `Light from Earth takes a full day to get there. When the team sends Voyager a command, it arrives the next day, and they wait another day to hear back.`,
     "Check Voyager 1's status before the meeting. On 19 November NASA said no science or engineering data had come back since 14 November, only a carrier signal, and engineers were analyzing the issue."],
  ]);

  S('record', [
    ["The Golden Record and what's on it.",
     `Each Voyager carries a copy of the Golden Record, a gold-plated copper record 30 centimetres across. On it are 115 images, greetings in 55 languages, 90 minutes of music, and sounds of Earth: surf, wind, thunder, birds, whales. A committee chaired by Carl Sagan chose what went on it. The cover shows how to play it and how to find Earth.

It will only be played if a spacefaring civilization finds one of the spacecraft.`,
     ""],
  ]);

  S('gallery', [
    ["Nine of the record's images, with short captions.",
     `The first picture is just a circle. Whoever plays the record can use it to check they're decoding the pictures correctly. Then there's a map showing where our solar system is, using 14 pulsars as landmarks, DNA, people licking, eating and drinking, children around a globe, a violin with its music, Earth, an astronaut, and a Titan-Centaur rocket, the kind that launched the Voyagers.`,
     "On the public site only the three NASA images appear; the other six are copyrighted and stay in your local copy."],
    ["The images dim; \"Why send a record that may never be played?\"",
     `Why send a record that may never be played?`,
     "Take a few answers before moving on."],
  ]);

  S('certificate', [
    ["The three requirements.",
     `The SPACE certificate is a way to get recognition for work you do beyond the classroom, across the arts and sciences.

Foundational knowledge is one of the approved courses, or a small project of your own that you write a short reflection about. You can connect it to this year's theme, emergence, or follow any question you're curious about.

You also need 15 activity credits. If you take one of the cross-listed courses, it's 12. With two, it's 9.

The capstone can be your program's integrating activity or an independent project. You confirm it with me, and you present or publish it through SPACE, on the website or at the Showcase.`,
     ""],
  ]);

  S('credits', [
    ["1 meeting = 1 credit · 1 event = 2 credits · up to 9 a semester · the two steps · the form's QR code.",
     `Your Astronomical Society meetings and events count as activity credits. Each meeting is one credit, and each event is two, up to 9 a semester.

First, enroll in the certificate on MyDawson, under Certificates of Study. Then report your meetings and events yourself on the SPACE Activities Form. The QR code opens it.`,
     "Leave the QR code up long enough for phones. The form is the only way to claim for now: MyDawson's activity list isn't updated."],
  ]);

  S('apophis', [
    ["Earth, the geostationary ring, and Apophis passing inside it.",
     `The asteroid Apophis will pass Earth on April 13, 2029, closer than the satellites in geostationary orbit. It's about 340 metres across.`,
     "Let the flyby finish drawing."],
    ["\"What would a CubeSat camera see during the flyby?\"",
     `We have a student CubeSat initiative for the flyby. We're working on a mission concept, simulations and a ground prototype.

What would a CubeSat camera see during the flyby?`,
     "Take a few answers before moving on."],
  ]);

  S('involved', [
    ["Apophis 2029, Astro Pi, MakerSPACE and robotics, your idea · the internships.",
     `For Apophis, a first question can be as concrete as what an instrument would need to measure, and whether something we can build here could measure it.

Astro Pi lets students run experiments on computers aboard the International Space Station.

In MakerSPACE and the Pico robotics projects, you build something, predict what it will do, and find out what you missed.

Or bring your own idea and propose a project.

There are also internships. A small number are research internships. The others are project internships, either guided or self-directed.`,
     "No dates, pay, credits or selection terms are on the slide: the MakerSPACE and Apophis calls are unpublished drafts. Add them once they're out."],
  ]);

  S('dropin', [
    ["7A.5, Wednesdays 1:00 – 2:15 · the SPACE Discord.",
     `Come to a Wednesday drop-in, one o'clock to two-fifteen in room 7A.5. Bring something you're curious about, or something you've tried that isn't working. You don't need the whole project figured out before you talk to us.

The QR code is the SPACE Discord. You can also reach me on MIO.`,
     "Take questions."],
  ]);
})();
