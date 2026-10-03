/*
 * Charlie MJ Music — browser-only application logic.
 *
 * Architecture promise:
 * - No backend, database, Node/Python server or GitHub Actions workflow.
 * - No private API secrets are embedded in this file.
 * - Personal moments remain in the browser unless the user opens an external service.
 * - Discovery uses normal public search URLs, so the core app still works on GitHub Pages.
 *
 * The important product behavior is the "moment -> discovery pack" flow:
 * creating a moment immediately builds search phrases for YouTube, Spotify,
 * poetry, wise quotes and social captions. A browser may block multiple popups;
 * when that happens the same searches remain available as clearly labeled buttons.
 */
(function(){
  'use strict';

  const STORAGE_KEY = 'charlie-mj-music.memories.v2';
  const ACTIVE_KEY = 'charlie-mj-music.active-moment.v1';
  const THEME_KEY = 'charlie-mj-music.theme.v1';
  const $ = (id) => document.getElementById(id);

  let mediaRecorder = null;
  let audioChunks = [];
  let activeMoment = null;

  // Small browser-safe helper used for status messages and romantic notifications.
  function toast(message){
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 3600);
  }

  // Escape user-authored text before inserting it into an HTML result card.
  function escapeHtml(value){
    return String(value ?? '').replace(/[&<>'"]/g, c => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
    }[c]));
  }

  function loadMemories(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch (error) { return []; }
  }

  function saveMemories(items){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
    catch (error) { toast('Browser storage is full. Try removing an old photo or memory.'); }
  }

  function saveActiveMoment(moment){
    activeMoment = moment;
    try { localStorage.setItem(ACTIVE_KEY, JSON.stringify(moment)); }
    catch (error) { /* The app still works for the current page session. */ }
  }

  function loadActiveMoment(){
    try { return JSON.parse(localStorage.getItem(ACTIVE_KEY) || 'null'); }
    catch (error) { return null; }
  }

  // Theme preference is local to this browser; there is no account or server preference.
  function initTheme(){
    if(localStorage.getItem(THEME_KEY) === 'light') document.body.classList.add('light');
    $('themeToggle').addEventListener('click', () => {
      document.body.classList.toggle('light');
      localStorage.setItem(THEME_KEY, document.body.classList.contains('light') ? 'light' : 'dark');
    });
  }

  // Convert the selected photo to a local data URL for preview/memory storage.
  $('photo').addEventListener('change', () => {
    const file = $('photo').files[0];
    const preview = $('photoPreview');
    if(!file){
      preview.classList.add('d-none');
      preview.style.backgroundImage = '';
      return;
    }
    if(!file.type.startsWith('image/')){
      toast('Please choose an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      preview.style.backgroundImage = `url("${reader.result}")`;
      preview.classList.remove('d-none');
      preview.dataset.dataUrl = reader.result;
    };
    reader.readAsDataURL(file);
  });

  $('story').addEventListener('input', () => {
    $('storyCount').textContent = `${$('story').value.length} / 1500`;
    updateSearchBlueprint();
  });
  ['event','mood','relationship','soundVibe','musicQuery'].forEach(id => {
    $(id).addEventListener('change', updateSearchBlueprint);
    $(id).addEventListener('input', updateSearchBlueprint);
  });

  /*
   * This local vocabulary is deliberately small and transparent.
   * It is not pretending to be an AI model. It simply translates common feelings
   * into search-friendly phrases so someone who says "I miss her but I am hopeful"
   * can discover better music without knowing an artist or song title.
   */
  const FEELING_MAP = [
    { keys:['miss','missing','far away','distance','abroad','apart','away from'], words:['long distance love','missing you','hopeful reunion','love across distance'] },
    { keys:['first date','first time','new relationship','new love','just met'], words:['new love','first date','falling in love','sweet romantic song'] },
    { keys:['anniversary','years together','married','marriage','wife','husband'], words:['marriage love','forever together','anniversary song','deep couple love'] },
    { keys:['proposal','engage','engagement','will you marry','marry me'], words:['proposal love song','will you marry me','forever love','romantic proposal'] },
    { keys:['wedding','first dance','bride','groom'], words:['wedding love song','first dance','romantic wedding','eternal love'] },
    { keys:['sorry','apology','mistake','forgive','argument','fight','hurt'], words:['love after conflict','forgive and reconnect','healing relationship','second chance love'] },
    { keys:['healing','heal','difficult','hard time','support','strong'], words:['healing love','comfort song','love through difficult times','hopeful relationship'] },
    { keys:['thank','grateful','gratitude','appreciate'], words:['gratitude love song','thank you my love','appreciation for partner','heartfelt love'] },
    { keys:['happy','smile','laugh','fun','joy','playful'], words:['happy love song','feel good couple song','playful romance','joyful relationship'] },
    { keys:['nostalgic','memory','remember','memories','childhood','old days'], words:['nostalgic love song','memories of us','old romantic song','timeless love'] },
    { keys:['passion','desire','chemistry','kiss','attraction'], words:['passionate love song','romantic chemistry','deep attraction','intimate romance'] },
    { keys:['calm','peace','safe','home','comfort'], words:['peaceful love song','love feels like home','soft romantic song','comforting relationship'] },
    { keys:['goodbye','leaving','departure','last night'], words:['goodbye love song','bittersweet love','until we meet again','emotional farewell'] },
    { keys:['forever','soulmate','always','eternal','together forever'], words:['forever love song','soulmate song','eternal love','always together'] }
  ];

  const MOOD_MAP = {
    'Romantic':['romantic love song','beautiful love'],
    'Deep Love':['deep emotional love','soulmate love'],
    'Happy':['happy couple song','joyful love'],
    'Dreamy':['dreamy romantic','soft cinematic love'],
    'Passionate':['passionate romance','intense love'],
    'Nostalgic':['nostalgic romance','memories together'],
    'Calm':['peaceful love','soft acoustic romance'],
    'Playful':['playful couple','fun romantic song'],
    'Heartfelt':['heartfelt love','emotional romantic song']
  };

  const EVENT_MAP = {
    'Birthday':['birthday love song','birthday message for partner'],
    'Marriage Anniversary':['anniversary love song','marriage anniversary'],
    'Wedding':['wedding romantic song','first dance love'],
    'Proposal':['proposal love song','marry me romance'],
    'Date Night':['date night love song','romantic evening'],
    'Long Distance':['long distance love song','missing you romance'],
    "Valentine's Day":['valentines love song','valentine romance'],
    'Just Because':['just because love song','sweet message for partner'],
    'Instagram / Social Post':['instagram couple song','romantic social caption']
  };

  function uniqueWords(items){
    return [...new Set(items.map(v => v.trim()).filter(Boolean))];
  }

  function extractFeelingSignals(story){
    const text = String(story || '').toLowerCase();
    const signals = [];
    FEELING_MAP.forEach(group => {
      if(group.keys.some(key => text.includes(key))) signals.push(...group.words);
    });
    return uniqueWords(signals);
  }

  function trimQuery(parts, maxLength = 330){
    const clean = uniqueWords(parts);
    let result = '';
    for(const part of clean){
      const candidate = result ? `${result} ${part}` : part;
      if(candidate.length > maxLength) break;
      result = candidate;
    }
    return result || 'romantic love song';
  }

  function getMomentDraft(){
    return {
      event: $('event').value.trim(),
      mood: $('mood').value.trim(),
      relationship: $('relationship').value.trim(),
      soundVibe: $('soundVibe').value.trim(),
      story: $('story').value.trim(),
      partner: $('partner').value.trim()
    };
  }

  /*
   * Build four independent searches from one moment.
   * The output is intentionally plain URLs because GitHub Pages cannot safely
   * hide private search API credentials. Search engines and music services do the
   * live retrieval, while this app handles the user's context and orchestration.
   */
  function buildDiscoveryPack(moment = getMomentDraft()){
    const storySignals = extractFeelingSignals(moment.story);
    const moodWords = MOOD_MAP[moment.mood] || [];
    const eventWords = EVENT_MAP[moment.event] || [];
    const relationshipWords = moment.relationship ? [moment.relationship] : [];
    const vibeWords = moment.soundVibe ? [moment.soundVibe] : [];
    const direct = $('musicQuery').value.trim();

    const shared = trimQuery([
      direct,
      moment.event,
      moment.mood,
      ...relationshipWords,
      ...vibeWords,
      ...storySignals.slice(0,5),
      ...moodWords.slice(0,2),
      ...eventWords.slice(0,2)
    ]);

    const songQuery = trimQuery([
      direct,
      ...storySignals.slice(0,4),
      ...moodWords.slice(0,2),
      ...eventWords.slice(0,2),
      moment.relationship,
      moment.soundVibe,
      moment.mood
    ]);

    const poetryQuery = trimQuery([
      'romantic poetry about',
      ...storySignals.slice(0,4),
      moment.event,
      moment.mood,
      moment.relationship
    ]);

    const quoteQuery = trimQuery([
      'wise love quotes about',
      ...storySignals.slice(0,4),
      moment.event,
      moment.mood,
      moment.relationship
    ]);

    const captionQuery = trimQuery([
      'romantic Instagram caption',
      ...storySignals.slice(0,3),
      moment.event,
      moment.mood,
      moment.relationship
    ]);

    return {
      shared,
      songQuery,
      poetryQuery,
      quoteQuery,
      captionQuery,
      urls: {
        youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(songQuery)}`,
        spotify: `https://open.spotify.com/search/${encodeURIComponent(songQuery)}`,
        poetry: `https://www.google.com/search?q=${encodeURIComponent(poetryQuery)}`,
        quotes: `https://www.google.com/search?q=${encodeURIComponent(quoteQuery)}`,
        captions: `https://www.google.com/search?q=${encodeURIComponent(captionQuery)}`
      }
    };
  }

  function updateSearchBlueprint(){
    const blueprint = $('searchBlueprint');
    if(!blueprint) return;
    const moment = getMomentDraft();
    const pack = buildDiscoveryPack(moment);
    const signals = extractFeelingSignals(moment.story);
    const chips = uniqueWords([
      moment.event,
      moment.mood,
      moment.relationship,
      moment.soundVibe,
      ...signals.slice(0,4)
    ]);
    blueprint.innerHTML = `
      <div class="blueprint-row">
        <span class="blueprint-label">Feeling signals</span>
        <div class="blueprint-chips">${chips.length ? chips.map(v => `<span>${escapeHtml(v)}</span>`).join('') : '<span class="blueprint-empty">Your story will create the search vocabulary.</span>'}</div>
      </div>
      <div class="blueprint-row">
        <span class="blueprint-label">Song search</span>
        <strong>${escapeHtml(pack.songQuery)}</strong>
      </div>
      <div class="blueprint-row">
        <span class="blueprint-label">Poetry</span>
        <strong>${escapeHtml(pack.poetryQuery)}</strong>
      </div>
      <div class="blueprint-row">
        <span class="blueprint-label">Wise quotes</span>
        <strong>${escapeHtml(pack.quoteQuery)}</strong>
      </div>`;
  }

  function openExternal(url){
    // Returning the window handle lets us tell the user when a popup was blocked.
    try { return window.open(url, '_blank', 'noopener,noreferrer'); }
    catch (error) { return null; }
  }

  function renderDiscoveryResults(pack, autoOpened = false){
    const service = $('service').value;
    const musicLinks = [];
    if(service === 'both' || service === 'youtube') musicLinks.push({label:'Open YouTube Songs', url:pack.urls.youtube, icon:'▶️'});
    if(service === 'both' || service === 'spotify') musicLinks.push({label:'Open Spotify Songs', url:pack.urls.spotify, icon:'🟢'});

    const cards = [
      ...musicLinks.map(item => ({...item, title:'Songs', text:pack.songQuery})),
      {title:'Poetry', label:'Search Romantic Poetry', url:pack.urls.poetry, icon:'📖', text:pack.poetryQuery},
      {title:'Wise Quotes', label:'Search Wise Love Quotes', url:pack.urls.quotes, icon:'💬', text:pack.quoteQuery},
      {title:'Captions', label:'Search Romantic Captions', url:pack.urls.captions, icon:'✨', text:pack.captionQuery}
    ];

    $('discoveryResults').classList.remove('d-none');
    $('discoveryResults').innerHTML = `
      <div class="discovery-result-header">
        <div>
          <div class="eyebrow mb-2">♡ DISCOVERY PACK READY</div>
          <h3>Results for this love moment</h3>
          <p class="muted mb-0">${autoOpened ? 'The app attempted to open the live searches automatically.' : 'Choose any live search below.'} If your browser blocked a new tab, use these buttons.</p>
        </div>
        <button id="openAllDiscovery" class="btn btn-heart btn-sm" type="button">Open All Searches</button>
      </div>
      <div class="row g-3 mt-2">
        ${cards.map(card => `
          <div class="col-md-6 col-xl-4">
            <article class="search-result-card">
              <div class="tool-icon">${card.icon}</div>
              <div class="eyebrow mb-1">${escapeHtml(card.title)}</div>
              <p class="small muted">${escapeHtml(card.text)}</p>
              <a class="btn btn-outline-heart btn-sm" href="${card.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(card.label)}</a>
            </article>
          </div>`).join('')}
      </div>`;

    $('openAllDiscovery').addEventListener('click', () => openDiscoveryPack(pack));
  }

  function openDiscoveryPack(pack){
    const service = $('service').value;
    const urls = [];
    if(service === 'both' || service === 'youtube') urls.push(pack.urls.youtube);
    if(service === 'both' || service === 'spotify') urls.push(pack.urls.spotify);
    urls.push(pack.urls.poetry, pack.urls.quotes, pack.urls.captions);

    let opened = 0;
    urls.forEach(url => { if(openExternal(url)) opened += 1; });
    const blocked = urls.length - opened;
    $('discoveryStatus').textContent = blocked
      ? `${opened} live searches opened. Your browser blocked ${blocked}; use the Discovery Pack buttons below to open those searches.`
      : 'All live searches opened: YouTube, Spotify, poetry, wise quotes and captions.';
    return opened;
  }

  function runMomentDiscovery(autoOpen = false){
    const moment = activeMoment || getMomentDraft();
    const pack = buildDiscoveryPack(moment);
    $('musicQuery').value = pack.songQuery;
    updateSearchBlueprint();
    renderDiscoveryResults(pack, autoOpen);
    $('discoveryStatus').textContent = autoOpen
      ? 'Your moment has been converted into a live discovery pack. Opening YouTube, Spotify, poetry, wise quotes and captions…'
      : 'Discovery pack refreshed from your current moment.';
    if(autoOpen) openDiscoveryPack(pack);
    return pack;
  }

  // Creating the moment is now the trigger for discovery — not a separate manual step.
  $('momentForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const moment = getMomentDraft();
    if(!moment.event || !moment.mood || !moment.story){
      toast('Choose an event, mood and write your feeling first.');
      return;
    }

    const memory = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      createdAt: new Date().toISOString(),
      ...moment,
      photo: $('photoPreview').dataset.dataUrl || null
    };

    const memories = loadMemories();
    memories.unshift(memory);
    saveMemories(memories);
    saveActiveMoment(memory);
    renderMemories();

    // Keep the user's story fields visible so the discovery engine can continue using context.
    $('momentOutput').classList.remove('d-none');
    $('momentOutput').innerHTML = `
      <strong>♡ Your moment is ready — and discovery has started.</strong>
      <p class="mb-2 mt-2">${escapeHtml(moment.event)} · ${escapeHtml(moment.mood)}${moment.partner ? ` · for ${escapeHtml(moment.partner)}` : ''}</p>
      <p class="mb-0 muted">Scroll to Discover to see the generated song, poetry, wise quote and caption searches. Nothing was invented as a fake result; the buttons open live searches.</p>`;

    toast('♡ Moment saved. Starting your song + poetry + quote discovery.');
    runMomentDiscovery(true);
    document.querySelector('#discover').scrollIntoView({behavior:'smooth', block:'start'});
  });

  $('clearMoment').addEventListener('click', () => {
    $('momentForm').reset();
    $('photoPreview').classList.add('d-none');
    $('photoPreview').style.backgroundImage = '';
    $('photoPreview').dataset.dataUrl = '';
    $('storyCount').textContent = '0 / 1500';
    $('momentOutput').classList.add('d-none');
    $('musicQuery').value = '';
    activeMoment = null;
    localStorage.removeItem(ACTIVE_KEY);
    updateSearchBlueprint();
  });

  // Manual discovery buttons use exactly the same pack generated from the moment.
  $('searchMusic').addEventListener('click', () => {
    const pack = buildDiscoveryPack(activeMoment || getMomentDraft());
    const service = $('service').value;
    const urls = service === 'both' ? [pack.urls.youtube, pack.urls.spotify] : [service === 'spotify' ? pack.urls.spotify : pack.urls.youtube];
    const opened = urls.filter(url => !!openExternal(url)).length;
    $('discoveryStatus').textContent = `${opened} music search${opened === 1 ? '' : 'es'} opened. Use the Discovery Pack for poetry and quotes.`;
    renderDiscoveryResults(pack, false);
  });

  $('searchPoetry').addEventListener('click', () => {
    const pack = buildDiscoveryPack(activeMoment || getMomentDraft());
    openExternal(pack.urls.poetry);
    $('discoveryStatus').textContent = 'Searching romantic poetry from your moment.';
    renderDiscoveryResults(pack, false);
  });

  $('searchQuotes').addEventListener('click', () => {
    const pack = buildDiscoveryPack(activeMoment || getMomentDraft());
    openExternal(pack.urls.quotes);
    $('discoveryStatus').textContent = 'Searching wise love quotes from your moment.';
    renderDiscoveryResults(pack, false);
  });

  $('searchCaptions').addEventListener('click', () => {
    const pack = buildDiscoveryPack(activeMoment || getMomentDraft());
    openExternal(pack.urls.captions);
    $('discoveryStatus').textContent = 'Searching romantic captions from your moment.';
    renderDiscoveryResults(pack, false);
  });

  $('searchAll').addEventListener('click', () => {
    const pack = runMomentDiscovery(false);
    openDiscoveryPack(pack);
  });

  $('openGuidedSearch').addEventListener('click', () => {
    if(!activeMoment){
      $('create').scrollIntoView({behavior:'smooth', block:'start'});
      toast('Tell us what you feel first; Charlie MJ Music will translate it into search ideas.');
      return;
    }
    const pack = runMomentDiscovery(false);
    openDiscoveryPack(pack);
    $('guidedStatus').textContent = 'Your feeling has been translated into song, poetry, quote and caption searches.';
    $('discover').scrollIntoView({behavior:'smooth', block:'start'});
  });

  $('openMusic').addEventListener('click', () => {
    const raw = $('musicUrl').value.trim();
    try {
      const url = new URL(raw);
      if(!/^https?:$/.test(url.protocol) || !/(youtube\.com|youtu\.be|spotify\.com)$/i.test(url.hostname)) throw new Error('unsupported');
      openExternal(url.href);
      $('musicStatus').textContent = 'Opened the supplied music link.';
    } catch(error) {
      $('musicStatus').textContent = 'Please enter a valid YouTube or Spotify URL.';
    }
  });

  // Prepare an original-writing prompt rather than pretending a private cloud AI key exists.
  function buildAiPrompt(){
    const moment = activeMoment || getMomentDraft();
    const custom = $('letterPrompt').value.trim();
    return `Create an original, warm and respectful romantic message for ${moment.partner || 'my partner'}.
Event: ${moment.event || '[event]'}
Mood: ${moment.mood || '[mood]'}
Relationship context: ${moment.relationship || '[relationship context]'}
Soundtrack vibe: ${moment.soundVibe || '[sound vibe]'}
Story: ${moment.story || '[story]'}
Extra request: ${custom || '[none]'}
Do not reproduce song lyrics, poems or copyrighted quotations. Make the writing personal and natural.`;
  }

  $('prepareLetter').addEventListener('click', () => {
    const output = $('letterOutput');
    output.textContent = buildAiPrompt();
    output.classList.remove('d-none');
    toast('Local AI writing prompt prepared.');
  });

  $('copyAiPrompt').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(buildAiPrompt());
      $('aiStatus').textContent = 'Prompt copied. Paste it into Ollama, WebLLM or another local AI tool.';
    } catch(error) {
      $('aiStatus').textContent = 'Clipboard permission was unavailable; use the Love Letter Studio prompt instead.';
    }
  });

  // Browser recording remains local. A recognition provider is optional because its secret
  // cannot be safely embedded in a public GitHub Pages application.
  $('recordButton').addEventListener('click', async () => {
    if(!navigator.mediaDevices?.getUserMedia){
      $('recordStatus').textContent = 'Microphone recording is not supported by this browser.';
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      audioChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = e => { if(e.data.size) audioChunks.push(e.data); };
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        const blob = new Blob(audioChunks, {type: mediaRecorder.mimeType || 'audio/webm'});
        $('recordingPlayer').src = URL.createObjectURL(blob);
        $('recordingPlayer').classList.remove('d-none');
        $('recordStatus').textContent = 'Recording ready locally. Configure a user-owned recognition provider if you want automatic song identification.';
      };
      mediaRecorder.start();
      $('recordButton').classList.add('d-none');
      $('stopButton').classList.remove('d-none');
      $('recordStatus').textContent = 'Recording…';
    } catch(error) {
      $('recordStatus').textContent = 'Microphone permission was not granted.';
    }
  });

  $('stopButton').addEventListener('click', () => {
    if(mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    $('recordButton').classList.remove('d-none');
    $('stopButton').classList.add('d-none');
  });

  function renderMemories(){
    const memories = loadMemories();
    const container = $('memoryList');
    if(!memories.length){
      container.innerHTML = '<div class="empty-state">♡ Your saved love stories will appear here.</div>';
      return;
    }
    container.innerHTML = memories.map(m => `
      <article class="memory-card">
        ${m.photo ? `<div class="memory-photo" style="background-image:url('${m.photo.replace(/'/g,'%27')}')"></div>` : ''}
        <div class="eyebrow">${escapeHtml(m.event)} · ${escapeHtml(m.mood)}</div>
        <h3>${m.partner ? `For ${escapeHtml(m.partner)}` : 'A love moment'}</h3>
        <p class="muted">${escapeHtml(m.story)}</p>
        <div class="small-status mb-3">${escapeHtml(m.relationship || 'Love story')} · ${escapeHtml(m.soundVibe || 'Open to discovery')}</div>
        <button class="btn btn-ghost btn-sm" data-delete="${escapeHtml(m.id)}">Delete</button>
      </article>`).join('');

    container.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => {
      saveMemories(loadMemories().filter(m => m.id !== btn.dataset.delete));
      if(activeMoment?.id === btn.dataset.delete){ activeMoment = null; localStorage.removeItem(ACTIVE_KEY); }
      renderMemories();
      toast('Local memory deleted.');
    }));
  }

  $('exportMemories').addEventListener('click', () => {
    const memories = loadMemories();
    if(!memories.length){ toast('There are no saved memories to export.'); return; }
    const blob = new Blob([JSON.stringify(memories,null,2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'charlie-mj-music-memories.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  $('clearMemories').addEventListener('click', () => {
    if(!loadMemories().length){ toast('There are no saved memories.'); return; }
    if(confirm('Delete all locally saved Charlie MJ Music memories from this browser?')){
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ACTIVE_KEY);
      activeMoment = null;
      renderMemories();
      toast('Local memories cleared.');
    }
  });

  // Restore the most recent moment after a page refresh so the discovery engine does not
  // appear to "forget" the user's context on GitHub Pages.
  function restoreActiveMoment(){
    const saved = loadActiveMoment();
    if(!saved) return;
    activeMoment = saved;
    ['event','mood','relationship','soundVibe','partner','story'].forEach(id => {
      if($(id) && saved[id]) $(id).value = saved[id];
    });
    $('storyCount').textContent = `${$('story').value.length} / 1500`;
    updateSearchBlueprint();
    const pack = buildDiscoveryPack(saved);
    $('musicQuery').value = pack.songQuery;
    renderDiscoveryResults(pack, false);
    $('discoveryStatus').textContent = 'Your latest love moment was restored locally. The discovery pack is ready.';
  }

  initTheme();
  renderMemories();
  updateSearchBlueprint();
  restoreActiveMoment();
})();
