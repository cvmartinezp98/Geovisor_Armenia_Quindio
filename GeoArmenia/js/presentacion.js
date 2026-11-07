/* Mejoras de navegación y presentación. No altera datos, gráficos o cálculos originales. */
(() => {
  'use strict';
  const api = window.geovisorUI;
  if (!api) { console.warn('Geovisor: interfaz de presentación no disponible.'); return; }
  const {map, layers} = api;
  const $ = (sel) => document.querySelector(sel);
  const tabs = {capas: $('#t-capas'), resultados: $('#t-resultados'), conflictos: $('#t-conflictos'), acerca: $('#t-acerca')};
  const groups = {
    general:['constr','red','franja','limite'],
    red:['red','franja','limite'],
    presion:['constr','tramos','red','franja','limite']
  };
  const viewBtns = [...document.querySelectorAll('[data-view]')];
  const setView = (name) => {
    if (!groups[name]) return;
    for (const [key, value] of Object.entries(layers)) {
      const visible=groups[name].includes(key);
      value.on=visible;
      const checkbox=document.querySelector(`input[data-k="${key}"]`);
      if (checkbox && checkbox.checked !== visible) {
        checkbox.checked=visible;
        checkbox.dispatchEvent(new Event('change',{bubbles:true}));
      } else {
        if (visible && !map.hasLayer(value.layer)) value.layer.addTo(map);
        if (!visible && map.hasLayer(value.layer)) map.removeLayer(value.layer);
      }
    }
    viewBtns.forEach(b => {const active=b.dataset.view===name;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
    if(name==='presion') tabs.conflictos?.click();
    else tabs.capas?.click();
    window.requestAnimationFrame(()=>map.invalidateSize());
    refreshLayers();
  };
  const refreshLayers = () => {
    const visible=Object.values(layers).filter(i=>map.hasLayer(i.layer)).length;
    const item=$('#layersState');if(item) item.textContent=`${visible} capas visibles`;
  };
  viewBtns.forEach(btn=>btn.addEventListener('click',()=>setView(btn.dataset.view)));
  $('#layerList')?.addEventListener('change',refreshLayers);
  const updateFocusButton=()=>{
    const btn=$('#focusBtn');if(!btn)return;
    btn.setAttribute('aria-pressed',String(document.body.classList.contains('focus-mode')));
    const span=btn.querySelector('span');if(span)span.textContent=document.body.classList.contains('focus-mode')?'Salir del modo presentación':'Modo presentación';
  };
  $('#focusBtn')?.addEventListener('click',()=>{
    document.body.classList.toggle('focus-mode');
    updateFocusButton();
    window.setTimeout(()=>map.invalidateSize(),80);
  });
  const guide=$('#guideDialog');
  const showGuide=()=>{if(guide?.showModal) guide.showModal();};
  $('#guideBtn')?.addEventListener('click',showGuide);
  $('#helpMapBtn')?.addEventListener('click',showGuide);
  $('#closeGuide')?.addEventListener('click',()=>guide?.close());
  $('#guideDone')?.addEventListener('click',()=>guide?.close());
  $('#printBtn')?.addEventListener('click',()=>window.print());
  document.addEventListener('keydown',(e)=>{
    if(e.key==='Escape'&&document.body.classList.contains('focus-mode')&&!guide?.open){
      document.body.classList.remove('focus-mode');updateFocusButton();setTimeout(()=>map.invalidateSize(),80);
    }
  });
  refreshLayers();
  // Keep the default map extent, visible layers, and map results exactly as in the source.
})();
