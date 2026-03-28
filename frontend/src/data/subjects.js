/**
 * subjects.js — Single source of truth for all Cambridge subjects.
 * Format: { code: string, papers: { "Paper label": "number" } }
 * This mirrors the backend subjects.py exactly.
 * Used by: SearchableSubjectSelect, QuestionSearch, all three hubs, AI Notes, Onboarding.
 */

export const IGCSE_SUBJECTS = {
  'Accounting':                  { code:'0452', papers:{ 'Paper 1 — Multiple Choice':'11', 'Paper 2 — Structured Questions':'21' } },
  'Agriculture':                 { code:'0600', papers:{ 'Paper 1':'11', 'Paper 2':'21', 'Paper 3':'31' } },
  'Art & Design':                { code:'0400', papers:{} },
  'Biology':                     { code:'0610', papers:{ 'Paper 1 — MC Core':'11', 'Paper 2 — MC Extended':'21', 'Paper 3 — Core Theory':'31', 'Paper 4 — Extended Theory':'41', 'Paper 5 — Practical':'51', 'Paper 6 — Alternative':'61' } },
  'Business Studies':            { code:'0450', papers:{ 'Paper 1':'11', 'Paper 2':'21' } },
  'Chemistry':                   { code:'0620', papers:{ 'Paper 1 — MC Core':'11', 'Paper 2 — MC Extended':'21', 'Paper 3 — Core Theory':'31', 'Paper 4 — Extended Theory':'41', 'Paper 5 — Practical':'51', 'Paper 6 — Alternative':'61' } },
  'Computer Science':            { code:'0478', papers:{ 'Paper 1 — Theory (Systems)':'11', 'Paper 2 — Problem Solving':'21' } },
  'Co-ordinated Sciences':       { code:'0654', papers:{ 'Paper 1':'11', 'Paper 2':'21', 'Paper 3':'31', 'Paper 4':'41' } },
  'Design & Technology':         { code:'0445', papers:{ 'Paper 1':'11', 'Paper 2':'21' } },
  'Economics':                   { code:'0455', papers:{ 'Paper 1 — Multiple Choice':'11', 'Paper 2 — Structured Questions':'21' } },
  'English - First Language':    { code:'0500', papers:{ 'Paper 1 — Reading':'11', 'Paper 2 — Writing':'21' } },
  'English - Second Language':   { code:'0510', papers:{ 'Paper 1 — Core':'11', 'Paper 2 — Extended':'21' } },
  'English - Literature':        { code:'0486', papers:{ 'Paper 1':'11', 'Paper 2':'21' } },
  'Enterprise':                  { code:'0454', papers:{ 'Paper 1':'11', 'Paper 2':'21' } },
  'Environmental Management':    { code:'0680', papers:{ 'Paper 1':'11', 'Paper 2':'21' } },
  'Food & Nutrition':            { code:'0648', papers:{ 'Paper 1':'11', 'Paper 2':'21' } },
  'French - Foreign Language':   { code:'0520', papers:{ 'Paper 1 — Listening':'11', 'Paper 2 — Reading':'21', 'Paper 3 — Speaking':'31', 'Paper 4 — Writing':'41' } },
  'Geography':                   { code:'0460', papers:{ 'Paper 1 — Geographical Themes':'11', 'Paper 2 — Geographical Skills':'21', 'Paper 4 — Alternative':'41' } },
  'German - Foreign Language':   { code:'0525', papers:{ 'Paper 1 — Listening':'11', 'Paper 2 — Reading':'21', 'Paper 3 — Speaking':'31', 'Paper 4 — Writing':'41' } },
  'Global Perspectives':         { code:'0457', papers:{ 'Paper 1':'11', 'Paper 2':'21' } },
  'History':                     { code:'0470', papers:{ 'Paper 1 — Core Content':'11', 'Paper 2 — Depth Study':'21', 'Paper 4 — Alternative':'41' } },
  'ICT':                         { code:'0417', papers:{ 'Paper 1 — Theory':'11', 'Paper 2 — Practical':'21', 'Paper 3':'31' } },
  'Islamic Studies':             { code:'0493', papers:{ 'Paper 1':'11', 'Paper 2':'21' } },
  'Mathematics':                 { code:'0580', papers:{ 'Paper 1 — Core Short Answer':'11', 'Paper 2 — Extended Short Answer':'21', 'Paper 3 — Core Problem Solving':'31', 'Paper 4 — Extended Problem Solving':'41' } },
  'Mathematics - Additional':    { code:'0606', papers:{ 'Paper 1':'11', 'Paper 2':'21' } },
  'Mathematics - International': { code:'0607', papers:{ 'Paper 1':'11', 'Paper 2':'21', 'Paper 3':'31', 'Paper 4':'41' } },
  'Music':                       { code:'0410', papers:{ 'Paper 1 — Listening':'11', 'Paper 2 — Performing':'21', 'Paper 3 — Composing':'31' } },
  'Physical Education':          { code:'0413', papers:{ 'Paper 1 — Theory':'11', 'Paper 2 — Practical':'21' } },
  'Physics':                     { code:'0625', papers:{ 'Paper 1 — MC Core':'11', 'Paper 2 — MC Extended':'21', 'Paper 3 — Core Theory':'31', 'Paper 4 — Extended Theory':'41', 'Paper 5 — Practical':'51', 'Paper 6 — Alternative':'61' } },
  'Religious Studies':           { code:'0490', papers:{ 'Paper 1':'11', 'Paper 2':'21' } },
  'Science - Combined':          { code:'0653', papers:{ 'Paper 1':'11', 'Paper 2':'21', 'Paper 3':'31', 'Paper 4':'41' } },
  'Sociology':                   { code:'0495', papers:{ 'Paper 1':'11', 'Paper 2':'21' } },
  'Spanish - Foreign Language':  { code:'0530', papers:{ 'Paper 1 — Listening':'11', 'Paper 2 — Reading':'21', 'Paper 3 — Speaking':'31', 'Paper 4 — Writing':'41' } },
  'Travel & Tourism':            { code:'0471', papers:{ 'Paper 1':'11', 'Paper 2':'21' } },
  'World Literature':            { code:'0408', papers:{ 'Paper 1':'11', 'Paper 2':'21' } },
};

export const AS_LEVEL_SUBJECTS = {
  'Accounting':         { code:'9706', papers:{ 'Paper 1 — Multiple Choice':'11', 'Paper 2 — Structured Questions AS':'21', 'Paper 3 — Structured Questions A2':'31' } },
  'Biology':            { code:'9700', papers:{ 'Paper 1 — Multiple Choice':'11', 'Paper 2 — AS Structured':'21', 'Paper 3 — Advanced Practical':'31', 'Paper 4 — A Level Structured':'41', 'Paper 5 — Planning, Analysis & Evaluation':'51' } },
  'Business':           { code:'9609', papers:{ 'Paper 1 — Short Answer & Essay AS':'11', 'Paper 2 — Data Response AS':'21', 'Paper 3 — Case Study A2':'31' } },
  'Chemistry':          { code:'9701', papers:{ 'Paper 1 — Multiple Choice':'11', 'Paper 2 — AS Structured':'21', 'Paper 3 — Advanced Practical':'31', 'Paper 4 — A Level Structured':'41', 'Paper 5 — Planning, Analysis & Evaluation':'51' } },
  'Computer Science':   { code:'9618', papers:{ 'Paper 1 — Theory Fundamentals':'11', 'Paper 2 — Fundamental Problem Solving':'21', 'Paper 3 — Advanced Theory':'31', 'Paper 4 — Advanced Problem Solving':'41' } },
  'Economics':          { code:'9708', papers:{ 'Paper 1 — Multiple Choice':'11', 'Paper 2 — Data Response AS':'21', 'Paper 3 — Multiple Choice A2':'31', 'Paper 4 — Data Response A2':'41' } },
  'English Language':   { code:'9093', papers:{ 'Paper 1 — Reading':'11', 'Paper 2 — Writing':'21', 'Paper 3 — Text Analysis':'31' } },
  'Geography':          { code:'9696', papers:{ 'Paper 1 — Core Physical & Human':'11', 'Paper 2 — Advanced Physical Options':'21', 'Paper 3 — Advanced Human Options':'31' } },
  'History':            { code:'9489', papers:{ 'Paper 1 — Document Question':'11', 'Paper 2 — Outline Study':'21', 'Paper 3 — Interpretations Question':'31' } },
  'Mathematics':        { code:'9709', papers:{ 'Paper 1 — Pure Mathematics 1':'11', 'Paper 2 — Pure Mathematics 2':'21', 'Paper 3 — Pure Mathematics 3':'31', 'Paper 4 — Mechanics':'41', 'Paper 5 — Statistics 1':'51', 'Paper 6 — Statistics 2':'61' } },
  'Physics':            { code:'9702', papers:{ 'Paper 1 — Multiple Choice':'11', 'Paper 2 — AS Structured':'21', 'Paper 3 — Advanced Practical':'31', 'Paper 4 — A Level Structured':'41', 'Paper 5 — Planning, Analysis & Evaluation':'51' } },
  'Psychology':         { code:'9990', papers:{ 'Paper 1 — Approaches in Psychology':'11', 'Paper 2 — Core Studies':'21', 'Paper 3 — Psychology & Research Methods':'31' } },
  'Sociology':          { code:'9699', papers:{ 'Paper 1 — Socialisation, Identity and Methods':'11', 'Paper 2 — Social Inequalities':'21', 'Paper 3 — Global Development':'31' } },
};

export const O_LEVEL_SUBJECTS = {
  'Accounting':           { code:'7110', papers:{ 'Paper 1 — Multiple Choice':'11', 'Paper 2 — Structured Questions':'21' } },
  'Biology':              { code:'5090', papers:{ 'Paper 1 — Multiple Choice':'11', 'Paper 2 — Theory':'21', 'Paper 3 — Practical':'31' } },
  'Chemistry':            { code:'5070', papers:{ 'Paper 1 — Multiple Choice':'11', 'Paper 2 — Theory':'21', 'Paper 3 — Practical':'31' } },
  'Commerce':             { code:'7100', papers:{ 'Paper 1 — Multiple Choice':'11', 'Paper 2 — Structured Questions':'21' } },
  'Computer Science':     { code:'2210', papers:{ 'Paper 1 — Theory':'11', 'Paper 2 — Problem Solving & Programming':'21' } },
  'Economics':            { code:'2281', papers:{ 'Paper 1 — Multiple Choice':'11', 'Paper 2 — Structured Questions':'21' } },
  'English Language':     { code:'1123', papers:{ 'Paper 1 — Reading':'11', 'Paper 2 — Writing':'21' } },
  'Geography':            { code:'2217', papers:{ 'Paper 1 — Core Geography':'11', 'Paper 2 — Geographical Themes':'21' } },
  'History':              { code:'2147', papers:{ 'Paper 1 — World Affairs':'11', 'Paper 2 — Local History':'21' } },
  'Mathematics':          { code:'4024', papers:{ 'Paper 1 — Short Answer':'11', 'Paper 2 — Structured Questions':'21' } },
  'Physics':              { code:'5054', papers:{ 'Paper 1 — Multiple Choice':'11', 'Paper 2 — Theory':'21', 'Paper 3 — Practical':'31' } },
  'Principles of Accounts': { code:'7110', papers:{ 'Paper 1 — Multiple Choice':'11', 'Paper 2 — Structured Questions':'21' } },
};

/** Convert a rich subject map to the legacy { name: code } format used by older components. */
export function toCodeMap(richMap) {
  return Object.fromEntries(Object.entries(richMap).map(([name, v]) => [name, v.code]));
}
