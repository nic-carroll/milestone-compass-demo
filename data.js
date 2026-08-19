/*
 * SAMPLE / DEMO DATA ONLY.
 *
 * Nothing in this file comes from a live integration. It stands in for three
 * pipelines that don't exist yet (see CLAUDE.md "Open Questions Ledger"):
 *   - COURSES  would come from a real OneRoster 1.2 sync.
 *   - STANDARDS would come from Georgia's CASE 2.0 network (case.georgiastandards.org).
 *   - QUESTIONS would come from vendor QTI imports and/or generated content,
 *     matched against the CASE standards above.
 *
 * The standard codes, domains, elements, and crosswalk values below follow
 * Georgia's real naming conventions (MGSE.../S7L.../SS8H.../ELAGSE...) and
 * CASE's real Domain -> Standard -> Element hierarchy shape, so the demo
 * *looks* like real Georgia Standards of Excellence — but the specific
 * content here was hand-picked for this demo, not fetched from CASE. Do not
 * treat this file as a standards source of record once the real CASE
 * integration exists — replace it, don't extend it.
 *
 * ACHIEVEMENT_LEVELS reuses Georgia's real 4 Milestones achievement-level
 * NAMES (Beginning/Developing/Proficient/Distinguished Learner), but the
 * `minPct` thresholds below are this demo's own illustrative binning of raw
 * practice-set accuracy — NOT the real Milestones cut scores. Georgia's
 * actual cut scores come from a secure standard-setting study on scaled
 * test scores, not a simple percent-correct formula, and this demo has no
 * way to reproduce that. Don't present these thresholds as official.
 */

const DOK_LEVELS = [
  { level: 1, name: "Recall & Reproduction", short: "Recall facts, definitions, and simple procedures.", color: "#2a78d6" },
  { level: 2, name: "Skills & Concepts",      short: "Apply a skill, compare, organize, or interpret information.", color: "#eb6834" },
  { level: 3, name: "Strategic Thinking",     short: "Reason with evidence, justify, or solve a non-routine problem.", color: "#1baf7a" },
  { level: 4, name: "Extended Thinking",      short: "Investigate or synthesize across an extended, complex task.", color: "#eda100" }
];

// Georgia's real 4 Milestones achievement-level names + Milestone-Compass-matching
// colors. minPct is an illustrative demo threshold on raw accuracy, not an
// official cut score — see file header.
const ACHIEVEMENT_LEVELS = [
  { level: 1, name: "Beginning Learner",     minPct: 0,  color: "#A6432F" },
  { level: 2, name: "Developing Learner",    minPct: 40, color: "#B9812E" },
  { level: 3, name: "Proficient Learner",    minPct: 70, color: "#5A8A46" },
  { level: 4, name: "Distinguished Learner", minPct: 90, color: "#2F6B4F" }
];

const QUESTION_FORMATS = [
  { id: "mc",         label: "Multiple Choice",      hint: "Pick the one best answer." },
  { id: "multiselect", label: "Select All That Apply", hint: "A technology-enhanced item — pick every correct option." },
  { id: "fill",       label: "Fill in the Blank",     hint: "Type the missing word or number." },
  { id: "matching",   label: "Matching",              hint: "Match each item on the left to its match on the right." }
];

const COURSES = [
  { id: "c-math7", subject: "Mathematics",     title: "Grade 7 Math",  section: "Period 3", teacher: "Ms. Rivera" },
  { id: "c-sci7",  subject: "Science",         title: "Life Science",  section: "Period 5", teacher: "Mr. Choi" },
  { id: "c-ss8",   subject: "Social Studies",  title: "US History",    section: "Period 2", teacher: "Mrs. Patel" },
  { id: "c-ela7",  subject: "Language Arts",   title: "Grade 7 ELA",   section: "Period 1", teacher: "Mr. Owens" }
];

/*
 * Standards follow CASE's real Domain -> Standard -> Element hierarchy:
 *   domain      the broader cluster a standard belongs to
 *   code        the standard itself (what items tag to in `QUESTIONS`)
 *   crosswalk   secondary framework mapping so content survives a GSE
 *               revision (Georgia Social Studies standards are state-specific
 *               with no national crosswalk, same as Milestone Compass's own
 *               example table shows for SS6G1 -- crosswalk is omitted there,
 *               not filled with a placeholder)
 *   elements    the most specific unit GSE defines; items tag to one of these
 */
const STANDARDS = {
  "c-math7": [
    {
      domain: "Ratios & Proportional Relationships",
      code: "MGSE7.RP.1",
      description: "Compute unit rates associated with ratios of fractions, including ratios of lengths, areas, and other quantities measured in like or different units.",
      crosswalk: { ccss: "7.RP.A.1" },
      elements: [
        { id: "a", description: "Understand what a unit rate is and how it's written" },
        { id: "b", description: "Compute a unit rate given a ratio of quantities, including fractions" },
        { id: "c", description: "Compare rates to determine whether they are equivalent" }
      ]
    },
    {
      domain: "The Number System",
      code: "MGSE7.NS.1",
      description: "Apply properties of operations to add and subtract rational numbers, including on a number line.",
      crosswalk: { ccss: "7.NS.A.1" },
      elements: [
        { id: "a", description: "Represent addition and subtraction of rational numbers on a number line" },
        { id: "b", description: "Add and subtract rational numbers in real-world contexts" }
      ]
    },
    {
      domain: "Expressions & Equations",
      code: "MGSE7.EE.4",
      description: "Use variables to represent quantities and construct simple equations and inequalities to solve real-world problems.",
      crosswalk: { ccss: "7.EE.B.4" },
      elements: [
        { id: "a", description: "Write an equation to represent a real-world relationship" },
        { id: "b", description: "Solve multi-step equations and inequalities" }
      ]
    }
  ],
  "c-sci7": [
    {
      domain: "Cells & Body Systems",
      code: "S7L2",
      description: "Describe the structure and function of cells and how cells relate to systems within organisms.",
      crosswalk: { ngss: "MS-LS1-2" },
      elements: [
        { id: "a", description: "Identify cell organelles and their functions" },
        { id: "b", description: "Predict the effect on a cell when a specific organelle malfunctions" }
      ]
    },
    {
      domain: "Ecosystems & Interdependence",
      code: "S7L4",
      description: "Examine the interdependence of organisms within an ecosystem.",
      crosswalk: { ngss: "MS-LS2-1" },
      elements: [
        { id: "a", description: "Identify roles of organisms in an ecosystem (producers, consumers, decomposers)" },
        { id: "b", description: "Analyze how a change to one population affects others in a food web" }
      ]
    },
    {
      domain: "Biological Adaptation",
      code: "S7L5",
      description: "Compare and contrast mechanisms of biological adaptation, including natural selection.",
      crosswalk: { ngss: "MS-LS4-4" },
      elements: [
        { id: "a", description: "Identify examples of natural selection versus other kinds of change" },
        { id: "b", description: "Analyze data or a scenario to explain an evolutionary outcome" }
      ]
    }
  ],
  "c-ss8": [
    {
      domain: "Civil War & Reconstruction in Georgia",
      code: "SS8H6",
      description: "Analyze the impact of the Civil War and Reconstruction on Georgia.",
      elements: [
        { id: "a", description: "Describe Georgia's economy and society before the Civil War" },
        { id: "b", description: "Analyze the effects of the Civil War and Reconstruction on Georgia" }
      ]
    },
    {
      domain: "Georgia and the U.S. Constitution",
      code: "SS8H8",
      description: "Analyze past and current issues in Georgia in relation to the U.S. Constitution.",
      elements: [
        { id: "a", description: "Analyze historical Georgia issues involving constitutional principles" }
      ]
    },
    {
      domain: "Georgia Government Structure",
      code: "SS8CG1",
      description: "Describe the foundational structure of the government of Georgia.",
      elements: [
        { id: "a", description: "Identify the branches of Georgia's government and their functions" },
        { id: "b", description: "Explain how checks and balances operate within Georgia's government" }
      ]
    }
  ],
  "c-ela7": [
    {
      domain: "Reading: Literature",
      code: "ELAGSE7RL1",
      description: "Cite several pieces of textual evidence to support analysis of what a literary text says explicitly and inferentially.",
      crosswalk: { ccss: "RL.7.1" },
      elements: [
        { id: "a", description: "Cite textual evidence that supports an inference" },
        { id: "b", description: "Evaluate which piece of evidence most strongly supports an inference" }
      ]
    },
    {
      domain: "Reading: Informational Text",
      code: "ELAGSE7RI2",
      description: "Determine two or more central ideas in an informational text and analyze their development.",
      crosswalk: { ccss: "RI.7.2" },
      elements: [
        { id: "a", description: "Understand what a central idea is" },
        { id: "b", description: "Determine two or more central ideas in a text" },
        { id: "c", description: "Distinguish supporting details from central ideas" }
      ]
    },
    {
      domain: "Vocabulary Acquisition & Use",
      code: "ELAGSE7L4",
      description: "Determine the meaning of unknown words and phrases using context clues.",
      crosswalk: { ccss: "L.7.4" },
      elements: [
        { id: "a", description: "Use context clues to determine the meaning of an unknown word" }
      ]
    }
  ]
};

/*
 * Every question carries: id, standard, element, dok (1-4), type, prompt, a
 * `skill` label (what a future short instructional video/article would
 * cover -- the link itself is a stub in the UI, see CLAUDE.md open question).
 *
 * Type-specific shape:
 *   mc / multiselect -> choices: [{ text, correct, explanation }]
 *   fill             -> accepted: [string,...] (case/whitespace-insensitive), explanation
 *   matching         -> pairs: [{ left, right, explanation }]  (right options are shuffled for display)
 */
const QUESTIONS = [
  // ---- MGSE7.RP.1 — unit rates ----
  {
    id: "q-rp1-1", standard: "MGSE7.RP.1", element: "a", dok: 1, type: "mc", skill: "What a unit rate is",
    prompt: "Which of these best describes a \"unit rate\"?",
    choices: [
      { text: "A rate written so the second quantity is 1", correct: true, explanation: "Correct — a unit rate always compares an amount to exactly 1 unit, like miles per 1 hour or dollars per 1 item." },
      { text: "Any fraction that compares two numbers", correct: false, explanation: "Too broad — this describes a ratio in general, not specifically a rate scaled to a denominator of 1." },
      { text: "A rate that never changes over time", correct: false, explanation: "Unit rate is about the form of the comparison (per 1 unit), not about whether a real-world rate stays constant." },
      { text: "The larger of two numbers being compared", correct: false, explanation: "Unit rate isn't about size — it's about rewriting a rate so the second quantity equals 1." }
    ]
  },
  {
    id: "q-rp1-2", standard: "MGSE7.RP.1", element: "b", dok: 2, type: "mc", skill: "Computing unit rates from fractions",
    prompt: "A recipe uses 3/4 cup of flour for every 1/2 cup of sugar. What is the unit rate of flour per 1 cup of sugar?",
    choices: [
      { text: "1.5 cups of flour per cup of sugar", correct: true, explanation: "Correct — divide 3/4 by 1/2: (3/4) ÷ (1/2) = (3/4) × 2 = 1.5." },
      { text: "0.375 cups of flour per cup of sugar", correct: false, explanation: "This comes from multiplying 3/4 × 1/2 instead of dividing — unit rate requires dividing by the second quantity." },
      { text: "0.67 cups of flour per cup of sugar", correct: false, explanation: "This is 1/2 ÷ 3/4 (sugar per flour), the reciprocal of what was asked." },
      { text: "2 cups of flour per cup of sugar", correct: false, explanation: "Close in spirit but not the exact quotient — (3/4) ÷ (1/2) simplifies to 1.5, not 2." }
    ]
  },
  {
    id: "q-rp1-3", standard: "MGSE7.RP.1", element: "b", dok: 2, type: "fill", skill: "Computing unit rates",
    prompt: "A car travels 180 miles in 3 hours. Its unit rate of speed is ___ miles per hour.",
    accepted: ["60", "60 mph", "60 miles per hour"],
    explanation: "180 miles ÷ 3 hours = 60 miles per hour — dividing total distance by total time gives the rate per 1 hour."
  },
  {
    id: "q-rp1-4", standard: "MGSE7.RP.1", element: "c", dok: 3, type: "multiselect", skill: "Comparing equivalent unit rates",
    prompt: "A store sells juice in three sizes: 2 quarts for $3.00, 3 quarts for $4.50, and 5 quarts for $8.00. Select every option that has the SAME unit price as 2 quarts for $3.00.",
    choices: [
      { text: "3 quarts for $4.50", correct: true, explanation: "Correct — $4.50 ÷ 3 = $1.50/quart, the same rate as $3.00 ÷ 2 = $1.50/quart." },
      { text: "5 quarts for $8.00", correct: false, explanation: "$8.00 ÷ 5 = $1.60/quart — close, but not equal to $1.50/quart, so this one should NOT be selected." },
      { text: "4 quarts for $6.00", correct: true, explanation: "Correct — $6.00 ÷ 4 = $1.50/quart, matching the original rate." },
      { text: "1 quart for $1.75", correct: false, explanation: "$1.75/quart is higher than $1.50/quart, so this should NOT be selected." }
    ]
  },

  // ---- MGSE7.NS.1 — rational numbers ----
  {
    id: "q-ns1-1", standard: "MGSE7.NS.1", element: "a", dok: 1, type: "mc", skill: "Adding rational numbers on a number line",
    prompt: "On a number line, adding a negative number moves you...",
    choices: [
      { text: "to the left", correct: true, explanation: "Correct — adding a negative number is the same as moving left (toward smaller values) on the number line." },
      { text: "to the right", correct: false, explanation: "Moving right corresponds to adding a positive number, not a negative one." },
      { text: "nowhere — the value stays the same", correct: false, explanation: "Adding any nonzero number changes position on the number line." },
      { text: "it depends on the starting number's sign", correct: false, explanation: "The direction of movement depends on the sign of the number being added, not the starting number." }
    ]
  },
  {
    id: "q-ns1-2", standard: "MGSE7.NS.1", element: "b", dok: 2, type: "mc", skill: "Adding/subtracting rational numbers in context",
    prompt: "The temperature was -4°F at 6am. By noon it had risen 15 degrees. What was the temperature at noon?",
    choices: [
      { text: "11°F", correct: true, explanation: "Correct — -4 + 15 = 11." },
      { text: "19°F", correct: false, explanation: "This adds the two numbers as if both were positive (4 + 15) instead of starting from -4." },
      { text: "-19°F", correct: false, explanation: "This treats the rise as a further drop — a temperature rise should be added, not subtracted." },
      { text: "-11°F", correct: false, explanation: "The sign is flipped — -4 + 15 lands on positive 11, not negative 11." }
    ]
  },
  {
    id: "q-ns1-3", standard: "MGSE7.NS.1", element: "b", dok: 2, type: "matching", skill: "Adding/subtracting rational numbers",
    prompt: "Match each expression to its correct sum.",
    pairs: [
      { left: "-3 + 7", right: "4", explanation: "-3 + 7 = 4 — moving 7 units right from -3 lands on 4." },
      { left: "-5 + (-2)", right: "-7", explanation: "-5 + (-2) = -7 — two negatives combine to a more negative sum." },
      { left: "6 + (-9)", right: "-3", explanation: "6 + (-9) = -3 — moving 9 units left from 6 lands on -3." }
    ]
  },

  // ---- MGSE7.EE.4 — equations & inequalities ----
  {
    id: "q-ee4-1", standard: "MGSE7.EE.4", element: "a", dok: 2, type: "mc", skill: "Writing equations from word problems",
    prompt: "A taxi charges a $3 flat fee plus $2 per mile. Which equation gives the total cost c for m miles?",
    choices: [
      { text: "c = 2m + 3", correct: true, explanation: "Correct — the flat $3 fee is added once, and $2 is multiplied by the number of miles." },
      { text: "c = 3m + 2", correct: false, explanation: "This charges $3 per mile plus a flat $2 fee — the rate and flat fee are swapped." },
      { text: "c = 2 + 3 + m", correct: false, explanation: "This just adds miles as a plain number instead of multiplying miles by the $2 rate." },
      { text: "c = 5m", correct: false, explanation: "This treats the whole $5 as a per-mile rate, ignoring that $3 is a one-time flat fee, not per mile." }
    ]
  },
  {
    id: "q-ee4-2", standard: "MGSE7.EE.4", element: "b", dok: 3, type: "mc", skill: "Solving and interpreting inequalities",
    prompt: "Maria has $40 and wants to buy books that cost $7 each. Which inequality correctly shows how many books b she can buy, and what's the most she can buy?",
    choices: [
      { text: "7b ≤ 40, so at most 5 books", correct: true, explanation: "Correct — 7b ≤ 40 gives b ≤ 5.71, and since she can't buy part of a book, the most she can buy is 5." },
      { text: "7b ≤ 40, so at most 6 books", correct: false, explanation: "The inequality is set up right, but 7 × 6 = 42 exceeds $40 — 6 books is too many." },
      { text: "7b ≥ 40, so at least 6 books", correct: false, explanation: "The inequality direction is backwards — she wants to spend no more than $40, which means ≤, not ≥." },
      { text: "b ≤ 40 − 7, so at most 33 books", correct: false, explanation: "This subtracts instead of dividing — the $7 cost applies per book, so it must divide into $40, not subtract from it." }
    ]
  },
  {
    id: "q-ee4-3", standard: "MGSE7.EE.4", element: "b", dok: 3, type: "fill", skill: "Solving multi-step equations",
    prompt: "Solve for x: 4x + 6 = 26. x = ___",
    accepted: ["5"],
    explanation: "4x + 6 = 26 → 4x = 20 → x = 5."
  },

  // ---- S7L2 — cells ----
  {
    id: "q-l2-1", standard: "S7L2", element: "a", dok: 1, type: "mc", skill: "Cell organelle functions",
    prompt: "Which organelle is often called the \"control center\" of the cell because it houses the cell's DNA?",
    choices: [
      { text: "Nucleus", correct: true, explanation: "Correct — the nucleus stores DNA and directs the cell's activities." },
      { text: "Mitochondria", correct: false, explanation: "Mitochondria produce energy (ATP) for the cell — they don't store the DNA that directs it." },
      { text: "Ribosome", correct: false, explanation: "Ribosomes build proteins; they don't store or manage the cell's genetic instructions." },
      { text: "Cell membrane", correct: false, explanation: "The cell membrane controls what enters/exits the cell — it's a boundary, not the DNA-storing control center." }
    ]
  },
  {
    id: "q-l2-2", standard: "S7L2", element: "a", dok: 2, type: "matching", skill: "Cell organelle functions",
    prompt: "Match each organelle to its main function.",
    pairs: [
      { left: "Mitochondria", right: "Produces energy for the cell", explanation: "Mitochondria break down nutrients to release usable energy (ATP)." },
      { left: "Ribosome", right: "Builds proteins", explanation: "Ribosomes read genetic instructions to assemble proteins." },
      { left: "Cell membrane", right: "Controls what enters and exits", explanation: "The cell membrane is selectively permeable, regulating movement in and out of the cell." }
    ]
  },
  {
    id: "q-l2-3", standard: "S7L2", element: "b", dok: 3, type: "mc", skill: "Predicting effects of cell malfunction",
    prompt: "If a muscle cell's mitochondria stopped functioning, what would you most likely predict?",
    choices: [
      { text: "The cell would have far less energy available and struggle to contract", correct: true, explanation: "Correct — mitochondria are the primary energy producers, so losing them would sharply limit the energy muscle cells need to contract." },
      { text: "The cell would be unable to control what enters or exits it", correct: false, explanation: "That function belongs to the cell membrane, not the mitochondria." },
      { text: "The cell would stop being able to build any proteins", correct: false, explanation: "Protein synthesis is the ribosome's job — mitochondria failing wouldn't directly stop that process, though the cell would eventually be affected by low energy." },
      { text: "There would be no noticeable effect on the cell", correct: false, explanation: "Mitochondria are essential for energy production, so their failure would have a significant, noticeable effect." }
    ]
  },

  // ---- S7L4 — ecosystems ----
  {
    id: "q-l4-1", standard: "S7L4", element: "a", dok: 1, type: "mc", skill: "Producers, consumers, decomposers",
    prompt: "In an ecosystem, an organism that makes its own food using sunlight is called a...",
    choices: [
      { text: "Producer", correct: true, explanation: "Correct — producers, like plants, use photosynthesis to make their own food from sunlight." },
      { text: "Consumer", correct: false, explanation: "Consumers eat other organisms for energy; they don't make their own food." },
      { text: "Decomposer", correct: false, explanation: "Decomposers break down dead organisms and waste — they don't produce food from sunlight." },
      { text: "Predator", correct: false, explanation: "A predator hunts other organisms for food — the opposite of making its own." }
    ]
  },
  {
    id: "q-l4-2", standard: "S7L4", element: "b", dok: 2, type: "mc", skill: "Interdependence in food webs",
    prompt: "In a food web, hawks eat snakes, and snakes eat mice. If the snake population suddenly dropped, what would most likely happen?",
    choices: [
      { text: "The mouse population would likely increase, and hawks would have less food", correct: true, explanation: "Correct — with fewer snakes to eat mice, mice increase; with fewer snakes for hawks to eat, hawks lose a food source." },
      { text: "Both mice and hawks would immediately die out", correct: false, explanation: "Too extreme — both species have other pressures and food sources; a sudden total die-off isn't the likely outcome." },
      { text: "The mouse population would decrease along with the snakes", correct: false, explanation: "Mice are eaten by snakes, so fewer snakes would reduce predation pressure on mice, not decrease their numbers." },
      { text: "Nothing would change — the species aren't connected", correct: false, explanation: "The scenario describes a direct predator-prey chain, so a change in one level does affect the others." }
    ]
  },
  {
    id: "q-l4-3", standard: "S7L4", element: "b", dok: 3, type: "multiselect", skill: "Factors disrupting ecosystems",
    prompt: "Select every factor below that could disrupt the interdependence of organisms within an ecosystem.",
    choices: [
      { text: "Introducing an invasive species with no natural predators", correct: true, explanation: "Correct — invasive species can outcompete native organisms and disrupt existing food webs." },
      { text: "A prolonged drought reducing plant growth", correct: true, explanation: "Correct — less plant growth reduces food for producers' consumers, rippling through the food web." },
      { text: "A stable, unchanging climate over many decades", correct: false, explanation: "A stable climate doesn't introduce disruption — this should NOT be selected." },
      { text: "Removal of a keystone predator", correct: true, explanation: "Correct — keystone predators help regulate prey populations; removing one can cause major imbalance." }
    ]
  },

  // ---- S7L5 — natural selection ----
  {
    id: "q-l5-1", standard: "S7L5", element: "a", dok: 2, type: "mc", skill: "Natural selection basics",
    prompt: "Which scenario is the best example of natural selection?",
    choices: [
      { text: "Beetles with better camouflage survive predators more often and pass on that trait", correct: true, explanation: "Correct — this shows a heritable trait affecting survival and reproduction, the core of natural selection." },
      { text: "A farmer deliberately breeds only the largest cows", correct: false, explanation: "This is artificial selection (human-directed breeding), not natural selection." },
      { text: "A single beetle changes color during its lifetime to hide from a predator", correct: false, explanation: "A trait changing within one individual's lifetime isn't natural selection — selection acts on heritable traits across generations." },
      { text: "All beetles in a population are identical and none are eaten", correct: false, explanation: "Natural selection requires variation in traits; with no variation, there's nothing for selection to act on." }
    ]
  },
  {
    id: "q-l5-2", standard: "S7L5", element: "b", dok: 3, type: "mc", skill: "Analyzing natural selection data",
    prompt: "Before a factory opened, 90% of a moth population was light-colored and 10% dark. After decades of soot darkening the trees, 80% of the population became dark-colored. What's the best explanation?",
    choices: [
      { text: "Dark moths were better camouflaged on soot-darkened trees, so they survived and reproduced more", correct: true, explanation: "Correct — this is a classic natural selection pattern: an environmental change favored a trait that already existed in the population, shifting the population over generations." },
      { text: "The moths intentionally changed their own color to match the trees", correct: false, explanation: "Individual organisms can't intentionally change their genetic traits — selection acts on existing variation across a population, not conscious choice." },
      { text: "All the light moths migrated away and were replaced by dark moths from elsewhere", correct: false, explanation: "The scenario gives no evidence of migration — the simplest explanation, and the classic textbook one, is selection acting on existing variation." },
      { text: "It was random chance with no relationship to the environment", correct: false, explanation: "A change this large, this consistently tied to the environmental shift (soot-darkened trees), points to selection, not random chance alone." }
    ]
  },

  // ---- SS8H6 — Civil War & Reconstruction in Georgia ----
  {
    id: "q-h6-1", standard: "SS8H6", element: "a", dok: 1, type: "mc", skill: "Georgia's pre-Civil War economy",
    prompt: "Before the Civil War, Georgia's economy was based mainly on...",
    choices: [
      { text: "Agriculture, especially cotton grown using enslaved labor", correct: true, explanation: "Correct — Georgia's antebellum economy centered on cotton plantations that relied on enslaved labor." },
      { text: "Manufacturing and heavy industry", correct: false, explanation: "The antebellum South, including Georgia, was much less industrialized than the North at this time." },
      { text: "Fishing and shipbuilding", correct: false, explanation: "These weren't Georgia's dominant pre-Civil War industries — agriculture was." },
      { text: "Technology and finance", correct: false, explanation: "These industries did not exist in this form in 19th-century Georgia." }
    ]
  },
  {
    id: "q-h6-2", standard: "SS8H6", element: "b", dok: 2, type: "mc", skill: "Effects of Sherman's March to the Sea",
    prompt: "What was a major effect of Sherman's March to the Sea on Georgia?",
    choices: [
      { text: "Widespread destruction of infrastructure, farms, and supply lines", correct: true, explanation: "Correct — Sherman's march deliberately destroyed railroads, crops, and property to cripple the Confederacy's ability to fight." },
      { text: "Georgia's economy grew rapidly during the march", correct: false, explanation: "The march caused severe destruction, not economic growth." },
      { text: "It had no lasting impact on the state", correct: false, explanation: "The march caused major, lasting damage to Georgia's infrastructure and economy." },
      { text: "It ended slavery in Georgia immediately by state law", correct: false, explanation: "The march was a military campaign, not a legal act — slavery's legal end came later, via the 13th Amendment." }
    ]
  },
  {
    id: "q-h6-3", standard: "SS8H6", element: "b", dok: 3, type: "fill", skill: "Reconstruction in Georgia",
    prompt: "The period after the Civil War when the South, including Georgia, rebuilt and rejoined the Union under new laws is called ___.",
    accepted: ["reconstruction", "the reconstruction", "reconstruction era"],
    explanation: "Reconstruction (roughly 1865-1877) was the period when former Confederate states, including Georgia, were reorganized and reintegrated into the United States under new political and social conditions."
  },

  // ---- SS8H8 — Georgia & the Constitution ----
  {
    id: "q-h8-1", standard: "SS8H8", element: "a", dok: 2, type: "mc", skill: "Georgia constitutional history",
    prompt: "The county unit system, later ruled unconstitutional, was significant in Georgia history because it...",
    choices: [
      { text: "Gave rural counties disproportionate voting power compared to their population", correct: true, explanation: "Correct — the county unit system weighted votes so smaller rural counties had outsized influence relative to their population, violating \"one person, one vote.\"" },
      { text: "Gave every county exactly equal representation regardless of population, which courts upheld", correct: false, explanation: "It did weight small counties more heavily, but courts eventually struck it down for violating equal representation principles, not upheld it." },
      { text: "Was a system for collecting county property taxes", correct: false, explanation: "It was a voting/representation system, not a tax collection system." },
      { text: "Only applied to electing the U.S. President, not state offices", correct: false, explanation: "It applied to Georgia's own primary elections for state offices, not just presidential voting." }
    ]
  },
  {
    id: "q-h8-2", standard: "SS8H8", element: "a", dok: 2, type: "matching", skill: "Georgia constitutional history",
    prompt: "Match each term to its description.",
    pairs: [
      { left: "County unit system", right: "Weighted votes that favored rural counties", explanation: "Ruled unconstitutional in Gray v. Sanders (1963) for violating equal representation." },
      { left: "14th Amendment", right: "Guarantees equal protection under the law", explanation: "Ratified after the Civil War, it applies constitutional protections to actions by states, including Georgia." },
      { left: "Reapportionment", right: "Redrawing districts to reflect population changes", explanation: "Required periodically so representation stays proportional as population shifts." }
    ]
  },

  // ---- SS8CG1 — GA government structure ----
  {
    id: "q-cg1-1", standard: "SS8CG1", element: "a", dok: 1, type: "mc", skill: "Branches of Georgia government",
    prompt: "Which branch of Georgia's government is responsible for making state laws?",
    choices: [
      { text: "Legislative branch (the General Assembly)", correct: true, explanation: "Correct — Georgia's General Assembly (House and Senate) is the legislative branch that writes and passes state laws." },
      { text: "Executive branch (the Governor)", correct: false, explanation: "The Governor enforces laws and can veto them, but doesn't write them — that's the legislature's role." },
      { text: "Judicial branch (the courts)", correct: false, explanation: "Courts interpret laws and rule on disputes; they don't create laws." },
      { text: "Local branch (county commissioners)", correct: false, explanation: "County commissioners handle local governance, not state-level lawmaking." }
    ]
  },
  {
    id: "q-cg1-2", standard: "SS8CG1", element: "b", dok: 2, type: "mc", skill: "Checks and balances in Georgia government",
    prompt: "If the Georgia General Assembly passes a bill but the Governor vetoes it, this is an example of...",
    choices: [
      { text: "Checks and balances between branches of government", correct: true, explanation: "Correct — the veto is the executive branch's check on the legislative branch's lawmaking power." },
      { text: "The judicial branch overturning a law", correct: false, explanation: "A veto comes from the Governor (executive branch), not the courts (judicial branch)." },
      { text: "An unconstitutional action by the Governor", correct: false, explanation: "Vetoing a bill is a normal, constitutional power the Governor holds — it isn't unconstitutional." },
      { text: "A local government overriding state law", correct: false, explanation: "This scenario is entirely at the state level — no local government is involved." }
    ]
  },

  // ---- ELAGSE7RL1 — citing textual evidence (literary) ----
  {
    id: "q-rl1-1", standard: "ELAGSE7RL1", element: "a", dok: 2, type: "mc", skill: "Citing textual evidence",
    prompt: "Passage: \"Maria's hands trembled as she read the letter twice, then folded it and slid it beneath her pillow without a word.\" Which detail BEST supports the inference that the letter's contents unsettled Maria?",
    choices: [
      { text: "\"her hands trembled\" and she hid the letter \"without a word\"", correct: true, explanation: "Correct — trembling hands and hiding the letter silently both directly support that the contents disturbed her." },
      { text: "She read the letter twice", correct: false, explanation: "Rereading alone could suggest many things (confusion, care) — it's weaker support than the trembling and silent hiding for \"unsettled.\"" },
      { text: "She folded the letter", correct: false, explanation: "Folding a letter is a neutral, ordinary action that doesn't by itself suggest being unsettled." },
      { text: "The letter was under her pillow", correct: false, explanation: "Location alone, without the trembling/silence detail, is weaker evidence for her emotional state." }
    ]
  },
  {
    id: "q-rl1-2", standard: "ELAGSE7RL1", element: "a", dok: 2, type: "fill", skill: "Citing textual evidence",
    prompt: "Using the same passage about Maria, type the short phrase that most directly shows she was physically nervous: \"her ___ trembled\"",
    accepted: ["hands"],
    explanation: "\"Her hands trembled\" is the direct physical detail showing nervousness — the most explicit textual evidence in the passage."
  },
  {
    id: "q-rl1-3", standard: "ELAGSE7RL1", element: "b", dok: 3, type: "mc", skill: "Evaluating strength of textual evidence",
    prompt: "A classmate claims Maria was excited, not unsettled, and cites \"she read the letter twice\" as evidence. Why is the trembling-hands detail STRONGER evidence than the classmate's choice?",
    choices: [
      { text: "Trembling hands is a specific physical reaction tied to nervousness, while rereading is ambiguous and could support several different emotions", correct: true, explanation: "Correct — strong textual evidence should narrow down the possible interpretations; \"trembling\" points more specifically toward nervousness than the ambiguous \"read it twice.\"" },
      { text: "It appears earlier in the sentence", correct: false, explanation: "Position in the sentence has no bearing on how strong a piece of evidence is." },
      { text: "It uses more words", correct: false, explanation: "Length isn't what makes evidence strong — specificity and how directly it supports the claim does." },
      { text: "Both pieces of evidence are equally strong", correct: false, explanation: "They aren't equal — trembling hands is far more specific to nervousness than rereading, which is ambiguous." }
    ]
  },

  // ---- ELAGSE7RI2 — central ideas (informational) ----
  {
    id: "q-ri2-1", standard: "ELAGSE7RI2", element: "a", dok: 1, type: "mc", skill: "Identifying the main idea",
    prompt: "The \"central idea\" of an informational text is best described as...",
    choices: [
      { text: "The most important overall point the text is making", correct: true, explanation: "Correct — the central idea is the key point the author wants readers to take away, supported by details throughout." },
      { text: "The very first sentence of the text", correct: false, explanation: "The central idea can appear anywhere, and often isn't stated directly in the first sentence." },
      { text: "Any interesting fact mentioned in the text", correct: false, explanation: "Interesting facts are often supporting details, not necessarily the central idea itself." },
      { text: "The title of the text", correct: false, explanation: "A title may hint at the topic but usually doesn't capture the full central idea on its own." }
    ]
  },
  {
    id: "q-ri2-2", standard: "ELAGSE7RI2", element: "b", dok: 2, type: "mc", skill: "Determining multiple central ideas",
    prompt: "An article discusses both how bees pollinate crops and how pesticide use is reducing bee populations. What's the best way to describe its central ideas?",
    choices: [
      { text: "Bees play a critical role in crop pollination, AND pesticide use is threatening bee populations", correct: true, explanation: "Correct — this captures both central ideas the article develops, not just one." },
      { text: "Bees are insects that live in hives", correct: false, explanation: "This is basic background information, not a central idea the article is developing." },
      { text: "Pesticides are chemicals used on farms", correct: false, explanation: "This is a definition/detail, not a central idea about the relationship between pesticides and bees." },
      { text: "Farmers grow many different kinds of crops", correct: false, explanation: "This is unrelated to the two central ideas about bees and pesticides described in the article." }
    ]
  },
  {
    id: "q-ri2-3", standard: "ELAGSE7RI2", element: "c", dok: 3, type: "multiselect", skill: "Distinguishing central ideas from supporting details",
    prompt: "From the bees/pesticides article above, select every statement that is a SUPPORTING DETAIL rather than a central idea.",
    choices: [
      { text: "One study found a 30% drop in a local bee population over five years", correct: true, explanation: "Correct — this is a specific supporting fact/statistic, not a central idea itself." },
      { text: "Pesticide use is threatening bee populations", correct: false, explanation: "This is one of the article's central ideas, not a supporting detail — it should NOT be selected." },
      { text: "Almonds are one crop that depends heavily on bee pollination", correct: true, explanation: "Correct — this is a specific example supporting the broader central idea about bees' role in pollination." },
      { text: "Bees play a critical role in crop pollination", correct: false, explanation: "This is the article's other central idea, not a supporting detail — it should NOT be selected." }
    ]
  },

  // ---- ELAGSE7L4 — context clues / vocabulary ----
  {
    id: "q-l4voc-1", standard: "ELAGSE7L4", element: "a", dok: 1, type: "mc", skill: "Using context clues",
    prompt: "\"The ravenous hikers devoured their sandwiches within minutes of reaching camp.\" Based on context, \"ravenous\" most likely means...",
    choices: [
      { text: "Extremely hungry", correct: true, explanation: "Correct — \"devoured\" and eating \"within minutes\" both signal extreme hunger." },
      { text: "Very tired", correct: false, explanation: "Nothing in the sentence points to tiredness — the clues (\"devoured,\" \"within minutes\") are about eating quickly, not fatigue." },
      { text: "Slightly annoyed", correct: false, explanation: "There's no context clue suggesting annoyance." },
      { text: "Well organized", correct: false, explanation: "\"Devoured their sandwiches\" doesn't relate to organization — it points to hunger." }
    ]
  },
  {
    id: "q-l4voc-2", standard: "ELAGSE7L4", element: "a", dok: 2, type: "mc", skill: "Using context clues",
    prompt: "\"Despite the coach's optimism, the team's dismal record made the playoffs seem impossible.\" What does \"dismal\" most likely mean here?",
    choices: [
      { text: "Very poor or discouraging", correct: true, explanation: "Correct — \"despite optimism\" and \"playoffs seem impossible\" both signal that \"dismal\" describes a bad record." },
      { text: "Surprisingly strong", correct: false, explanation: "This contradicts \"playoffs seem impossible,\" which signals the record was bad, not strong." },
      { text: "Recently updated", correct: false, explanation: "Nothing in the sentence relates to how recent the record is." },
      { text: "Well documented", correct: false, explanation: "The context is about the quality of the record (poor), not how well it's documented." }
    ]
  },
  {
    id: "q-l4voc-3", standard: "ELAGSE7L4", element: "a", dok: 2, type: "matching", skill: "Using context clues",
    prompt: "Match each bolded word to its meaning based on the context sentence.",
    pairs: [
      { left: "\"The candid response surprised everyone with its honesty.\"", right: "Honest and direct", explanation: "The sentence itself defines \"candid\" through \"its honesty.\"" },
      { left: "\"The ancient ruins were in a state of decay, crumbling with every storm.\"", right: "Breaking down or rotting", explanation: "\"Crumbling with every storm\" signals that \"decay\" means breaking down." },
      { left: "\"Her meticulous notes covered every possible detail.\"", right: "Extremely careful and precise", explanation: "\"Covered every possible detail\" signals that \"meticulous\" means very careful/thorough." }
    ]
  }
];
