import { v4 as uuid } from 'uuid';

// ── Realistic LeetCode problem pool ────────────────────────────────────────
const PROBLEMS = [
  { n: 1,   name: 'Two Sum',                              diff: 'Easy',   topics: ['Arrays', 'Hash Map'] },
  { n: 2,   name: 'Add Two Numbers',                      diff: 'Medium', topics: ['Linked List', 'Math'] },
  { n: 3,   name: 'Longest Substring Without Repeating',  diff: 'Medium', topics: ['Sliding Window', 'Strings'] },
  { n: 5,   name: 'Longest Palindromic Substring',        diff: 'Medium', topics: ['Dynamic Programming', 'Strings'] },
  { n: 11,  name: 'Container With Most Water',            diff: 'Medium', topics: ['Two Pointers', 'Arrays'] },
  { n: 15,  name: 'Three Sum',                            diff: 'Medium', topics: ['Two Pointers', 'Arrays', 'Sorting'] },
  { n: 17,  name: 'Letter Combinations of a Phone Number',diff: 'Medium', topics: ['Backtracking', 'Strings'] },
  { n: 20,  name: 'Valid Parentheses',                    diff: 'Easy',   topics: ['Stack', 'Strings'] },
  { n: 21,  name: 'Merge Two Sorted Lists',               diff: 'Easy',   topics: ['Linked List', 'Recursion'] },
  { n: 23,  name: 'Merge K Sorted Lists',                 diff: 'Hard',   topics: ['Linked List', 'Heap / Priority Queue'] },
  { n: 33,  name: 'Search in Rotated Sorted Array',       diff: 'Medium', topics: ['Binary Search', 'Arrays'] },
  { n: 39,  name: 'Combination Sum',                      diff: 'Medium', topics: ['Backtracking', 'Arrays'] },
  { n: 46,  name: 'Permutations',                         diff: 'Medium', topics: ['Backtracking', 'Recursion'] },
  { n: 48,  name: 'Rotate Image',                         diff: 'Medium', topics: ['Matrix', 'Arrays'] },
  { n: 49,  name: 'Group Anagrams',                       diff: 'Medium', topics: ['Strings', 'Hash Map', 'Sorting'] },
  { n: 51,  name: 'N-Queens',                             diff: 'Hard',   topics: ['Backtracking'] },
  { n: 53,  name: 'Maximum Subarray',                     diff: 'Medium', topics: ['Dynamic Programming', 'Arrays'] },
  { n: 56,  name: 'Merge Intervals',                      diff: 'Medium', topics: ['Intervals', 'Sorting', 'Arrays'] },
  { n: 70,  name: 'Climbing Stairs',                      diff: 'Easy',   topics: ['Dynamic Programming', 'Math'] },
  { n: 76,  name: 'Minimum Window Substring',             diff: 'Hard',   topics: ['Sliding Window', 'Strings', 'Hash Map'] },
  { n: 78,  name: 'Subsets',                              diff: 'Medium', topics: ['Backtracking', 'Arrays', 'Bit Manipulation'] },
  { n: 84,  name: 'Largest Rectangle in Histogram',       diff: 'Hard',   topics: ['Stack', 'Arrays'] },
  { n: 98,  name: 'Validate Binary Search Tree',          diff: 'Medium', topics: ['Trees', 'Binary Search Tree', 'DFS'] },
  { n: 102, name: 'Binary Tree Level Order Traversal',    diff: 'Medium', topics: ['Trees', 'BFS'] },
  { n: 104, name: 'Maximum Depth of Binary Tree',         diff: 'Easy',   topics: ['Trees', 'DFS', 'BFS', 'Recursion'] },
  { n: 121, name: 'Best Time to Buy and Sell Stock',      diff: 'Easy',   topics: ['Arrays', 'Dynamic Programming'] },
  { n: 124, name: 'Binary Tree Maximum Path Sum',         diff: 'Hard',   topics: ['Trees', 'DFS', 'Dynamic Programming'] },
  { n: 128, name: 'Longest Consecutive Sequence',         diff: 'Medium', topics: ['Arrays', 'Hash Map', 'Union Find'] },
  { n: 131, name: 'Palindrome Partitioning',              diff: 'Medium', topics: ['Backtracking', 'Dynamic Programming'] },
  { n: 141, name: 'Linked List Cycle',                    diff: 'Easy',   topics: ['Linked List', 'Two Pointers'] },
  { n: 146, name: 'LRU Cache',                            diff: 'Medium', topics: ['Design', 'Hash Map', 'Linked List'] },
  { n: 152, name: 'Maximum Product Subarray',             diff: 'Medium', topics: ['Dynamic Programming', 'Arrays'] },
  { n: 153, name: 'Find Minimum in Rotated Sorted Array', diff: 'Medium', topics: ['Binary Search', 'Arrays'] },
  { n: 169, name: 'Majority Element',                     diff: 'Easy',   topics: ['Arrays', 'Sorting', 'Hash Map'] },
  { n: 198, name: 'House Robber',                         diff: 'Medium', topics: ['Dynamic Programming', 'Arrays'] },
  { n: 200, name: 'Number of Islands',                    diff: 'Medium', topics: ['Graphs', 'BFS', 'DFS', 'Matrix'] },
  { n: 206, name: 'Reverse Linked List',                  diff: 'Easy',   topics: ['Linked List', 'Recursion'] },
  { n: 207, name: 'Course Schedule',                      diff: 'Medium', topics: ['Graphs', 'BFS', 'DFS'] },
  { n: 208, name: 'Implement Trie',                       diff: 'Medium', topics: ['Trie', 'Design'] },
  { n: 212, name: 'Word Search II',                       diff: 'Hard',   topics: ['Trie', 'Backtracking', 'Matrix'] },
  { n: 215, name: 'Kth Largest Element in an Array',      diff: 'Medium', topics: ['Heap / Priority Queue', 'Sorting'] },
  { n: 217, name: 'Contains Duplicate',                   diff: 'Easy',   topics: ['Arrays', 'Hash Map', 'Sorting'] },
  { n: 226, name: 'Invert Binary Tree',                   diff: 'Easy',   topics: ['Trees', 'DFS', 'BFS', 'Recursion'] },
  { n: 230, name: 'Kth Smallest Element in a BST',        diff: 'Medium', topics: ['Trees', 'Binary Search Tree', 'DFS'] },
  { n: 235, name: 'Lowest Common Ancestor of a BST',      diff: 'Medium', topics: ['Trees', 'Binary Search Tree'] },
  { n: 238, name: 'Product of Array Except Self',         diff: 'Medium', topics: ['Arrays', 'Greedy'] },
  { n: 239, name: 'Sliding Window Maximum',               diff: 'Hard',   topics: ['Sliding Window', 'Queue', 'Arrays'] },
  { n: 242, name: 'Valid Anagram',                        diff: 'Easy',   topics: ['Strings', 'Sorting', 'Hash Map'] },
  { n: 268, name: 'Missing Number',                       diff: 'Easy',   topics: ['Arrays', 'Math', 'Bit Manipulation'] },
  { n: 271, name: 'Encode and Decode Strings',            diff: 'Medium', topics: ['Strings', 'Design'] },
  { n: 295, name: 'Find Median from Data Stream',         diff: 'Hard',   topics: ['Heap / Priority Queue', 'Design'] },
  { n: 297, name: 'Serialize and Deserialize Binary Tree',diff: 'Hard',   topics: ['Trees', 'BFS', 'DFS', 'Design'] },
  { n: 300, name: 'Longest Increasing Subsequence',       diff: 'Medium', topics: ['Dynamic Programming', 'Binary Search'] },
  { n: 322, name: 'Coin Change',                          diff: 'Medium', topics: ['Dynamic Programming', 'Arrays'] },
  { n: 347, name: 'Top K Frequent Elements',              diff: 'Medium', topics: ['Arrays', 'Hash Map', 'Heap / Priority Queue', 'Sorting'] },
  { n: 417, name: 'Pacific Atlantic Water Flow',          diff: 'Medium', topics: ['Graphs', 'BFS', 'DFS', 'Matrix'] },
  { n: 424, name: 'Longest Repeating Character Replacement', diff: 'Medium', topics: ['Sliding Window', 'Strings'] },
  { n: 435, name: 'Non-overlapping Intervals',            diff: 'Medium', topics: ['Intervals', 'Greedy', 'Sorting'] },
  { n: 543, name: 'Diameter of Binary Tree',              diff: 'Easy',   topics: ['Trees', 'DFS'] },
  { n: 572, name: 'Subtree of Another Tree',              diff: 'Easy',   topics: ['Trees', 'DFS'] },
  { n: 647, name: 'Palindromic Substrings',               diff: 'Medium', topics: ['Dynamic Programming', 'Strings', 'Two Pointers'] },
  { n: 703, name: 'Kth Largest Element in a Stream',      diff: 'Easy',   topics: ['Heap / Priority Queue', 'Design', 'Binary Search Tree'] },
  { n: 739, name: 'Daily Temperatures',                   diff: 'Medium', topics: ['Stack', 'Arrays'] },
  { n: 853, name: 'Car Fleet',                            diff: 'Medium', topics: ['Stack', 'Sorting', 'Arrays'] },
];

const NOTES_POOL = [
  'Used hash map for O(n) solution. Key insight: store complement.',
  'Tried brute force first, then optimized with two pointers.',
  'Classic DP — think about base case and transition carefully.',
  'BFS level-order traversal. Use a queue with a level counter.',
  'Sliding window: expand right, shrink left when constraint violated.',
  'DFS with backtracking. Prune early when sum exceeds target.',
  'Stack-based solution. Monotonic stack is the key pattern here.',
  'Binary search on the answer space — not on the array directly.',
  'Union-Find with path compression and union by rank.',
  'Greedy: sort by end time to minimize overlap.',
  'Two-pass approach: left product then right product.',
  'Recursive DFS. Be careful about null checks on leaf nodes.',
  'Heap (min/max) for maintaining running top-k.',
  'Trie insertion and search — O(m) per operation.',
  'Memoization with a map — avoid recomputing overlapping subproblems.',
  '',
  '',
  '',
];

const STATUSES = ['Solved', 'Solved', 'Solved', 'Solved', 'Attempted', 'Attempted', 'Revisit'];

// ── College seed data ───────────────────────────────────────────────────────
const COURSES = [
  { code: 'CS201', name: 'Data Structures & Algorithms', creditHours: 3 },
  { code: 'CS301', name: 'Operating Systems',            creditHours: 3 },
  { code: 'MATH211', name: 'Discrete Mathematics',       creditHours: 3 },
  { code: 'CS350', name: 'Database Systems',             creditHours: 3 },
  { code: 'CS410', name: 'Computer Networks',            creditHours: 3 },
  { code: 'MATH310', name: 'Linear Algebra',             creditHours: 3 },
];

const ENTRY_TYPES = ['Assignment', 'Exam', 'Quiz', 'Lab', 'Project'];

const COLLEGE_ENTRIES = {
  'CS201': [
    { name: 'Assignment 1 — Arrays & Sorting', type: 'Assignment', grade: '92/100', timeSpentMinutes: 90 },
    { name: 'Lab 1 — Linked List Implementation', type: 'Lab', grade: '95/100', timeSpentMinutes: 120 },
    { name: 'Quiz 1 — Time Complexity', type: 'Quiz', grade: '18/20', timeSpentMinutes: 30 },
    { name: 'Assignment 2 — BST Operations', type: 'Assignment', grade: '88/100', timeSpentMinutes: 150 },
    { name: 'Midterm Exam', type: 'Exam', grade: '78/100', timeSpentMinutes: 180 },
    { name: 'Assignment 3 — AVL Tree', type: 'Assignment', grade: '85/100', timeSpentMinutes: 200 },
    { name: 'Lab 2 — Graph BFS/DFS', type: 'Lab', grade: '100/100', timeSpentMinutes: 90 },
    { name: 'Final Exam', type: 'Exam', grade: '82/100', timeSpentMinutes: 180 },
  ],
  'CS301': [
    { name: 'Lab 1 — Process Scheduling', type: 'Lab', grade: '90/100', timeSpentMinutes: 120 },
    { name: 'Assignment 1 — Shell Implementation', type: 'Assignment', grade: '75/100', timeSpentMinutes: 300 },
    { name: 'Quiz 1 — Memory Management', type: 'Quiz', grade: '15/20', timeSpentMinutes: 25 },
    { name: 'Midterm Exam', type: 'Exam', grade: '71/100', timeSpentMinutes: 180 },
    { name: 'Assignment 2 — File System', type: 'Assignment', grade: '80/100', timeSpentMinutes: 240 },
    { name: 'Final Project — Mini OS Kernel', type: 'Project', grade: 'HD', timeSpentMinutes: 600 },
  ],
  'MATH211': [
    { name: 'Problem Set 1 — Logic & Proofs', type: 'Assignment', grade: '96/100', timeSpentMinutes: 60 },
    { name: 'Quiz 1 — Sets & Functions', type: 'Quiz', grade: '19/20', timeSpentMinutes: 20 },
    { name: 'Problem Set 2 — Counting & Probability', type: 'Assignment', grade: '88/100', timeSpentMinutes: 90 },
    { name: 'Midterm', type: 'Exam', grade: '85/100', timeSpentMinutes: 120 },
    { name: 'Problem Set 3 — Graph Theory', type: 'Assignment', grade: '91/100', timeSpentMinutes: 80 },
    { name: 'Final Exam', type: 'Exam', grade: '89/100', timeSpentMinutes: 120 },
  ],
  'CS350': [
    { name: 'Lab 1 — SQL Queries', type: 'Lab', grade: '100/100', timeSpentMinutes: 60 },
    { name: 'Assignment 1 — ER Diagrams', type: 'Assignment', grade: '93/100', timeSpentMinutes: 90 },
    { name: 'Midterm', type: 'Exam', grade: '80/100', timeSpentMinutes: 120 },
    { name: 'Assignment 2 — Normalization', type: 'Assignment', grade: '87/100', timeSpentMinutes: 100 },
    { name: 'Final Project — Full-Stack DB App', type: 'Project', grade: 'A', timeSpentMinutes: 480 },
  ],
  'CS410': [
    { name: 'Lab 1 — Socket Programming', type: 'Lab', grade: '88/100', timeSpentMinutes: 150 },
    { name: 'Assignment 1 — TCP/IP Analysis', type: 'Assignment', grade: '79/100', timeSpentMinutes: 100 },
    { name: 'Quiz 1 — OSI Model', type: 'Quiz', grade: '17/20', timeSpentMinutes: 20 },
    { name: 'Midterm', type: 'Exam', grade: '74/100', timeSpentMinutes: 120 },
    { name: 'Assignment 2 — HTTP Server', type: 'Assignment', grade: '90/100', timeSpentMinutes: 200 },
  ],
  'MATH310': [
    { name: 'Problem Set 1 — Vector Spaces', type: 'Assignment', grade: '94/100', timeSpentMinutes: 70 },
    { name: 'Problem Set 2 — Eigenvalues', type: 'Assignment', grade: '86/100', timeSpentMinutes: 80 },
    { name: 'Midterm', type: 'Exam', grade: '82/100', timeSpentMinutes: 120 },
    { name: 'Problem Set 3 — SVD', type: 'Assignment', grade: '91/100', timeSpentMinutes: 90 },
    { name: 'Final Exam', type: 'Exam', grade: '88/100', timeSpentMinutes: 120 },
  ],
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function isoDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Generators ───────────────────────────────────────────────────────────────
function generateLeetCodeEntries() {
  const used = new Set();
  const entries = [];
  const pool = [...PROBLEMS].sort(() => Math.random() - 0.5);

  // Spread entries across last 80 days — active ~55% of days, 1–3 per active day
  for (let daysAgo = 1; daysAgo <= 80; daysAgo++) {
    if (Math.random() < 0.45) continue; // skip ~45% of days
    const count = Math.random() < 0.6 ? 1 : Math.random() < 0.7 ? 2 : 3;

    for (let i = 0; i < count; i++) {
      const problem = pool[entries.length % pool.length];
      const status = pick(STATUSES);
      const baseTime = problem.diff === 'Easy' ? 20 : problem.diff === 'Medium' ? 40 : 70;
      const timeSpentMinutes = baseTime + randInt(-10, 30);

      entries.push({
        id: uuid(),
        problemName: problem.name,
        problemNumber: problem.n,
        difficulty: problem.diff,
        status,
        topics: problem.topics,
        timeSpentMinutes: Math.max(5, timeSpentMinutes),
        notes: pick(NOTES_POOL),
        url: `https://leetcode.com/problems/${problem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`,
        date: isoDate(daysAgo),
        createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      });
    }
  }

  return entries;
}

function generateCollegeData() {
  // Two semesters — Fall 2024 and Spring 2025
  const semesterDefs = [
    { name: 'Fall 2024',   courses: [COURSES[0], COURSES[1], COURSES[2]], startDaysAgo: 120 },
    { name: 'Spring 2025', courses: [COURSES[3], COURSES[4], COURSES[5]], startDaysAgo: 10  },
  ];

  const semesters = semesterDefs.map(({ name, courses, startDaysAgo }) => ({
    id: uuid(),
    name,
    courses: courses.map((course, ci) => {
      const rawEntries = COLLEGE_ENTRIES[course.code] || [];
      const entries = rawEntries.map((e, ei) => {
        const daysAgo = startDaysAgo - (ei * randInt(8, 15)) - ci * 3;
        return {
          id: uuid(),
          name: e.name,
          type: e.type,
          grade: e.grade,
          date: isoDate(Math.max(1, daysAgo)),
          timeSpentMinutes: e.timeSpentMinutes + randInt(-20, 20),
          notes: '',
          createdAt: new Date(Date.now() - Math.max(1, daysAgo) * 86400000).toISOString(),
        };
      });

      return {
        id: uuid(),
        code: course.code,
        name: course.name,
        creditHours: course.creditHours,
        entries,
      };
    }),
  }));

  return { semesters };
}

// ── Public API ───────────────────────────────────────────────────────────────
export function generateSeedData() {
  const leetcode = generateLeetCodeEntries();
  const college = generateCollegeData();

  localStorage.setItem('studylog_leetcode', JSON.stringify(leetcode));
  localStorage.setItem('studylog_college', JSON.stringify(college));

  return { leetcodeCount: leetcode.length, semesterCount: college.semesters.length };
}

export function clearAllData() {
  localStorage.removeItem('studylog_leetcode');
  localStorage.removeItem('studylog_college');
  localStorage.removeItem('studylog_timer');
}
