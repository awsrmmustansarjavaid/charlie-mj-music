// Charlie MJ Music backend.
// Provides secure proxy routes for optional YouTube, Spotify, AudD and Ollama integrations.
import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const app = express();
const upload = multer({ dest: path.join(__dirname, 'uploads'), limits: { fileSize: 12 * 1024 * 1024 } });
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(root, 'public')));

function disabled(res, provider) { return res.status(503).json({ ok:false, provider, message:`${provider} is not configured. Add its credentials to .env.` }); }

app.get('/api/config', (_req,res) => res.json({
  youtube: Boolean(process.env.YOUTUBE_API_KEY), spotify: Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET),
  audd: Boolean(process.env.AUDD_API_TOKEN), ollama: Boolean(process.env.OLLAMA_URL)
}));

app.get('/api/youtube/search', async (req,res) => {
  if (!process.env.YOUTUBE_API_KEY) return disabled(res,'YouTube');
  const q = String(req.query.q || '').trim(); if (!q) return res.status(400).json({ok:false,message:'Search text is required.'});
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part','snippet'); url.searchParams.set('type','video'); url.searchParams.set('maxResults','12'); url.searchParams.set('q',q); url.searchParams.set('key',process.env.YOUTUBE_API_KEY);
  try { const r=await fetch(url); const data=await r.json(); if(!r.ok) return res.status(r.status).json({ok:false,message:data?.error?.message||'YouTube request failed.'}); res.json({ok:true,items:data.items||[]}); }
  catch(e){res.status(502).json({ok:false,message:e.message});}
});

let spotifyToken = { value:null, expires:0 };
async function getSpotifyToken(){
  if(spotifyToken.value && Date.now()<spotifyToken.expires) return spotifyToken.value;
  const basic=Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const r=await fetch('https://accounts.spotify.com/api/token',{method:'POST',headers:{Authorization:`Basic ${basic}`,'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'});
  const d=await r.json(); if(!r.ok) throw new Error(d.error_description||'Spotify authentication failed.');
  spotifyToken={value:d.access_token,expires:Date.now()+((d.expires_in||3600)-60)*1000}; return spotifyToken.value;
}
app.get('/api/spotify/search', async(req,res)=>{
  if(!process.env.SPOTIFY_CLIENT_ID||!process.env.SPOTIFY_CLIENT_SECRET) return disabled(res,'Spotify');
  const q=String(req.query.q||'').trim(); if(!q) return res.status(400).json({ok:false,message:'Search text is required.'});
  try { const token=await getSpotifyToken(); const u=new URL('https://api.spotify.com/v1/search'); u.searchParams.set('q',q); u.searchParams.set('type','track'); u.searchParams.set('limit','12'); const r=await fetch(u,{headers:{Authorization:`Bearer ${token}`}}); const d=await r.json(); if(!r.ok)return res.status(r.status).json({ok:false,message:d?.error?.message||'Spotify request failed.'}); res.json({ok:true,items:d.tracks?.items||[]}); } catch(e){res.status(502).json({ok:false,message:e.message});}
});

app.post('/api/recognize', upload.single('audio'), async(req,res)=>{
  if(!process.env.AUDD_API_TOKEN) return disabled(res,'AudD');
  if(!req.file) return res.status(400).json({ok:false,message:'Audio recording is required.'});
  try {
    const audio=await fs.readFile(req.file.path);
    const form=new FormData(); form.append('api_token',process.env.AUDD_API_TOKEN); form.append('return','apple_music,spotify'); form.append('file',new Blob([audio]),req.file.originalname||'recording.webm');
    const r=await fetch('https://api.audd.io/',{method:'POST',body:form}); const d=await r.json(); if(!r.ok)return res.status(r.status).json({ok:false,message:d?.error?.error_message||'Recognition failed.'}); res.json({ok:true,result:d.result||null});
  } catch(e){res.status(502).json({ok:false,message:e.message});} finally { await fs.rm(req.file.path,{force:true}); }
});

app.post('/api/ai/generate', async(req,res)=>{
  if(!process.env.OLLAMA_URL) return disabled(res,'Ollama');
  const body=req.body||{}; const prompt=`Create original, non-copyrighted romantic content for Charlie MJ Music. Event: ${body.event||'special moment'}. Feeling: ${body.feeling||'romantic'}. Mood: ${body.mood||'warm'}. User note: ${body.note||''}. Return concise JSON with keys title, caption, message, poem. Do not quote songs or existing poems.`;
  try { const r=await fetch(`${process.env.OLLAMA_URL.replace(/\/$/,'')}/api/generate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OLLAMA_MODEL||'llama3.2',prompt,stream:false,format:'json'})}); const d=await r.json(); if(!r.ok)return res.status(r.status).json({ok:false,message:d?.error||'Ollama request failed.'}); let parsed; try{parsed=JSON.parse(d.response)}catch{parsed={message:d.response||''}} res.json({ok:true,result:parsed}); } catch(e){res.status(502).json({ok:false,message:e.message});}
});

app.get('*',(req,res)=>{ if(req.path.startsWith('/api/')) return res.status(404).json({ok:false,message:'API route not found.'}); res.sendFile(path.join(root,'public','index.html')); });
app.listen(PORT,()=>console.log(`Charlie MJ Music running at http://localhost:${PORT}`));
