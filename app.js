(function(){var d=document.documentElement,s;try{s=localStorage.getItem('lang')}catch(e){}
if(s!=='de'&&s!=='en'){s=(navigator.language||'de').slice(0,2)==='de'?'de':'en'}
d.lang=s;document.addEventListener('DOMContentLoaded',function(){var b=document.getElementById('lang');
function label(){b.textContent=d.lang==='de'?'EN':'DE'}label();
b.addEventListener('click',function(){d.lang=d.lang==='de'?'en':'de';try{localStorage.setItem('lang',d.lang)}catch(e){}label()})})})();
