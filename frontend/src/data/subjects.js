/**
 * subjects.js — Complete Cambridge subject list for all three levels.
 *
 * IGCSE:    0xxx codes  — 50+ subjects
 * AS/A-Level: 9xxx codes — 40+ subjects
 * O-Level:  2xxx/4xxx/5xxx/7xxx codes — 30+ subjects
 *
 * Used by: SearchableSubjectSelect, QuestionSearch, hubs, AI Notes, Onboarding.
 */

// ── IGCSE ─────────────────────────────────────────────────────────────────────
export const IGCSE_SUBJECTS = {
  // Sciences
  'Biology':                        { code:'0610', papers:{ 'Paper 1 — MC Core':'11','Paper 2 — MC Extended':'21','Paper 3 — Core Theory':'31','Paper 4 — Extended Theory':'41','Paper 5 — Practical':'51','Paper 6 — Alternative to Practical':'61' } },
  'Chemistry':                      { code:'0620', papers:{ 'Paper 1 — MC Core':'11','Paper 2 — MC Extended':'21','Paper 3 — Core Theory':'31','Paper 4 — Extended Theory':'41','Paper 5 — Practical':'51','Paper 6 — Alternative to Practical':'61' } },
  'Physics':                        { code:'0625', papers:{ 'Paper 1 — MC Core':'11','Paper 2 — MC Extended':'21','Paper 3 — Core Theory':'31','Paper 4 — Extended Theory':'41','Paper 5 — Practical':'51','Paper 6 — Alternative to Practical':'61' } },
  'Co-ordinated Sciences (Double)': { code:'0654', papers:{ 'Paper 1 — Multiple Choice':'11','Paper 2 — Core Theory':'21','Paper 3 — Extended Theory':'31','Paper 4 — Alternative to Practical':'41','Paper 5 — Practical':'51' } },
  'Science - Combined':             { code:'0653', papers:{ 'Paper 1':'11','Paper 2':'21','Paper 3':'31','Paper 4':'41' } },
  'Environmental Management':       { code:'0680', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Agriculture':                    { code:'0600', papers:{ 'Paper 1':'11','Paper 2':'21','Paper 3 — Practical':'31' } },
  'Marine Science':                 { code:'0697', papers:{ 'Paper 1':'11','Paper 2':'21' } },

  // Mathematics
  'Mathematics':                    { code:'0580', papers:{ 'Paper 1 — Core Short Answer':'11','Paper 2 — Extended Short Answer':'21','Paper 3 — Core Problem Solving':'31','Paper 4 — Extended Problem Solving':'41' } },
  'Mathematics - Additional':       { code:'0606', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Mathematics - International':    { code:'0607', papers:{ 'Paper 1':'11','Paper 2':'21','Paper 3':'31','Paper 4':'41','Paper 5':'51','Paper 6':'61' } },

  // English & Languages
  'English - First Language':       { code:'0500', papers:{ 'Paper 1 — Reading':'11','Paper 2 — Directed Writing & Composition':'21' } },
  'English - Second Language':      { code:'0510', papers:{ 'Paper 1 — Core':'11','Paper 2 — Extended':'21','Paper 3 — Listening Core':'31','Paper 4 — Listening Extended':'41' } },
  'English - Literature':           { code:'0486', papers:{ 'Paper 1 — Poetry & Prose':'11','Paper 2 — Drama':'21' } },
  'World Literature':               { code:'0408', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Arabic - First Language':        { code:'0508', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Arabic - Foreign Language':      { code:'0544', papers:{ 'Paper 1 — Listening':'11','Paper 2 — Reading':'21','Paper 3 — Speaking':'31','Paper 4 — Writing':'41' } },
  'Chinese - First Language':       { code:'0509', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Chinese - Second Language':      { code:'0523', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Dutch - Foreign Language':       { code:'0515', papers:{ 'Paper 1 — Listening':'11','Paper 2 — Reading':'21','Paper 3 — Speaking':'31','Paper 4 — Writing':'41' } },
  'French - Foreign Language':      { code:'0520', papers:{ 'Paper 1 — Listening':'11','Paper 2 — Reading':'21','Paper 3 — Speaking':'31','Paper 4 — Writing':'41' } },
  'German - Foreign Language':      { code:'0525', papers:{ 'Paper 1 — Listening':'11','Paper 2 — Reading':'21','Paper 3 — Speaking':'31','Paper 4 — Writing':'41' } },
  'Hindi as a Second Language':     { code:'0549', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Malay - Foreign Language':       { code:'0546', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Portuguese - Foreign Language':  { code:'0540', papers:{ 'Paper 1 — Listening':'11','Paper 2 — Reading':'21','Paper 3 — Speaking':'31','Paper 4 — Writing':'41' } },
  'Spanish - First Language':       { code:'0502', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Spanish - Foreign Language':     { code:'0530', papers:{ 'Paper 1 — Listening':'11','Paper 2 — Reading':'21','Paper 3 — Speaking':'31','Paper 4 — Writing':'41' } },
  'Urdu as a Second Language':      { code:'0539', papers:{ 'Paper 1':'11','Paper 2':'21' } },

  // Humanities & Social Sciences
  'History':                        { code:'0470', papers:{ 'Paper 1 — Core Content':'11','Paper 2 — Depth Study':'21','Paper 4 — Alternative to Coursework':'41' } },
  'Geography':                      { code:'0460', papers:{ 'Paper 1 — Geographical Themes':'11','Paper 2 — Geographical Skills':'21','Paper 4 — Alternative to Coursework':'41' } },
  'Economics':                      { code:'0455', papers:{ 'Paper 1 — Multiple Choice':'11','Paper 2 — Structured Questions':'21' } },
  'Sociology':                      { code:'0495', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Religious Studies':              { code:'0490', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Islamic Studies':                { code:'0493', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Global Perspectives':            { code:'0457', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Travel & Tourism':               { code:'0471', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Development Studies':            { code:'0453', papers:{ 'Paper 1':'11','Paper 2':'21' } },

  // Business & Technology
  'Business Studies':               { code:'0450', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Accounting':                     { code:'0452', papers:{ 'Paper 1 — Multiple Choice':'11','Paper 2 — Structured Questions':'21' } },
  'Economics & Business Studies':   { code:'0448', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Enterprise':                     { code:'0454', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Computer Science':               { code:'0478', papers:{ 'Paper 1 — Theory':'11','Paper 2 — Problem Solving':'21' } },
  'ICT':                            { code:'0417', papers:{ 'Paper 1 — Theory':'11','Paper 2 — Practical':'21','Paper 3 — Practical':'31' } },

  // Creative & Vocational
  'Art & Design':                   { code:'0400', papers:{ 'Paper 1 — Portfolio':'11','Paper 2 — Examination':'21' } },
  'Design & Technology':            { code:'0445', papers:{ 'Paper 1 — Theory':'11','Paper 2 — Coursework':'21' } },
  'Drama':                          { code:'0411', papers:{ 'Paper 1 — Practical':'11','Paper 2 — Written':'21' } },
  'Food & Nutrition':               { code:'0648', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Music':                          { code:'0410', papers:{ 'Paper 1 — Listening':'11','Paper 2 — Performing':'21','Paper 3 — Composing':'31' } },
  'Physical Education':             { code:'0413', papers:{ 'Paper 1 — Theory':'11','Paper 2 — Practical':'21' } },
  'Textiles':                       { code:'0441', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Child Development':              { code:'0637', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Health Science':                 { code:'0646', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Psychology':                     { code:'0478', papers:{ 'Paper 1':'11','Paper 2':'21' } },
};

// ── AS & A-Level ──────────────────────────────────────────────────────────────
export const AS_LEVEL_SUBJECTS = {
  // Sciences
  'Biology':                        { code:'9700', papers:{ 'Paper 1 — Multiple Choice':'11','Paper 2 — AS Structured Questions':'21','Paper 3 — Advanced Practical':'31','Paper 4 — A Level Structured Questions':'41','Paper 5 — Planning, Analysis & Evaluation':'51' } },
  'Chemistry':                      { code:'9701', papers:{ 'Paper 1 — Multiple Choice':'11','Paper 2 — AS Structured Questions':'21','Paper 3 — Advanced Practical':'31','Paper 4 — A Level Structured Questions':'41','Paper 5 — Planning, Analysis & Evaluation':'51' } },
  'Physics':                        { code:'9702', papers:{ 'Paper 1 — Multiple Choice':'11','Paper 2 — AS Structured Questions':'21','Paper 3 — Advanced Practical':'31','Paper 4 — A Level Structured Questions':'41','Paper 5 — Planning, Analysis & Evaluation':'51' } },
  'Environmental Management':       { code:'8291', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Marine Science':                 { code:'9693', papers:{ 'Paper 1':'11','Paper 2':'21','Paper 3':'31','Paper 4':'41' } },

  // Mathematics & Computer Science
  'Mathematics':                    { code:'9709', papers:{ 'Paper 1 — Pure Mathematics 1':'11','Paper 2 — Pure Mathematics 2':'21','Paper 3 — Pure Mathematics 3':'31','Paper 4 — Mechanics':'41','Paper 5 — Probability & Statistics 1':'51','Paper 6 — Probability & Statistics 2':'61' } },
  'Further Mathematics':            { code:'9231', papers:{ 'Paper 1 — Further Pure Maths 1':'11','Paper 2 — Further Pure Maths 2':'21','Paper 3 — Further Mechanics':'31','Paper 4 — Further Statistics':'41' } },
  'Computer Science':               { code:'9618', papers:{ 'Paper 1 — Theory Fundamentals':'11','Paper 2 — Fundamental Problem Solving':'21','Paper 3 — Advanced Theory':'31','Paper 4 — Advanced Problem Solving & Programming':'41' } },
  'Information Technology':         { code:'9626', papers:{ 'Paper 1 — Theory':'11','Paper 2 — Practical':'21','Paper 3 — Advanced Theory':'31','Paper 4 — Advanced Practical':'41' } },

  // English & Languages
  'English Language':               { code:'9093', papers:{ 'Paper 1 — Reading':'11','Paper 2 — Writing':'21','Paper 3 — Text Analysis':'31','Paper 4 — Language Topics':'41' } },
  'English Literature':             { code:'9695', papers:{ 'Paper 1 — Poetry & Prose':'11','Paper 2 — Drama & Poetry':'21','Paper 3 — Poetry & Prose (A2)':'31','Paper 4 — Drama (A2)':'41' } },
  'English Language & Literature':  { code:'9092', papers:{ 'Paper 1':'11','Paper 2':'21','Paper 3':'31' } },
  'Arabic':                         { code:'9680', papers:{ 'Paper 1 — Reading':'11','Paper 2 — Writing':'21','Paper 3 — Listening':'31','Paper 4 — Speaking':'41' } },
  'Chinese (A Level)':              { code:'9715', papers:{ 'Paper 1':'11','Paper 2':'21','Paper 3':'31' } },
  'French':                         { code:'9716', papers:{ 'Paper 1 — Listening, Reading & Writing':'11','Paper 2 — Writing':'21','Paper 3 — Speaking':'31','Paper 4 — Literature':'41' } },
  'German':                         { code:'9717', papers:{ 'Paper 1 — Listening, Reading & Writing':'11','Paper 2 — Writing':'21','Paper 3 — Speaking':'31','Paper 4 — Literature':'41' } },
  'Spanish':                        { code:'9719', papers:{ 'Paper 1 — Listening, Reading & Writing':'11','Paper 2 — Writing':'21','Paper 3 — Speaking':'31','Paper 4 — Literature':'41' } },
  'Portuguese':                     { code:'9718', papers:{ 'Paper 1':'11','Paper 2':'21','Paper 3':'31' } },
  'Hindi':                          { code:'9687', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Urdu':                           { code:'9676', papers:{ 'Paper 1':'11','Paper 2':'21','Paper 3':'31' } },

  // Humanities & Social Sciences
  'History':                        { code:'9489', papers:{ 'Paper 1 — Interpretations':'11','Paper 2 — Outline Study':'21','Paper 3 — Source-based':'31','Paper 4 — Thematic Essay':'41' } },
  'Geography':                      { code:'9696', papers:{ 'Paper 1 — Core Physical & Human':'11','Paper 2 — Advanced Physical Options':'21','Paper 3 — Advanced Human Options':'31','Paper 4 — Geographical Skills & Investigation':'41' } },
  'Economics':                      { code:'9708', papers:{ 'Paper 1 — Multiple Choice AS':'11','Paper 2 — Data Response AS':'21','Paper 3 — Multiple Choice A2':'31','Paper 4 — Data Response & Essays A2':'41' } },
  'Sociology':                      { code:'9699', papers:{ 'Paper 1 — Socialisation, Identity & Methods':'11','Paper 2 — Social Inequalities':'21','Paper 3 — Global Development':'31' } },
  'Psychology':                     { code:'9990', papers:{ 'Paper 1 — Approaches in Psychology':'11','Paper 2 — Core Studies':'21','Paper 3 — Research Methods':'31','Paper 4 — Psychological Skills':'41' } },
  'Law':                            { code:'9084', papers:{ 'Paper 1 — Paper 1':'11','Paper 2 — Paper 2':'21','Paper 3 — Paper 3':'31','Paper 4 — Paper 4':'41' } },
  'Global Perspectives & Research': { code:'9239', papers:{ 'Paper 1 — Written Examination':'11','Paper 2 — Research Report':'21','Paper 3 — Team Project':'31' } },
  'Religious Studies':              { code:'9011', papers:{ 'Paper 1':'11','Paper 2':'21','Paper 3':'31','Paper 4':'41' } },
  'Thinking Skills':                { code:'9694', papers:{ 'Paper 1 — Thinking Skills Assessment':'11','Paper 2 — Critical Thinking':'21','Paper 3 — Problem Analysis & Solution':'31','Paper 4 — Applied Reasoning':'41' } },
  'Travel & Tourism':               { code:'9395', papers:{ 'Paper 1 — Core Paper':'11','Paper 2 — Options Paper':'21','Paper 3 — Decision Making':'31' } },

  // Business
  'Business':                       { code:'9609', papers:{ 'Paper 1 — Short Answer & Essay AS':'11','Paper 2 — Data Response AS':'21','Paper 3 — Case Study A2':'31','Paper 4 — Research-based Essay':'41' } },
  'Accounting':                     { code:'9706', papers:{ 'Paper 1 — Multiple Choice':'11','Paper 2 — Structured Questions AS':'21','Paper 3 — Structured Questions A2':'31','Paper 4 — Problem Solving':'41' } },
  'Management of Business':         { code:'9626', papers:{ 'Paper 1':'11','Paper 2':'21' } },

  // Creative
  'Art & Design':                   { code:'9479', papers:{ 'Paper 1 — Portfolio':'11','Paper 2 — Examination':'21','Paper 3 — A Level Portfolio':'31' } },
  'Drama':                          { code:'9482', papers:{ 'Paper 1':'11','Paper 2':'21','Paper 3':'31' } },
  'Music':                          { code:'9483', papers:{ 'Paper 1 — Listening':'11','Paper 2 — Composing':'21','Paper 3 — Appraising':'31','Paper 4 — Performing':'41' } },
  'Physical Education':             { code:'9396', papers:{ 'Paper 1 — Theory & Concepts':'11','Paper 2 — Application of Theory':'21','Paper 3 — Evaluating & Planning':'31','Paper 4 — Practical':'41' } },
  'Design & Technology':            { code:'9705', papers:{ 'Paper 1 — Theory':'11','Paper 2 — Practical & Project':'21' } },
  'Food Science & Technology':      { code:'9336', papers:{ 'Paper 1':'11','Paper 2':'21','Paper 3':'31' } },
};

// ── O-Level ───────────────────────────────────────────────────────────────────
export const O_LEVEL_SUBJECTS = {
  // Sciences
  'Biology':                        { code:'5090', papers:{ 'Paper 1 — Multiple Choice':'11','Paper 2 — Theory':'21','Paper 3 — Practical':'31' } },
  'Chemistry':                      { code:'5070', papers:{ 'Paper 1 — Multiple Choice':'11','Paper 2 — Theory':'21','Paper 3 — Practical':'31' } },
  'Physics':                        { code:'5054', papers:{ 'Paper 1 — Multiple Choice':'11','Paper 2 — Theory':'21','Paper 3 — Practical':'31' } },
  'Combined Science':               { code:'5129', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Agriculture':                    { code:'5038', papers:{ 'Paper 1':'11','Paper 2':'21' } },

  // Mathematics
  'Mathematics':                    { code:'4024', papers:{ 'Paper 1 — Short Answer':'11','Paper 2 — Structured Questions':'21' } },
  'Additional Mathematics':         { code:'4037', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Statistics':                     { code:'4040', papers:{ 'Paper 1':'11','Paper 2':'21' } },

  // English & Languages
  'English Language':               { code:'1123', papers:{ 'Paper 1 — Reading':'11','Paper 2 — Writing':'21' } },
  'Literature in English':          { code:'2010', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Arabic':                         { code:'3180', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Chinese':                        { code:'1190', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'French':                         { code:'3015', papers:{ 'Paper 1 — Listening':'11','Paper 2 — Reading & Writing':'21' } },
  'German':                         { code:'3025', papers:{ 'Paper 1 — Listening':'11','Paper 2 — Reading & Writing':'21' } },
  'Hindi':                          { code:'2055', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Malay':                          { code:'1119', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Spanish':                        { code:'3035', papers:{ 'Paper 1 — Listening':'11','Paper 2 — Reading & Writing':'21' } },
  'Tamil':                          { code:'2254', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Urdu':                           { code:'3247', papers:{ 'Paper 1':'11','Paper 2':'21' } },

  // Humanities & Social Sciences
  'History':                        { code:'2147', papers:{ 'Paper 1 — World Affairs 1917–1991':'11','Paper 2 — Local & Regional History':'21' } },
  'Geography':                      { code:'2217', papers:{ 'Paper 1 — Core Geography':'11','Paper 2 — Geographical Themes':'21' } },
  'Economics':                      { code:'2281', papers:{ 'Paper 1 — Multiple Choice':'11','Paper 2 — Structured Questions':'21' } },
  'Sociology':                      { code:'2251', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Religious Knowledge (Islam)':    { code:'2056', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Religious Knowledge (Christian)':{ code:'2048', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Islamic Studies':                { code:'2058', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Pakistan Studies':               { code:'2059', papers:{ 'Paper 1 — History & Culture':'11','Paper 2 — Geography':'21' } },

  // Business & Technology
  'Commerce':                       { code:'7100', papers:{ 'Paper 1 — Multiple Choice':'11','Paper 2 — Structured Questions':'21' } },
  'Principles of Accounts':         { code:'7110', papers:{ 'Paper 1 — Multiple Choice':'11','Paper 2 — Structured Questions':'21' } },
  'Economics & Business Studies':   { code:'7115', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Business Studies':               { code:'7115', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Computer Science':               { code:'2210', papers:{ 'Paper 1 — Theory':'11','Paper 2 — Problem Solving & Programming':'21' } },
  'Information & Communication Technology': { code:'2210', papers:{ 'Paper 1':'11','Paper 2':'21' } },

  // Creative & Vocational
  'Art & Design':                   { code:'6010', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Design & Technology':            { code:'6043', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Food & Nutrition':               { code:'6065', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Physical Education':             { code:'5329', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Music':                          { code:'6065', papers:{ 'Paper 1 — Listening':'11','Paper 2 — Performing/Composing':'21' } },
  'Child Development':              { code:'6045', papers:{ 'Paper 1':'11','Paper 2':'21' } },
  'Textiles':                       { code:'6047', papers:{ 'Paper 1':'11','Paper 2':'21' } },
};

/** Convert a rich subject map to the legacy { name: code } format used by older components. */
export function toCodeMap(richMap) {
  return Object.fromEntries(Object.entries(richMap).map(([name, v]) => [name, v.code]));
}
