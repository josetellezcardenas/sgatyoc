'use strict';
function estadoDe(u){if(u.dni==='54784385')return{k:'FAL',t:'Falta'};var h=parseInt(u.dni.slice(-2),10);if(h%9===0)return{k:'TAR',t:'Tarde'};return{k:'PRE',t:'Presente'};}
function renderAdmin(){var L=$('#adminLocked'),C=$('#adminContent');if(!L||!C)return;L.hidden=canManage();C.hidden=!canManage();if(!canManage())return;
var q=$('#admSearch').value.trim().toLowerCase();
var list=USUARIOS.filter(function(u){return u.tipo!=='Kiosco'&&(!q||u.dni.indexOf(q)!==-1||u.nom.toLowerCase().indexOf(q)!==-1);});
$('#admCount').textContent=list.length+' personas';
$('#kPresentes').textContent=USUARIOS.filter(function(u){return estadoDe(u).k==='PRE';}).length;
$('#kTarde').textContent=USUARIOS.filter(function(u){return estadoDe(u).k==='TAR';}).length;
$('#kFalta').textContent=USUARIOS.filter(function(u){return estadoDe(u).k==='FAL';}).length;
$('#kTotal').textContent=USUARIOS.filter(function(u){return u.tipo!=='Kiosco';}).length;
$('#admBody').innerHTML=list.map(function(u){var s=estadoDe(u);var c=s.k==='PRE'?'ok':s.k==='TAR'?'warn':'danger';
return '<tr><td><input type="checkbox" class="rowSel" data-dni="'+u.dni+'"></td><td><div class="emp-cell"><span class="avatar">'+iniciales(u.nom)+'</span><span><b>'+esc(u.nom)+'</b><small>DNI '+u.dni+'</small></span></div></td><td><span class="chip soft">'+esc(u.tipo)+'</span></td><td class="num">'+refriLbl(u.refri)+'</td><td><span class="chip '+c+'">'+s.t+'</span></td><td style="text-align:right;white-space:nowrap"><button class="btn sm" data-edit="'+u.dni+'">Editar</button> <button class="btn sm" data-reg="'+u.dni+'">Justificar</button></td></tr>';}).join('')||'<tr><td colspan="6"><div class="empty">Sin resultados.</div></td></tr>';
$('#auditList').innerHTML=REGHIST.map(function(a){return '<div class="audit-item"><div class="a-top"><code>'+a.id+'</code><span>'+esc(a.fecha)+'</span></div><div><b>'+esc(a.emp)+'</b> · '+esc(a.campo)+' → <b class="num">'+esc(a.ahora)+'</b></div><div style="color:var(--dim)">'+esc(a.motivo)+' · por <b>'+esc(a.admin)+'</b></div></div>';}).join('');}
$('#admSearch').addEventListener('input',renderAdmin);
$('#selAll').addEventListener('change',function(e){$$('.rowSel').forEach(function(c){c.checked=e.target.checked;});});
$('#btnGroupApply').addEventListener('click',function(){var g=$('#selGroup').value;var sel=$$('.rowSel').filter(function(c){return c.checked;});
if(!sel.length){toast('warn','Selecciona al menos una persona.');return;}
sel.forEach(function(c){var u=USUARIOS.filter(function(x){return x.dni===c.getAttribute('data-dni');})[0];if(u)u.refri=g;});
saveUsers();renderAdmin();toast('ok',sel.length+' persona(s) asignadas a refrigerio '+refriLbl(g)+'.');});
$('#admBody').addEventListener('click',function(e){var b=e.target.closest?e.target.closest('button'):null;if(!b)return;
if(b.hasAttribute('data-edit'))openUserModal(b.getAttribute('data-edit'));
if(b.hasAttribute('data-reg'))openRegModal(b.getAttribute('data-reg'));});
var editingDni=null;
function openUserModal(dni){editingDni=dni;var u=dni?USUARIOS.filter(function(x){return x.dni===dni;})[0]:null;
$('#userTitle').textContent=u?'Editar persona':'Nueva persona';$('#uNom').value=u?u.nom:'';$('#uDni').value=u?u.dni:'';$('#uDni').disabled=!!u;
$('#uTipo').innerHTML=TIPOS.map(function(t){return '<option '+(u&&u.tipo===t?'selected':'')+'>'+t+'</option>';}).join('');
$('#uRefri').value=u?u.refri:'13-14';$('#uDevTxt').textContent=u&&u.device?'Dispositivo: '+u.device:'Sin dispositivo autorizado';
$('#userDelete').hidden=!u;$('#userErr').classList.remove('show');$('#userModal').classList.add('show');}
function closeUserModal(){$('#userModal').classList.remove('show');}
$('#btnNuevoUser').addEventListener('click',function(){openUserModal(null);});
$('#userClose').addEventListener('click',closeUserModal);$('#userCancel').addEventListener('click',closeUserModal);
$('#uResetDev').addEventListener('click',function(){if(!editingDni)return;var u=USUARIOS.filter(function(x){return x.dni===editingDni;})[0];if(!u)return;u.device='';saveUsers();$('#uDevTxt').textContent='Sin dispositivo autorizado';toast('info','Dispositivo restablecido.');});
$('#userSave').addEventListener('click',function(){var nom=$('#uNom').value.trim(),dni=$('#uDni').value.trim();var errs=[];
if(nom.length<5)errs.push('Escribe el nombre completo.');if(!/^\d{8}$/.test(dni))errs.push('DNI: 8 dígitos.');
if(!editingDni&&USUARIOS.some(function(u){return u.dni===dni;}))errs.push('Ya existe ese DNI.');
var box=$('#userErr');if(errs.length){box.innerHTML=errs.join('<br>');box.classList.add('show');return;}box.classList.remove('show');
if(editingDni){var u=USUARIOS.filter(function(x){return x.dni===editingDni;})[0];u.nom=nom;u.tipo=$('#uTipo').value;u.refri=$('#uRefri').value;toast('ok','Datos actualizados.');}
else{USUARIOS.push({dni:dni,nom:nom,tipo:$('#uTipo').value,refri:$('#uRefri').value,pin:'0000',device:''});toast('ok','Persona agregada. PIN inicial 0000.');}
saveUsers();closeUserModal();renderAdmin();});
$('#userDelete').addEventListener('click',function(){if(!editingDni)return;if(!confirm('¿Eliminar a esta persona?'))return;
USUARIOS=USUARIOS.filter(function(u){return u.dni!==editingDni;});saveUsers();closeUserModal();renderAdmin();toast('info','Persona eliminada.');});
var reg={time:null};
function openRegModal(dni){$('#regEmp').innerHTML=USUARIOS.filter(function(u){return u.tipo!=='Kiosco';}).map(function(u){return '<option value="'+u.dni+'" '+(dni===u.dni?'selected':'')+'>'+esc(u.nom)+' · '+u.dni+'</option>';}).join('');
$('#tpManual').value='';reg.time=null;$('#tpPrev').textContent='—';$('#regJust').value='';$('#regDesc').value='';$('#regErr').classList.remove('show');$('#editModal').classList.add('show');}
function closeRegModal(){$('#editModal').classList.remove('show');}
$('#regClose').addEventListener('click',closeRegModal);$('#regCancel').addEventListener('click',closeRegModal);
$('#tpManual').addEventListener('input',function(e){var v=e.target.value.replace(/\D/g,'').slice(0,4);if(v.length>=3)v=v.slice(0,2)+':'+v.slice(2);e.target.value=v;
if(v.length===5){var h=+v.slice(0,2),m=+v.slice(3);reg.time=(h<24&&m<60)?v:null;$('#tpPrev').textContent=reg.time||'inválida';}else{reg.time=null;$('#tpPrev').textContent='—';}});
$('#regSubmit').addEventListener('click',function(){var just=$('#regJust').value;var errs=[];if(!reg.time)errs.push('Ingresa la nueva hora.');if(!just)errs.push('Selecciona el motivo.');
var box=$('#regErr');if(errs.length){box.innerHTML=errs.join('<br>');box.classList.add('show');return;}box.classList.remove('show');
var emp=USUARIOS.filter(function(u){return u.dni===$('#regEmp').value;})[0];var d=new Date();
REGHIST.unshift({id:'REG-'+(1043+REGHIST.length),admin:USER.nom,emp:emp.nom,campo:$('#regTipo').value,ahora:reg.time,motivo:just,fecha:pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()+' '+nowHM()});
saveReg();closeRegModal();renderAdmin();toast('ok','Justificación guardada en el historial.');});
var kioskTimer=null,kQR=null,kLast='';
function openKiosk(){$('#kioskModal').classList.add('show');kRender();kioskTimer=setInterval(kRender,1000);}
function kRender(){var c=currentTotp();$('#kioskSecs').textContent='Cambia en '+(30-Math.floor((Date.now()/1000)%30))+' s';$('#kioskCode').textContent=c;
if(c!==kLast){kLast=c;if(window.QRCode){if(!kQR)kQR=new QRCode({element:$('#kioskCanvas'),size:260,level:'M'});kQR.value=JSON.stringify({app:'SGATyOC',totp:c,sede:'MD-SMP'});}}}
function closeKiosk(){$('#kioskModal').classList.remove('show');clearInterval(kioskTimer);}
$('#btnKiosk').addEventListener('click',openKiosk);$('#kioskClose').addEventListener('click',function(){closeKiosk();if(USER&&USER.tipo==='Kiosco')logout();});
$('#btnExport').addEventListener('click',function(){if(!window.XLSX){toast('danger','No se cargó el exportador.');return;}
var wb=XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['DNI','Nombre','Tipo','Refrigerio','DeviceID']].concat(USUARIOS.map(function(u){return[u.dni,u.nom,u.tipo,u.refri,u.device||''];}))),'Usuarios');
XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['ID','DNI','Fecha','Hora','Tipo','Lat','Lng','FueraRango']].concat(S.allMarks.map(function(m){return[m.id,m.dni,m.fecha,m.hora,m.type,m.geo.lat,m.geo.lng,m.fuera?'SI':'NO'];}))),'Marcaciones');
XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['ID','Persona','Campo','HoraNueva','Motivo','Admin','Fecha']].concat(REGHIST.map(function(a){return[a.id,a.emp,a.campo,a.ahora,a.motivo,a.admin,a.fecha];}))),'Justificaciones');
XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['ID','DNI','Fecha','Hora','Tipo','Detalle','Lat','Lng']].concat(S.incidents.map(function(i){return[i.id,i.dni,i.fecha,i.ts,i.tipo,i.desc,i.geo?i.geo.lat:'',i.geo?i.geo.lng:''];}))),'Incidencias');
XLSX.writeFile(wb,'SGATyOC_respaldo.xlsx');toast('ok','Excel exportado con 4 pestañas.');});
var THEMES=[['light','Light','#0F4C81'],['dark','Dark','#54A9FF'],['ocean','Ocean','#2EC4B6'],['forest','Forest','#386641'],['sunset','Sunset','#D1495B'],['sakura','Sakura','#A85D75']];
function applyTheme(id){S.theme=id;document.documentElement.setAttribute('data-theme',id);store.set('sgatyoc_theme',id);$$('#themeGrid .theme-card').forEach(function(c){c.classList.toggle('on',c.getAttribute('data-t')===id);});}
$('#themeGrid').innerHTML=THEMES.map(function(t){return '<button class="theme-card" data-t="'+t[0]+'"><span class="sw"><i style="background:'+t[2]+'"></i></span><b>'+t[1]+'</b></button>';}).join('');
$('#themeGrid').addEventListener('click',function(e){var b=e.target.closest('[data-t]');if(b)applyTheme(b.getAttribute('data-t'));});
$('#btnPolicy').addEventListener('click',function(){$('#policyBox').classList.add('show');$('#consentModal').classList.add('show');$('#btnConsentOk').style.display='none';$('#consentClose').style.display='';});
$('#btnPolicy2').addEventListener('click',function(){$('#policyBox').classList.toggle('show');});
$('#btnConsentOk').addEventListener('click',function(){S.consent=true;store.set('sgatyoc_consent','1');$('#consentModal').classList.remove('show');stabilizeGPS();toast('ok','Consentimiento registrado.');});
$('#consentClose').addEventListener('click',function(){$('#consentModal').classList.remove('show');});
function logout(){store.del('sgatyoc_session');try{sessionStorage.removeItem('sgatyoc_session');}catch(e){}
USER=null;$('#appShell').hidden=true;$('#botNav').hidden=true;$('#loginBox').classList.add('show');
$('#loginForm').hidden=false;$('#pinChange').hidden=true;$('#loginDni').value='';$('#loginPin').value='';$('#fldPin').hidden=true;}
$('#btnLogout').addEventListener('click',logout);
function enterApp(){$('#appShell').hidden=false;$('#botNav').hidden=USER.tipo==='Kiosco';
$('#sbName').textContent=USER.nom.split(',')[0];$('#sbTipo').textContent=USER.tipo;$('#sbAvatar').textContent=iniciales(USER.nom);
$('#greet').textContent='Hola, '+USER.nom.split(',')[0];$('#myRefri').textContent='Tu refrigerio: '+refriLbl(USER.refri);
$('#pfName').textContent=USER.nom;$('#pfMeta').textContent=USER.tipo+' · DNI '+USER.dni+' · Dispositivo '+devId();
applyTheme(S.theme);buildNav();tick();updateScanUI();updateActionUI();renderHistory();renderAdmin();renderRuta();refreshSyncUI();
if(USER.tipo==='Kiosco'){openKiosk();return;}
go('marcacion');if(!S.consent)$('#consentModal').classList.add('show');else stabilizeGPS();}
(function(){try{
var dni=store.get('sgatyoc_session','');if(!dni){try{dni=sessionStorage.getItem('sgatyoc_session')||'';}catch(e){}}
var u=USUARIOS.filter(function(x){return x.dni===dni;})[0];
if(u){USER=u;$('#loginBox').classList.remove('show');enterApp();}
Cola.init().then(refreshSyncUI).then(function(){if(netOk())flushQueue();});
}catch(err){console.error('boot:',err);toast('danger','Error de arranque: '+err.message);}})();
/* Restablecer PIN desde el Panel */
(function(){var mb=$('#userModal .m-body');if(!mb)return;
var row=document.createElement('div');row.className='fld';
row.innerHTML='<label>Seguridad</label><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" id="uResetPin" type="button">Restablecer PIN a 0000</button><button class="btn sm" id="uResetDev2" type="button">Liberar dispositivo</button></div>';
mb.insertBefore(row,$('#userErr'));
on('#uResetPin',function(){if(!editingDni){toast('warn','Guarda primero a la persona.');return;}
api({action:'resetPin',dni:editingDni}).then(function(){toast('ok','PIN restablecido a 0000 y dispositivo liberado.');}).catch(function(){toast('danger','No se pudo restablecer el PIN.');});});
on('#uResetDev2',function(){if(!editingDni){toast('warn','Guarda primero a la persona.');return;}
api({action:'resetDevice',dni:editingDni}).then(function(){var u=USUARIOS.filter(function(x){return x.dni===editingDni;})[0];if(u)u.device='';$('#uDevTxt').textContent='Sin dispositivo autorizado';toast('ok','Dispositivo liberado.');}).catch(function(){toast('danger','No se pudo liberar el dispositivo.');});});})();
