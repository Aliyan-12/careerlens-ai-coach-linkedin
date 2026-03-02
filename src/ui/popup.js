/* ===== State Management ===== */

function showState(state) {
  ['initial', 'loading', 'results', 'error'].forEach(s => {
    document.getElementById(`${s}-state`).classList.toggle('hidden', s !== state);
  });
}

function updateLoadingStep(step) {
  document.querySelectorAll('.loading-step').forEach((el, i) => {
    el.classList.remove('active', 'done');
    if (i < step) el.classList.add('done');
    else if (i === step) el.classList.add('active');
  });
}

function showError(message) {
  document.getElementById('error-message').textContent = message;
  showState('error');
}

/* ===== Score Helpers ===== */

function getScoreColor(score) {
  if (score >= 80) return '#057642';
  if (score >= 60) return '#0a66c2';
  if (score >= 40) return '#c37d16';
  return '#cc1016';
}

function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Work';
  return 'Poor';
}

function formatDuration(weeks) {
  if (!weeks) return '';
  const years = Math.floor(weeks / 52);
  const months = Math.round((weeks % 52) / 4.33);
  if (years > 0 && months > 0) return `${years} yr ${months} mo`;
  if (years > 0) return `${years} yr`;
  if (months > 0) return `${months} mo`;
  return `${weeks} wk`;
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

/* ===== SVG Icons ===== */

const ICONS = {
  user: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" fill="#0a66c2"/>
    <path d="M5 20c0-3.5 3.5-6 7-6s7 2.5 7 6" fill="#0a66c2" opacity="0.4"/>
  </svg>`,
  briefcase: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="8" width="18" height="12" rx="2" fill="#c37d16" opacity="0.4"/>
    <rect x="8" y="4" width="8" height="6" rx="1" stroke="#c37d16" stroke-width="2" fill="none"/>
  </svg>`,
  headline: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="4" rx="1" fill="#057642"/>
    <rect x="3" y="11" width="13" height="3" rx="1" fill="#057642" opacity="0.4"/>
    <rect x="3" y="16" width="9" height="3" rx="1" fill="#057642" opacity="0.2"/>
  </svg>`,
  star: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L14.5 8.5H21.5L16 12.5L18 19.5L12 15.5L6 19.5L8 12.5L2.5 8.5H9.5L12 2Z" fill="#7c3aed"/>
  </svg>`,
  lightbulb: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M9 21h6M12 3a6 6 0 00-4 10.5V17h8v-3.5A6 6 0 0012 3z" stroke="#c37d16" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  check: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M3 8.5L6.5 12L13 4" stroke="#057642" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  arrow: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M8 12V4M5 6.5L8 3.5L11 6.5" stroke="#0a66c2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  target: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="#c37d16" stroke-width="1.5" fill="none"/>
    <circle cx="8" cy="8" r="3" stroke="#c37d16" stroke-width="1.5" fill="none"/>
    <circle cx="8" cy="8" r="1" fill="#c37d16"/>
  </svg>`
};

/* ===== Rendering ===== */

function renderCategoryBar(label, score) {
  const s = score || 0;
  const color = getScoreColor(s);
  return `
    <div class="score-category">
      <div class="score-cat-header">
        <span class="score-cat-label">${label}</span>
        <span class="score-cat-value" style="color:${color}">${s}</span>
      </div>
      <div class="score-bar">
        <div class="score-bar-fill" style="background:${color};width:0" data-target="${s}"></div>
      </div>
    </div>`;
}

function renderTipItem(text, type) {
  const icon = type === 'strength' ? ICONS.check : ICONS.arrow;
  return `
    <div class="tip-item ${type}">
      <span class="tip-icon">${icon}</span>
      <span class="tip-text">${text}</span>
    </div>`;
}

function renderResults(response) {
  const { structuredProfile, analysis } = response;
  const profile = structuredProfile || {};
  const scores = analysis || {};
  const container = document.getElementById('results-state');

  const overallScore = scores.overallScore || 0;
  const scoreColor = getScoreColor(overallScore);
  const circumference = 2 * Math.PI * 52;
  const offset = circumference * (1 - overallScore / 100);

  let html = '';

  // Profile Header (if name available)
  if (profile.headline?.name) {
    html += `
      <div class="profile-header-card animate-in">
        <div class="profile-avatar">${getInitials(profile.headline.name)}</div>
        <div class="profile-info">
          <div class="profile-name">${profile.headline.name}</div>
          ${profile.headline.title ? `<div class="profile-title">${profile.headline.title}</div>` : ''}
          ${profile.headline.location ? `<div class="profile-location">${profile.headline.location}</div>` : ''}
        </div>
      </div>`;
  }

  // Score Circle
  html += `
    <div class="score-section animate-in">
      <div class="score-circle-wrap">
        <svg viewBox="0 0 120 120">
          <circle class="score-circle-bg" cx="60" cy="60" r="52"/>
          <circle class="score-circle-progress" cx="60" cy="60" r="52"
            stroke="${scoreColor}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${circumference}"
            data-target="${offset}"/>
        </svg>
        <div class="score-value">
          <div class="score-number" style="color:${scoreColor}" data-target="${overallScore}">0</div>
          <div class="score-sublabel">Score</div>
        </div>
      </div>
      <div class="score-badge" style="background:${scoreColor}15;color:${scoreColor}">
        ${getScoreLabel(overallScore)}
      </div>
      <div class="score-breakdown">
        ${renderCategoryBar('Headline', scores.categories?.headline?.score)}
        ${renderCategoryBar('About', scores.categories?.about?.score)}
        ${renderCategoryBar('Experience', scores.categories?.experience?.score)}
        ${renderCategoryBar('Skills', scores.categories?.skills?.score)}
      </div>
    </div>`;

  // About Section
  if (profile.about) {
    const aboutScore = scores.categories?.about?.score;
    const aboutTips = scores.categories?.about?.tips || [];
    html += `
      <div class="section-card animate-in">
        <div class="section-header" onclick="this.parentElement.classList.toggle('collapsed')">
          <div class="section-icon" style="background:#e8f4fd">${ICONS.user}</div>
          <span class="section-title">About</span>
          ${aboutScore ? `<span class="section-score-badge" style="background:${getScoreColor(aboutScore)}15;color:${getScoreColor(aboutScore)}">${aboutScore}/100</span>` : ''}
          <svg class="section-chevron" viewBox="0 0 20 20" fill="currentColor"><path d="M6 8l4 4 4-4"/></svg>
        </div>
        <div class="section-body">
          <p class="about-summary">${profile.about.summary || 'No summary available.'}</p>
          ${profile.about.keyPoints?.length ? `
            <div class="key-points">
              ${profile.about.keyPoints.map(kp => `<span class="key-point-tag">${kp}</span>`).join('')}
            </div>` : ''}
          ${aboutTips.length ? `
            <div class="tips-list">
              ${aboutTips.map(t => renderTipItem(t, 'improvement')).join('')}
            </div>` : ''}
          ${scores.aboutRewrite ? `
            <div class="about-rewrite">
              <div class="about-rewrite-label">Suggested Rewrite</div>
              <div class="about-rewrite-text">${scores.aboutRewrite}</div>
            </div>` : ''}
        </div>
      </div>`;
  }

  // Experience Section
  if (profile.experience?.length) {
    const expScore = scores.categories?.experience?.score;
    const expTips = scores.categories?.experience?.tips || [];
    html += `
      <div class="section-card animate-in">
        <div class="section-header" onclick="this.parentElement.classList.toggle('collapsed')">
          <div class="section-icon" style="background:#fef3e6">${ICONS.briefcase}</div>
          <span class="section-title">Experience</span>
          ${expScore ? `<span class="section-score-badge" style="background:${getScoreColor(expScore)}15;color:${getScoreColor(expScore)}">${expScore}/100</span>` : ''}
          <svg class="section-chevron" viewBox="0 0 20 20" fill="currentColor"><path d="M6 8l4 4 4-4"/></svg>
        </div>
        <div class="section-body">
          ${profile.experience.map(exp => `
            <div class="experience-item">
              <div class="exp-dot"></div>
              <div class="exp-content">
                <div class="exp-role">${exp.role || 'Role'}</div>
                <div class="exp-company">${exp.company || 'Company'}</div>
                ${exp.duration ? `<div class="exp-duration">${formatDuration(exp.duration)}</div>` : ''}
                ${exp.bullets?.length ? `
                  <ul class="exp-bullets">
                    ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
                  </ul>` : ''}
              </div>
            </div>`).join('')}
          ${expTips.length ? `
            <div class="tips-list" style="margin-top:12px;padding-top:12px;border-top:1px solid #f0f0f0">
              ${expTips.map(t => renderTipItem(t, 'improvement')).join('')}
            </div>` : ''}
        </div>
      </div>`;
  }

  // Headline Suggestions
  if (scores.headlineSuggestions?.length) {
    const hlScore = scores.categories?.headline?.score;
    html += `
      <div class="section-card animate-in">
        <div class="section-header" onclick="this.parentElement.classList.toggle('collapsed')">
          <div class="section-icon" style="background:#e6f4ea">${ICONS.headline}</div>
          <span class="section-title">Headline Suggestions</span>
          ${hlScore ? `<span class="section-score-badge" style="background:${getScoreColor(hlScore)}15;color:${getScoreColor(hlScore)}">${hlScore}/100</span>` : ''}
          <svg class="section-chevron" viewBox="0 0 20 20" fill="currentColor"><path d="M6 8l4 4 4-4"/></svg>
        </div>
        <div class="section-body">
          ${scores.headlineSuggestions.map(s => `<div class="headline-suggestion">"${s}"</div>`).join('')}
          ${scores.categories?.headline?.tips?.length ? `
            <div class="tips-list" style="margin-top:10px">
              ${scores.categories.headline.tips.map(t => renderTipItem(t, 'improvement')).join('')}
            </div>` : ''}
        </div>
      </div>`;
  }

  // Key Insights (Strengths & Improvements)
  if (scores.topStrengths?.length || scores.topImprovements?.length) {
    html += `
      <div class="section-card animate-in">
        <div class="section-header" onclick="this.parentElement.classList.toggle('collapsed')">
          <div class="section-icon" style="background:#f3e8fd">${ICONS.star}</div>
          <span class="section-title">Key Insights</span>
          <svg class="section-chevron" viewBox="0 0 20 20" fill="currentColor"><path d="M6 8l4 4 4-4"/></svg>
        </div>
        <div class="section-body">
          ${scores.topStrengths?.length ? `
            <div class="insight-group">
              <div class="insight-group-title">${ICONS.check} Strengths</div>
              <div class="tips-list">
                ${scores.topStrengths.map(s => renderTipItem(s, 'strength')).join('')}
              </div>
            </div>` : ''}
          ${scores.topImprovements?.length ? `
            <div class="insight-group">
              <div class="insight-group-title">${ICONS.target} Areas to Improve</div>
              <div class="tips-list">
                ${scores.topImprovements.map(s => renderTipItem(s, 'improvement')).join('')}
              </div>
            </div>` : ''}
        </div>
      </div>`;
  }

  // Footer
  html += `
    <div class="footer animate-in">
      <div class="footer-reanalyze">
        <button id="reanalyze" class="btn-secondary">Re-analyze Profile</button>
      </div>
      <div class="footer-brand">Powered by CareerLens AI</div>
    </div>`;

  container.innerHTML = html;

  // Animate score circle and bars after render
  requestAnimationFrame(() => {
    setTimeout(() => {
      const circle = container.querySelector('.score-circle-progress');
      if (circle) circle.style.strokeDashoffset = circle.dataset.target;

      const scoreNum = container.querySelector('.score-number');
      if (scoreNum) animateNumber(scoreNum, 0, parseInt(scoreNum.dataset.target), 1200);

      container.querySelectorAll('.score-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.target + '%';
      });
    }, 80);
  });

  // Attach re-analyze handler
  document.getElementById('reanalyze')?.addEventListener('click', startAnalysis);
}

/* ===== Number Animation ===== */

function animateNumber(el, from, to, duration) {
  const start = performance.now();
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* ===== Main Analysis ===== */

async function startAnalysis() {
  showState('loading');
  updateLoadingStep(0);

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url || !tab.url.includes('linkedin.com/in/')) {
      showError('Please navigate to a LinkedIn profile page first.');
      return;
    }

    updateLoadingStep(1);

    // Inject content script if not already present (handles extension reload case)
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['src/content/index.js']
      });
    } catch (e) {
      // Script may already be injected, that's fine
    }

    const profileData = await chrome.tabs.sendMessage(tab.id, { type: "SCRAPE_PROFILE" });

    if (!profileData || (!profileData.headline && !profileData.aboutSection && !profileData.experienceSection)) {
      showError('Could not extract profile data. Make sure the profile page is fully loaded and try again.');
      return;
    }

    updateLoadingStep(2);

    const response = await chrome.runtime.sendMessage({
      type: "ANALYZE_WITH_GEMINI",
      payload: profileData
    });

    updateLoadingStep(3);

    if (!response || (!response.structuredProfile && !response.analysis)) {
      showError('Analysis failed. Please try again.');
      return;
    }

    renderResults(response);
    showState('results');

  } catch (error) {
    console.error('CareerLens analysis error:', error);
    showError(error.message || 'An unexpected error occurred. Please try again.');
  }
}

/* ===== Event Listeners ===== */

document.getElementById('analyze').addEventListener('click', startAnalysis);
document.getElementById('retry').addEventListener('click', startAnalysis);
