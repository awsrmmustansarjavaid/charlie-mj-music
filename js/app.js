/*
 * Charlie MJ Music — client-side application logic.
 *
 * IMPORTANT ARCHITECTURE NOTE
 * ---------------------------
 * This project is intentionally static. It does not call a private server and
 * it does not contain private API keys. Therefore the discovery engine uses
 * real public search URLs (YouTube, Spotify and web-search providers) instead
 * of pretending that it has a server-side search API.
 *
 * The important flow is:
 *   Create Moment -> analyze feeling -> build search pack -> render links
 *   -> optionally open the searches in new tabs.
 *
 * Everything that describes a user's moment is kept in the browser's local
 * storage. No default/fake songs, poems, quotes or memories are seeded.
 */

(() => {
  'use strict';

  const STORAGE = {
    memories: 'cmm_memories_v3',
    activeMoment: 'cmm_active_moment_v3',
    theme: 'cmm_theme_v3'
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    form: $('momentForm'), event: $('event'), mood: $('mood'), relationship: $('relationship'),
    soundVibe: $('soundVibe'), story: $('story'), partner: $('partner'), photo: $('photo'),
    photoPreview: $('photoPreview'), storyCount: $('storyCount'), momentOutput: $('momentOutput'),
    musicQuery: $('musicQuery'), service: $('service'), searchBlueprint: $('searchBlueprint'),
    searchAll: $('searchAll'), searchMusic: $('searchMusic'), searchPoetry: $('searchPoetry'),
    searchQuotes: $('searchQuotes'), searchCaptions: $('searchCaptions'), discoveryStatus: $('discoveryStatus'),
    discoveryResults: $('discoveryResults'), discoveryQueryHint: $('discoveryQueryHint'), musicUrl: $('musicUrl'),
    openMusic: $('openMusic'), musicStatus: $('musicStatus'), memoryList: $('memoryList'),
    exportMemories: $('exportMemories'), clearMemories: $('clearMemories'), clearMoment: $('clearMoment'),
    themeToggle: $('themeToggle'), toast: $('toast'), prepareLetter: $('prepareLetter'),
    letterPrompt: $('letterPrompt'), letterOutput: $('letterOutput'), copyAiPrompt: $('copyAiPrompt'),
    aiStatus: $('aiStatus'), openGuidedSearch: $('openGuidedSearch'), guidedStatus: $('guidedStatus'),
    recordButton: $('recordButton'), stopButton: $('stopButton'), recordStatus: $('recordStatus'),
    recordingPlayer: $('recordingPlayer')
  };

  let activeMoment = null;
  let memories = loadJSON(STORAGE.memories, []);
  let recorder = null;
  let recordingChunks = [];
  let currentPhotoData = '';

  // ---------- Small utilities ----------

  function loadJSON(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;'
    }[char]));
  }

  function clean(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function unique(values) {
    return [...new Set(values.map(clean).filter(Boolean))];
  }

  function encode(value) {
    return encodeURIComponent(clean(value));
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => els.toast.classList.remove('show'), 3600);
  }

  function updateStoryCount() {
    els.storyCount.textContent = `${els.story.value.length} / 1500`;
  }

  // ---------- Feeling-to-search intelligence ----------

  const eventTerms = {
    'Birthday': ['birthday love song', 'romantic birthday song'],
    'Marriage Anniversary': ['marriage anniversary song', 'anniversary love song', 'forever together song'],
    'Wedding': ['wedding love song', 'first dance song', 'wedding poetry'],
    'Proposal': ['proposal love song', 'will you marry me song', 'romantic proposal song'],
    'Date Night': ['date night love song', 'romantic date song'],
    'Long Distance': ['long distance relationship song', 'miss you love song', 'love across distance'],
    "Valentine's Day": ['valentine love song', 'valentines romantic song'],
    'Just Because': ['sweet love song', 'romantic song for no reason'],
    'Instagram / Social Post': ['romantic Instagram song', 'couple reel song'],
    'Other': ['romantic love song']
  };

  const moodTerms = {
    'Romantic': ['romantic', 'tender love'], 'Deep Love': ['deep love', 'soulmate love'],
    'Happy': ['happy couple', 'joyful love'], 'Dreamy': ['dreamy romantic', 'soft dreamy love'],
    'Passionate': ['passionate love', 'intense romance'], 'Nostalgic': ['nostalgic love', 'memories of us'],
    'Calm': ['calm romantic', 'peaceful love'], 'Playful': ['playful couple', 'cute love song'],
    'Heartfelt': ['heartfelt love', 'emotional romantic']
  };

  const relationshipTerms = {
    'New Love': ['new love', 'falling in love'], 'Married Love': ['married couple', 'husband wife love'],
    'Long Distance': ['long distance love', 'missing my partner'], 'Missing Someone': ['missing you', 'i miss you love'],
    'First Date': ['first date love', 'new romance'], 'Proposal': ['proposal', 'engagement love'],
    'Wedding / First Dance': ['first dance', 'wedding romance'], 'Healing / Reconnection': ['relationship healing', 'second chance love'],
    'Gratitude': ['thank you for loving me', 'grateful for you'], 'Forever / Soulmates': ['forever love', 'soulmates']
  };

  const vibeTerms = {
    'Acoustic / Soft': ['acoustic love song', 'soft romantic song'], 'Piano / Emotional': ['emotional piano love song', 'piano romance'],
    'Romantic Pop': ['romantic pop song'], 'R&B / Soul': ['R&B soul love song'], 'Indie / Dreamy': ['indie dreamy love song'],
    'Classic Love Song': ['classic romantic love song'], 'Wedding / First Dance': ['wedding first dance song'],
    'Instrumental': ['romantic instrumental'], 'Urdu / South Asian': ['Urdu romantic song', 'South Asian love song'],
    'Turkish / International': ['Turkish romantic song', 'international love song']
  };

  function analyzeMoment(moment) {
    const story = moment.story.toLowerCase();
    const detected = [];
    const rules = [
      [/miss|missing|apart|away|abroad|distance/, ['missing you', 'long distance love', 'reunion song']],
      [/sorry|apolog|mistake|fight|argument|hurt/, ['relationship healing', 'sorry love song', 'reconciliation']],
      [/thank|grateful|appreciat/, ['gratitude love', 'thank you love song']],
      [/first|met|meet|begin/, ['first love', 'new romance', 'first date']],
      [/forever|always|soulmate|eternal/, ['forever love', 'soulmate song']],
      [/wedding|married|husband|wife|anniversary/, ['marriage love', 'wedding romance']],
      [/baby|child|family|home/, ['family love', 'home love song']],
      [/cry|sad|lonely|heartbreak/, ['emotional love song', 'healing song']],
      [/happy|smile|laugh|joy/, ['happy love song', 'feel good couple song']]
    ];
    rules.forEach(([regex, terms]) => { if (regex.test(story)) detected.push(...terms); });

    const primary = unique([
      ...(eventTerms[moment.event] || []), ...(moodTerms[moment.mood] || []),
      ...(relationshipTerms[moment.relationship] || []), ...(vibeTerms[moment.soundVibe] || []), detected
    ]);

    const storyWords = story
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length >= 4)
      .filter((word) => !['that', 'this', 'with', 'want', 'something', 'really', 'because', 'about', 'from', 'have', 'will', 'your'].includes(word));

    return { terms: unique([...primary, ...storyWords.slice(0, 8)]).slice(0, 16), detected };
  }

  function buildContext(moment, extra = '') {
    const analysis = analyzeMoment(moment);
    const parts = [
      extra, moment.event, moment.mood, moment.relationship, moment.soundVibe,
      ...analysis.terms.slice(0, 8), moment.story
    ];
    return unique(parts).join(' ');
  }

  function getMoment() {
    if (activeMoment) return activeMoment;
    const stored = loadJSON(STORAGE.activeMoment, null);
    if (stored) activeMoment = stored;
    return activeMoment;
  }

  // ---------- Real external discovery links ----------

  function buildSearchPack(moment, extra = '') {
    const context = buildContext(moment, extra);
    const query = clean(context);
    const q = encode(query);
    const poetryQuery = encode(`${query} romantic poetry poem`);
    return {
      query,
      youtube: `https://www.youtube.com/results?search_query=${q}`,
      spotify: `https://open.spotify.com/search/${q}`,
      poetry: `https://www.google.com/search?q=${encode(`site:poetryfoundation.org OR site:poets.org ${query} romantic poetry`)}`,
      poetryGeneral: `https://www.google.com/search?q=${poetryQuery}`,
      quotes: `https://www.google.com/search?q=${encode(`site:wikiquote.org OR site:goodreads.com ${query} love quotes`)}`,
      quotesGeneral: `https://www.google.com/search?q=${encode(`${query} wise love quotes`)}`,
      captions: `https://www.google.com/search?q=${encode(`${query} romantic Instagram captions`)}`,
      searchEngine: `https://www.google.com/search?q=${q}`
    };
  }

  function openUrl(url, label) {
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) showToast(`Your browser blocked the ${label} tab. Use the button in the Discovery Pack.`);
    return opened;
  }

  function openPack(pack, type = 'all') {
    let urls;
    if (type === 'music') {
      const selected = els.service.value;
      urls = selected === 'youtube' ? [pack.youtube] : selected === 'spotify' ? [pack.spotify] : [pack.youtube, pack.spotify];
    } else if (type === 'poetry') {
      urls = [pack.poetry, pack.poetryGeneral];
    } else if (type === 'quotes') {
      urls = [pack.quotes, pack.quotesGeneral];
    } else if (type === 'captions') {
      urls = [pack.captions];
    } else {
      urls = [pack.youtube, pack.spotify, pack.poetry, pack.quotes, pack.captions];
    }

    // The calls happen synchronously from the button/form event so browsers are
    // allowed to treat them as user-initiated popups. If a browser still blocks
    // some tabs, the rendered cards below remain clickable.
    let opened = 0;
    urls.forEach((url, index) => {
      if (index === 0 || type !== 'all') {
        if (openUrl(url, type)) opened += 1;
      } else {
        // Give the browser a separate user gesture only where possible. The
        // visual pack is the reliable fallback when popup policies intervene.
        const win = window.open(url, '_blank', 'noopener,noreferrer');
        if (win) opened += 1;
      }
    });
    els.discoveryStatus.textContent = `${opened} discovery tab${opened === 1 ? '' : 's'} opened. Your complete search pack is also shown below.`;
  }

  function renderBlueprint(moment) {
    const analysis = analyzeMoment(moment);
    const pack = buildSearchPack(moment, els.musicQuery.value);
    els.discoveryQueryHint.textContent = `Live query: ${pack.query.slice(0, 140)}${pack.query.length > 140 ? '…' : ''}`;
    els.searchBlueprint.innerHTML = `
      <div class="blueprint-row"><span>♡ Moment</span><strong>${escapeHTML(moment.event || 'Special moment')}</strong></div>
      <div class="blueprint-row"><span>♡ Feeling</span><strong>${escapeHTML(moment.mood || 'Personal feeling')}</strong></div>
      <div class="blueprint-row"><span>♡ Detected themes</span><strong>${escapeHTML(unique([...analysis.detected, ...analysis.terms]).slice(0, 8).join(' · ') || 'romantic love')}</strong></div>
      <div class="blueprint-row"><span>♡ Search context</span><strong>${escapeHTML(pack.query)}</strong></div>`;
  }

  function renderDiscoveryPack(moment, autoOpen = false) {
    const pack = buildSearchPack(moment, els.musicQuery.value);
    const analysis = analyzeMoment(moment);
    els.discoveryResults.classList.remove('d-none');
    els.discoveryResults.innerHTML = `
      <div class="pack-head">
        <div><div class="eyebrow">♡ DISCOVERY PACK READY</div><h3>We turned your feeling into real searches.</h3><p>${escapeHTML(pack.query)}</p></div>
        <button id="openEverything" class="btn btn-heart" type="button">Open All Searches</button>
      </div>
      <div class="row g-3 mt-2">
        ${discoveryCard('🎵', 'YouTube Songs', 'Search real videos, songs and performances.', pack.youtube, 'Search YouTube')}
        ${discoveryCard('🟢', 'Spotify Songs', 'Search real tracks, artists and albums.', pack.spotify, 'Search Spotify')}
        ${discoveryCard('📖', 'Poetry', 'Find poetry matching the event, mood and story.', pack.poetry, 'Find Poetry')}
        ${discoveryCard('💬', 'Wise Quotes', 'Find relationship and love quotes around the same feeling.', pack.quotes, 'Find Quotes')}
        ${discoveryCard('✨', 'Captions', 'Find social captions for the moment.', pack.captions, 'Find Captions')}
        ${discoveryCard('🔎', 'Broad Web Search', 'Use the complete emotional search phrase anywhere on the web.', pack.searchEngine, 'Search Web')}
      </div>
      <div class="detected-feelings mt-4"><strong>Feeling translator:</strong> ${escapeHTML(unique([...analysis.detected, ...analysis.terms]).slice(0, 10).join(' · ') || 'romantic love')}</div>`;

    $('openEverything').addEventListener('click', () => openPack(pack, 'all'));
    if (autoOpen) openPack(pack, 'all');
  }

  function discoveryCard(icon, title, text, url, action) {
    return `<div class="col-md-6 col-xl-4"><article class="result-card"><div class="result-icon">${icon}</div><h4>${escapeHTML(title)}</h4><p>${escapeHTML(text)}</p><a class="btn btn-outline-heart btn-sm" href="${url}" target="_blank" rel="noopener noreferrer">${escapeHTML(action)} ↗</a></article></div>`;
  }

  // ---------- Moment creation ----------

  function collectMoment() {
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      createdAt: new Date().toISOString(),
      event: clean(els.event.value), mood: clean(els.mood.value), relationship: clean(els.relationship.value),
      soundVibe: clean(els.soundVibe.value), story: clean(els.story.value), partner: clean(els.partner.value),
      photo: currentPhotoData
    };
  }

  function saveMoment(moment) {
    activeMoment = moment;
    saveJSON(STORAGE.activeMoment, moment);
    memories = [moment, ...memories.filter((item) => item.id !== moment.id)].slice(0, 30);
    saveJSON(STORAGE.memories, memories);
  }

  function renderMomentOutput(moment) {
    const analysis = analyzeMoment(moment);
    els.momentOutput.classList.remove('d-none');
    els.momentOutput.innerHTML = `
      <div class="moment-created"><span class="big-heart">♡</span><div><div class="eyebrow">MOMENT CREATED</div><h3>${escapeHTML(moment.partner ? `A moment for ${moment.partner}` : 'Your love moment')}</h3><p class="mb-2">${escapeHTML(moment.event || 'Special moment')} · ${escapeHTML(moment.mood || 'Heartfelt')}</p><div class="chips">${unique([...analysis.detected, ...analysis.terms]).slice(0, 7).map((x) => `<span>${escapeHTML(x)}</span>`).join('')}</div></div></div>
      <div class="auto-discovery-note"><strong>Now searching your moment.</strong> The app has built real YouTube, Spotify, poetry, quote and caption searches below. If your browser blocks automatic tabs, click the cards in the Discovery Pack.</div>`;
  }

  function scrollToDiscovery() {
    document.querySelector('#discover')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  els.form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!els.event.value || !els.mood.value) {
      showToast('Choose an event and mood first so the discovery engine has a clear feeling.');
      return;
    }
    const moment = collectMoment();
    saveMoment(moment);
    renderMomentOutput(moment);
    renderBlueprint(moment);
    renderDiscoveryPack(moment, true);
    renderMemories();
    showToast('Your moment is created — searching songs, poetry, quotes and captions now.');
    setTimeout(scrollToDiscovery, 120);
  });

  // ---------- Discovery controls ----------

  function requireMoment() {
    const moment = getMoment();
    if (!moment) {
      showToast('Create a moment first. Then Charlie MJ Music can search from what you feel.');
      document.querySelector('#create')?.scrollIntoView({ behavior: 'smooth' });
      return null;
    }
    return moment;
  }

  function doSearch(type) {
    const moment = requireMoment();
    if (!moment) return;
    const pack = buildSearchPack(moment, els.musicQuery.value);
    renderBlueprint(moment);
    renderDiscoveryPack(moment, false);
    openPack(pack, type);
  }

  els.searchAll.addEventListener('click', () => doSearch('all'));
  els.searchMusic.addEventListener('click', () => doSearch('music'));
  els.searchPoetry.addEventListener('click', () => doSearch('poetry'));
  els.searchQuotes.addEventListener('click', () => doSearch('quotes'));
  els.searchCaptions.addEventListener('click', () => doSearch('captions'));
  els.musicQuery.addEventListener('input', () => { const moment = getMoment(); if (moment) renderBlueprint(moment); });

  els.openMusic.addEventListener('click', () => {
    const url = clean(els.musicUrl.value);
    if (!url || !/^https?:\/\//i.test(url)) {
      els.musicStatus.textContent = 'Paste a valid YouTube or Spotify URL.';
      return;
    }
    openUrl(url, 'music');
    els.musicStatus.textContent = 'Opening your music link in a new tab.';
  });

  // ---------- Photo handling ----------

  els.photo.addEventListener('change', () => {
    const file = els.photo.files?.[0];
    if (!file) { currentPhotoData = ''; els.photoPreview.classList.add('d-none'); return; }
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      currentPhotoData = String(reader.result);
      els.photoPreview.classList.remove('d-none');
      els.photoPreview.innerHTML = `<img src="${currentPhotoData}" alt="Selected couple photo preview"><button id="removePhoto" class="btn btn-ghost btn-sm" type="button">Remove photo</button>`;
      $('removePhoto').addEventListener('click', () => { currentPhotoData = ''; els.photo.value = ''; els.photoPreview.classList.add('d-none'); });
    };
    reader.readAsDataURL(file);
  });

  // ---------- Local memories ----------

  function renderMemories() {
    if (!memories.length) {
      els.memoryList.innerHTML = '<div class="empty-state">♡ Your saved love stories will appear here.</div>';
      return;
    }
    els.memoryList.innerHTML = memories.map((moment) => `
      <article class="memory-card">
        ${moment.photo ? `<img src="${moment.photo}" alt="Saved couple memory">` : ''}
        <div class="memory-body"><span class="memory-date">${new Date(moment.createdAt).toLocaleString()}</span><h3>${escapeHTML(moment.partner || moment.event || 'Love moment')}</h3><p>${escapeHTML(moment.story || `${moment.mood || 'Romantic'} · ${moment.event || 'Special moment'}`)}</p><button class="btn btn-outline-heart btn-sm reopen-memory" data-id="${escapeHTML(moment.id)}" type="button">Discover Again</button></div>
      </article>`).join('');
    document.querySelectorAll('.reopen-memory').forEach((button) => button.addEventListener('click', () => {
      const moment = memories.find((item) => item.id === button.dataset.id);
      if (!moment) return;
      activeMoment = moment; saveJSON(STORAGE.activeMoment, moment); renderBlueprint(moment); renderDiscoveryPack(moment, true); scrollToDiscovery();
    }));
  }

  els.exportMemories.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(memories, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'charlie-mj-music-memories.json'; anchor.click(); URL.revokeObjectURL(url);
  });

  els.clearMemories.addEventListener('click', () => {
    if (!confirm('Clear all locally saved Charlie MJ Music memories?')) return;
    memories = []; saveJSON(STORAGE.memories, memories); renderMemories(); showToast('Local memories cleared.');
  });

  els.clearMoment.addEventListener('click', () => {
    els.form.reset(); currentPhotoData = ''; els.photoPreview.classList.add('d-none');
    activeMoment = null; localStorage.removeItem(STORAGE.activeMoment); els.momentOutput.classList.add('d-none');
    els.discoveryResults.classList.add('d-none'); els.searchBlueprint.innerHTML = ''; els.discoveryStatus.textContent = 'Create a moment above and Charlie MJ Music will prepare the complete discovery pack automatically.';
    updateStoryCount(); showToast('Current moment cleared.');
  });

  // ---------- Advanced love helpers ----------

  els.openGuidedSearch.addEventListener('click', () => {
    const moment = requireMoment();
    if (!moment) return;
    const suggestions = analyzeMoment(moment).terms;
    els.musicQuery.value = suggestions.slice(0, 4).join(' ');
    renderBlueprint(moment); renderDiscoveryPack(moment, false); scrollToDiscovery();
    els.guidedStatus.textContent = `Suggested search language: ${suggestions.slice(0, 8).join(' · ')}`;
  });

  function makeAiPrompt(moment, request) {
    const pack = buildSearchPack(moment, request);
    return `You are a romantic writing and music discovery assistant.\n\nMoment: ${moment.event}\nMood: ${moment.mood}\nRelationship: ${moment.relationship || 'not specified'}\nSound: ${moment.soundVibe || 'not specified'}\nStory: ${moment.story}\n\nSearch concepts: ${pack.query}\n\nTask: ${request || 'Suggest 10 song-search directions, 5 poetry themes, 5 wise quote themes and 5 original caption ideas. Do not reproduce copyrighted lyrics or poems.'}`;
  }

  els.prepareLetter.addEventListener('click', () => {
    const moment = requireMoment(); if (!moment) return;
    const prompt = makeAiPrompt(moment, els.letterPrompt.value || 'Write an original heartfelt love letter based on this moment.');
    els.letterOutput.classList.remove('d-none'); els.letterOutput.textContent = prompt;
    showToast('Local AI prompt prepared.');
  });

  els.copyAiPrompt.addEventListener('click', async () => {
    const moment = getMoment();
    if (!moment) { showToast('Create a moment first.'); return; }
    const prompt = makeAiPrompt(moment, 'Help me find the words and music for this feeling. Give original writing only.');
    try { await navigator.clipboard.writeText(prompt); els.aiStatus.textContent = 'Prompt copied. Paste it into your local AI tool.'; }
    catch { els.aiStatus.textContent = prompt; }
  });

  // ---------- Browser microphone recording ----------

  els.recordButton.addEventListener('click', async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      els.recordStatus.textContent = 'This browser does not support microphone recording.'; return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingChunks = [];
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => { if (event.data.size) recordingChunks.push(event.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(recordingChunks, { type: recorder.mimeType || 'audio/webm' });
        els.recordingPlayer.src = URL.createObjectURL(blob);
        els.recordingPlayer.classList.remove('d-none');
        els.recordStatus.textContent = 'Recording ready. A recognition provider can process this clip; this static app does not expose a private provider key.';
      };
      recorder.start(); els.recordButton.classList.add('d-none'); els.stopButton.classList.remove('d-none');
      els.recordStatus.textContent = 'Recording… sing or play a short clip, then stop.';
    } catch { els.recordStatus.textContent = 'Microphone permission was not granted.'; }
  });

  els.stopButton.addEventListener('click', () => {
    if (recorder?.state === 'recording') recorder.stop();
    els.recordButton.classList.remove('d-none'); els.stopButton.classList.add('d-none');
  });

  // ---------- Theme + initialization ----------

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    saveJSON(STORAGE.theme, theme);
    els.themeToggle.textContent = theme === 'rose' ? '☾ Midnight' : '☀ Rose';
  }

  els.themeToggle.addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'rose' ? 'midnight' : 'rose'));
  els.story.addEventListener('input', updateStoryCount);

  // Restore the latest moment so refreshing the GitHub Pages site does not
  // destroy the discovery context. No server/database is involved.
  activeMoment = loadJSON(STORAGE.activeMoment, null);
  if (activeMoment) { renderBlueprint(activeMoment); renderMomentOutput(activeMoment); renderDiscoveryPack(activeMoment, false); }
  renderMemories(); updateStoryCount(); applyTheme(loadJSON(STORAGE.theme, 'midnight'));
})();
