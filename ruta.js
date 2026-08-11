'use strict';
function saveInc(){store.set('sgatyoc_incidents',JSON.stringify(S.incidents));}
var elIncGps=$('#incGps');
if(elIncGps)elIncGps.addEventListener('change',function(e){var st=$('#incGpsState');
if(e.target.checked){if(!navigator.geolocation){st.hidden=false;st.style.color='var(--warn)';st.textContent='Dispositivo sin geolocalización.';e.target.checked=false;return;}
st.hidden=false;st.style.color='var(--dim)';st.textContent='Solicitando ubicación…';
navigator.geolocation.getCurrentPosition(function(p){S.inc.fix={lat:+p.coords.latitude.toFixed(6),lng:+p.coords.longitude.toFixed(6),acc:Math.round(p.coords.accuracy)};st.style.color='var(--ok)';st.textContent='Ubicación adjunta · ±'+S.inc.fix.acc+' m';},
function(err){e.target.checked=false;S.inc.fix=null;st.style.color='var(--warn)';st.textContent=err.code===1?'Permiso denegado; continuará sin ubicación.':'No se obtuvo ubicación; continuará sin ella.';},
{enableHighAccuracy:true,timeout:10000,maximumAge:30000});}else{S.inc.fix=null;st.hidden=true;}});
on('#incSend',function(){var tipo=$('#incTipo').value;if(!tipo){toast('warn','Selecciona el tipo de evento.');return;}
var d=new Date();var inc={id:'INC-'+String(Date.now()).slice(-6),fecha:isoDate(d),ts:pad(d.getDate())+'/'+pad(d.getMonth()+1)+' '+nowHM(),tipo:tipo,desc:$('#incDesc').value.trim(),geo:S.inc.fix,dni:USER.dni,user:USER.nom,msgs:[]};
var pay={action:'incident',id:inc.id,dni:USER.dni,fecha:inc.fecha,hora:inc.ts,tipo:tipo,detalle:inc.desc,lat:inc.geo?inc.geo.lat:'',lng:inc.geo?inc.geo.lng:''};
S.incidents.unshift(inc);saveInc();
addMsg(inc,'coord','Reporte '+inc.id+' registrado. Coordinación y Subgerencia pueden leer este chat.');
openChat(inc);renderRuta();$('#incDesc').value='';$('#incTipo').value='';if(elIncGps)elIncGps.checked=false;var st2=$('#incGpsState');if(st2)st2.hidden=true;S.inc.fix=null;
if(netOk()){api(pay).then(function(){toast('ok','Reporte <b>'+inc.id+'</b> enviado al sistema.');}).catch(function(){toast('warn','Reporte <b>'+inc.id+'</b> guardado en el teléfono. Se enviará al recuperar conexión.');});}
else toast('warn','Reporte <b>'+inc.id+'</b> guardado en el teléfono.');});
function openChat(inc){$('#rutaFormCard').hidden=true;$('#rutaChatCard').hidden=false;$('#chatReportId').textContent=inc.id;S.inc.current=inc.id;renderChat(inc);}
function renderChat(inc){$('#chatBox').innerHTML=inc.msgs.map(function(m){return '<div class="msg '+m.who+'">'+esc(m.text)+'<small>'+(m.who==='user'?'Tú':'Coordinación')+' · '+m.h+'</small></div>';}).join('');var b=$('#chatBox');b.scrollTop=b.scrollHeight;}
function addMsg(inc,who,text){var d=new Date();inc.msgs.push({who:who,text:text,h:pad(d.getHours())+':'+pad(d.getMinutes())});saveInc();if(S.inc.current===inc.id&&!$('#rutaChatCard').hidden)renderChat(inc);}
function sendChat(){var t=$('#chatText').value.trim();if(!t)return;var inc=S.incidents.filter(function(i){return i.id===S.inc.current;})[0];if(!inc)return;addMsg(inc,'user',t);$('#chatText').value='';}
on('#chatSend',sendChat);
var elChatText=$('#chatText');if(elChatText)elChatText.addEventListener('keydown',function(e){if(e.key==='Enter')sendChat();});
on('#chatClose',function(){$('#rutaChatCard').hidden=true;$('#rutaFormCard').hidden=false;S.inc.current=null;});
on('#waShare',function(){var inc=S.incidents.filter(function(i){return i.id===S.inc.current;})[0];if(!inc)return;
var txt='Reporte '+inc.id+' · '+inc.tipo+' · '+inc.ts+(inc.desc?' · '+inc.desc:'')+(inc.geo?' · Ubicación: https://maps.google.com/?q='+inc.geo.lat+','+inc.geo.lng:' · Sin ubicación')+' · SGATyOC';
window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank');});
function renderRuta(){var f=$('#rutaDate').value||isoDate(new Date());$('#rutaDate').value=f;
var list=S.incidents.filter(function(i){return i.fecha===f&&(canManage()||i.dni===USER.dni);});
if(!$('#rutaList'))return;
if(!list.length){$('#rutaList').innerHTML='<div class="empty">Sin reportes en esta fecha.</div>';return;}
$('#rutaList').innerHTML=list.map(function(i){return '<div class="today-item"><span class="ti-ico" style="background:var(--warnsoft);color:var(--warn)">!</span><span class="tt"><b>'+esc(i.tipo)+'</b><small>'+i.id+' · '+i.ts+' · '+esc(i.user||'')+(i.geo?' · con ubicación':'')+'</small></span><button class="btn sm" data-openinc="'+i.id+'">Abrir</button></div>';}).join('');}
var elRutaDate=$('#rutaDate');if(elRutaDate)elRutaDate.addEventListener('change',renderRuta);
on('#rutaList',function(e){var b=e.target.closest?e.target.closest('[data-openinc]'):null;if(!b)return;var inc=S.incidents.filter(function(i){return i.id===b.getAttribute('data-openinc');})[0];if(inc)openChat(inc);});
/* ---- Historial (lee de S.allMarks y REGHIST, sincronizados de Sheets) ---- */
function renderHistory(){var y=S.month.y,m=S.month.m;$('#monthLabel').textContent=MESES[m]+' '+y;
$('#histUser').textContent=USER.nom+' · DNI '+USER.dni;
var now=new Date(),enActual=y===now.getFullYear()&&m===now.getMonth();
$('#nextM').disabled=enActual;
var map={};
(S.allMarks||[]).forEach(function(mk){var key=mk.Fecha||mk.fecha;if(!key)return;if(!map[key])map[key]={};map[key][mk.Tipo||mk.tipo]=mk.Hora||mk.hora;});
(REGHIST||[]).forEach(function(r){var emp=String(r.emp||'');var mio=(emp===USER.dni)||(USUARIOS.some(function(u){return u.nom===emp&&u.dni===USER.dni;}));if(!mio)return;
var key=String(r.fecha||'').split(' ')[0];if(!key)return;if(!map[key])map[key]={};
var c=r.campo;if(c==='Ingreso')map[key].INGRESO=r.ahora;else if(c==='Salida a refrigerio')map[key].SALIDA_REF=r.ahora;else if(c==='Retorno de refrigerio')map[key].RETORNO=r.ahora;else if(c==='Salida')map[key].SALIDA=r.ahora;map[key]._reg=r;});
var days=new Date(y,m+1,0).getDate();var rows=[];
for(var d=1;d<=days;d++){var dt=new Date(y,m,d),wd=dt.getDay();if(wd===0||wd===6)continue;if(enActual&&d>now.getDate())continue;
var mk=map[isoDate(dt)]||{};
var ing=mk.INGRESO?parseHM(mk.INGRESO):null,ref=mk.SALIDA_REF?parseHM(mk.SALIDA_REF):null,ret=mk.RETORNO?parseHM(mk.RETORNO):null,sal=mk.SALIDA?parseHM(mk.SALIDA):null;
var ot=null,per=null;
if(ing!=null&&sal!=null){var b=(ref!=null&&ret!=null)?(ret-ref):0;per=(sal-ing)-b;var ex=per-480;if(ex>0)ot='+'+Math.floor(ex/60)+':'+pad(ex%60);}
rows.push({d:d,dt:dt,ing:ing,ref:ref,ret:ret,sal:sal,ot:ot,per:per,mods:mk._reg||null,omision:ing===null&&sal===null});}
rows=rows.slice().reverse();
function cell(v,r){var t=(v!=null)?fmtHM(v):'<span class="dash">—</span>';
var ast=r.mods?'<button class="ast" data-admin="'+esc(r.mods.admin||'')+'" data-mot="'+esc(r.mods.motivo||'')+'" data-fec="'+esc(r.mods.fecha||'')+'">*</button>':'';
return t+ast;}
$('#histBody').innerHTML=rows.map(function(r){var esHoy=enActual&&r.d===now.getDate();
return '<div class="hrow"><span class="hcell hdate"><b>'+r.dt.getDate()+' '+MESES[m].slice(0,3)+'.</b><small>'+DIAS[r.dt.getDay()].slice(0,3)+(r.omision?' · <b style="color:var(--danger)">Sin marca</b>':'')+(esHoy?' · <b style="color:var(--primary)">Hoy</b>':'')+'</small></span>'+
'<span class="hcell" data-l="Ingreso"><b class="num">'+cell(r.ing,r)+'</b></span>'+
'<span class="hcell" data-l="Salida refrig."><b class="num">'+cell(r.ref,r)+'</b></span>'+
'<span class="hcell" data-l="Retorno"><b class="num">'+cell(r.ret,r)+'</b></span>'+
'<span class="hcell" data-l="Salida"><b class="num">'+cell(r.sal,r)+'</b></span>'+
'<span class="hcell" data-l="Sobretiempo">'+(r.ot?'<span class="ot-pos">'+r.ot+'</span>':'<span class="dash">—</span>')+'</span></div>';}).join('')||'<div class="empty">Sin marcas este mes.</div>';
var lab=rows.length,seg=rows.reduce(function(a,r){return a+(r.per||0);},0);
var ex2=rows.reduce(function(a,r){if(!r.ot)return a;var p=r.ot.slice(1).split(':');return a+(+p[0])*60+(+p[1]);},0);
var om=rows.filter(function(r){return r.omision;}).length;
$('#histSummary').innerHTML='<div class="sum-item"><b class="num">'+lab+'</b><span>Días laborados</span></div><div class="sum-item"><b class="num">'+Math.floor(seg/60)+'h '+pad(seg%60)+'m</b><span>Horas efectivas</span></div><div class="sum-item"><b class="num" style="color:var(--ok)">'+(ex2?Math.floor(ex2/60)+'h '+pad(ex2%60)+'m':'0h 00m')+'</b><span>Sobretiempo</span></div><div class="sum-item"><b class="num" style="color:'+(om?'var(--danger)':'inherit')+'">'+om+'</b><span>Sin marca</span></div>';}
on('#prevM',function(){S.month.m--;if(S.month.m<0){S.month.m=11;S.month.y--;}renderHistory();});
on('#nextM',function(){S.month.m++;if(S.month.m>11){S.month.m=0;S.month.y++;}renderHistory();});
