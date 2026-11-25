'use strict';
const menu = document.querySelector('#menu');
const menuButton = document.querySelector('.menu-button');
if (menu && menuButton) {
  menuButton.addEventListener('click', () => { menu.showModal(); menuButton.setAttribute('aria-expanded', 'true'); });
  menu.addEventListener('close', () => menuButton.setAttribute('aria-expanded', 'false'));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => menu.close()));
}
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.close)?.close()));
const video = document.querySelector('#hero-video');
const videoToggle = document.querySelector('#video-toggle');
if (video && videoToggle) {
  video.muted = true;
  video.defaultMuted = true;
  const updateVideoButton = () => {
    const label = video.paused ? '영상 재생' : '영상 일시정지';
    videoToggle.textContent = label + (video.paused ? ' ▶' : ' Ⅱ');
    videoToggle.setAttribute('aria-label', '배경 ' + label);
  };
  video.addEventListener('play', updateVideoButton);
  video.addEventListener('pause', updateVideoButton);
  videoToggle.addEventListener('click', () => { if (video.paused) video.play().catch(updateVideoButton); else video.pause(); });
  video.play().catch(updateVideoButton);
}
const directory = document.querySelector('#directory-list');
if (directory) {
  const search = document.querySelector('#directory-search');
  const count = document.querySelector('#directory-count');
  const empty = document.querySelector('#directory-empty');
  const tabs = [...document.querySelectorAll('.region-tabs button')];
  const rows = [...directory.querySelectorAll('.directory-row')];
  let region = 'all';
  function filterStores() {
    const query = search.value.replace(/\s/g, '').toLowerCase();
    let total = 0;
    rows.forEach(row => {
      const match = (region === 'all' || row.dataset.region === region) && row.dataset.search.replace(/\s/g, '').toLowerCase().includes(query);
      row.hidden = !match;
      if (match) total++;
    });
    count.textContent = total + '개 매장';
    empty.hidden = total !== 0;
  }
  tabs.forEach(tab => tab.addEventListener('click', () => {
    region = tab.dataset.region;
    tabs.forEach(button => button.setAttribute('aria-pressed', String(button === tab)));
    filterStores();
  }));
  search.addEventListener('input', filterStores);
}
// Map navigation also clears filters so a selected store can always be reached.
if (directory) {
  const clearDirectory = () => {
    const search = document.querySelector('#directory-search');
    search.value = '';
    document.querySelector('.region-tabs [data-region="all"]').click();
  };
  const selectStore = (id, focus = true) => {
    const row = document.getElementById(id);
    if (!row) return;
    clearDirectory();
    document.querySelectorAll('.directory-row').forEach(item => item.classList.toggle('is-selected', item === row));
    if (focus) {
      row.focus({preventScroll:true});
      row.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    }
  };
  document.querySelectorAll('[data-store-jump]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    let chosen = link;
    if (event.detail && document.querySelector('.store-map')) {
      const candidates = [...document.querySelectorAll('[data-store-jump]')];
      chosen = candidates.reduce((best, item) => {
        const r = item.getBoundingClientRect();
        const distance = Math.hypot(event.clientX-r.left-r.width/2,event.clientY-r.top-r.height/2);
        return distance < best.distance ? {item,distance} : best;
      }, {item:link,distance:Infinity}).item;
    }
    const id = chosen.getAttribute('href').slice(1);
    history.pushState(null,'','#'+id);
    selectStore(id);
  }));
  window.addEventListener('hashchange', () => selectStore(location.hash.slice(1)));
  if (location.hash.startsWith('#store-')) selectStore(location.hash.slice(1), false);
}

const mapZoom=document.querySelector('.map-zoom');
if(mapZoom) mapZoom.addEventListener('click',()=>{
 const expanded=mapZoom.getAttribute('aria-pressed')!=='true';
 document.querySelector('.map-shell').classList.toggle('is-zoomed',expanded);
 mapZoom.setAttribute('aria-pressed',String(expanded));
 mapZoom.textContent=expanded?'전체 지도 −':'지도 확대 ＋';
 document.querySelector('.map-mobile-hint').textContent=expanded?'지도를 좌우로 밀어 확인해 주세요.':'번호를 눌러 매장 정보를 확인하세요.';
});
const header=document.querySelector('.header');
const headerLogo=header?.querySelector('.brand img');
const updateHeader=()=>{
 const scrolled=window.scrollY>80;
 header?.classList.toggle('is-scrolled',scrolled);
 const source=scrolled?'assets/logo-dark.svg':'assets/logo-light.svg';
 if(headerLogo && headerLogo.getAttribute('src')!==source) headerLogo.setAttribute('src',source);
};
window.addEventListener('scroll',updateHeader,{passive:true});
updateHeader();

const photoSlideshow=document.querySelector('.signature-slideshow');
if(photoSlideshow){
 const slides=[...photoSlideshow.querySelectorAll('img')];
 const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
 let current=0, timer=null, visible=false, paused=reduceMotion.matches;
 const stop=()=>{clearInterval(timer);timer=null;};
 const showNext=()=>{
  const next=(current+1)%slides.length;
  if(!slides[next].complete || !slides[next].naturalWidth) return;
  slides[current].classList.remove('is-active');
  slides[current].setAttribute('aria-hidden','true');
  current=next;
  slides[current].classList.add('is-active');
  slides[current].removeAttribute('aria-hidden');
 };
 const sync=()=>{
  stop();
  if(visible && !paused && !document.hidden) timer=setInterval(showNext,Number(photoSlideshow.dataset.interval));
 };
 document.addEventListener('visibilitychange',sync);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.1}).observe(photoSlideshow);
 sync();
}

const scrollMotion=matchMedia('(prefers-reduced-motion: reduce)');
if(!scrollMotion.matches && 'IntersectionObserver' in window){
 const revealTargets=document.querySelectorAll('.story .section-heading,.story-photo,.signature-image,.signature-copy,.table-copy,.menu-tile,.journal,.brand-wide,.editorial-section>div,.brand-pair>img,.brand-pair>div,.page-end,.product-editorial>img,.product-editorial>div,.shop-card,.shop-information');
 const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   // Keep observing after entry so leaving and returning always replays the motion.
   if(!entry.isIntersecting) entry.target.style.setProperty('--reveal-offset',entry.boundingClientRect.top>0?'22px':'-22px');
   entry.target.classList.toggle('is-in-view',entry.isIntersecting);
  });
 },{threshold:.08,rootMargin:'0px 0px -20px 0px'});
 revealTargets.forEach(element=>{element.classList.add('scroll-reveal');revealObserver.observe(element);});
}
