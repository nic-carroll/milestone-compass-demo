/*
 * Standards Practice Platform — demo app.
 * Vanilla JS, no build step, no backend. All "real" data comes from data.js
 * (clearly marked as sample/demo data — see that file's header comment and
 * CLAUDE.md). Login is a name-only stand-in for real district auth/LTI.
 * Progress is tracked in this browser's localStorage only, keyed per local
 * demo student profile (see LS_KEYS.progress) — there is no backend and no
 * real class roster. The Teacher View only ever shows students who have
 * actually practiced in this browser; it never fabricates a roster.
 */

const LS_KEYS = {
  progress: "spp.progress.v2",       // { [slug]: { displayName, sessions:[], standardStats:{}, dokStats:{} } }
  activeStudent: "spp.activeStudent.v2"
};

const STATE = {
  studentName: null,
  studentSlug: null,
  currentCourseId: null,
  quiz: null
  // quiz shape (non-adaptive): { adaptive:false, questions, index, mode, courseId, courseTitle, results, availabilityNote }
  // quiz shape (adaptive):     { adaptive:true, pool, dokTarget, targetCount, questions, index, mode, courseId, courseTitle, results, availabilityNote, stepNote }
};

const ALL_STANDARDS = Object.values(STANDARDS).flat();

// ---------------- storage helpers ----------------

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function emptyStudentRecord(displayName) {
  return { displayName, sessions: [], standardStats: {}, dokStats: {} };
}

// ---------------- generic helpers ----------------

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pct(correct, total) {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}
function normalizeAnswer(s) {
  return String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function slugify(name) {
  const s = String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return s || "student";
}
function dokInfo(level) {
  return DOK_LEVELS.find((d) => d.level === level);
}
function formatInfo(id) {
  return QUESTION_FORMATS.find((f) => f.id === id);
}
function findStandardByCode(code) {
  return ALL_STANDARDS.find((s) => s.code === code);
}
function findStandardMeta(courseId, code) {
  return (STANDARDS[courseId] || []).find((s) => s.code === code);
}
function findElementDesc(courseId, code, elementId) {
  const meta = findStandardMeta(courseId, code);
  const el = meta && (meta.elements || []).find((e) => e.id === elementId);
  return el ? el.description : null;
}

// ---------------- achievement level + mastery state ----------------
// See data.js header: ACHIEVEMENT_LEVELS thresholds are this demo's own
// illustrative binning of raw accuracy, not GA's real Milestones cut scores.

function computeAchievementLevel(correct, total) {
  if (total === 0) return null;
  const p = pct(correct, total);
  let result = ACHIEVEMENT_LEVELS[0];
  ACHIEVEMENT_LEVELS.forEach((lvl) => {
    if (p >= lvl.minPct) result = lvl;
  });
  return result;
}
function computeMasteryState(correct, total) {
  if (total === 0) return { key: "not-started", label: "Not Yet Practiced" };
  if (total >= 4 && correct / total >= 0.8) return { key: "mastered", label: "Mastered" };
  return { key: "building", label: "Still Building" };
}

// ---------------- view switching ----------------

function showView(id) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  document.getElementById("view-" + id).classList.add("active");
  document.querySelectorAll(".nav-link").forEach((n) => n.classList.remove("active"));
  const navBtn = document.querySelector('.nav-link[data-nav="' + id + '"]');
  if (navBtn) navBtn.classList.add("active");
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

// ---------------- login ----------------

function initLogin() {
  const activeSlug = loadJSON(LS_KEYS.activeStudent, null);
  if (activeSlug) {
    const progress = loadJSON(LS_KEYS.progress, {});
    if (progress[activeSlug]) document.getElementById("loginName").value = progress[activeSlug].displayName;
  }
  document.getElementById("loginBtn").addEventListener("click", doLogin);
  document.getElementById("loginName").addEventListener("keydown", (e) => {
    if (e.key === "Enter") doLogin();
  });
  document.getElementById("switchStudentBtn").addEventListener("click", () => {
    STATE.studentName = null;
    STATE.studentSlug = null;
    document.getElementById("appHeader").classList.add("hidden");
    showView("login");
  });
  document.getElementById("teacherEntryBtn").addEventListener("click", () => {
    renderTeacherEntry();
    showView("teacher");
  });
  document.getElementById("teacherBackBtn").addEventListener("click", () => showView("login"));
}

function doLogin() {
  const raw = document.getElementById("loginName").value.trim();
  const name = raw || "Student";
  const slug = slugify(name);
  STATE.studentName = name;
  STATE.studentSlug = slug;

  const progress = loadJSON(LS_KEYS.progress, {});
  if (!progress[slug]) progress[slug] = emptyStudentRecord(name);
  else progress[slug].displayName = name;
  saveJSON(LS_KEYS.progress, progress);
  saveJSON(LS_KEYS.activeStudent, slug);

  document.getElementById("studentNameLabel").textContent = name;
  document.getElementById("studentAvatar").textContent = name.slice(0, 1).toUpperCase();
  document.getElementById("appHeader").classList.remove("hidden");

  renderClasses();
  showView("classes");
}

// ---------------- my classes ----------------

function renderClasses() {
  const grid = document.getElementById("classGrid");
  grid.innerHTML = "";
  COURSES.forEach((course) => {
    const card = document.createElement("button");
    card.className = "class-card";
    card.innerHTML = `
      <span class="subject-tag">${escapeHtml(course.subject)}</span>
      <div class="class-title">${escapeHtml(course.title)}</div>
      <div class="class-meta">${escapeHtml(course.section)} &middot; ${escapeHtml(course.teacher)}</div>
    `;
    card.addEventListener("click", () => {
      STATE.currentCourseId = course.id;
      renderStandardsView(course.id);
      showView("standards");
    });
    grid.appendChild(card);
  });
}

// ---------------- course standards ----------------

function renderStandardsView(courseId) {
  const course = COURSES.find((c) => c.id === courseId);
  document.getElementById("standardsCourseTitle").textContent = course.title;
  document.getElementById("standardsCourseMeta").textContent =
    `${course.subject} · ${course.section} · ${course.teacher}`;

  const list = document.getElementById("standardsList");
  list.innerHTML = "";
  (STANDARDS[courseId] || []).forEach((s) => {
    const row = document.createElement("div");
    row.className = "standard-row";
    const elementsHtml = (s.elements || [])
      .map((e) => `<li><strong>${escapeHtml(e.id)}.</strong> ${escapeHtml(e.description)}</li>`)
      .join("");
    const crosswalkHtml = s.crosswalk
      ? Object.entries(s.crosswalk).map(([k, v]) => `<span class="format-badge">${k.toUpperCase()} ${escapeHtml(v)}</span>`).join(" ")
      : `<span class="format-badge" title="Georgia Social Studies standards are state-specific, with no national crosswalk">State-specific</span>`;
    row.innerHTML = `
      <div style="width:100%;">
        <div class="hint-text" style="margin:0 0 4px;text-transform:uppercase;letter-spacing:.03em;font-weight:700;color:var(--muted);">${escapeHtml(s.domain || "")}</div>
        <div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;">
          <span class="standard-code">${escapeHtml(s.code)}</span>
          <span class="standard-desc">${escapeHtml(s.description)}</span>
        </div>
        <ul style="margin:8px 0 4px 18px;padding:0;font-size:13px;color:var(--text-secondary);">${elementsHtml}</ul>
        <div style="margin-top:4px;">${crosswalkHtml}</div>
      </div>
    `;
    list.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("goToBuilderBtn").addEventListener("click", () => {
    renderBuilder(STATE.currentCourseId);
    showView("builder");
  });
  document.getElementById("backToStandardsBtn").addEventListener("click", () => {
    showView("standards");
  });
});

// ---------------- practice set builder ----------------

function renderBuilder(courseId) {
  const course = COURSES.find((c) => c.id === courseId);
  document.getElementById("builderCourseLabel").textContent = `${course.title} — ${course.section}`;

  // standards
  const standardBox = document.getElementById("standardOptions");
  standardBox.innerHTML = "";
  (STANDARDS[courseId] || []).forEach((s) => {
    const row = document.createElement("label");
    row.className = "option-row";
    row.innerHTML = `
      <input type="checkbox" checked value="${escapeHtml(s.code)}" data-role="standard">
      <span>
        <div class="option-main">${escapeHtml(s.code)} <span style="color:var(--muted);font-weight:400;">— ${escapeHtml(s.domain)}</span></div>
        <div class="option-sub">${escapeHtml(s.description)}</div>
      </span>
    `;
    standardBox.appendChild(row);
  });

  // DOK levels
  const dokBox = document.getElementById("dokOptions");
  dokBox.innerHTML = "";
  DOK_LEVELS.forEach((d) => {
    const row = document.createElement("label");
    row.className = "option-row";
    row.innerHTML = `
      <input type="checkbox" checked value="${d.level}" data-role="dok">
      <span>
        <div class="option-main"><span class="dok-swatch" style="background:${d.color}"></span>DOK ${d.level} — ${escapeHtml(d.name)}</div>
        <div class="option-sub">${escapeHtml(d.short)}</div>
      </span>
    `;
    dokBox.appendChild(row);
  });

  // formats
  const formatBox = document.getElementById("formatOptions");
  formatBox.innerHTML = "";
  QUESTION_FORMATS.forEach((f) => {
    const row = document.createElement("label");
    row.className = "option-row";
    row.innerHTML = `
      <input type="checkbox" checked value="${f.id}" data-role="format">
      <span>
        <div class="option-main">${escapeHtml(f.label)}</div>
        <div class="option-sub">${escapeHtml(f.hint)}</div>
      </span>
    `;
    formatBox.appendChild(row);
  });

  // count controls reset
  document.querySelectorAll(".chip[data-count]").forEach((c) => c.classList.toggle("selected", c.dataset.count === "5"));
  document.getElementById("customCount").value = "";
  document.getElementById("countWarning").style.display = "none";
  document.getElementById("builderError").style.display = "none";

  // adaptive toggle reset
  document.getElementById("adaptiveToggle").checked = false;
  document.getElementById("dokOptions").style.display = "";
  document.getElementById("dokHint").style.display = "";
}

function currentRequestedCount() {
  const custom = document.getElementById("customCount").value;
  if (custom) return parseInt(custom, 10);
  const selectedChip = document.querySelector(".chip[data-count].selected");
  return selectedChip ? parseInt(selectedChip.dataset.count, 10) : 5;
}

function updateCountWarning() {
  const n = currentRequestedCount();
  document.getElementById("countWarning").style.display = n > 15 ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".chip[data-count]").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip[data-count]").forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      document.getElementById("customCount").value = "";
      updateCountWarning();
    });
  });
  document.getElementById("customCount").addEventListener("input", () => {
    document.querySelectorAll(".chip[data-count]").forEach((c) => c.classList.remove("selected"));
    updateCountWarning();
  });
  document.getElementById("adaptiveToggle").addEventListener("change", (e) => {
    const on = e.target.checked;
    document.getElementById("dokOptions").style.display = on ? "none" : "";
    document.getElementById("dokHint").style.display = on ? "none" : "";
  });

  document.getElementById("generateBtn").addEventListener("click", generatePracticeSet);
});

function generatePracticeSet() {
  const errorBox = document.getElementById("builderError");
  errorBox.style.display = "none";

  const standards = Array.from(document.querySelectorAll('#standardOptions input[data-role="standard"]:checked')).map((i) => i.value);
  const formats = Array.from(document.querySelectorAll('#formatOptions input[data-role="format"]:checked')).map((i) => i.value);
  const count = currentRequestedCount();
  const adaptive = document.getElementById("adaptiveToggle").checked;

  if (standards.length === 0) return showBuilderError("Select at least one standard to practice.");
  if (formats.length === 0) return showBuilderError("Select at least one question type.");
  if (!count || count < 1) return showBuilderError("Enter a valid number of questions (1 or more).");

  const course = COURSES.find((c) => c.id === STATE.currentCourseId);

  if (adaptive) {
    const matching = QUESTIONS.filter((q) => standards.includes(q.standard) && formats.includes(q.type));
    if (matching.length === 0) {
      return showBuilderError("No sample questions match that combination in this demo yet — try selecting more standards or question types.");
    }
    STATE.quiz = {
      adaptive: true,
      pool: shuffle(matching),
      dokTarget: 2,
      targetCount: count,
      questions: [],
      index: 0,
      mode: "answering",
      courseId: course.id,
      courseTitle: course.title,
      results: [],
      availabilityNote: null,
      stepNote: null
    };
    const first = pickNextAdaptiveQuestion();
    STATE.quiz.questions.push(first);
    renderQuizQuestion();
    showView("quiz");
    return;
  }

  const doks = Array.from(document.querySelectorAll('#dokOptions input[data-role="dok"]:checked')).map((i) => parseInt(i.value, 10));
  if (doks.length === 0) return showBuilderError("Select at least one difficulty (DOK) level.");

  const matching = QUESTIONS.filter(
    (q) => standards.includes(q.standard) && doks.includes(q.dok) && formats.includes(q.type)
  );
  if (matching.length === 0) {
    return showBuilderError("No sample questions match that combination in this demo yet — try selecting more standards, difficulty levels, or question types.");
  }

  const chosen = shuffle(matching).slice(0, Math.min(count, matching.length));
  let availabilityNote = null;
  if (matching.length < count) {
    availabilityNote = `Showing all ${matching.length} sample questions available for this combination in this demo (you asked for ${count}).`;
  }

  STATE.quiz = {
    adaptive: false,
    questions: chosen,
    index: 0,
    mode: "answering",
    courseId: course.id,
    courseTitle: course.title,
    results: [],
    availabilityNote
  };

  renderQuizQuestion();
  showView("quiz");
}

function showBuilderError(msg) {
  const box = document.getElementById("builderError");
  box.textContent = msg;
  box.style.display = "block";
}

// ---------------- adaptive question selection ----------------

function pickNextAdaptiveQuestion() {
  const pool = STATE.quiz.pool;
  if (pool.length === 0) return null;
  let candidates = pool.filter((q) => q.dok === STATE.quiz.dokTarget);
  if (candidates.length === 0) {
    let best = null;
    let bestDiff = Infinity;
    pool.forEach((q) => {
      const diff = Math.abs(q.dok - STATE.quiz.dokTarget);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = q;
      }
    });
    candidates = best ? [best] : [];
  }
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  STATE.quiz.pool = pool.filter((q) => q.id !== chosen.id);
  return chosen;
}

// ---------------- quiz ----------------

function renderQuizQuestion() {
  const { questions, index, adaptive } = STATE.quiz;
  const q = questions[index];
  STATE.quiz.mode = "answering";

  const total = adaptive ? STATE.quiz.targetCount : questions.length;
  let progressLabel = `Question ${index + 1} of ${total}`;
  if (STATE.quiz.availabilityNote) progressLabel += ` — ${STATE.quiz.availabilityNote}`;
  document.getElementById("quizProgressLabel").textContent = progressLabel;
  document.getElementById("quizProgressFill").style.width = `${(index / total) * 100}%`;

  const dok = dokInfo(q.dok);
  const fmt = formatInfo(q.type);
  const meta = findStandardMeta(STATE.quiz.courseId, q.standard);
  const elDesc = q.element ? findElementDesc(STATE.quiz.courseId, q.standard, q.element) : null;

  let adaptiveBadge = "";
  if (adaptive) {
    const note = STATE.quiz.stepNote || "Adaptive: starting point";
    adaptiveBadge = `<span class="format-badge" style="background:var(--primary-wash);color:var(--primary-dark);">${escapeHtml(note)}</span>`;
  }

  document.getElementById("quizBadgeRow").innerHTML = `
    <span class="standard-code" title="${escapeHtml(meta ? meta.domain : "")}">${escapeHtml(q.standard)}</span>
    ${q.element ? `<span class="format-badge" title="${escapeHtml(elDesc || "")}">Element ${escapeHtml(q.element)}</span>` : ""}
    <span class="dok-badge" style="background:${dok.color}">DOK ${dok.level} · ${escapeHtml(dok.name)}</span>
    <span class="format-badge">${escapeHtml(fmt.label)}</span>
    ${adaptiveBadge}
  `;
  document.getElementById("quizPrompt").textContent = q.prompt;

  const answerArea = document.getElementById("quizAnswerArea");
  answerArea.innerHTML = "";
  document.getElementById("quizFeedbackArea").innerHTML = "";

  if (q.type === "mc") {
    q.choices.forEach((choice, i) => {
      const row = document.createElement("label");
      row.className = "choice-row";
      row.innerHTML = `<input type="radio" name="answer" value="${i}"><span class="choice-text">${escapeHtml(choice.text)}</span>`;
      answerArea.appendChild(row);
    });
  } else if (q.type === "multiselect") {
    q.choices.forEach((choice, i) => {
      const row = document.createElement("label");
      row.className = "choice-row";
      row.innerHTML = `<input type="checkbox" name="answer" value="${i}"><span class="choice-text">${escapeHtml(choice.text)}</span>`;
      answerArea.appendChild(row);
    });
  } else if (q.type === "fill") {
    const wrap = document.createElement("div");
    wrap.innerHTML = `<input type="text" class="fill-input" id="fillInput" autocomplete="off" placeholder="Type your answer">`;
    answerArea.appendChild(wrap);
  } else if (q.type === "matching") {
    const rightOptions = shuffle(q.pairs.map((p) => p.right));
    q.pairs.forEach((pair, i) => {
      const row = document.createElement("div");
      row.className = "match-row";
      const options = rightOptions.map((r) => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join("");
      row.innerHTML = `
        <div class="match-left">${escapeHtml(pair.left)}</div>
        <select class="match-select" data-index="${i}"><option value="">Choose a match...</option>${options}</select>
      `;
      answerArea.appendChild(row);
    });
  }

  answerArea.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("input", updateSubmitEnabled);
    el.addEventListener("change", updateSubmitEnabled);
  });
  if (q.type === "fill") {
    document.getElementById("fillInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !document.getElementById("quizPrimaryBtn").disabled) {
        document.getElementById("quizPrimaryBtn").click();
      }
    });
  }

  document.getElementById("quizPrimaryBtn").textContent = "Submit Answer";
  updateSubmitEnabled();
}

function updateSubmitEnabled() {
  if (STATE.quiz.mode !== "answering") {
    document.getElementById("quizPrimaryBtn").disabled = false;
    return;
  }
  const q = STATE.quiz.questions[STATE.quiz.index];
  const answerArea = document.getElementById("quizAnswerArea");
  let valid = false;

  if (q.type === "mc") {
    valid = !!answerArea.querySelector('input[name="answer"]:checked');
  } else if (q.type === "multiselect") {
    valid = answerArea.querySelectorAll('input[name="answer"]:checked').length > 0;
  } else if (q.type === "fill") {
    const el = document.getElementById("fillInput");
    valid = el && el.value.trim().length > 0;
  } else if (q.type === "matching") {
    const selects = Array.from(answerArea.querySelectorAll(".match-select"));
    valid = selects.length > 0 && selects.every((s) => s.value !== "");
  }
  document.getElementById("quizPrimaryBtn").disabled = !valid;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("quizPrimaryBtn").addEventListener("click", () => {
    if (STATE.quiz.mode === "answering") {
      gradeCurrentQuestion();
    } else {
      advanceQuiz();
    }
  });
});

function gradeCurrentQuestion() {
  const { questions, index } = STATE.quiz;
  const q = questions[index];
  const answerArea = document.getElementById("quizAnswerArea");
  let correct = false;

  if (q.type === "mc") {
    const picked = answerArea.querySelector('input[name="answer"]:checked');
    const pickedIndex = parseInt(picked.value, 10);
    correct = q.choices[pickedIndex].correct;

    answerArea.querySelectorAll(".choice-row").forEach((row, i) => {
      const choice = q.choices[i];
      const isPicked = i === pickedIndex;
      if (choice.correct) row.classList.add("correct-answer");
      else if (isPicked) row.classList.add("wrong-answer");
      row.querySelector('input').disabled = true;
      const explain = document.createElement("div");
      explain.className = "choice-explain";
      explain.innerHTML = `<span class="choice-icon ${choice.correct ? "good" : "bad"}">${choice.correct ? "✓" : "✗"}</span>${escapeHtml(choice.explanation)}${isPicked ? ' <strong>(your answer)</strong>' : ""}`;
      row.after(explain);
    });

  } else if (q.type === "multiselect") {
    const pickedIndexes = Array.from(answerArea.querySelectorAll('input[name="answer"]:checked')).map((i) => parseInt(i.value, 10));
    const correctIndexes = q.choices.map((c, i) => (c.correct ? i : null)).filter((i) => i !== null);
    correct = pickedIndexes.length === correctIndexes.length && pickedIndexes.every((i) => correctIndexes.includes(i));

    answerArea.querySelectorAll(".choice-row").forEach((row, i) => {
      const choice = q.choices[i];
      const isPicked = pickedIndexes.includes(i);
      if (choice.correct) row.classList.add("correct-answer");
      else if (isPicked) row.classList.add("wrong-answer");
      row.querySelector('input').disabled = true;
      const explain = document.createElement("div");
      explain.className = "choice-explain";
      explain.innerHTML = `<span class="choice-icon ${choice.correct ? "good" : "bad"}">${choice.correct ? "✓" : "✗"}</span>${escapeHtml(choice.explanation)}${isPicked ? ' <strong>(your answer)</strong>' : ""}`;
      row.after(explain);
    });

  } else if (q.type === "fill") {
    const el = document.getElementById("fillInput");
    const value = el.value;
    correct = q.accepted.some((a) => normalizeAnswer(a) === normalizeAnswer(value));
    el.classList.add(correct ? "correct" : "incorrect");
    el.disabled = true;

    const explain = document.createElement("div");
    explain.className = "choice-explain";
    explain.style.paddingLeft = "0";
    explain.innerHTML = `<strong>Accepted answer:</strong> ${escapeHtml(q.accepted[0])} — ${escapeHtml(q.explanation)}`;
    el.parentElement.after(explain);

  } else if (q.type === "matching") {
    const selects = Array.from(answerArea.querySelectorAll(".match-select"));
    let allCorrect = true;
    selects.forEach((sel, i) => {
      const pair = q.pairs[i];
      const isCorrect = sel.value === pair.right;
      if (!isCorrect) allCorrect = false;
      sel.classList.add(isCorrect ? "correct" : "incorrect");
      sel.disabled = true;

      const explain = document.createElement("div");
      explain.className = "match-explain";
      explain.innerHTML = `<span class="choice-icon ${isCorrect ? "good" : "bad"}">${isCorrect ? "✓" : "✗"}</span>Correct match: <strong>${escapeHtml(pair.right)}</strong> — ${escapeHtml(pair.explanation)}`;
      sel.closest(".match-row").after(explain);
    });
    correct = allCorrect;
  }

  const banner = document.createElement("div");
  banner.className = "feedback-banner " + (correct ? "good" : "bad");
  banner.textContent = correct ? "✅ Correct!" : "❌ Not quite — here's why.";
  document.getElementById("quizFeedbackArea").prepend(banner);

  const skillStub = document.createElement("div");
  skillStub.className = "skill-stub";
  skillStub.title = "This will link to a short lesson once instructional content is connected.";
  skillStub.innerHTML = `📘 Related skill: <strong>${escapeHtml(q.skill)}</strong> — short lesson coming soon`;
  document.getElementById("quizFeedbackArea").appendChild(skillStub);

  STATE.quiz.results.push({ standard: q.standard, dok: q.dok, correct });

  if (STATE.quiz.adaptive) {
    STATE.quiz.dokTarget = Math.max(1, Math.min(4, STATE.quiz.dokTarget + (correct ? 1 : -1)));
    STATE.quiz.stepNote = correct
      ? `Adaptive: stepped up to DOK ${STATE.quiz.dokTarget} — last answer correct`
      : `Adaptive: stepped down to DOK ${STATE.quiz.dokTarget} — last answer incorrect`;
  }

  STATE.quiz.mode = "reviewing";
  document.getElementById("quizPrimaryBtn").disabled = false;
  const isLast = STATE.quiz.adaptive
    ? STATE.quiz.questions.length >= STATE.quiz.targetCount || STATE.quiz.pool.length === 0
    : STATE.quiz.index === STATE.quiz.questions.length - 1;
  document.getElementById("quizPrimaryBtn").textContent = isLast ? "See Results" : "Next Question";
}

function advanceQuiz() {
  if (STATE.quiz.adaptive) {
    if (STATE.quiz.questions.length >= STATE.quiz.targetCount) {
      finishQuizSet();
      return;
    }
    const next = pickNextAdaptiveQuestion();
    if (!next) {
      STATE.quiz.availabilityNote = `Showing all ${STATE.quiz.questions.length} sample questions available for this combination in this demo (you asked for ${STATE.quiz.targetCount}).`;
      finishQuizSet();
      return;
    }
    STATE.quiz.questions.push(next);
    STATE.quiz.index += 1;
    renderQuizQuestion();
    return;
  }

  STATE.quiz.index += 1;
  if (STATE.quiz.index >= STATE.quiz.questions.length) {
    finishQuizSet();
  } else {
    renderQuizQuestion();
  }
}

// ---------------- summary + persistence ----------------

function groupResults(results, key) {
  const groups = {};
  results.forEach((r) => {
    const k = r[key];
    if (!groups[k]) groups[k] = { correct: 0, total: 0 };
    groups[k].total += 1;
    if (r.correct) groups[k].correct += 1;
  });
  return groups;
}

function finishQuizSet() {
  const { results, courseId, courseTitle } = STATE.quiz;
  const total = results.length;
  const correctCount = results.filter((r) => r.correct).length;
  const byStandard = groupResults(results, "standard");
  const byDok = groupResults(results, "dok");

  const progress = loadJSON(LS_KEYS.progress, {});
  const rec = progress[STATE.studentSlug] || emptyStudentRecord(STATE.studentName);
  rec.displayName = STATE.studentName;
  rec.sessions.push({
    date: new Date().toISOString(),
    courseId,
    courseTitle,
    questionCount: total,
    correctCount,
    byStandard,
    byDok
  });
  Object.entries(byStandard).forEach(([code, g]) => {
    const cur = rec.standardStats[code] || { correct: 0, total: 0 };
    rec.standardStats[code] = { correct: cur.correct + g.correct, total: cur.total + g.total };
  });
  Object.entries(byDok).forEach(([level, g]) => {
    const cur = rec.dokStats[level] || { correct: 0, total: 0 };
    rec.dokStats[level] = { correct: cur.correct + g.correct, total: cur.total + g.total };
  });
  progress[STATE.studentSlug] = rec;
  saveJSON(LS_KEYS.progress, progress);

  renderSummary(total, correctCount, byStandard, byDok);
  showView("summary");
}

function barRow(label, correct, total, color) {
  const p = pct(correct, total);
  return `
    <div class="breakdown-row">
      <div class="breakdown-label">${escapeHtml(label)}</div>
      <div class="breakdown-track"><div class="breakdown-fill" style="width:${p}%;background:${color}"></div></div>
      <div class="breakdown-value">${total > 0 ? p + "%" : "—"}</div>
    </div>
  `;
}

function standardProgressRow(code, correct, total) {
  const meta = findStandardByCode(code);
  const p = pct(correct, total);
  const level = computeAchievementLevel(correct, total);
  const mastery = computeMasteryState(correct, total);
  return `
    <div class="breakdown-row" style="flex-wrap:wrap;">
      <div class="breakdown-label" style="width:150px;">
        <div>${escapeHtml(code)}</div>
        <div style="font-size:11px;color:var(--muted);font-weight:400;">${escapeHtml(meta ? meta.domain : "")}</div>
      </div>
      <div class="breakdown-track"><div class="breakdown-fill" style="width:${p}%;background:#2a78d6"></div></div>
      <div class="breakdown-value">${total > 0 ? p + "%" : "—"}</div>
      <span class="dok-badge" style="background:${level ? level.color : "#c3c2b7"};white-space:nowrap;">${level ? escapeHtml(level.name) : "No data"}</span>
      <span class="format-badge" style="white-space:nowrap;">${escapeHtml(mastery.label)}</span>
    </div>
  `;
}

function renderSummary(total, correctCount, byStandard, byDok) {
  document.getElementById("summaryScoreNumber").textContent = `${correctCount}/${total}`;
  document.getElementById("summaryScoreLabel").textContent = `${pct(correctCount, total)}% correct on this practice set`;

  const standardBox = document.getElementById("summaryByStandard");
  standardBox.innerHTML = Object.entries(byStandard)
    .map(([code, g]) => barRow(code, g.correct, g.total, "#2a78d6"))
    .join("");

  const dokBox = document.getElementById("summaryByDok");
  dokBox.innerHTML = Object.entries(byDok)
    .sort((a, b) => a[0] - b[0])
    .map(([level, g]) => barRow(`DOK ${level}`, g.correct, g.total, dokInfo(parseInt(level, 10)).color))
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("practiceAgainBtn").addEventListener("click", () => {
    renderBuilder(STATE.currentCourseId);
    showView("builder");
  });
});

// ---------------- progress ----------------

function renderProgress() {
  const progress = loadJSON(LS_KEYS.progress, {});
  const rec = progress[STATE.studentSlug] || emptyStudentRecord(STATE.studentName);
  const sessions = rec.sessions;
  const standardStats = rec.standardStats;
  const dokStats = rec.dokStats;

  const totalQuestions = Object.values(standardStats).reduce((sum, s) => sum + s.total, 0);
  const totalCorrect = Object.values(standardStats).reduce((sum, s) => sum + s.correct, 0);
  const standardsPracticed = Object.keys(standardStats).length;

  document.getElementById("progressStatTiles").innerHTML = `
    <div class="stat-tile"><div class="stat-value">${totalQuestions}</div><div class="stat-label">Questions Practiced</div></div>
    <div class="stat-tile"><div class="stat-value">${pct(totalCorrect, totalQuestions)}%</div><div class="stat-label">Overall Accuracy</div></div>
    <div class="stat-tile"><div class="stat-value">${sessions.length}</div><div class="stat-label">Practice Sessions</div></div>
    <div class="stat-tile"><div class="stat-value">${standardsPracticed}</div><div class="stat-label">Standards Practiced</div></div>
  `;

  const byStandardCard = document.getElementById("progressByStandardCard");
  const standardEntries = Object.entries(standardStats);
  byStandardCard.innerHTML = standardEntries.length
    ? standardEntries.map(([code, g]) => standardProgressRow(code, g.correct, g.total)).join("")
    : `<div class="empty-state">No practice data yet.</div>`;

  const byDokCard = document.getElementById("progressByDokCard");
  byDokCard.innerHTML = DOK_LEVELS.map((d) => {
    const g = dokStats[d.level] || { correct: 0, total: 0 };
    return barRow(`DOK ${d.level} — ${d.name}`, g.correct, g.total, d.color);
  }).join("");

  const tbody = document.getElementById("historyTableBody");
  const sorted = sessions.slice().reverse();
  tbody.innerHTML = sorted
    .map((s) => {
      const dt = new Date(s.date);
      const standardsList = Object.keys(s.byStandard || {}).join(", ");
      return `<tr>
        <td>${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
        <td>${escapeHtml(s.courseTitle)}</td>
        <td>${escapeHtml(standardsList)}</td>
        <td>${s.questionCount}</td>
        <td>${s.correctCount}/${s.questionCount} (${pct(s.correctCount, s.questionCount)}%)</td>
      </tr>`;
    })
    .join("");
  document.getElementById("historyEmptyState").style.display = sorted.length ? "none" : "block";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("clearDataBtn").addEventListener("click", () => {
    if (!confirm("Clear ALL demo students' progress data from this browser? This can't be undone.")) return;
    localStorage.removeItem(LS_KEYS.progress);
    renderProgress();
  });
});

// ---------------- teacher dashboard ----------------

function renderTeacherEntry() {
  const chipRow = document.getElementById("teacherCourseChips");
  chipRow.innerHTML = "";
  COURSES.forEach((c, i) => {
    const chip = document.createElement("button");
    chip.className = "chip" + (i === 0 ? " selected" : "");
    chip.textContent = c.title;
    chip.dataset.courseId = c.id;
    chip.addEventListener("click", () => {
      chipRow.querySelectorAll(".chip").forEach((x) => x.classList.remove("selected"));
      chip.classList.add("selected");
      renderTeacherHeatmap(c.id);
    });
    chipRow.appendChild(chip);
  });
  if (COURSES.length) renderTeacherHeatmap(COURSES[0].id);
}

const ACHIEVEMENT_INITIALS = { 1: "B", 2: "Dv", 3: "P", 4: "D" };

function renderTeacherHeatmap(courseId) {
  const course = COURSES.find((c) => c.id === courseId);
  const standards = STANDARDS[courseId] || [];
  const progress = loadJSON(LS_KEYS.progress, {});
  const slugs = Object.keys(progress).filter((slug) => (progress[slug].sessions || []).some((s) => s.courseId === courseId));
  const wrap = document.getElementById("teacherHeatmapWrap");

  if (slugs.length === 0) {
    wrap.innerHTML = `<div class="card"><div class="empty-state">No students have practiced ${escapeHtml(course.title)} in this browser yet. Log in as a student (or use "Switch") and complete a practice set to populate this view — this is real local data, never a fabricated roster.</div></div>`;
    return;
  }

  const headerCells = standards.map((s) => `<th title="${escapeHtml(s.description)}">${escapeHtml(s.code)}</th>`).join("");
  const rows = slugs
    .map((slug) => {
      const rec = progress[slug];
      const cells = standards
        .map((s) => {
          const g = rec.standardStats[s.code] || { correct: 0, total: 0 };
          const level = computeAchievementLevel(g.correct, g.total);
          if (!level) return `<td><span class="format-badge" title="No attempts yet">—</span></td>`;
          const initial = ACHIEVEMENT_INITIALS[level.level];
          return `<td><span class="dok-badge" style="background:${level.color}" title="${escapeHtml(level.name)} — ${pct(g.correct, g.total)}% on ${g.total} attempt(s)">${initial}</span></td>`;
        })
        .join("");
      return `<tr><td><strong>${escapeHtml(rec.displayName)}</strong></td>${cells}</tr>`;
    })
    .join("");

  const legend = ACHIEVEMENT_LEVELS
    .map((l) => `<span><span class="dok-swatch" style="background:${l.color}"></span>${escapeHtml(l.name)} (${ACHIEVEMENT_INITIALS[l.level]})</span>`)
    .join(" &nbsp; ");

  wrap.innerHTML = `
    <div class="card">
      <div style="overflow-x:auto;">
        <table class="history-table"><thead><tr><th>Student</th>${headerCells}</tr></thead><tbody>${rows}</tbody></table>
      </div>
      <p class="hint-text" style="margin-top:14px;">${legend}</p>
      <p class="hint-text" style="margin-top:6px;">Cells show each student's real achievement level for that standard, computed from their own local practice history in this browser — not a live class roster, and not GA's official Milestones cut scores (see CLAUDE.md).</p>
    </div>
  `;
}

// ---------------- nav wiring ----------------

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.addEventListener("click", () => {
      const target = el.dataset.nav;
      if (target === "progress") renderProgress();
      if (target === "classes") renderClasses();
      showView(target);
    });
  });

  initLogin();
});
