/* Supabase project settings.
 *
 * The anon key is a public, browser-safe key — it is designed to be shipped to
 * clients. All real protection comes from Row Level Security policies on the
 * database, not from hiding this value. */
var SUPABASE_URL = "https://tamfoctishttjfiffizq.supabase.co";
var SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhbWZvY3Rpc2h0dGpmaWZmaXpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MTY1MDcsImV4cCI6MjA5NzA5MjUwN30.rYWeg-hRkFM_Bf03T-mXrT1v03ShmdtrnaW_bSladZs";

/* Grading scale used across the portal. Mirrors the SQL/backend rules. */
var GRADE_SCALE = [
  { min: 70, grade: "A", remark: "Excellent", points: 5 },
  { min: 60, grade: "B", remark: "Very Good", points: 4 },
  { min: 50, grade: "C", remark: "Good", points: 3 },
  { min: 45, grade: "D", remark: "Pass", points: 2 },
  { min: 40, grade: "E", remark: "Fair", points: 1 },
  { min: 0, grade: "F", remark: "Fail", points: 0 },
];

var MAX_CA = 40;
var MAX_EXAM = 60;
