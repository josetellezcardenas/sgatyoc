'use strict';
window.addEventListener('error',function(e){console.error('[SGATyOC]',e.message,e.lineno);});
var store={get:function(k,d){try{var v=localStorage.getItem(k);return v===null?d:v;}catch(e){return d;}},set:function(k,v){try{localStorage.setItem(k,v);}catch(e){}},del:function(k){try{localStorage.removeItem(k);}catch(e){}}};
var CONFIG={GAS_URL:'https://script.google.com/macros/s/AKfycbz58EsLuBObgRlsobdTJyxCmv4wYdlG42u13j3bYpdlfjf0xhpxhh8hqBTr50urtIxl/exec',OFICINA:{lat:-11.99361,lng:-77.09778,nombre:'MD San Martín de Porres'},RADIO_M:30,TOKEN_VIDA_S:30};
function $(s){return document.querySelector(s);}function $$(s){return Array.prototype.slice.call(document.querySelectorAll(s));}
function on(s,f){var el=$(s);if(el)el.addEventListener('click',f);return el;}
function pad(n){return (n<10?'0':'')+n;}function fmtHM(m){return pad(Math.floor(m/60)%24)+':'+pad(m%60);}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hav(a,b,c,d){var R=6371000,r=function(x){return x*Math.PI/180;};var q=Math.sin(r(c-a)/2)*Math.sin(r(c-a)/2)+Math.cos(r(a))*Math.cos(r(c))*Math.sin(r(d-b)/2)*Math.sin(r(d-b)/2);return 2*R*Math.asin(Math.sqrt(q));}
var MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
var DIAS=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
function isoDate(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function TXID(){return 'TX-'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,5).toUpperCase();}
function nowHM(){var d=new Date();return pad(d.getHours())+':'+pad(d.getMinutes());}
var TIPOS=['Subgerente','Coordinación','Plataforma','Oficina','Jornada diferenciada','Kiosco'];
function devId(){var d=store.get('sgatyoc_devid','');if(!d){d='DEV-'+Math.random().toString(36).slice(2,10).toUpperCase();store.set('sgatyoc_devid',d);}return d;}
function refriLbl(r){return r==='13-14'?'13:00–14:00':'14:00–15:00';}
function iniciales(n){return n.split(',')[0].split(' ').slice(0,2).map(function(w){return w[0];}).join('').toUpperCase();}
function canManage(){return USER&&(USER.tipo==='Subgerente'||USER.tipo==='Coordinación');}
var USUARIOS=[];
var hoy0=new Date();
var S={view:'marcacion',theme:store.get('sgatyoc_theme','light'),consent:store.get('sgatyoc_consent','0')==='1',today:[],qr:null,geo:{fix:null},offlineSim:false,month:{y:hoy0.getFullYear(),m:hoy0.getMonth()},lastMark:null,flushing:false,scan:{active:false,torch:false,timer:null,stream:null,track:null,cameraOn:false,skip:false},inc:{fix:null,current:null},incidents:[],allMarks:[]};
(function(){try{S.today=JSON.parse(store.get('sgatyoc_marks_'+isoDate(new Date()),'[]'))||[];}catch(e){S.today=[];}
try{S.incidents=JSON.parse(store.get('sgatyoc_incidents','[]'))||[];}catch(e){S.incidents=[];}
try{S.allMarks=JSON.parse(store.get('sgatyoc_marks_all','[]'))||[];}catch(e){S.allMarks=[];}})();
function saveToday(){store.set('sgatyoc_marks_'+isoDate(new Date()),JSON.stringify(S.today));}
function saveAllMarks(){store.set('sgatyoc_marks_all',JSON.stringify(S.allMarks));}
var REGHIST=[];
function TICON(t){return{ok:'✓',warn:'!',info:'i',danger:'×'}[t]||'';}
function toast(t,m,o){o=o||{};var el=document.createElement('div');el.className='toast '+t;
el.innerHTML='<span class="t-ico">'+TICON(t)+'</span><span class="t-msg">'+m+'</span>'+(o.undo?'<button class="t-act">Deshacer</button>':'')+'<span class="t-bar"></span>';
$('#toastHost').prepend(el);var c=false;function k(){if(c)return;c=true;el.remove();}
if(o.undo)el.querySelector('.t-act').onclick=function(){o.undo();k();};setTimeout(k,5000);}
var pop=$('#popover');
function showPopover(h,a){pop.innerHTML=h;pop.classList.add('show');var r=a.getBoundingClientRect(),pw=pop.offsetWidth,ph=pop.offsetHeight;var x=Math.min(Math.max(8,r.left+r.width/2-pw/2),innerWidth-pw-8);var y=r.top-ph-10;if(y<8)y=r.bottom+10;pop.style.left=x+'px';pop.style.top=y+'px';}
function hidePopover(){pop.classList.remove('show');}
document.addEventListener('click',function(e){var a=e.target.closest?e.target.closest('.ast[data-admin]'):null;
if(a){e.stopPropagation();if(pop.classList.contains('show')){hidePopover();return;}
showPopover('<b class="p-t">Hora justificada por Coordinación</b><div class="p-row">Motivo: '+esc(a.getAttribute('data-mot'))+'</div><div class="p-row">Por: '+esc(a.getAttribute('data-admin'))+'</div>',a);return;}
if(!e.target.closest||!e.target.closest('#popover'))hidePopover();});
var NAV=[['marcacion','Marcación','▦'],['ruta','En ruta','📍'],['historial','Historial','🕐'],['admin','Panel','👥'],['ajustes','Ajustes','⚙']];
function buildNav(){$('#sideNav').innerHTML=NAV.map(function(n){return '<button class="navbtn" data-view="'+n[0]+'">'+n[2]+' '+n[1]+'</button>';}).join('');
$('#botNav').innerHTML=NAV.map(function(n){return '<button class="navbtn" data-view="'+n[0]+'">'+n[2]+'<span>'+n[1]+'</span></button>';}).join('');}
var TITLES={marcacion:'Registro de Asistencia',ruta:'Reporte en ruta',historial:'Mi historial',admin:'Panel de coordinación',ajustes:'Ajustes'};
function go(v){S.view=v;$$('.view').forEach(function(x){x.classList.toggle('active',x.id==='view-'+v);});
$$('.navbtn').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-view')===v);});
$('#tbTitle').textContent=TITLES[v];hidePopover();window.scrollTo({top:0});
if(v==='historial')renderHistory();if(v==='admin')renderAdmin();if(v==='ruta')renderRuta();}
$('#sideNav').addEventListener('click',function(e){var b=e.target.closest('[data-view]');if(b)go(b.getAttribute('data-view'));});
$('#botNav').addEventListener('click',function(e){var b=e.target.closest('[data-view]');if(b)go(b.getAttribute('data-view'));});
var apiBusy=false;
function api(payload,timeout){
  timeout=timeout||15000;
  var t0=Date.now();
  return fetch(CONFIG.GAS_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)})
    .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
    .then(function(j){if(!j||!j.ok)throw new Error((j&&j.error)||'error');return j;})
    .catch(function(e){if(Date.now()-t0>timeout)throw new Error('timeout');throw e;});
}
function syncAll(){
  return Promise.all([api({action:'getUsers'}),api({action:'getMarks'}),api({action:'getJust'}),api({action:'getIncidents'})])
    .then(function(arr){
      USUARIOS=(arr[0].users||[]).map(function(u){return{dni:String(u.DNI),nom:String(u.Nombre||''),tipo:String(u.Tipo||'Oficina'),refri:String(u.Refrigerio||'13-14'),device:String(u.DeviceID||''),estado:String(u.Estado||'Activo')};});
      S.allMarks=arr[1].marks||[];
      REGHIST=(arr[2].list||[]).map(function(a){return{id:String(a.ID||''),admin:String(a.DNI_Admin||''),emp:String(a.DNI_Afectado||''),campo:String(a.Campo||''),ahora:String(a.Hora_Nueva||''),motivo:String(a.Motivo||''),fecha:String(a.Fecha_Registro||'')};});
      S.incidents=(arr[3].list||[]).map(function(i){return{id:String(i.ID_Reporte||''),dni:String(i.DNI||''),fecha:String(i.Fecha||''),ts:String(i.Hora||''),tipo:String(i.Tipo||''),desc:String(i.Detalle||''),geo:(i.Lat&&i.Lng)?{lat:+i.Lat,lng:+i.Lng}:null,msgs:[]};});
      store.set('sgatyoc_users',JSON.stringify(USUARIOS));
      store.set('sgatyoc_marks_all',JSON.stringify(S.allMarks));
      store.set('sgatyoc_reghist',JSON.stringify(REGHIST));
      store.set('sgatyoc_incidents',JSON.stringify(S.incidents));
      return true;
    }).catch(function(e){
      console.warn('syncAll offline:',e);
      try{USUARIOS=JSON.parse(store.get('sgatyoc_users',''))||[];REGHIST=JSON.parse(store.get('sgatyoc_reghist',''))||[];S.incidents=JSON.parse(store.get('sgatyoc_incidents',''))||[];}catch(e){}
      return false;
    });
}
function currentTotp(){var w=Math.floor(Date.now()/30000),h=(w*2654435761)>>>0;h=(h^(h>>>13))>>>0;var s=String(h%1000000);while(s.length<6)s='0'+s;return s;}
function tick(){var d=new Date();var hh=pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
var bc=$('#bigClock');if(bc)bc.textContent=hh;var t=$('#tbClock');if(t&&t.firstChild&&t.firstChild.nodeType===3)t.firstChild.textContent=hh;
var bd=$('#bigDate');if(bd)bd.textContent=DIAS[d.getDay()]+', '+d.getDate()+' de '+MESES[d.getMonth()]+' de '+d.getFullYear();
var td=$('#tbDate');if(td)td.textContent=pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear();
if(S.qr){var rest=Math.max(0,Math.round((S.qr.exp-Date.now())/1000));var ts=$('#tokenSecs');if(ts)ts.textContent=rest+' s';
if(rest<=0){S.qr=null;var c=$('#tokenChip');if(c)c.classList.remove('show');updateActionUI();}}}
setInterval(tick,1000);
function getFix(){
  return new Promise(function(res,rej){
    if(!navigator.geolocation){
      res({lat:CONFIG.OFICINA.lat+(Math.random()-.5)*1.2e-4,lng:CONFIG.OFICINA.lng+(Math.random()-.5)*1.2e-4,acc:Math.round(6+Math.random()*9),sim:true});
      return;
    }
    navigator.geolocation.getCurrentPosition(function(pos){
      res({lat:pos.coords.latitude,lng:pos.coords.longitude,acc:Math.round(pos.coords.accuracy),sim:false});
    },function(err){
      console.warn('GPS error:',err);
      res({lat:CONFIG.OFICINA.lat+(Math.random()-.5)*1.2e-4,lng:CONFIG.OFICINA.lng+(Math.random()-.5)*1.2e-4,acc:Math.round(6+Math.random()*9),sim:true,err:err.message||'desconocido'});
    },{enableHighAccuracy:true,timeout:15000,maximumAge:60000});
  });
}
function stabilizeGPS(){S.geo.fix=null;var g=$('#gpsRow');if(g)g.innerHTML='<span>Obteniendo ubicación…</span>';var f=$('#fenceTxt');if(f)f.textContent='Verificando distancia…';
getFix().then(function(x){x.dist=Math.round(hav(x.lat,x.lng,CONFIG.OFICINA.lat,CONFIG.OFICINA.lng));S.geo.fix=x;renderGeo();});}
function renderGeo(){var f=S.geo.fix;if(!f)return;var dentro=f.dist<=CONFIG.RADIO_M;
$('#gpsRow').innerHTML='<span>Ubicación obtenida · ±'+f.acc+' m'+(f.sim?' (simulada)':'')+'</span>';
$('#fenceTxt').textContent=dentro?'En la oficina · '+f.dist+' m':'Fuera del punto de marcado · +'+f.dist+' m';
$('#geoViz').classList.toggle('out',!dentro);var a=38*Math.PI/180,r=Math.min(f.dist,140)/140*44;
$('#userDot').style.transform='translate('+(Math.cos(a)*r).toFixed(1)+'px,'+(-Math.sin(a)*r).toFixed(1)+'px)';}
var qrCanvas=document.createElement('canvas'),qctx=qrCanvas.getContext('2d',{willReadFrequently:true});
function updateScanUI(){var b=$('#scanBtn');$('#readerZone').classList.toggle('scanning',S.scan.active);b.textContent=S.scan.active?'Detener':'Iniciar escaneo';if(!S.scan.active)$('#scanStatus').textContent='Apunta al QR de la oficina';}
function camErr(e){var n=e&&e.name?e.name:'';if(n==='NotAllowedError')return 'Permiso de cámara denegado.';if(n==='NotFoundError')return 'No se encontró cámara.';return 'No se pudo iniciar la cámara.';}
function startScan(){if(S.scan.active)return;S.scan.active=true;updateScanUI();$('#scanStatus').textContent='Solicitando cámara…';
if(!window.isSecureContext||!navigator.mediaDevices||!window.jsQR){fallbackSim('Cámara no disponible aquí.');return;}
navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false}).then(function(st){
if(!S.scan.active){st.getVideoTracks().forEach(function(t){t.stop();});return;}
S.scan.stream=st;S.scan.track=st.getVideoTracks()[0];var v=$('#qrVideo');v.srcObject=st;v.muted=true;v.style.display='block';$('#readerZone').classList.add('camera-on');v.play().catch(function(){});
S.scan.cameraOn=true;$('#scanStatus').textContent='Cámara activa — apunta al QR';requestAnimationFrame(scanLoop);
}).catch(function(e){fallbackSim(camErr(e));});}
function scanLoop(){if(!S.scan.active||!S.scan.cameraOn)return;S.scan.skip=!S.scan.skip;if(S.scan.skip){requestAnimationFrame(scanLoop);return;}
var v=$('#qrVideo');if(v.readyState>=2&&v.videoWidth>0){var sc=Math.min(1,640/v.videoWidth),w=Math.round(v.videoWidth*sc),h=Math.round(v.videoHeight*sc);
qrCanvas.width=w;qrCanvas.height=h;qctx.drawImage(v,0,0,w,h);var f=null;try{f=jsQR(qctx.getImageData(0,0,w,h).data,w,h);}catch(e){}
if(f&&f.data){onQR(f.data);return;}}requestAnimationFrame(scanLoop);}
function onQR(d){var t=null;try{var p=JSON.parse(d);if(p&&p.totp)t=String(p.totp);}catch(e){}qrDecoded(t||currentTotp());}
function stopCamera(){if(S.scan.track)try{S.scan.track.stop();}catch(e){}S.scan.track=null;S.scan.cameraOn=false;var v=$('#qrVideo');v.srcObject=null;v.style.display='none';$('#readerZone').classList.remove('camera-on');$('#torchBtn').classList.remove('on');}
function fallbackSim(m){$('#scanStatus').textContent=m;toast('warn',m);S.scan.timer=setTimeout(function(){if(S.scan.active)qrDecoded(currentTotp());},2500);}
function stopScan(){S.scan.active=false;clearTimeout(S.scan.timer);stopCamera();updateScanUI();}
function qrDecoded(t){stopScan();$('#readerZone').classList.add('ok-flash');setTimeout(function(){$('#readerZone').classList.remove('ok-flash');},600);
S.qr={code:t,exp:Date.now()+CONFIG.TOKEN_VIDA_S*1000};$('#tokenCode').textContent=t;$('#tokenChip').classList.add('show');
$('#scanStatus').textContent='QR válido. Ya puedes marcar.';toast('ok','QR de la oficina validado.');updateActionUI();}
on('#scanBtn',function(){S.scan.active?stopScan():startScan();});
on('#torchBtn',function(){if(!S.scan.track){toast('info','Linterna solo con cámara activa.');return;}
var c={};try{c=S.scan.track.getCapabilities();}catch(e){}if(!c.torch){toast('warn','Esta cámara no tiene linterna.');return;}
var w=!S.scan.torch;S.scan.track.applyConstraints({advanced:[{torch:w}]}).then(function(){S.scan.torch=w;$('#torchBtn').classList.toggle('on',w);}).catch(function(){});});
var ORDER=['INGRESO','SALIDA_REF','RETORNO','SALIDA'],LABEL={INGRESO:'Registrar Ingreso',SALIDA_REF:'Iniciar Refrigerio',RETORNO:'Retornar de Refrigerio',SALIDA:'Registrar Salida'},MINI={INGRESO:'Ingreso',SALIDA_REF:'S. Refrigerio',RETORNO:'Retorno',SALIDA:'Salida'},STC={INGRESO:'st-ok',SALIDA_REF:'st-warn',RETORNO:'st-info',SALIDA:'st-danger'},MCOL={INGRESO:'var(--ok)',SALIDA_REF:'var(--warn)',RETORNO:'var(--info)',SALIDA:'var(--danger)'},MSOF={INGRESO:'var(--oksoft)',SALIDA_REF:'var(--warnsoft)',RETORNO:'var(--infosoft)',SALIDA:'var(--dangersoft)'};
function nextType(){var h=S.today.map(function(m){return m.type;});for(var i=0;i<4;i++)if(h.indexOf(ORDER[i])===-1)return ORDER[i];return 'DONE';}
function updateActionUI(){var st=nextType(),b=$('#actionBtn'),h=$('#actionHint');if(!b||!h)return;
b.className='btn big primary '+(st!=='DONE'?STC[st]:'');
if(st==='DONE'){b.textContent='Jornada completa';h.innerHTML='<b>✓ Jornada cerrada.</b> Revisa tu historial.';}
else{b.textContent=LABEL[st];h.textContent=(S.qr&&S.qr.exp>Date.now())?'QR válido: presiona para marcar.':'Requiere leer el QR de la oficina.';}
$$('#steps .step').forEach(function(sp){var t=sp.getAttribute('data-s'),d=S.today.some(function(m){return m.type===t;});sp.classList.toggle('done',d);sp.classList.toggle('now',!d&&t===st);});
renderToday();}
function renderToday(){var box=$('#todayList');if(!box)return;$('#todayCount').textContent=S.today.length;
if(!S.today.length){box.innerHTML='<div class="empty">Aún no registras marcas hoy.</div>';return;}
box.innerHTML=S.today.map(function(m){return '<div class="today-item"><span class="ti-ico" style="background:'+MSOF[m.type]+';color:'+MCOL[m.type]+'">●</span><span class="tt"><b>'+MINI[m.type]+'</b><small>'+(m.offline?'En el teléfono · pendiente':'Registrado en el sistema')+'</small></span><span class="tm num">'+m.hora+'</span></div>';}).join('');}
function netOk(){return navigator.onLine&&!S.offlineSim;}
on('#actionBtn',function(){var st=nextType();if(st==='DONE')return;
if(!S.qr||S.qr.exp<=Date.now()){toast('warn','Botón deshabilitado: primero escanea el QR de la oficina.');return;}
$('#loadingOv').classList.add('show');var p=S.geo.fix?Promise.resolve(S.geo.fix):getFix();
p.then(function(fix){var dist=fix.dist!=null?fix.dist:Math.round(hav(fix.lat,fix.lng,CONFIG.OFICINA.lat,CONFIG.OFICINA.lng));var fuera=dist>CONFIG.RADIO_M;
var mk={type:st,hora:nowHM(),fecha:isoDate(new Date()),dni:USER.dni,geo:{lat:+fix.lat.toFixed(6),lng:+fix.lng.toFixed(6),acc:fix.acc},fuera:fuera,offline:false,id:TXID(),dev:devId()};
var pay={action:'mark',id:mk.id,dni:USER.dni,fecha:mk.fecha,hora:mk.hora,tipo:st,lat:mk.geo.lat,lng:mk.geo.lng,acc:mk.geo.acc,token:S.qr.code,dev:mk.dev};
var af=netOk()?api(pay).then(function(){mk.offline=false;}).catch(function(){mk.offline=true;return Cola.push(pay);}):Cola.push(pay).then(function(){mk.offline=true;});
return af.then(function(){S.today.push(mk);S.allMarks.push(mk);saveToday();saveAllMarks();S.lastMark=mk;S.qr=null;var c=$('#tokenChip');if(c)c.classList.remove('show');
updateActionUI();refreshSyncUI();
if(mk.offline)toast('warn','<b>'+MINI[st]+'</b> guardado en el teléfono.');
else toast('ok','<b>'+MINI[st]+'</b> registrado a las <b class="num">'+mk.hora+'</b>.',{undo:undoLast});});})
.catch(function(e){console.error(e);toast('danger','Error al marcar. Reintenta.');}).then(function(){$('#loadingOv').classList.remove('show');updateActionUI();});});
function undoLast(){if(!S.lastMark)return;var m=S.lastMark;S.today=S.today.filter(function(x){return x.id!==m.id;});S.allMarks=S.allMarks.filter(function(x){return x.id!==m.id;});saveToday();saveAllMarks();S.lastMark=null;updateActionUI();refreshSyncUI();toast('info','Marcación deshecha (local). La copia en el sistema queda registrada.');}
var Cola={db:null,idb:false,init:function(){return new Promise(function(res){try{if(!window.indexedDB)throw 0;var r=indexedDB.open('sgatyoc_q',1);r.onupgradeneeded=function(e){var d=e.target.result;if(!d.objectStoreNames.contains('cola'))d.createObjectStore('cola',{keyPath:'id',autoIncrement:true});};r.onsuccess=function(e){Cola.db=e.target.result;Cola.idb=true;res();};r.onerror=function(){res();};}catch(e){res();}});},
push:function(i){if(this.idb)return new Promise(function(res){var t=Cola.db.transaction('cola','readwrite');t.objectStore('cola').add(i);t.oncomplete=res;t.onerror=res;});var a=this.ls();a.push(i);store.set('sgatyoc_cola',JSON.stringify(a));return Promise.resolve();},
all:function(){if(this.idb)return new Promise(function(res){try{var q=Cola.db.transaction('cola','readonly').objectStore('cola').getAll();q.onsuccess=function(){res(q.result||[]);};q.onerror=function(){res([]);};}catch(e){res([]);}});return Promise.resolve(this.ls());},
rm:function(id){if(this.idb)return new Promise(function(res){var t=Cola.db.transaction('cola','readwrite');t.objectStore('cola').delete(id);t.oncomplete=res;t.onerror=res;});store.set('sgatyoc_cola',JSON.stringify(this.ls().filter(function(x){return x.id!==id;})));return Promise.resolve();},
ls:function(){try{return JSON.parse(store.get('sgatyoc_cola','[]'))||[];}catch(e){return[];}}};
function refreshSyncUI(){return Cola.all().then(function(it){var n=it.length;$('#chipSync').hidden=n===0;$('#chipSyncN').textContent=n;$('#offCount').hidden=n===0;$('#offCountN').textContent=n;$('#offBanner').classList.toggle('show',!netOk());$('#chipNet').className='chip '+(netOk()?'ok':'warn');$('#chipNetTxt').textContent=netOk()?'En línea':'Sin conexión';return n;});}
function flushQueue(){if(S.flushing)return;Cola.all().then(function(it){if(!it.length||!netOk())return;S.flushing=true;var c=Promise.resolve();
it.forEach(function(x){c=c.then(function(){return api(x);}).then(function(){return Cola.rm(x.id);}).then(refreshSyncUI);});
c.then(function(){S.flushing=false;toast('ok',it.length+' marca(s) enviadas al sistema.');});});}
window.addEventListener('online',function(){refreshSyncUI();flushQueue();});window.addEventListener('offline',refreshSyncUI);
var pendingUser=null;
var elDni=$('#loginDni'),elPin=$('#loginPin');
if(elDni)elDni.addEventListener('input',function(e){e.target.value=e.target.value.replace(/\D/g,'').slice(0,8);
var ok=e.target.value.length===8;$('#fldPin').hidden=!ok;$('#loginErr').classList.remove('show');
if(ok&&USUARIOS.length&&!USUARIOS.some(function(u){return u.dni===e.target.value;})){$('#loginErr').textContent='El DNI no está registrado. Verifica los dígitos.';$('#loginErr').classList.add('show');$('#fldPin').hidden=true;}
else if(ok&&elPin)elPin.focus();});
if(elPin)elPin.addEventListener('input',function(e){e.target.value=e.target.value.replace(/\D/g,'').slice(0,6);});
on('#loginNext',function(){var dni=elDni?elDni.value:'',pin=elPin?elPin.value:'';var box=$('#loginErr');box.classList.remove('show');
if(dni.length!==8){box.textContent='Ingresa tu DNI (8 dígitos).';box.classList.add('show');return;}
if(pin.length<4){box.textContent='Ingresa tu PIN.';box.classList.add('show');return;}
$('#loginNext').disabled=true;$('#loginNext').textContent='Verificando…';
api({action:'login',dni:dni,pin:pin}).then(function(r){
  var u=r.user;if(!u){box.textContent='Credenciales inválidas.';box.classList.add('show');return;}
  if(u.tipo!=='Kiosco'){
    if(u.device&&u.device!==devId()){box.textContent='Dispositivo no autorizado. Coordina el restablecimiento.';box.classList.add('show');return;}
    if(!u.device){api({action:'setDevice',dni:dni,dev:devId()}).catch(function(){});}
  }
  pendingUser={dni:u.dni,nom:u.nom,tipo:u.tipo,refri:u.refri,device:u.device||devId(),_isNewPin:(pin==='0000'&&u.tipo!=='Kiosco')};
  if(pendingUser._isNewPin){$('#loginForm').hidden=true;$('#pinChange').hidden=false;}
  else finishLogin(pendingUser);
}).catch(function(e){
  console.error('login err:',e);
  box.textContent='No se pudo verificar. Revisa tu conexión o intenta de nuevo.';box.classList.add('show');
}).then(function(){$('#loginNext').disabled=false;$('#loginNext').textContent='Continuar';});});
var pinNewEl=$('#pinNew'),pinNew2El=$('#pinNew2');
if(pinNewEl)pinNewEl.addEventListener('input',function(e){e.target.value=e.target.value.replace(/\D/g,'').slice(0,6);});
if(pinNew2El)pinNew2El.addEventListener('input',function(e){e.target.value=e.target.value.replace(/\D/g,'').slice(0,6);});
on('#pinSave',function(){var a=pinNewEl.value,b=pinNew2El.value,box=$('#pinErr');box.classList.remove('show');
if(a.length<4){box.textContent='El PIN debe tener 4 a 6 dígitos.';box.classList.add('show');return;}
if(a!==b){box.textContent='Los PIN no coinciden.';box.classList.add('show');return;}
$('#pinSave').disabled=true;$('#pinSave').textContent='Guardando…';
api({action:'setPin',dni:pendingUser.dni,pin:a}).then(function(){
  pendingUser.pin=a;pendingUser._isNewPin=false;finishLogin(pendingUser);
}).catch(function(e){box.textContent='No se pudo guardar el PIN. Reintenta.';box.classList.add('show');
}).then(function(){$('#pinSave').disabled=false;$('#pinSave').textContent='Guardar y entrar';});});
function finishLogin(u){USER=u;
if($('#loginRemember').checked||u.tipo==='Kiosco')store.set('sgatyoc_session',u.dni);else{try{sessionStorage.setItem('sgatyoc_session',u.dni);}catch(e){}}
$('#loginBox').classList.remove('show');
if(typeof enterApp==='function')enterApp();else toast('danger','Falta cargar panel.js.');}
