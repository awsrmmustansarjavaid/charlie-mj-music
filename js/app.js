/* Charlie MJ Music — browser-only application logic.
   Design goals: no backend, no GitHub Actions, no embedded private secrets.
   Personal memories are stored locally in the browser using localStorage. */
(function(){
  'use strict';

  const STORAGE_KEY='charlie-mj-music.memories.v1';
  const THEME_KEY='charlie-mj-music.theme.v1';
  const $=(id)=>document.getElementById(id);
  let mediaRecorder=null;
  let audioChunks=[];

  // Keep UI feedback centralized so every feature has consistent notifications.
  function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3200)}
  function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  function loadMemories(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch(e){return []}}
  function saveMemories(items){localStorage.setItem(STORAGE_KEY,JSON.stringify(items))}

  // Theme preference is local to this browser; there is no account or server preference.
  function initTheme(){if(localStorage.getItem(THEME_KEY)==='light')document.body.classList.add('light');$('themeToggle').addEventListener('click',()=>{document.body.classList.toggle('light');localStorage.setItem(THEME_KEY,document.body.classList.contains('light')?'light':'dark')})}

  // The image is converted to a data URL only for local persistence. Nothing is uploaded.
  $('photo').addEventListener('change',()=>{const file=$('photo').files[0];const preview=$('photoPreview');if(!file){preview.classList.add('d-none');preview.style.backgroundImage='';return}if(!file.type.startsWith('image/')){toast('Please choose an image file.');return}const reader=new FileReader();reader.onload=()=>{preview.style.backgroundImage=`url("${reader.result}")`;preview.classList.remove('d-none');preview.dataset.dataUrl=reader.result};reader.readAsDataURL(file)})
  $('story').addEventListener('input',()=>{$('storyCount').textContent=`${$('story').value.length} / 1500`})

  // Create a real user-authored moment. No seed/demo content is inserted automatically.
  $('momentForm').addEventListener('submit',(event)=>{event.preventDefault();const eventName=$('event').value,mood=$('mood').value,story=$('story').value.trim(),partner=$('partner').value.trim();if(!eventName||!mood||!story){toast('Choose an event, mood and write your story first.');return}const memory={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),createdAt:new Date().toISOString(),event:eventName,mood,story,partner,photo:$('photoPreview').dataset.dataUrl||null};const memories=loadMemories();memories.unshift(memory);saveMemories(memories);renderMemories();$('momentOutput').classList.remove('d-none');$('momentOutput').innerHTML=`<strong>♡ Your moment is ready.</strong><p class="mb-0 mt-2">${escapeHtml(eventName)} · ${escapeHtml(mood)}${partner?` · for ${escapeHtml(partner)}`:''}. Use the music search below to turn this feeling into a soundtrack.</p>`;toast('Your love moment was saved locally.');$('momentForm').reset();$('photoPreview').classList.add('d-none');$('photoPreview').style.backgroundImage='';$('photoPreview').dataset.dataUrl='';$('storyCount').textContent='0 / 1500'})
  $('clearMoment').addEventListener('click',()=>{$('momentForm').reset();$('photoPreview').classList.add('d-none');$('photoPreview').style.backgroundImage='';$('storyCount').textContent='0 / 1500';$('momentOutput').classList.add('d-none')})

  // Service search uses public search pages rather than exposing a private API key.
  $('searchMusic').addEventListener('click',()=>{const q=$('musicQuery').value.trim();if(!q){toast('Enter a song, artist or feeling first.');return}const service=$('service').value;const url=service==='spotify'?`https://open.spotify.com/search/${encodeURIComponent(q)}`:`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;window.open(url,'_blank','noopener,noreferrer')})
  $('openMusic').addEventListener('click',()=>{const raw=$('musicUrl').value.trim();try{const url=new URL(raw);if(!/^https?:$/.test(url.protocol)||!/(youtube\.com|youtu\.be|spotify\.com)$/i.test(url.hostname)){throw new Error('unsupported')}window.open(url.href,'_blank','noopener,noreferrer');$('musicStatus').textContent='Opened the supplied music link.'}catch(e){$('musicStatus').textContent='Please enter a valid YouTube or Spotify URL.'}})

  // Instead of pretending that a private AI key is available, create a portable prompt.
  function buildAiPrompt(){const eventName=$('event').value||'[event]';const mood=$('mood').value||'[mood]';const story=$('story').value.trim()||'[story]';const partner=$('partner').value.trim()||'my partner';return `Write an original, warm and respectful romantic message for ${partner}. Event: ${eventName}. Mood: ${mood}. Story: ${story}. Avoid song lyrics and copyrighted text. Keep it personal, natural and suitable for sharing.`}
  $('prepareLetter').addEventListener('click',()=>{const output=$('letterOutput');output.textContent=buildAiPrompt();output.classList.remove('d-none');toast('Local AI prompt prepared. No remote AI key was used.')})
  $('copyAiPrompt').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(buildAiPrompt());$('aiStatus').textContent='Prompt copied. Paste it into your local AI tool.'}catch(e){$('aiStatus').textContent='Clipboard permission was unavailable; use the Love Letter Studio prompt instead.'}})

  // Browser recording is fully local. Recognition is deliberately separate because provider
  // credentials must belong to the user and must never be committed to this public repository.
  $('recordButton').addEventListener('click',async()=>{if(!navigator.mediaDevices?.getUserMedia){$('recordStatus').textContent='Microphone recording is not supported by this browser.';return}try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});audioChunks=[];mediaRecorder=new MediaRecorder(stream);mediaRecorder.ondataavailable=e=>{if(e.data.size)audioChunks.push(e.data)};mediaRecorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());const blob=new Blob(audioChunks,{type:mediaRecorder.mimeType||'audio/webm'});$('recordingPlayer').src=URL.createObjectURL(blob);$('recordingPlayer').classList.remove('d-none');$('recordStatus').textContent='Recording ready locally. Send it to a recognition provider only after configuring your own provider credentials.'};mediaRecorder.start();$('recordButton').classList.add('d-none');$('stopButton').classList.remove('d-none');$('recordStatus').textContent='Recording…';}catch(e){$('recordStatus').textContent='Microphone permission was not granted.'}})
  $('stopButton').addEventListener('click',()=>{if(mediaRecorder&&mediaRecorder.state!=='inactive')mediaRecorder.stop();$('recordButton').classList.remove('d-none');$('stopButton').classList.add('d-none')})

  // Render locally saved memories with no predefined content.
  function renderMemories(){const memories=loadMemories();const container=$('memoryList');if(!memories.length){container.innerHTML='<div class="empty-state">♡ Your saved love stories will appear here.</div>';return}container.innerHTML=memories.map(m=>`<article class="memory-card">${m.photo?`<div class="memory-photo" style="background-image:url('${m.photo.replace(/'/g,"%27")}')"></div>`:''}<div class="eyebrow">${escapeHtml(m.event)} · ${escapeHtml(m.mood)}</div><h3>${m.partner?`For ${escapeHtml(m.partner)}`:'A love moment'}</h3><p class="muted">${escapeHtml(m.story)}</p><button class="btn btn-ghost btn-sm" data-delete="${escapeHtml(m.id)}">Delete</button></article>`).join('');container.querySelectorAll('[data-delete]').forEach(btn=>btn.addEventListener('click',()=>{saveMemories(loadMemories().filter(m=>m.id!==btn.dataset.delete));renderMemories();toast('Local memory deleted.')}))}
  $('exportMemories').addEventListener('click',()=>{const memories=loadMemories();if(!memories.length){toast('There are no saved memories to export.');return}const blob=new Blob([JSON.stringify(memories,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='charlie-mj-music-memories.json';a.click();URL.revokeObjectURL(a.href)})
  $('clearMemories').addEventListener('click',()=>{if(!loadMemories().length){toast('There are no saved memories.');return}if(confirm('Delete all locally saved Charlie MJ Music memories from this browser?')){localStorage.removeItem(STORAGE_KEY);renderMemories();toast('Local memories cleared.')}})

  initTheme();renderMemories();
})();
