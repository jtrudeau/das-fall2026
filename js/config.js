/* Things Joel may want to change without touching a scene.
   An empty string ('') in a field marked TO CONFIRM shows a marked placeholder on the slide until it is filled in. */
window.CONFIG = {
  title: 'SPACE: Arts and Sciences Certificate',
  audience: 'Dawson Astronomical Society',
  speaker: 'Joel Trudeau',
  date: '',                         /* TO CONFIRM: the meeting date, e.g. '3 December 2026'. Empty hides it (no placeholder). */
  theme: 'EMERGENCE',

  /* Credits slide. The rule is Joel's (23 November 2026). `max` is from the 2026–27 orientation deck
     ("SPACE-affiliated project meetings — maximum 9 credits per semester"). An empty `rule` list shows a marked placeholder. */
  meetingCredits: {
    rule: ['1 meeting = 1 credit', '1 event = 2 credits'],
    max: 'Up to 9 credits a semester',
  },

  /* QR codes. claimForm: "SPACE Activities Form: Certificate Credit", cut from the 2026–27 orientation deck
     (it opens https://forms.cloud.microsoft/r/u4nrvUxh80). discord: the invite made on 19 November 2026
     (it opens https://discord.gg/qBmtqvwKp). Check the invite has not expired before the meeting. */
  claimForm: 'media/qr-claim-form.png',
  claimFormLink: 'forms.cloud.microsoft/r/u4nrvUxh80',   /* shown under the QR code; students self-report (Joel, 23 November 2026) */
  discord: 'media/qr-discord.png',

  /* Images on the Golden Record, from NASA's gallery (science.nasa.gov/mission/voyager/golden-record-contents/images),
     640 x 480 GIFs downloaded 23 November 2026. NASA: "All of these images are copyright protected." Those credited to
     NASA are public domain; the others sit in media/record/rights/, which tools/publish_pages.sh leaves out of the
     public site. A tile whose image is missing is dropped from the slide. [file, caption, credit] */
  /* On the public site (github.io) the copyrighted entries are skipped, so the page never asks for files it doesn't have. */
  publicSite: /(^|\.)github\.io$/.test(location.hostname),
  recordImages: [
    ['rights/calibration-circle.gif', 'Calibration circle', 'Jon Lomberg'],
    ['rights/solar-location-map.gif', 'Where we are', 'Frank Drake'],
    ['rights/dna.gif', 'DNA', 'Jon Lomberg'],
    ['rights/eating-drinking.gif', 'Licking, eating, drinking', 'NAIC'],
    ['rights/children-globe.gif', 'Children with a globe', 'UN/DPI Photo'],
    ['rights/violin.gif', 'Violin and score', 'NAIC, Cornell University'],
    ['earth.gif', 'Earth', 'NASA'],
    ['astronaut.gif', 'Astronaut in space', 'NASA'],
    ['titan-centaur-launch.gif', 'Titan-Centaur launch', 'NASA'],
  ],

  /* SPACE drop-in. Room 7A.5 since 20 November 2026 (Joel); the time is from the October newsletter outline. */
  dropin: { day: 'Wednesdays', room: '7A.5', time: '1:00 – 2:15' },

  /* Ways in, as on the AI for Science invitation scene. Joel owns the wording. */
  routes: [
    { name: 'Research internships', tag: 'limited places' },
    { name: 'Project internships', tag: 'guided' },
    { name: 'Project internships', tag: 'self-directed' },
  ],
};
