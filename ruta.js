'use strict';
function saveInc(){store.set('sgatyoc_incidents',JSON.stringify(S.incidents));}
$('#incGps').addEventListener('change',function(e){var st=$('#incGpsState');
if(e.target.checked){if(!navigator.geolocation){st.hidden=false;st.style.color='var(--warn)';st.textContent='Dispositivo sin geolocalización.';e.target.checked=false;return;}
st.hidden=false;st.style.color='var(--dim)';st.textContent='Solicitando ubicación…';
navigator.geolocation.getCurrentPosition(function(p){S.inc.fix={lat:+p.coords.latitude.toFixed(6),lng:+p.coords.longitude.toFixed(6),acc:Math.round(p.coords.accuracy)};st.style.color='var(--ok)';st.textContent='Ubicación adjunta · ±'+S.inc.fix.acc+' m';},
function(err){e.target.checked=false;S.inc.fix=null;st.style.color='var(--warn)';st.textContent=err.code===1?'Permiso denegado; continuará sin ubicación.':'No se obtuvo ubicación; continuará sin ella.';},
{enableHighAccuracy:true,timeout:10000,maximumAge:30000});}else{S.inc.fix=null;st.hidden=true;}});
$('#incSend').addEventListener('click',function(){var tipo=$('#incTipo').value;if(!tipo){toast('warn','Selecciona el tipo de evento.');return;}
var d=new Date();var inc={id:'INC-'+String(Date.now()).slice(-6),fecha:isoDate(d),ts:pad(d.getDate())+'/'+pad(d.getMonth()+1)+' '+nowHM(),tipo:tipo,desc:$('#incDesc').value.trim(),geo:S.inc.fix,dni:USER.dni,user:USER.nom,msgs:[]};
S.incidents.unshift(inc);saveInc();addMsg(inc,'coord','Reporte '+inc.id+' registrado. Coordinación y Subgerencia pueden leer este chat.');
openChat(inc);renderRuta();$('#incDesc').value='';$('#incTipo').value='';$('#incGps').checked=false;$('#incGpsState').hidden=true;S.inc.fix=null;
toast('ok','Reporte <b>'+inc.id+'</b> generado.');});
function openChat(inc){$('#rutaFormCard').hidden=true;$('#rutaChatCard').hidden=false;$('#chatReportId').textContent=inc.id;S.inc.current=inc.id;renderChat(inc);}
function renderChat(inc){$('#chatBox').innerHTML=inc.msgs.map(function(m){return '<div class="msg '+m.who+'">'+esc(m.text)+'<small>'+(m.who==='user'?'Tú':'Coordinación')+' · '+m.h+'</small></div>';}).join('');var b=$('#chatBox');b.scrollTop=b.scrollHeight;}
function addMsg(inc,who,text){var d=new Date();inc.msgs.push({who:who,text:text,h:pad(d.getHours())+':'+pad(d.getMinutes())});saveInc();if(S.inc.current===inc.id&&!$('#rutaChatCard').hidden)renderChat(inc);}
function sendChat(){var t=$('#chatText').value.trim();if(!t)return;var inc=S.incidents.filter(function(i){return i.id===S.inc.current;})[0];if(!inc)return;addMsg(inc,'user',t);$('#chatText').value='';}
$('#chatSend').addEventListener('click',sendChat);
$('#chatText').addEventListener('keydown',function(e){if(e.key==='Enter')sendChat();});
$('#chatClose').addEventListener('click',function(){$('#rutaChatCard').hidden=true;$('#rutaFormCard').hidden=false;S.inc.current=null;});
$('#waShare').addEventListener('click',function(){var inc=S.incidents.filter(function(i){return i.id===S.inc.current;})[0];if(!inc)return;
var txt='Reporte '+inc.id+' · '+inc.tipo+' · '+inc.ts+(inc.desc?' · '+inc.desc:'')+(inc.geo?' · Ubicación: https://maps.google.com/?q='+inc.geo.lat+','+inc.geo.lng:' · Sin ubicación')+' · SGATyOC';
window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank');});
function renderRuta(){var f=$('#rutaDate').value||isoDate(new Date());$('#rutaDate').value=f;
var list=S.incidents.filter(function(i){return i.fecha===f&&(canManage()||i.dni===USER.dni);});
if(!list.length){$('#rutaList').innerHTML='<div class="empty">Sin reportes en esta fecha.</div>';return;}
$('#rutaList').innerHTML=list.map(function(i){return '<div class="today-item"><span class="ti-ico" style="background:var(--warnsoft);color:var(--warn)">!</span><span class="tt"><b>'+esc(i.tipo)+'</b><small>'+i.id+' · '+i.ts+' · '+esc(i.user)+(i.geo?' · con ubicación':'')+'</small></span><button class="btn sm" data-openinc="'+i.id+'">Abrir</button></div>';}).join('');}
$('#rutaDate').addEventListener('change',renderRuta);
$('#rutaList').addEventListener('click',function(e){var b=e.target.closest?e.target.closest('[data-openinc]'):null;if(!b)return;var inc=S.incidents.filter(function(i){return i.id===b.getAttribute('data-openinc');})[0];if(inc)openChat(inc);});
