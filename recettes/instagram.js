// Fiches de liens Instagram pour Mon carnet gourmand
(function(){
  const $ = id => document.getElementById(id);
  let savedPhoto = '';
  const oldRenderRecipes = window.renderRecipes;
  window.renderRecipes = function(){
    const q = norm($('search').value), cat = $('categoryFilter').value, fav = $('favFilter').checked;
    const list = state.recipes.filter(r =>
      (!q || norm([r.name,r.category,r.tags,r.notes,r.source,...(r.ingredients||[]).map(i=>i.name)].join(' ')).includes(q)) &&
      (!cat || r.category===cat) && (!fav || r.favorite));
    $('recipeGrid').innerHTML = list.length ? list.map(r =>
      '<article class="card">'+(r.photo?'<img class="recipe-photo" src="'+r.photo+'" alt="">':'<div class="placeholder">'+(r.kind==='instagram'?'📱':'🍲')+'</div>')+
      '<div class="card-body"><h3>'+esc(r.name)+'</h3><div class="meta">'+(r.kind==='instagram'?'📱 Instagram · Lien enregistré':esc(r.category||'Autre')+' · '+((+r.prep||0)+(+r.cook||0))+' min · '+(+r.servings||4)+' portions')+'</div>'+
      '<div class="chips">'+(r.kind==='instagram'?'<span class="chip">Instagram</span>':(r.tags||[]).map(t=>'<span class="chip">'+esc(t)+'</span>').join(''))+'</div><div>'+('⭐'.repeat(+r.rating||0))+(r.favorite?' ♥':'')+'</div>'+
      '<div class="toolbar"><button class="small" data-see="'+esc(r.id)+'">Voir</button><button class="small secondary" data-edit="'+esc(r.id)+'">Modifier</button><button class="small secondary" data-fav="'+esc(r.id)+'">'+(r.favorite?'♥':'♡')+'</button></div></div></article>'
    ).join('') : '<div class="empty">Aucune recette pour le moment.<br>Ajoute ton premier plat avec « Nouvelle recette ».</div>';
    $('recipeGrid').querySelectorAll('[data-see]').forEach(b=>b.onclick=()=>showRecipe(b.dataset.see));
    $('recipeGrid').querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editRecipe(b.dataset.edit));
    $('recipeGrid').querySelectorAll('[data-fav]').forEach(b=>b.onclick=()=>toggleFav(b.dataset.fav));
  };
  const btn=document.createElement('button');btn.className='secondary';btn.textContent='＋ Lien Instagram';btn.id='addInstagram';
  $('addRecipe').insertAdjacentElement('afterend',btn);
  const modal=document.createElement('div');modal.id='instagramModal';modal.className='modal';
  modal.innerHTML='<div class="modalbox"><div class="modalhead"><h2 id="instagramModalTitle">Ajouter un lien Instagram</h2><button type="button" class="secondary" id="closeInstagram">✕</button></div><form id="instagramForm"><input type="hidden" id="instagramId"><div class="field"><label>Titre de la recette *</label><input id="instagramName" required placeholder="Ex. : Pommes de terre croustillantes"></div><div class="field"><label>Lien Instagram *</label><input id="instagramUrl" type="url" required placeholder="https://www.instagram.com/reel/…"></div><div class="field"><label>Photo de la recette (facultatif)</label><input id="instagramPhoto" type="file" accept="image/*"><img id="instagramPreview" class="recipe-photo hidden" alt="Aperçu de la photo"></div><div class="field"><label>Note personnelle (facultatif)</label><textarea id="instagramNotes" placeholder="À essayer, variantes, ingrédients à ajouter…"></textarea></div><p class="meta">Le lien ouvre la publication d’origine. La photo et les notes sont enregistrées sur cet appareil.</p><div class="toolbar"><button type="submit">Enregistrer dans le carnet</button><button type="button" class="secondary" id="cancelInstagram">Annuler</button></div></form></div>';
  document.body.append(modal);
  function close(){modal.classList.remove('open')}
  function open(r){
    $('instagramForm').reset();savedPhoto=r&&r.photo||'';$('instagramId').value=r&&r.id||'';
    $('instagramModalTitle').textContent=r?'Modifier le lien Instagram':'Ajouter un lien Instagram';
    $('instagramName').value=r&&r.name||'';$('instagramUrl').value=r&&r.source||'';$('instagramNotes').value=r&&r.notes||'';
    $('instagramPreview').classList.toggle('hidden',!savedPhoto);if(savedPhoto)$('instagramPreview').src=savedPhoto;
    modal.classList.add('open');
  }
  btn.onclick=()=>open();$('closeInstagram').onclick=$('cancelInstagram').onclick=close;
  $('instagramPhoto').onchange=async e=>{const file=e.target.files[0];if(!file)return;savedPhoto=await imageToData(file,1000,.78);$('instagramPreview').src=savedPhoto;$('instagramPreview').classList.remove('hidden')};
  $('instagramForm').onsubmit=e=>{
    e.preventDefault();const url=$('instagramUrl').value.trim();let u;
    try{u=new URL(url)}catch(_){return notify('Vérifie le lien Instagram.')}
    if(!['http:','https:'].includes(u.protocol)||!/(^|\.)instagram\.com$/i.test(u.hostname))return notify('Colle un lien provenant de instagram.com.');
    const id=$('instagramId').value||((crypto&&crypto.randomUUID)?crypto.randomUUID():'ig-'+Date.now()+'-'+Math.random().toString(36).slice(2)),old=state.recipes.find(r=>r.id===id);
    const r={id,kind:'instagram',name:$('instagramName').value.trim(),category:'Autre',prep:0,cook:0,servings:1,rating:0,ingredients:[],steps:[],tags:['Instagram'],source:url,notes:$('instagramNotes').value.trim(),photo:savedPhoto,favorite:old&&old.favorite||false,created:old&&old.created||new Date().toISOString()};
    const i=state.recipes.findIndex(x=>x.id===id);if(i>=0)state.recipes[i]=r;else state.recipes.unshift(r);
    save();close();renderRecipes();notify('Lien Instagram enregistré dans ton carnet.');
  };
  const oldEditRecipe=window.editRecipe;
  window.editRecipe=function(id){const r=state.recipes.find(x=>x.id===id);if(r&&r.kind==='instagram'){open(r);return}oldEditRecipe(id)};
  const oldRenderDetail=window.renderDetail;
  window.renderDetail=function(){
    const r=detailRecipe;if(!r||r.kind!=='instagram')return oldRenderDetail();
    $('detailTitle').textContent=r.name;
    $('detailContent').innerHTML=(r.photo?'<img class="recipe-photo" style="border-radius:12px" src="'+r.photo+'" alt="">':'<div class="placeholder">📱</div>')+
      '<div class="chips"><span class="chip">Instagram</span></div>'+(r.notes?'<h3>Ta note</h3><p>'+esc(r.notes)+'</p>':'')+
      '<div class="toolbar"><button id="openInstagramPost">Ouvrir sur Instagram ↗</button><button class="small secondary" id="editInstagramPost">Modifier</button><button class="small danger" id="deleteInstagramPost">Supprimer</button></div><p class="meta">Si la publication est supprimée ou privée, Instagram peut ne plus l’afficher.</p>';
    $('openInstagramPost').onclick=()=>window.open(r.source,'_blank','noopener');$('editInstagramPost').onclick=()=>open(r);$('deleteInstagramPost').onclick=()=>deleteRecipe(r.id);
  };
  $('randomRecipe').onclick=()=>{const choices=state.recipes.filter(r=>r.kind!=='instagram');if(!choices.length)return notify('Ajoute d’abord quelques recettes classiques.');showRecipe(choices[Math.floor(Math.random()*choices.length)].id)};
  window.planMeal=function(k,meal){
    const choices=state.recipes.filter(r=>r.kind!=='instagram');
    if(!choices.length)return notify('Ajoute d’abord une recette classique.');
    const labels=choices.map((r,i)=>(i+1)+'. '+r.name).join('\\n');
    const n=prompt('Choisis une recette en entrant son numéro :\\n'+labels);
    if(n===null)return;
    const r=choices[+n-1];if(!r)return notify('Numéro invalide.');
    state.planner[k]=state.planner[k]||[];
    state.planner[k]=state.planner[k].filter(x=>x.meal!==meal);
    state.planner[k].push({meal,id:r.id,name:r.name});save();renderPlanner();
  };
  renderRecipes();
})();