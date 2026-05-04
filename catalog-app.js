// ─── HOVER MENUS ──────────────────────────────────────────
document.querySelectorAll('.menu').forEach(function(menu){
  let timer;
  menu.addEventListener('mouseenter', function(){
    clearTimeout(timer);
    document.querySelectorAll('.menu.open').forEach(function(m){ if (m !== menu) m.classList.remove('open'); });
    menu.classList.add('open');
  });
  menu.addEventListener('mouseleave', function(){
    timer = setTimeout(function(){ menu.classList.remove('open'); }, 120);
  });
  // click trigger toggles for keyboard/touch
  var trig = menu.querySelector('.menu-trigger');
  trig.addEventListener('click', function(e){
    e.stopPropagation();
    var open = menu.classList.contains('open');
    document.querySelectorAll('.menu.open').forEach(function(m){ m.classList.remove('open'); });
    if (!open) menu.classList.add('open');
  });
});
document.addEventListener('click', function(){
  document.querySelectorAll('.menu.open').forEach(function(m){ m.classList.remove('open'); });
});

// Mobile menu toggle (sheets)
function toggleMobileMenu(which){
  document.querySelectorAll('.menu').forEach(function(m){
    if (m.dataset.menu === which) {
      m.classList.toggle('mobile-active');
    } else {
      m.classList.remove('mobile-active');
    }
  });
  document.querySelectorAll('.mobile-menu-bar button').forEach(function(b){
    b.classList.toggle('active', b.id === 'mob-' + which && document.querySelector('.menu[data-menu="'+which+'"]').classList.contains('mobile-active'));
  });
}

// Source switching wired to menu
document.querySelectorAll('[data-src]').forEach(function(btn){
  btn.addEventListener('click', function(e){ e.stopPropagation(); switchSource(btn.dataset.src); });
});
document.querySelectorAll('[data-filter]').forEach(function(btn){
  btn.addEventListener('click', function(e){ e.stopPropagation(); setFilter(btn.dataset.filter); });
});
document.querySelectorAll('[data-cat]').forEach(function(btn){
  btn.addEventListener('click', function(e){ e.stopPropagation(); setBullyCategory(btn.dataset.cat); });
});
document.querySelectorAll('[data-avail]').forEach(function(btn){
  btn.addEventListener('click', function(e){ e.stopPropagation(); setBullyAvail(btn.dataset.avail); });
});

// ─── TWEAKS ───────────────────────────────────────────────
window.addEventListener('message', function(e){
  var d = e.data || {};
  if (d.type === '__activate_edit_mode') openTweaks();
  else if (d.type === '__deactivate_edit_mode') closeTweaks();
});
window.parent && window.parent.postMessage({ type: '__edit_mode_available' }, '*');

function openTweaks(){
  document.getElementById('tweaks-panel').classList.add('open');
  document.getElementById('tweaks-toggle').classList.remove('show');
}
function closeTweaks(){
  document.getElementById('tweaks-panel').classList.remove('open');
  document.getElementById('tweaks-toggle').classList.add('show');
  window.parent && window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
}
function toggleTweaks(){
  var p = document.getElementById('tweaks-panel');
  if (p.classList.contains('open')) closeTweaks(); else openTweaks();
}
document.querySelectorAll('.tweak-opt').forEach(function(btn){
  btn.addEventListener('click', function(){
    var key = btn.dataset.tweak, val = btn.dataset.val;
    document.querySelectorAll('.tweak-opt[data-tweak="'+key+'"]').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active');
    applyTweak(key, val);
  });
});
function applyTweak(key, val){
  if (key === 'theme') document.body.classList.toggle('theme-black', val === 'black');
  else if (key === 'density'){
    document.body.classList.remove('density-tight','density-roomy');
    if (val === 'tight') document.body.classList.add('density-tight');
    if (val === 'roomy') document.body.classList.add('density-roomy');
  }
  else if (key === 'type') document.body.classList.toggle('type-mix', val === 'mix');
}

// ─── UTIL ─────────────────────────────────────────────────
function debounce(fn,t){let id;return function(){var a=arguments,c=this;clearTimeout(id);id=setTimeout(function(){fn.apply(c,a);},t);};}
const debouncedApplyFilters = debounce(function(){applyFilters();}, 200);
function pad(n){ return String(n).padStart(3,'0'); }

// ─── CONFIG ───────────────────────────────────────────────
const SWELL_URL='https://yzy-prod.swell.store/api/products?limit=1000';
const SWELL_AUTH='Basic '+btoa('pk_UDtBUDIgX4j2StzcMPjwb7pfsmM1deoK:');
const BULLY_BASE='https://square-salad-516d.noahdoespython.workers.dev/?url=https://checkout.yeezy.com/products/';
const BULLY_SLUGS=['red-vinyl','digital-album','clear-vinyl','standard-vinyl','bully-cd','bully-ts-o7-box-w','bully-jp-ts-o7-box-r','bully-jp-ts-o7-box-b','bully-jp-hd-o1-box-b','bully-cassette','180g-black-vinyl','white-lp-signed','chrome-lp-signed','bully-cd-signed','bully-jp-hd-o1-box-r','bully-lp-signed','bully-lp-signed-clear','ls-o3-ye-live-red','ts-o7-htr-grey','hd-o1-htr-grey','hd-o1-red','ls-o3-ye-live-yellow','hd-o1-yellow','ls-o3-mask-white','hd-o1-globe-black','ls-o3-globe-black','ts-o7-red','ls-o3-mask-red','ls-o3-ye-live-white','ts-o7-black','ls-o3-ye-live-black','ls-o3-mask-yellow','hd-o1-globe-htr-grey','ht-o1-htr-grey','ls-o3-mask-black','hd-o1-black','ts-o7-yellow','red-lp-signed','brown-vinyl','grey-vinyl','blue-vinyl','gr-o1','chrome-vinyl','bully-ts-o7-box-b','tan-vinyl'];

const FALLBACK_SVG = '<div class="card-img-placeholder">// no img</div>';
window.handleImgError = function(el){var w=el.parentElement;if(w){el.remove();w.insertAdjacentHTML('afterbegin',FALLBACK_SVG);}};

function getBullyCategory(slug){
  if (/^(ts-o7|hd-o1|ls-o3|ht-o1|gr-o1)/.test(slug)) return 'apparel';
  if (/^bully-(ts-o7|jp-ts|jp-hd|hd-o1)-box/.test(slug)) return 'bundles';
  return 'music';
}

// ─── STATE ────────────────────────────────────────────────
let allProducts=[];let bullyProducts=[];let bullyLoaded=false;
let currentSource='swell',currentFilter='all',currentView='grid',bullyCategory='all',bullyAvail='all';
let filteredItemsState=[],currentBuildFn=null,currentIndex=0;
const BATCH_SIZE=40;let gridObserver=null;

// ─── HELPERS ──────────────────────────────────────────────
function stockLevel(p){
  const v=(p.purchasable_stock!=null)?p.purchasable_stock:(p.stock_level!=null?p.stock_level:null);
  if (v==null) return {label:'na',val:null};
  if (v<=0) return {label:'na',val:0};
  if (v<=10) return {label:'low',val:v};
  return {label:'in',val:v};
}
function fmtDate(d){if(!d)return '——';var dt=new Date(d);return String(dt.getFullYear()).slice(2)+'·'+String(dt.getMonth()+1).padStart(2,'0')+'·'+String(dt.getDate()).padStart(2,'0');}
function fmtPrice(a,c){if(a==null)return null;var v=c?a/100:a;return '$'+Number(v).toFixed(0);}
function imgUrl(p){
  if (p.slug==='pk-01') return 'https://yeezy.com/cdn-cgi/image/width=1204,height=1204,quality=100,compression=fast,slow-connection-quality=80,fit=pad,gravity=center,background=transparent/https://cdn.swell.store/yzy-prod/694d83a9ecc8af00131f2a26/9d6efa4534bdcf10ac476c7106673383/PK-01-SNOW-CAMO-1.png';
  var i=p.images||[];return (i.length&&i[0].file)?i[0].file.url:null;
}
function makeImg(s,a){if(!s)return FALLBACK_SVG;return '<img src="'+s+'" alt="'+(a||'')+'" width="240" height="240" loading="lazy" decoding="async" onerror="handleImgError(this)">';}

// "Designed by" line — derived from attributes since API doesn't have a designer field
function swellMeta(p){
  var parts = [];
  var a = p.attributes || {};
  if (a.gender && a.gender.value) {
    var g = a.gender.value;
    parts.push(g==='M'?'Mens':g==='W'?'Womens':g==='U'?'Unisex':g);
  }
  if (a.slot && a.slot.value) parts.push(a.slot.value);
  if (a.color && a.color.value) {
    var c = Array.isArray(a.color.value) ? a.color.value.join('/') : a.color.value;
    parts.push(c);
  }
  return parts.join(' · ');
}

// ─── SWELL CARD ───────────────────────────────────────────
function buildSwellCard(p, isList, idx){
  const sl = stockLevel(p);
  const price = fmtPrice(p.price, false);
  const img = imgUrl(p);
  const imgHtml = makeImg(img, p.name);
  const meta = swellMeta(p);
  const date = fmtDate(p.date_created);
  const designer = (p.attributes && p.attributes.designer && p.attributes.designer.value) || null;
  const dotClass = sl.label==='in'?'in':sl.label==='low'?'low':'out';
  const idxStr = pad(idx+1);
  const stockTxt = sl.label==='na' ? 'Out' : sl.label==='low' ? sl.val+' left' : sl.val+' in stock';

  if (isList){
    return '<article class="product-card" tabindex="0">'
      +'<span class="stock-dot '+dotClass+'" title="'+stockTxt+'"></span>'
      +'<div class="card-img-wrap" style="margin-left:14px;">'+imgHtml+'</div>'
      +'<div class="card-body">'
        +'<div style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:0;">'
          +'<div class="card-name">'+(p.name||'Unknown')+'</div>'
          +'<div class="card-meta">'+(p.slug||'').toUpperCase()+(meta?' · '+meta:'')+(designer?' · DESIGN BY '+String(designer).toUpperCase():'')+'</div>'
        +'</div>'
        +'<div class="card-meta" style="font-size:9px;">'+date+'</div>'
        +'<div class="card-meta" style="font-size:9px;">'+stockTxt+'</div>'
        +(price?'<div class="card-price">'+price+'</div>':'<div class="card-price muted">—</div>')
      +'</div>'
    +'</article>';
  }
  return '<article class="product-card" tabindex="0">'
    +'<span class="stock-dot '+dotClass+'" title="'+stockTxt+'"></span>'
    +'<span class="card-idx">'+idxStr+'</span>'
    +'<div class="card-img-wrap">'+imgHtml+'</div>'
    +'<div class="card-body">'
      +'<div style="display:flex;align-items:baseline;gap:10px;justify-content:space-between;">'
        +'<div class="card-name">'+(p.name||'Unknown')+'</div>'
        +(price?'<div class="card-price">'+price+'</div>':'<div class="card-price muted">—</div>')
      +'</div>'
      +(meta?'<div class="card-meta">'+meta+'</div>':'')
      +(designer?'<div class="card-designer">Design by '+designer+'</div>':'')
      +'<div class="card-hover">'
        +'<span>'+(p.slug||'').toUpperCase()+'</span>'
        +'<span>'+stockTxt+' · '+date+'</span>'
      +'</div>'
    +'</div>'
  +'</article>';
}

// ─── BULLY CARD ───────────────────────────────────────────
function buildBullyCard(p, isList, idx){
  const available = p.available;
  const variants = p.variants || [];
  const totalQty = variants.reduce(function(s,v){return s+(v.inventory_quantity||0);},0);
  let label = 'out';
  if (available && totalQty > 10) label = 'in';
  else if (available && totalQty > 0) label = 'low';
  else if (available) label = 'in';
  const dotClass = label;
  const stockTxt = !available ? 'Unavailable' : totalQty>0 ? totalQty+' in stock' : 'Available';

  const price = fmtPrice(p.price?p.price.cents:null, true);
  const img = p.featured_image ? p.featured_image.url : null;
  const imgHtml = makeImg(img, p.name);
  const date = fmtDate(p.published_at);
  const idxStr = pad(idx+1);

  let chipsHtml = '';
  if (variants.length > 0 && variants[0].options && variants[0].options.SIZE){
    chipsHtml = '<div class="size-chips">' + variants.map(function(v){
      const q = v.inventory_quantity || 0;
      const c = q<=0 ? 'out' : q<=10 ? 'low' : 'in';
      return '<span class="size-chip '+c+'">'+v.title+' · '+q+'</span>';
    }).join('') + '</div>';
  }

  const desc = (p.description||'').replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,'').trim();
  const nameWithTip = desc
    ? '<div class="card-name has-tooltip">'+(p.name||'Unknown')+'<span class="tt">'+desc+'</span></div>'
    : '<div class="card-name">'+(p.name||'Unknown')+'</div>';
  const cat = getBullyCategory(p.handle).toUpperCase();

  if (isList){
    return '<article class="product-card" tabindex="0">'
      +'<span class="stock-dot '+dotClass+'"></span>'
      +'<div class="card-img-wrap" style="margin-left:14px;">'+imgHtml+'</div>'
      +'<div class="card-body">'
        +'<div style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:0;">'
          +nameWithTip
          +'<div class="card-meta">'+(p.handle||'').toUpperCase()+' · '+cat+'</div>'
        +'</div>'
        +'<div class="card-meta" style="font-size:9px;">'+date+'</div>'
        +'<div class="card-meta" style="font-size:9px;">'+stockTxt+'</div>'
        +(price?'<div class="card-price">'+price+'</div>':'<div class="card-price muted">—</div>')
      +'</div>'
    +'</article>';
  }
  return '<article class="product-card" tabindex="0">'
    +'<span class="stock-dot '+dotClass+'"></span>'
    +'<span class="card-idx">'+idxStr+'</span>'
    +'<div class="card-img-wrap">'+imgHtml+'</div>'
    +'<div class="card-body">'
      +'<div style="display:flex;align-items:baseline;gap:10px;justify-content:space-between;">'
        +nameWithTip
        +(price?'<div class="card-price">'+price+'</div>':'<div class="card-price muted">—</div>')
      +'</div>'
      +'<div class="card-meta">'+cat+'</div>'
      +chipsHtml
      +'<div class="card-hover">'
        +'<span>'+(p.handle||'').toUpperCase()+'</span>'
        +'<span>'+stockTxt+' · '+date+'</span>'
      +'</div>'
    +'</div>'
  +'</article>';
}

// ─── SIDEBAR / MENU UPDATES ───────────────────────────────
function updateSwellMenuStats(products){
  const total = products.length;
  const inStock = products.filter(function(p){return stockLevel(p).label==='in';}).length;
  const lowStock = products.filter(function(p){return stockLevel(p).label==='low';}).length;
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-in').textContent = inStock + lowStock;
  document.getElementById('cnt-all').textContent = total;
  document.getElementById('cnt-in').textContent = inStock;
  document.getElementById('cnt-low').textContent = lowStock;
  document.getElementById('cnt-source-swell').textContent = total;
}
function updateBullyMenuStats(products){
  const apparel=products.filter(function(p){return getBullyCategory(p.handle)==='apparel';}).length;
  const music=products.filter(function(p){return getBullyCategory(p.handle)==='music';}).length;
  const bundles=products.filter(function(p){return getBullyCategory(p.handle)==='bundles';}).length;
  const inStock=products.filter(function(p){return p.available;}).length;
  const outStock=products.filter(function(p){return !p.available;}).length;
  document.getElementById('stat-total').textContent = products.length;
  document.getElementById('stat-in').textContent = inStock;
  document.getElementById('bcat-all').textContent = products.length;
  document.getElementById('bcat-apparel').textContent = apparel;
  document.getElementById('bcat-music').textContent = music;
  document.getElementById('bcat-bundles').textContent = bundles;
  document.getElementById('bavail-all').textContent = products.length;
  document.getElementById('bavail-in').textContent = inStock;
  document.getElementById('bavail-out').textContent = outStock;
  document.getElementById('cnt-source-bully').textContent = products.length;
}

// ─── FILTERS ──────────────────────────────────────────────
function applyFilters(){ if(currentSource==='swell') applySwellFilters(); else applyBullyFilters(); }

function applySwellFilters(){
  const q=document.getElementById('search').value.toLowerCase().trim();
  const sort=document.getElementById('sort-sel').value;
  const filtered=allProducts.filter(function(p){
    const sl=stockLevel(p).label;
    const f=currentFilter==='all'||sl===currentFilter;
    const s=!q||(p.name||'').toLowerCase().includes(q)||(p.slug||'').toLowerCase().includes(q);
    return f && s;
  });
  filtered.sort(function(a,b){
    switch(sort){
      case 'date-desc': return new Date(b.date_created||0)-new Date(a.date_created||0);
      case 'date-asc': return new Date(a.date_created||0)-new Date(b.date_created||0);
      case 'price-asc': return (a.price||0)-(b.price||0);
      case 'price-desc': return (b.price||0)-(a.price||0);
      case 'name-asc': return (a.name||'').localeCompare(b.name||'');
      case 'stock-desc': return (stockLevel(b).val||0)-(stockLevel(a).val||0);
      default: return 0;
    }
  });
  renderGrid(filtered, buildSwellCard);
}

function applyBullyFilters(){
  const q=document.getElementById('search').value.toLowerCase().trim();
  const sort=document.getElementById('sort-sel').value;
  let filtered=bullyProducts.filter(function(p){
    const cat=getBullyCategory(p.handle);
    const c=bullyCategory==='all'||cat===bullyCategory;
    const a=bullyAvail==='all'||(bullyAvail==='in'?p.available:!p.available);
    const s=!q||(p.name||'').toLowerCase().includes(q)||(p.handle||'').toLowerCase().includes(q);
    return c&&a&&s;
  });
  filtered.sort(function(a,b){
    const dA=new Date(a.published_at||0),dB=new Date(b.published_at||0);
    switch(sort){
      case 'date-asc': return dA-dB;
      case 'price-asc': return ((a.price&&a.price.cents)||0)-((b.price&&b.price.cents)||0);
      case 'price-desc': return ((b.price&&b.price.cents)||0)-((a.price&&a.price.cents)||0);
      case 'name-asc': return (a.name||'').localeCompare(b.name||'');
      case 'stock-desc':{
        const aQ=(a.variants||[]).reduce(function(s,v){return s+(v.inventory_quantity||0);},0);
        const bQ=(b.variants||[]).reduce(function(s,v){return s+(v.inventory_quantity||0);},0);
        return bQ-aQ;
      }
      case 'date-desc':default: return dB-dA;
    }
  });
  renderGrid(filtered, buildBullyCard);
}

function renderGrid(items, buildFn){
  const grid=document.getElementById('product-grid');
  filteredItemsState=items;currentBuildFn=buildFn;currentIndex=0;
  grid.innerHTML='';
  if (items.length===0){
    grid.innerHTML='<div class="empty"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><h3>No products found</h3><p>Adjust filters or search query</p></div>';
    updateResultCount(0);return;
  }
  const sentinel=document.createElement('div');
  sentinel.id='grid-sentinel';sentinel.style.height='20px';sentinel.style.gridColumn='1 / -1';
  grid.appendChild(sentinel);
  appendNextBatch();
  if (gridObserver) gridObserver.disconnect();
  gridObserver=new IntersectionObserver(function(e){if(e[0].isIntersecting&&currentIndex<filteredItemsState.length)appendNextBatch();},{rootMargin:'400px'});
  gridObserver.observe(sentinel);
}
function appendNextBatch(){
  const grid=document.getElementById('product-grid');
  const sentinel=document.getElementById('grid-sentinel');
  const isList=currentView==='list';
  const batch=filteredItemsState.slice(currentIndex,currentIndex+BATCH_SIZE);
  if (batch.length===0) return;
  const frag=document.createDocumentFragment();
  const tmp=document.createElement('div');
  let html='';for(let i=0;i<batch.length;i++) html+=currentBuildFn(batch[i],isList,currentIndex+i);
  tmp.innerHTML=html;
  while (tmp.firstChild) frag.appendChild(tmp.firstChild);
  grid.insertBefore(frag,sentinel);
  currentIndex+=batch.length;
  updateResultCount(currentIndex);
  if (currentIndex>=filteredItemsState.length && gridObserver) gridObserver.disconnect();
}
function updateResultCount(showing){
  const total = currentSource==='swell' ? allProducts.length : bullyProducts.length;
  document.getElementById('header-count').textContent = pad(total);
  document.getElementById('foot-count').textContent = total + ' items · '+pad(showing)+' shown';
  document.getElementById('menu-source-count').textContent = total;
}

function setFilter(val){
  currentFilter=val;
  document.querySelectorAll('[data-filter]').forEach(function(b){b.classList.toggle('active', b.dataset.filter===val);});
  document.getElementById('menu-filter-label').textContent = val==='all'?'All':val==='in'?'In':val==='low'?'Low':val;
  applyFilters();
}
function setBullyCategory(val){
  bullyCategory=val;
  document.querySelectorAll('[data-cat]').forEach(function(b){b.classList.toggle('active', b.dataset.cat===val);});
  applyFilters();
}
function setBullyAvail(val){
  bullyAvail=val;
  document.querySelectorAll('[data-avail]').forEach(function(b){b.classList.toggle('active', b.dataset.avail===val);});
  applyFilters();
}
function setView(v){
  currentView=v;
  document.getElementById('product-grid').classList.toggle('list-view',v==='list');
  document.getElementById('btn-grid').classList.toggle('active',v==='grid');
  document.getElementById('btn-list').classList.toggle('active',v==='list');
  applyFilters();
}

function switchSource(src){
  currentSource=src;
  document.querySelectorAll('[data-src]').forEach(function(b){b.classList.toggle('active', b.dataset.src===src);});
  document.getElementById('menu-source-label').textContent = src==='swell'?'YZY Store':'Bully';
  document.getElementById('foot-source').textContent = src==='swell'?'YZY/STORE':'YZY/BULLY';
  document.getElementById('info-src').textContent = src==='swell'?'yzy-prod.swell.store':'checkout.yeezy.com';

  // Filter menu — swap stock vs bully sub-rows
  document.getElementById('menu-filter-rows-stock').style.display = src==='swell'?'block':'none';
  document.getElementById('menu-filter-rows-bully').style.display = src==='bully'?'block':'none';
  document.getElementById('menu-filter-cat-label').textContent = src==='swell'?'Stock':'Filters';

  document.getElementById('search').value='';

  if (src==='swell'){
    updateSwellMenuStats(allProducts);
    applyFilters();
  } else {
    if (!bullyLoaded) fetchBullyProducts();
    else { updateBullyMenuStats(bullyProducts); applyFilters(); }
  }
  // close any open menus
  document.querySelectorAll('.menu.open,.menu.mobile-active').forEach(function(m){m.classList.remove('open','mobile-active');});
}

// ─── FETCH ────────────────────────────────────────────────
async function fetchProducts(){
  const btn=document.getElementById('sync-btn');if(btn)btn.classList.add('spinning');
  try{
    const r=await fetch(SWELL_URL,{headers:{'Authorization':SWELL_AUTH,'Content-Type':'application/json'}});
    if (!r.ok) throw new Error('HTTP '+r.status);
    const d=await r.json();
    allProducts=d.results||[];
    updateSwellMenuStats(allProducts);
    if (currentSource==='swell') applyFilters();
    const t=new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    document.getElementById('last-updated').textContent=t;
    document.getElementById('foot-time').textContent='Synced '+t;
  }catch(e){
    if (currentSource==='swell'){
      document.getElementById('product-grid').innerHTML='<div class="error-state"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><h3>Failed to load</h3><p>'+e.message+'</p><button class="retry-btn" onclick="fetchProducts()">Retry →</button></div>';
    }
    document.getElementById('last-updated').textContent='Error';
  }finally{
    setTimeout(function(){if(btn)btn.classList.remove('spinning');},400);
  }
}

async function fetchBullyProducts(){
  const cached=sessionStorage.getItem('bully_cache');
  if (cached){
    try{ bullyProducts=JSON.parse(cached);bullyLoaded=true;updateBullyMenuStats(bullyProducts);document.getElementById('last-updated').textContent='cache';applyFilters();return; }catch(e){}
  }
  const grid=document.getElementById('product-grid');
  grid.innerHTML='<div class="bully-progress">'
    +'<div>// Loading Bully catalog</div>'
    +'<div class="progress-bar-wrap"><div class="progress-bar-inner" id="bully-prog" style="width:0%"></div></div>'
    +'<div id="bully-prog-text">000 / '+pad(BULLY_SLUGS.length)+'</div>'
    +'</div>';

  const results=[];const CONCURRENCY=6;let completed=0;
  function up(){completed++;const p=Math.round((completed/BULLY_SLUGS.length)*100);const b=document.getElementById('bully-prog');const t=document.getElementById('bully-prog-text');if(b)b.style.width=p+'%';if(t)t.textContent=pad(completed)+' / '+pad(BULLY_SLUGS.length);}
  async function fS(s){try{const r=await fetch(BULLY_BASE+s+'.js');if(!r.ok) throw new Error();const d=await r.json();d._slug=s;d._category=getBullyCategory(s);return d;}catch{return null;}finally{up();}}
  for (let i=0;i<BULLY_SLUGS.length;i+=CONCURRENCY){
    const b=BULLY_SLUGS.slice(i,i+CONCURRENCY);
    const r=await Promise.all(b.map(fS));
    r.forEach(function(x){if(x)results.push(x);});
  }
  bullyProducts=results;bullyLoaded=true;
  sessionStorage.setItem('bully_cache',JSON.stringify(bullyProducts));
  updateBullyMenuStats(bullyProducts);
  const t=new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
  document.getElementById('last-updated').textContent=t;
  document.getElementById('foot-time').textContent='Synced '+t;
  applyFilters();
}

// ─── INIT ─────────────────────────────────────────────────
fetchProducts();
setInterval(fetchProducts, 5*60*1000);
