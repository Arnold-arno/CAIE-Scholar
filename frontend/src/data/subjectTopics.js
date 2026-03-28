/**
 * subjectTopics.js — Predefined topic presets per Cambridge subject.
 * Keys match subject names from hub subject maps.
 * Each { label, query } — label shown in pill, query autofills topic field.
 */
const T = {
  'Mathematics': [
    { label:'Algebra',          query:'algebra expressions simplification' },
    { label:'Quadratics',       query:'quadratic equations factorisation completing the square' },
    { label:'Trigonometry',     query:'trigonometry SOHCAHTOA sine cosine tangent' },
    { label:'Probability',      query:'probability tree diagrams combined events' },
    { label:'Statistics',       query:'statistics mean median mode cumulative frequency histograms' },
    { label:'Circle Theorems',  query:'circle theorems geometric proofs' },
    { label:'Calculus',         query:'differentiation integration calculus' },
    { label:'Vectors',          query:'vectors column notation magnitude direction' },
    { label:'Functions',        query:'functions inverse composite domain range' },
    { label:'Sequences',        query:'sequences series nth term geometric arithmetic' },
    { label:'Matrices',         query:'matrices determinant inverse transformation' },
  ],
  'Physics': [
    { label:'Forces & Motion',  query:"forces Newton's laws momentum impulse" },
    { label:'Waves',            query:'waves reflection refraction diffraction interference' },
    { label:'Electricity',      query:"electricity circuits Ohm's law resistance power" },
    { label:'Energy',           query:'energy work power efficiency conservation' },
    { label:'Magnetism',        query:'magnetism electromagnetism motors generators induction' },
    { label:'Radioactivity',    query:'radioactivity nuclear decay half-life radiation' },
    { label:'Thermal Physics',  query:'thermal physics heat specific heat capacity latent heat' },
    { label:'Pressure',         query:'pressure density fluids Archimedes upthrust' },
    { label:'Light & Optics',   query:'light optics lenses mirrors total internal reflection' },
    { label:'Space',            query:'space stars solar system universe gravity' },
  ],
  'Chemistry': [
    { label:'Atomic Structure', query:'atomic structure electron configuration periodic table' },
    { label:'Bonding',          query:'ionic covalent metallic bonding structures' },
    { label:'Rates & Equilib.', query:'rates of reaction equilibrium Le Chatelier' },
    { label:'Acids & Bases',    query:'acids bases salts neutralisation pH indicators' },
    { label:'Organic Chem.',    query:'organic chemistry alkanes alkenes functional groups polymers' },
    { label:'Electrochemistry', query:'electrolysis redox reactions electrochemical cells' },
    { label:'Energetics',       query:"energetics enthalpy Hess's law bond energies" },
    { label:'Metals',           query:'metals reactivity series extraction corrosion' },
    { label:'Mole Calculations',query:'mole calculations stoichiometry empirical formula' },
    { label:'Separation',       query:'separation techniques chromatography distillation filtration' },
  ],
  'Biology': [
    { label:'Cell Biology',     query:'cell structure organelles plant animal prokaryotic' },
    { label:'Photosynthesis',   query:'photosynthesis light reactions Calvin cycle chloroplast' },
    { label:'Respiration',      query:'aerobic anaerobic respiration ATP Krebs cycle' },
    { label:'Genetics & DNA',   query:'genetics inheritance DNA replication alleles genotype' },
    { label:'Evolution',        query:'evolution natural selection adaptation speciation' },
    { label:'Circulation',      query:'circulatory system heart blood vessels transport' },
    { label:'Digestion',        query:'digestion enzymes absorption alimentary canal villi' },
    { label:'Nervous System',   query:'nervous system neurons reflexes brain coordination hormones' },
    { label:'Reproduction',     query:'reproduction fertilisation sexual asexual mitosis meiosis' },
    { label:'Ecology',          query:'ecology ecosystems food webs nutrient cycles biodiversity' },
  ],
  'English - First Language': [
    { label:'Directed Writing', query:'directed writing summary form purpose audience' },
    { label:'Comprehension',    query:"comprehension inference analysis writer's effects" },
    { label:'Narrative Writing',query:'narrative creative writing structure character development' },
    { label:'Descriptive',      query:'descriptive writing sensory imagery figurative language' },
    { label:'Persuasive',       query:'persuasive writing rhetoric argument counter-argument' },
    { label:'Language Analysis',query:"language analysis writer's techniques stylistic devices" },
  ],
  'Computer Science': [
    { label:'Programming',      query:'programming pseudocode algorithms control structures' },
    { label:'Data Structures',  query:'arrays linked lists stacks queues data structures' },
    { label:'Networking',       query:'networking protocols TCP/IP OSI model internet' },
    { label:'Databases',        query:'databases SQL queries relational normalisation' },
    { label:'Boolean Logic',    query:'Boolean logic gates truth tables combinational circuits' },
    { label:'Binary & Hex',     query:'binary hexadecimal number systems two\'s complement' },
    { label:'Cybersecurity',    query:'cybersecurity encryption malware authentication' },
    { label:'OOP',              query:'object-oriented programming classes inheritance encapsulation' },
  ],
  'Economics': [
    { label:'Supply & Demand',  query:'supply demand equilibrium price elasticity' },
    { label:'Market Structures',query:'monopoly oligopoly perfect competition market power' },
    { label:'Macroeconomics',   query:'GDP inflation unemployment economic growth' },
    { label:'Trade',            query:'international trade comparative advantage protectionism' },
    { label:'Fiscal Policy',    query:'fiscal policy government spending taxation multiplier' },
    { label:'Monetary Policy',  query:'monetary policy interest rates money supply central bank' },
    { label:'Development',      query:'economic development HDI poverty inequality' },
  ],
  'History': [
    { label:'World War I',      query:'World War One causes Western Front trench warfare armistice' },
    { label:'World War II',     query:'World War Two Nazi Germany Holocaust Allies D-Day' },
    { label:'Cold War',         query:'Cold War USA USSR arms race Cuban Missile Crisis Berlin Wall' },
    { label:'Rise of Hitler',   query:'Weimar Republic Hitler rise Nazi Germany hyperinflation' },
    { label:'League of Nations',query:'League of Nations failures collective security interwar' },
    { label:'Russian Revolution',query:'Russian Revolution 1917 Bolsheviks Lenin Stalin' },
  ],
  'Geography': [
    { label:'Rivers',           query:'river processes erosion deposition transportation landforms' },
    { label:'Coasts',           query:'coastal processes erosion deposition management strategies' },
    { label:'Population',       query:'population growth migration demographic transition urbanisation' },
    { label:'Climate Change',   query:'climate change greenhouse gases mitigation adaptation' },
    { label:'Earthquakes',      query:'tectonic hazards earthquakes volcanoes plate boundaries' },
    { label:'Development',      query:'development indicators HDI Brandt Line strategies' },
    { label:'Ecosystems',       query:'tropical rainforests biomes ecosystems sustainability' },
  ],
  'Business Studies': [
    { label:'Marketing Mix',    query:'marketing mix 4Ps product price place promotion' },
    { label:'Finance',          query:'profit loss cash flow balance sheet ratio analysis' },
    { label:'Human Resources',  query:'motivation theories leadership styles HR management' },
    { label:'Operations',       query:'production methods quality control lean operations' },
    { label:'Business Types',   query:'sole trader partnership limited company PLC' },
    { label:'Globalisation',    query:'globalisation multinational corporations trade barriers' },
  ],
  'Accounting': [
    { label:'Double Entry',     query:'double entry bookkeeping debit credit journal entries' },
    { label:'Financial Stmts',  query:'income statement balance sheet trial balance' },
    { label:'Ratios',           query:'financial ratios profitability liquidity efficiency' },
    { label:'Cash Flow',        query:'cash flow statement forecasting working capital' },
    { label:'Depreciation',     query:'depreciation straight-line reducing balance method' },
    { label:'Partnerships',     query:'partnership accounts appropriation goodwill revaluation' },
  ],
  'Psychology': [
    { label:'Memory',           query:'memory models multi-store working memory encoding retrieval' },
    { label:'Attachment',       query:'attachment theory Bowlby Ainsworth Strange Situation' },
    { label:'Research Methods', query:'research methods experiments validity reliability ethics' },
    { label:'Social Influence', query:'social influence conformity obedience Milgram Asch' },
    { label:'Psychopathology',  query:'psychopathology depression OCD phobias definitions' },
    { label:'Biopsychology',    query:'biopsychology nervous system neurons brain localisation' },
    { label:'Cognition',        query:'cognitive psychology perception attention schemas' },
  ],
  'Sociology': [
    { label:'Education',        query:'sociology education achievement gender ethnicity class' },
    { label:'Crime & Deviance', query:'crime deviance social control labelling theory' },
    { label:'Families',         query:'family types diversity changing patterns sociology' },
    { label:'Research Methods', query:'sociological methods interviews surveys ethnography' },
    { label:'Stratification',   query:'social class inequality stratification life chances' },
    { label:'Religion',         query:'religion secularisation fundamentalism sociology' },
  ],
};

// Aliases
T['Mathematics - Additional']    = T['Mathematics'];
T['English - Second Language']   = T['English - First Language'];
T['English Language']            = T['English - First Language'];
T['English - Literature']        = [
  { label:'Poetry',             query:'poetry analysis techniques imagery themes form structure' },
  { label:'Prose Fiction',      query:'prose fiction narrative characterisation setting themes' },
  { label:'Drama',              query:'drama stagecraft character conflict dramatic techniques' },
  { label:'Unseen Text',        query:'unseen text close reading language effects writer purpose' },
];
T['Science - Combined']          = [...T['Biology'].slice(0,3), ...T['Chemistry'].slice(0,3), ...T['Physics'].slice(0,3)];
T['Co-ordinated Sciences']       = T['Science - Combined'];
T['ICT']                         = T['Computer Science'];

export default T;
