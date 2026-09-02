// ORDENES
function renderOrdenes(){
  var q=(document.getElementById("src-o")?document.getElementById("src-o").value:"").toLowerCase();
  var lista=ordenes.filter(function(o){
    if(!q) return true;
    var c=cById(o.clienteId);
    var nick=(c&&c.nick||"").toLowerCase();
    var fecha=(o.fecha||"").toLowerCase();
    var fechaLegible=fechaCorta(o.fecha).toLowerCase();
    var tel=(c&&c.telefono||"").toLowerCase();
    var numdi=(c&&c.numDI||"").toLowerCase();
    return nick.indexOf(q)>=0||fecha.indexOf(q)>=0||fechaLegible.indexOf(q)>=0||tel.indexOf(q)>=0||numdi.indexOf(q)>=0;
  }).sort(function(a,b){
    var diff=new Date(b.fecha||0)-new Date(a.fecha||0);
    return diff!==0?diff:(b.id-a.id);
  });
  var pg=pagSlice("ordenes",lista);
  document.getElementById("lst-o").innerHTML=(pg.items.length?pg.items.map(function(o){
    var c=cById(o.clienteId);
    var items=o.detalleIds.map(function(id){return detalles.find(function(d){return d.id===id;});}).filter(Boolean);
    var total=items.reduce(function(s,d){return s+d.precio*d.cantidad;},0);
    var cantTotal=items.reduce(function(s,d){return s+(Number(d.cantidad)||0);},0);
    var envioRel=envios.find(function(e){return e.ordenId===o.id;});
    return '<div class="card" onclick="cardEdit(event,\'orden\','+o.id+')"><div class="crow" style="margin-bottom:8px"><div style="width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,var(--rose),var(--gold));display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">📦</div><div class="ci"><div class="cn">'+esc(c?c.nombre:"")+'</div><div class="cm"><span>'+esc(c?c.nick:"")+'</span><span>'+o.fecha+'</span></div><div class="cm" style="margin-top:2px"><span style="font-weight:700;background:var(--cream);color:var(--dark);padding:2px 8px;border-radius:8px">OV-'+o.id+'</span>'+(envioRel?'<span>🚚 #'+esc(envioRel.tracking||"SN")+'</span>':'')+'</div></div><div class="ca"><div class="amt">'+fmt(total)+'</div><div class="sub" style="font-size:11px;color:var(--gray);margin-top:2px">Cant. 🛍️ '+cantTotal+'</div>'+bdg("Con_OV")+'</div><div class="cact"><button class="ib" onclick="viewOrden('+o.id+')">'+SVGey+'</button><button class="ib" onclick="openForm(\'orden\','+o.id+')">'+SVGe+'</button><button class="ib ibd" onclick="delO('+o.id+')">'+SVGt+'</button></div></div><div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">'+'<span style="font-size:11px;color:var(--gray)">📍 '+esc(o.direccion)+'</span></div><div style="display:flex;gap:6px" data-noedit><button class="btn btn-sm" style="flex:1;justify-content:center;background:var(--dark);color:#fff" onclick="descargarReciboOrdenPDF('+o.id+')">⬇ PDF</button><button class="btn btn-sm" style="flex:1;justify-content:center;background:#2E7D32;color:#fff" onclick="descargarReciboOrdenExcel('+o.id+')">⬇ Excel</button></div></div>';
  }).join(""):'<div class="empty"><div style="font-size:32px;margin-bottom:12px">📦</div>Sin órdenes aún</div>')+pagControlHTML("ordenes",pg,"renderOrdenes");
}
function fmOrden(id,body){
  var o=id?ordenes.find(function(x){return x.id===id;}):null;
  var selC=o&&o.clienteId?cById(o.clienteId):null;
  var selVal=selC?selC.nombre+(selC.nick?" ("+selC.nick+")":""):"";
  ovSel=o&&o.detalleIds?o.detalleIds.slice():[];
  body.innerHTML=
    '<div class="field"><label>Clienta *</label><div class="sdr"><input type="text" id="co-search" placeholder="Buscar por nombre o @nick…" value="'+esc(selVal)+'" autocomplete="off" oninput="filterDrop(\'co-search\',\'co-drop\',\'selectCO\')" onfocus="filterDrop(\'co-search\',\'co-drop\',\'selectCO\')"/><input type="hidden" id="co-id" value="'+(o&&o.clienteId?o.clienteId:"")+'" /><div class="sdrd" id="co-drop"></div></div></div>'+
    '<div style="position:sticky;top:0;background:#fff;z-index:10;padding-bottom:10px;margin-bottom:4px">'+
    '<div class="frow"><div class="field" style="margin-bottom:0"><label>Fecha</label><input id="f-fecha" type="date" value="'+(o?o.fecha:today())+'"/></div><div class="field" style="margin-bottom:0"><label>Total Orden</label><div id="sto" style="padding:10px 14px;background:rgba(242,196,206,.25);border-radius:10px;font-family:\'Playfair Display\',serif;font-size:17px;font-weight:600;color:var(--pink)">S/ 0.00</div></div></div>'+
    '</div>'+
    '<div class="field"><label>Items de la clienta (marca para agregar o quitar)</label><div id="idisp"><p style="font-size:13px;color:var(--gray)">Selecciona una clienta primero</p></div></div>'+
    '<div class="field"><label>Dirección *</label><input id="f-dir" type="text" value="'+esc(o?o.direccion||"":"")+'" placeholder="Cra 10 #25-30, Ciudad"/></div>'+
    '<div class="field"><label>Notas</label><input id="f-not" type="text" value="'+esc(o?o.notas||"":"")+'" placeholder="Instrucciones especiales…"/></div>'+
    '<div class="fftr"><button class="btn btn-s" onclick="closeForm()">Cancelar</button><button class="btn btn-p" onclick="saveO('+(id||"null")+')">📦 Generar Orden</button></div>';
  if(o&&o.clienteId) updateDispOV();
}
function saveO(id){
  var cid=Number(document.getElementById("co-id").value);
  var dir=document.getElementById("f-dir").value.trim();
  if(!cid){alert("Selecciona una clienta");return;}
  if(!ovSel.length){alert("Selecciona al menos un item");return;}
  if(!dir){alert("La dirección es requerida");return;}
  var obj={clienteId:cid,fecha:document.getElementById("f-fecha").value,detalleIds:ovSel.slice(),direccion:dir,notas:document.getElementById("f-not").value,estado:"Con_OV"};
  var isNewOrden=!id;
  if(id){
    var anterior=ordenes.find(function(o){return o.id===id;});
    var idsAntes=anterior?anterior.detalleIds.slice():[];
    ordenes=ordenes.map(function(o){return o.id===id?Object.assign({},o,obj):o;});
    var agregados=ovSel.filter(function(did){return idsAntes.indexOf(did)<0;});
    var quitados=idsAntes.filter(function(did){return ovSel.indexOf(did)<0;});
    detalles=detalles.map(function(d){
      if(agregados.indexOf(d.id)>=0) return Object.assign({},d,{estado:"Con_OV"});
      if(quitados.indexOf(d.id)>=0) return Object.assign({},d,{estado:"Sin_OV"});
      return d;
    });
    agregados.concat(quitados).forEach(function(did){ guardarDetalleEnColeccion(detalles.find(function(d){return d.id===did;})); });
  }
  else{
    obj.id=uid();ordenes.push(obj);
    detalles=detalles.map(function(d){return ovSel.indexOf(d.id)>=0?Object.assign({},d,{estado:"Con_OV"}):d;});
    ovSel.forEach(function(did){ guardarDetalleEnColeccion(detalles.find(function(d){return d.id===did;})); });
  }
  closeForm();renderOrdenes();renderVentas();updateNav();
  guardarOrdenEnColeccion(ordenes.find(function(o){return o.id===(id||obj.id);}));
}
// ENVIOS
var MEDIOENV=["Agencia","Delivery Moto","Punto de Entrega"];
var ESTENV=["Preparando","Enviado","Anulado"];
var AGENC=["SHALOM","OLVA","MARVISUR","MARAVILLAS DEL NORTE","Biker Delivery","Otro"];
var ESTCLS={Preparando:"st-preparando",Enviado:"st-enviado",Anulado:"st-cancelado"};
var ESTCOLOR={Preparando:"#B8860B",Enviado:"#1565C0",Anulado:"#C62828"};
var PEDIDO_OPTS=["Preparando","OK"];
var PEDIDO_COLOR={Preparando:"#B8860B",OK:"#1565C0"};
function getOInfo(oid){var o=ordenes.find(function(x){return x.id===Number(oid);});if(!o) return null;var c=cById(o.clienteId);var items=o.detalleIds.map(function(id){return detalles.find(function(d){return d.id===id;});}).filter(Boolean);return{o:o,c:c,items:items,total:items.reduce(function(s,d){return s+d.precio*d.cantidad;},0),cant:items.reduce(function(s,d){return s+(Number(d.cantidad)||0);},0)};}
function renderEnvios(){
  var q=(document.getElementById("src-e")?document.getElementById("src-e").value:"").toLowerCase();
  var medioSel=document.getElementById("flt-e-medio")?document.getElementById("flt-e-medio").value:"";
  var agSel=document.getElementById("flt-e-agencia")?document.getElementById("flt-e-agencia").value:"";
  var pedSel=document.getElementById("flt-e-pedido")?document.getElementById("flt-e-pedido").value:"";
  var estSel=document.getElementById("flt-e-estado")?document.getElementById("flt-e-estado").value:"";
  var lista=envios.filter(function(e){
    if(medioSel&&e.medioEnvio!==medioSel) return false;
    if(agSel&&e.agencia!==agSel) return false;
    if(pedSel&&(e.pedido||"Preparando")!==pedSel) return false;
    if(estSel&&(e.estadoEnvio||"Preparando")!==estSel) return false;
    if(q){
      var info=getOInfo(e.ordenId);
      var nombre=(e.nombres||(info&&info.c?info.c.nombre:"")||"").toLowerCase();
      var nick=(info&&info.c?info.c.nick||"":"").toLowerCase();
      if(nombre.indexOf(q)<0&&nick.indexOf(q)<0) return false;
    }
    return true;
  }).sort(function(a,b){
    var diff=new Date(b.fechaEnvio||0)-new Date(a.fechaEnvio||0);
    return diff!==0?diff:(b.id-a.id);
  });
  var pg=pagSlice("envios",lista);
  document.getElementById("lst-e").innerHTML=(pg.items.length?pg.items.map(function(e){
    var info=getOInfo(e.ordenId);if(!info) return "";
    var ec=ESTCLS[e.estadoEnvio]||"";
    var pedColor=PEDIDO_COLOR[e.pedido]||"var(--gray)";
    var ubic=[e.distrito,e.provincia,e.dpto].filter(Boolean).join(", ");
    return '<div class="card" onclick="cardEdit(event,\'envio\','+e.id+')"><div class="crow" style="margin-bottom:8px"><div style="width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,var(--teal),var(--gold));display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">🚚</div><div class="ci"><div class="cn">'+esc(e.nombres||(info.c?info.c.nombre:""))+(info.c&&info.c.nick?' <span style="font-weight:700;color:'+(info.c.redSocial==="TikTok"?"#010101":"#C13584")+';font-size:12px">'+esc(info.c.nick)+'</span>':'')+'</div><div class="cm"><span>'+esc(e.medioEnvio||"")+(e.agencia?' · '+esc(e.agencia):'')+'</span><strong>#'+esc(e.tracking||"SN")+'</strong><span style="font-weight:700;background:var(--cream);color:var(--dark);padding:2px 8px;border-radius:8px">'+fechaCortaAno2(e.fechaEnvio)+'</span></div>'+(ubic?'<div class="cm" style="margin-top:2px"><span>📍 '+esc(ubic)+'</span>'+(e.nombreLocal?'<span>· '+esc(e.nombreLocal)+'</span>':'')+'</div>':'')+(e.celular?'<div class="cm" style="margin-top:2px"><span>📱 '+esc(e.celular)+'</span></div>':'')+'</div><div class="ca"><div style="font-size:12px;font-weight:600;margin-bottom:2px">OV-'+e.ordenId+'</div><div style="font-size:11px;color:var(--gray);margin-bottom:4px">Cant. 🛍️ '+info.cant+'</div><span class="bs" style="background:transparent;color:'+(ESTCOLOR[e.estadoEnvio]||"var(--gray)")+';font-weight:700;padding:0">● '+esc(e.estadoEnvio)+'</span><div style="font-size:11px;font-weight:700;color:'+pedColor+';margin-top:3px">Pedido: '+esc(e.pedido||"Preparando")+'</div></div><div class="cact" style="flex-wrap:wrap">'+(e.pedido!=="OK"?'<button class="btn btn-sm" style="background:#1565C0;color:#fff" onclick="marcarPedidoOK('+e.id+')" title="Marcar pedido como OK">✓ OK</button>':'')+(e.estadoEnvio==="Preparando"?'<button class="btn btn-sm" style="background:#2E7D32;color:#fff" onclick="marcarEnviado('+e.id+')" title="Marcar como Enviado y fijar fecha de entrega hoy">🚚 Enviado</button>':'')+'<button class="ib" onclick="openForm(\'envio\','+e.id+')">'+SVGe+'</button><button class="ib ibd" onclick="delE('+e.id+')">'+SVGt+'</button></div></div><div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px"><span style="font-size:11px;color:var(--gray)">📍 '+esc(info.o.direccion)+'</span></div><div style="display:flex;gap:6px">'+(e.qrImagen?'<button class="btn btn-g btn-sm" style="flex:1;justify-content:center" onclick="descargarQREnvio('+e.id+')">⬇ QR</button>':'')+(e.whatsappDelivery?'<button class="btn btn-sm" style="flex:1;justify-content:center;background:#25D366;color:#fff" onclick="enviarWhatsappDelivery('+e.id+')">📨 Enviar a Delivery</button>':'')+'</div></div>';
  }).join(""):'<div class="empty"><div style="font-size:32px;margin-bottom:12px">🚚</div>Sin envíos registrados</div>')+pagControlHTML("envios",pg,"renderEnvios");
}
function fmEnvio(id,body){
  var e=id?envios.find(function(x){return x.id===id;}):null;
  tmpEnvioQR=e&&e.qrImagen?e.qrImagen:"";
  var ords=(id?ordenes:ordenes.filter(function(o){var used=envios.filter(function(x){return x.id!==id;}).map(function(x){return x.ordenId;});return used.indexOf(o.id)<0;})).map(function(o){var c=cById(o.clienteId);return '<option value="'+o.id+'"'+((e&&e.ordenId===o.id)?' selected':'')+'>OV-'+o.id+' · '+esc(c?c.nombre:"")+' · '+o.fecha+'</option>';}).join("");
  var medioSel=e?e.medioEnvio||"Agencia":"Agencia";
  var pedidoSel=e?e.pedido||"Preparando":"Preparando";
  var estadoSel=e?e.estadoEnvio||"Preparando":"Preparando";
  var tipoDiSel=e?e.tipoDi||"DNI":"DNI";
  body.innerHTML=
    '<div class="field"><label>Orden vinculada *</label><select id="f-oid" onchange="onOrdenEnvioChange()"><option value="">— Seleccionar orden —</option>'+ords+'</select></div>'+
    '<div class="field" id="envio-cant-preview" style="display:none;background:rgba(107,181,181,.15);border-radius:10px;padding:9px 14px;margin-bottom:14px;font-size:13px"></div>'+
    '<div class="field"><label>Código QR (del envío)</label><div style="display:flex;align-items:center;gap:14px;background:var(--cream);border-radius:10px;padding:12px"><canvas id="envioqrcanvas" style="display:none"></canvas><div id="envioqrpreview" style="width:70px;height:70px;background:#fff;border-radius:8px;display:flex;align-items:center;justify-content:center;border:1px solid var(--light)">'+(tmpEnvioQR?'<img src="'+tmpEnvioQR+'" style="width:100%;height:100%;object-fit:contain;padding:4px"/>':'<span style="font-size:11px;color:var(--gray);text-align:center">Se genera al guardar</span>')+'</div><div style="font-size:12px;color:var(--gray)">El código se genera automáticamente con el # de tracking. Descárgalo desde la tarjeta del envío para tu etiquetadora.</div></div></div>'+
    '<div class="field"><label>Nombres</label><input id="f-nombres" type="text" value="'+esc(e?e.nombres||"":"")+'" placeholder="Nombre completo del cliente"/></div>'+
    '<div class="frow"><div class="field"><label>Tipo DI</label><select id="f-tipodi">'+["DNI","CE","PASAPORTE"].map(function(t){return '<option'+(tipoDiSel===t?' selected':'')+'>'+t+'</option>';}).join("")+'</select></div><div class="field"><label># Doc. Indent.</label><input id="f-numdoc" type="text" value="'+esc(e?e.numDoc||"":"")+'" placeholder="12345678"/></div></div>'+
    '<div class="field"><label>Celular</label><input id="f-celular" type="tel" value="'+esc(e?e.celular||"":"")+'" placeholder="987654321"/></div>'+
    '<div class="field"><label>Medio de envío</label><select id="f-medio">'+MEDIOENV.map(function(m){return '<option'+(medioSel===m?' selected':'')+'>'+m+'</option>';}).join("")+'</select></div>'+
    '<div class="frow"><div class="field"><label>Agencia</label><select id="f-agc">'+AGENC.map(function(a){return '<option'+(((e?e.agencia:"")===a)?' selected':'')+'>'+a+'</option>';}).join("")+'</select></div><div class="field"><label># Tracking</label><input id="f-trk" type="text" value="'+esc(e?(e.tracking||"SN"):generarTrackingAuto())+'" placeholder="SN"/></div></div>'+
    '<div class="field"><label>Pedido</label><div id="pedido-btns" style="display:flex;gap:8px">'+PEDIDO_OPTS.map(function(p){var active=pedidoSel===p;var c=PEDIDO_COLOR[p];return '<button type="button" class="btn btn-sm" data-pedido="'+p+'" onclick="selectPedidoBtn(\''+p+'\')" style="flex:1;justify-content:center;border:2px solid '+c+';background:'+(active?c:"transparent")+';color:'+(active?"#fff":c)+';font-weight:700">'+p+'</button>';}).join("")+'</div><input type="hidden" id="f-pedido" value="'+pedidoSel+'"/></div>'+
    '<div class="field"><label>Estado del envío</label><select id="f-est">'+ESTENV.map(function(s){return '<option'+(estadoSel===s?' selected':'')+'>'+s+'</option>';}).join("")+'</select></div>'+
    '<div class="frow"><div class="field"><label>Fecha envío</label><input id="f-fenv" type="date" value="'+(e?e.fechaEnvio:today())+'"/></div><div class="field"><label>Fecha entrega</label><input id="f-fent" type="date" value="'+esc(e?e.fechaEntrega||"":"")+'" /></div></div>'+
    '<div class="frow"><div class="field"><label>Dpto.</label><input id="f-dpto" type="text" value="'+esc(e?e.dpto||"":"")+'" placeholder="Lima"/></div><div class="field"><label>Provincia</label><input id="f-prov2" type="text" value="'+esc(e?e.provincia||"":"")+'" placeholder="Lima"/></div></div>'+
    '<div class="frow"><div class="field"><label>Distrito</label><input id="f-dist" type="text" value="'+esc(e?e.distrito||"":"")+'" placeholder="Miraflores"/></div><div class="field"><label>Nombre Local Agencia</label><input id="f-local" type="text" value="'+esc(e?e.nombreLocal||"":"")+'" placeholder="Agencia Av. Larco"/></div></div>'+
    '<div class="field"><label>Dirección</label><input id="f-dir2" type="text" value="'+esc(e?(e.direccion||"SN"):"SN")+'" placeholder="SN"/></div>'+
    '<div class="field"><label>Referencia</label><input id="f-ref" type="text" value="'+esc(e?(e.referencia||"SN"):"SN")+'" placeholder="SN"/></div>'+
    '<div class="field"><label>📍 Ubicación (link Google Maps)</label><input id="f-ubic" type="url" value="'+esc(e?e.ubicacion||"":"")+'" placeholder="https://maps.google.com/…"/></div>'+
    '<div class="field"><label>📱 WAS | Delivery (WhatsApp del delivery)</label><div style="display:flex;gap:8px"><input id="f-wadelivery" type="tel" value="'+esc(e?e.whatsappDelivery||"":"")+'" placeholder="51987654321" style="flex:1"/><button class="btn btn-sm" style="background:#25D366;color:#fff" onclick="enviarWhatsappDeliveryPreview('+(id||"null")+')">📨</button></div></div>'+
    '<div class="field"><label>Notas</label><textarea id="f-not" rows="3" placeholder="Recoger en punto…">'+esc(e?e.notas||"":"")+'</textarea></div>'+
    '<div class="fftr"><button class="btn btn-s" onclick="closeForm()">Cancelar</button><button class="btn btn-p" onclick="saveE('+(id||"null")+')">🚚 Guardar Envío</button></div>';
  if(e&&e.ordenId) updateEnvioCantPreview();
}
var ovSel=[];

function updateDispOV(){
  var cid=Number(document.getElementById("co-id")?document.getElementById("co-id").value:0);
  var el=document.getElementById("idisp");
  if(!el) return;
  if(!cid){el.innerHTML='<p style="font-size:13px;color:var(--gray)">Selecciona una clienta primero</p>';return;}
  var disp=detalles.filter(function(d){return d.clienteId===cid&&(d.estado==="Sin_OV"||ovSel.indexOf(d.id)>=0);})
    .sort(function(a,b){
      var diff=new Date(b.fecha||0)-new Date(a.fecha||0);
      return diff!==0?diff:(b.id-a.id);
    });
  if(!disp.length){el.innerHTML='<p style="font-size:13px;color:var(--gray)">No hay items disponibles para esta clienta</p>';return;}
  var todosSel=disp.every(function(d){return ovSel.indexOf(d.id)>=0;});
  var html='<div class="chk'+(todosSel?" sel":"")+'" onclick="toggleSelectAllOV()" style="background:rgba(242,196,206,.2);border:1.5px dashed var(--pink)"><div class="chkb">'+(todosSel?SVGck:"")+'</div><div style="flex:1;font-size:13px;font-weight:600">Seleccionar todos ('+disp.length+' items)</div></div>';
  html+=disp.map(function(d){
    var sel=ovSel.indexOf(d.id)>=0;
    return '<div class="chk'+(sel?" sel":"")+'" onclick="toggleOV('+d.id+',this)" data-id="'+d.id+'"><div class="chkb">'+(sel?SVGck:"")+'</div><div style="flex:1"><div style="font-size:13px;font-weight:500">'+fechaCorta(d.fecha)+' | '+esc(d.producto)+'</div><div style="font-size:11px;color:var(--gray);margin-top:2px">'+esc(d.color||"—")+' · ×'+d.cantidad+' · P.Unit: '+fmt(d.precio)+'</div><div style="font-size:13px;font-weight:500;margin-top:2px;color:var(--pink)">Sub Total: '+fmt(d.precio*d.cantidad)+'</div></div></div>';
  }).join("");
  el.innerHTML=html;
  updSubO();
}
function toggleSelectAllOV(){
  var cid=Number(document.getElementById("co-id")?document.getElementById("co-id").value:0);
  var disp=detalles.filter(function(d){return d.clienteId===cid&&(d.estado==="Sin_OV"||ovSel.indexOf(d.id)>=0);});
  var todosSel=disp.every(function(d){return ovSel.indexOf(d.id)>=0;});
  if(todosSel){
    // Ya estaban todos marcados: los desmarca todos
    ovSel=ovSel.filter(function(id){return disp.findIndex(function(d){return d.id===id;})<0;});
  } else {
    // Agrega los que falten, sin duplicar
    disp.forEach(function(d){ if(ovSel.indexOf(d.id)<0) ovSel.push(d.id); });
  }
  updateDispOV();
}
function toggleOV(id,el){
  var idx=ovSel.indexOf(id);
  if(idx>=0){ovSel.splice(idx,1);el.classList.remove("sel");el.querySelector(".chkb").innerHTML="";}
  else{ovSel.push(id);el.classList.add("sel");el.querySelector(".chkb").innerHTML=SVGck;}
  updSubO();
}
function updSubO(){
  var sub=ovSel.reduce(function(s,id){var d=detalles.find(function(x){return x.id===id;});return d?s+d.precio*d.cantidad:s;},0);
  var el=document.getElementById("sto");
  if(el){el.textContent=fmt(sub);}
}

function guardarOrdenEnColeccion(obj){
  if(!db||!obj) return;
  db.collection("ordenes").doc(String(obj.id)).set(obj,{merge:true}).catch(function(err){
    console.error("Error guardando orden en Firestore:",err);
    setSyncStatus("error","Error al guardar orden");
  });
}
function delO(id){
  confirm2("¿Eliminar? Los items volverán a Sin_OV.").then(function(ok){
    if(!ok) return;
    var o=ordenes.find(function(x){return x.id===id;});
    if(o){
      detalles=detalles.map(function(d){return o.detalleIds.indexOf(d.id)>=0?Object.assign({},d,{estado:"Sin_OV"}):d;});
      o.detalleIds.forEach(function(did){ guardarDetalleEnColeccion(detalles.find(function(d){return d.id===did;})); });
    }
    ordenes=ordenes.filter(function(x){return x.id!==id;});
    renderOrdenes();renderVentas();updateNav();
    if(db){db.collection("ordenes").doc(String(id)).delete().catch(function(err){console.error("Error eliminando orden:",err);setSyncStatus("error","Error al eliminar orden");});}
  });
}
function viewOrden(id){
  var o=ordenes.find(function(x){return x.id===id;});if(!o) return;
  var c=cById(o.clienteId);
  var items=o.detalleIds.map(function(id){return detalles.find(function(d){return d.id===id;});}).filter(Boolean);
  var total=items.reduce(function(s,d){return s+d.precio*d.cantidad;},0);
  var cantTotal=items.reduce(function(s,d){return s+(Number(d.cantidad)||0);},0);
  var envioRel=envios.find(function(e){return e.ordenId===o.id;});
  document.getElementById("fotitle").textContent="Detalle de Orden";
  document.getElementById("fobody").innerHTML='<div style="background:rgba(242,196,206,.2);border-radius:12px;padding:13px 17px;margin-bottom:14px"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-family:\'Playfair Display\',serif;font-size:16px;font-weight:600">'+esc(c?c.nombre:"")+'</div><span style="font-weight:700;background:#fff;color:var(--dark);padding:3px 10px;border-radius:8px;font-size:12px">OV-'+o.id+'</span></div><div style="font-size:13px;color:var(--gray);margin-top:3px">'+esc(c?c.nick:"")+" · "+o.fecha+(c&&c.telefono?" · 📱 "+esc(c.telefono):"")+'</div></div><div style="font-size:13px;color:var(--gray);margin-bottom:14px">📍 '+esc(o.direccion)+(o.notas?" · 📝 "+esc(o.notas):"")+(envioRel?' · 🚚 Envío #'+esc(envioRel.tracking||"SN"):' · 🚚 Sin envío registrado')+'</div>'+items.map(function(d){return '<div class="hr"><div><div style="font-size:13px;font-weight:500">'+esc(d.producto)+'</div><div style="font-size:11px;color:var(--gray)">Talla '+esc(d.talla)+' · '+esc(d.color)+' ×'+d.cantidad+'</div></div><div style="font-weight:600">'+fmt(d.precio*d.cantidad)+'</div></div>';}).join("")+'<div style="display:flex;justify-content:space-between;padding:10px 0 0;font-size:13px;color:var(--gray)"><span>Cant. 🛍️ total</span><span style="font-weight:600">'+cantTotal+'</span></div><div style="display:flex;justify-content:space-between;padding:8px 0 14px;font-family:\'Playfair Display\',serif;font-size:16px;font-weight:600"><span>Total</span><span style="color:var(--pink)">'+fmt(total)+'</span></div><div style="display:flex;gap:8px"><button class="btn btn-p btn-sm" style="flex:1;justify-content:center;background:var(--dark)" onclick="descargarReciboOrdenPDF('+o.id+')">⬇ PDF</button><button class="btn btn-p btn-sm" style="flex:1;justify-content:center;background:#2E7D32" onclick="descargarReciboOrdenExcel('+o.id+')">⬇ Excel</button></div>';
  document.getElementById("fo").classList.add("open");
}



// Acción rápida: marca el Pedido como "OK" (antes "Preparando") sin abrir el formulario completo
function marcarPedidoOK(id){
  envios=envios.map(function(e){return e.id===id?Object.assign({},e,{pedido:"OK"}):e;});
  renderEnvios();updateNav();
  guardarEnvioEnColeccion(envios.find(function(e){return e.id===id;}));
}
// Acción rápida: marca el envío como "Enviado" (antes "Preparando") y fija Fecha Entrega en hoy
function marcarEnviado(id){
  envios=envios.map(function(e){return e.id===id?Object.assign({},e,{estadoEnvio:"Enviado",fechaEntrega:today()}):e;});
  renderEnvios();updateNav();
  guardarEnvioEnColeccion(envios.find(function(e){return e.id===id;}));
}
var tmpEnvioQR="";
// Genera un tracking automático tipo "Env20260713-1" (fecha + secuencia del día)
function generarTrackingAuto(){
  var hoy=new Date();
  var ymd=hoy.getFullYear()+String(hoy.getMonth()+1).padStart(2,"0")+String(hoy.getDate()).padStart(2,"0");
  var prefix="Env"+ymd+"-";
  var count=envios.filter(function(x){return (x.tracking||"").indexOf(prefix)===0;}).length;
  return prefix+(count+1);
}

function selectPedidoBtn(val){
  document.getElementById("f-pedido").value=val;
  var btns=document.querySelectorAll('[data-pedido]');
  for(var i=0;i<btns.length;i++){
    var b=btns[i];
    var p=b.getAttribute("data-pedido");
    var c=PEDIDO_COLOR[p];
    var active=p===val;
    b.style.background=active?c:"transparent";
    b.style.color=active?"#fff":c;
  }
}
function updateEnvioCantPreview(){
  var oid=document.getElementById("f-oid")?document.getElementById("f-oid").value:"";
  var box=document.getElementById("envio-cant-preview");
  if(!box) return;
  if(!oid){box.style.display="none";return;}
  var info=getOInfo(oid);
  if(!info){box.style.display="none";return;}
  box.style.display="block";
  box.innerHTML="Cant. 🛍️ total: <strong>"+info.cant+"</strong> · "+fmt(info.total);
}
// Autocompleta Nombres, Tipo DI, # Doc. Ident., Celular, Distrito, Dirección,
// Referencia y Ubicación (Maps) con los datos de la clienta de la orden elegida.
// Los campos quedan editables: es solo un punto de partida, no un bloqueo.
var TIPODI_MAP={"DNI":"DNI","CE":"CE","Pasaporte":"PASAPORTE"};
function onOrdenEnvioChange(){
  updateEnvioCantPreview();
  var oid=document.getElementById("f-oid")?document.getElementById("f-oid").value:"";
  if(!oid) return;
  var info=getOInfo(oid);
  var c=info?info.c:null;
  if(!c) return;
  var set=function(id,val){ var el=document.getElementById(id); if(el&&val) el.value=val; };
  set("f-nombres",c.nombre);
  if(c.docIdent&&TIPODI_MAP[c.docIdent]) set("f-tipodi",TIPODI_MAP[c.docIdent]);
  set("f-numdoc",c.numDI);
  set("f-celular",c.telefono);
  set("f-dpto",c.dpto);
  set("f-prov2",c.provincia);
  set("f-dist",c.ciudad);
  set("f-local",c.nombreLocalAgencia);
  set("f-dir2",c.direccion);
  set("f-ref",c.referencia);
  set("f-ubic",c.ubicacionMaps);
}

// ── Construye el mensaje de WhatsApp con el formato solicitado ──────────────
function buildWhatsappMsgFromForm(){
  var nombres=document.getElementById("f-nombres")?document.getElementById("f-nombres").value:"";
  var tipoDi=document.getElementById("f-tipodi")?document.getElementById("f-tipodi").value:"";
  var numDoc=document.getElementById("f-numdoc")?document.getElementById("f-numdoc").value:"";
  var celular=document.getElementById("f-celular")?document.getElementById("f-celular").value:"";
  var distrito=document.getElementById("f-dist")?document.getElementById("f-dist").value:"";
  var direccion=document.getElementById("f-dir2")?(document.getElementById("f-dir2").value||"SN"):"SN";
  var referencia=document.getElementById("f-ref")?(document.getElementById("f-ref").value||"SN"):"SN";
  var ubicacion=document.getElementById("f-ubic")?document.getElementById("f-ubic").value:"";
  var oid=document.getElementById("f-oid")?document.getElementById("f-oid").value:"";
  var info=oid?getOInfo(oid):null;
  var porCobrar=info?fmt(info.total):"S/ 0.00";
  return buildWhatsappMsg(nombres,tipoDi,numDoc,celular,distrito,direccion,referencia,ubicacion,porCobrar);
}
function buildWhatsappMsg(nombres,tipoDi,numDoc,celular,distrito,direccion,referencia,ubicacion,porCobrar){
  var lines=[];
  lines.push("Cliente: *"+(nombres||"—")+"*");
  lines.push((tipoDi||"DNI")+": "+(numDoc||"—"));
  lines.push("📱Cel: *"+(celular||"—")+"*");
  lines.push("💲*Por Cobrar: "+(porCobrar||"S/ 0.00")+"*");
  lines.push("📌Distrito: *"+(distrito||"—")+"*");
  lines.push("📌 Direccion: "+(direccion||"SN"));
  lines.push("📌 Ref: "+(referencia||"SN"));
  if(ubicacion) lines.push("📍Ubicación: "+ubicacion);
  lines.push("======================");
  return lines.join("\n");
}
function enviarWhatsappDeliveryPreview(id){
  var wa=document.getElementById("f-wadelivery")?document.getElementById("f-wadelivery").value.trim():"";
  if(!wa){ alert("Ingresa el número de WhatsApp del delivery antes de enviar."); return; }
  var msg=buildWhatsappMsgFromForm();
  var phone=wa.replace(/[^\d]/g,"");
  var url="https://wa.me/"+phone+"?text="+encodeURIComponent(msg);
  window.open(url,"_blank");
}
function enviarWhatsappDelivery(id){
  var e=envios.find(function(x){return x.id===id;});if(!e){return;}
  var info=getOInfo(e.ordenId);
  var porCobrar=info?fmt(info.total):"S/ 0.00";
  var msg=buildWhatsappMsg(e.nombres,e.tipoDi,e.numDoc,e.celular,e.distrito,e.direccion,e.referencia,e.ubicacion,porCobrar);
  var phone=(e.whatsappDelivery||"").replace(/[^\d]/g,"");
  if(!phone){ flashScanMsg("Este envío no tiene WhatsApp de delivery configurado."); return; }
  var url="https://wa.me/"+phone+"?text="+encodeURIComponent(msg);
  window.open(url,"_blank");
}

// ── Descargar QR del envío (etiqueta para impresora) ────────────────────────
function descargarQREnvio(id){
  var e=envios.find(function(x){return x.id===id;});if(!e||!e.qrImagen){ flashScanMsg("Este envío no tiene código QR generado."); return; }
  var info=getOInfo(e.ordenId);
  var labelW=300,labelH=380;
  var cv=document.createElement("canvas");
  cv.width=labelW;cv.height=labelH;
  var ctx=cv.getContext("2d");
  ctx.fillStyle="#ffffff";ctx.fillRect(0,0,labelW,labelH);
  ctx.fillStyle="#000000";
  ctx.textAlign="center";
  var qrImgEl=new Image();
  qrImgEl.onload=function(){
    var qrSize=220;
    ctx.drawImage(qrImgEl,(labelW-qrSize)/2,16,qrSize,qrSize);
    ctx.font="bold 16px Arial";
    ctx.fillText("#"+(e.tracking||"SN"),labelW/2,16+qrSize+24);
    ctx.font="13px Arial";
    var nombreCorto=(e.nombres||(info&&info.c?info.c.nombre:"")||"").slice(0,34);
    ctx.fillText(nombreCorto,labelW/2,16+qrSize+46);
    ctx.font="12px Arial";
    ctx.fillText(esc(e.distrito||""),labelW/2,16+qrSize+66);
    var imgData=cv.toDataURL("image/jpeg",0.92);
    var pdfBlob=buildSimplePDF(imgData,labelW,labelH);
    var url=URL.createObjectURL(pdfBlob);
    var a=document.createElement("a");
    a.href=url;
    a.download="Envio-"+(e.tracking||e.id)+".pdf";
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); },1000);
  };
  qrImgEl.src=e.qrImagen;
}

function saveE(id){
  var oid=Number(document.getElementById("f-oid").value);
  if(!oid){alert("Selecciona una orden");return;}
  var trackingVal=document.getElementById("f-trk").value.trim()||"SN";
  var obj={
    ordenId:oid,
    nombres:document.getElementById("f-nombres").value,
    tipoDi:document.getElementById("f-tipodi").value,
    numDoc:document.getElementById("f-numdoc").value,
    celular:document.getElementById("f-celular").value,
    medioEnvio:document.getElementById("f-medio").value,
    agencia:document.getElementById("f-agc").value,
    tracking:trackingVal,
    pedido:document.getElementById("f-pedido").value||"Preparando",
    estadoEnvio:document.getElementById("f-est").value,
    fechaEnvio:document.getElementById("f-fenv").value,
    fechaEntrega:document.getElementById("f-fent").value,
    dpto:document.getElementById("f-dpto").value,
    provincia:document.getElementById("f-prov2").value,
    distrito:document.getElementById("f-dist").value,
    nombreLocal:document.getElementById("f-local").value,
    direccion:document.getElementById("f-dir2").value||"SN",
    referencia:document.getElementById("f-ref").value||"SN",
    ubicacion:document.getElementById("f-ubic").value,
    whatsappDelivery:document.getElementById("f-wadelivery").value,
    notas:document.getElementById("f-not").value,
    qrImagen:tmpEnvioQR
  };
  // Generar QR automáticamente a partir del tracking si no existe aún o cambió el tracking
  try{
    if(!obj.qrImagen || (id && envios.find(function(x){return x.id===id;}) && envios.find(function(x){return x.id===id;}).tracking!==trackingVal)){
      var dataUrl=genQRDataURL(trackingVal,160);
      if(dataUrl) obj.qrImagen=dataUrl;
    }
  }catch(err){}
  if(id){envios=envios.map(function(e){return e.id===id?Object.assign({},e,obj):e;});}
  else{obj.id=uid();envios.push(obj);}
  closeForm();renderEnvios();updateNav();
  guardarEnvioEnColeccion(envios.find(function(e){return e.id===(id||obj.id);}));
}
function guardarEnvioEnColeccion(obj){
  if(!db||!obj) return;
  db.collection("envios").doc(String(obj.id)).set(obj,{merge:true}).catch(function(err){
    console.error("Error guardando envío en Firestore:",err);
    setSyncStatus("error","Error al guardar envío");
  });
}
function delE(id){confirm2("¿Eliminar este envío?").then(function(ok){if(!ok) return;envios=envios.filter(function(e){return e.id!==id;});renderEnvios();updateNav();if(db){db.collection("envios").doc(String(id)).delete().catch(function(err){console.error("Error eliminando envío:",err);setSyncStatus("error","Error al eliminar envío");});}});}

// ── Descargar etiqueta QR en PDF (para impresora de etiquetas) ──────────────
// Ajusta un texto a un ancho máximo, en hasta maxLines líneas. Si el texto no
// alcanza a completo, recorta la última línea y la termina en "."
function wrapTextLines(ctx,text,maxWidth,maxLines){
  var words=(text||"").split(/\s+/).filter(Boolean);
  var lines=[];
  var current="";
  var idx=0;
  while(idx<words.length&&lines.length<maxLines){
    var word=words[idx];
    var test=current?current+" "+word:word;
    if(ctx.measureText(test).width<=maxWidth){
      current=test;idx++;
    } else if(!current){
      current=word;idx++;
    } else {
      lines.push(current);current="";
    }
  }
  if(current&&lines.length<maxLines) lines.push(current);
  var truncado=idx<words.length;
  if(truncado){
    var last=lines[lines.length-1]||"";
    while(ctx.measureText(last+".").width>maxWidth&&last.length>1){
      last=last.slice(0,-1);
    }
    lines[lines.length-1]=last.replace(/\s+$/,"")+".";
  }
  return lines;
}

// Recibo de venta de una Orden — descarga en PDF, estilo recibo para la clienta.
function descargarReciboOrdenPDF(id){
  var o=ordenes.find(function(x){return x.id===id;});if(!o) return;
  var c=cById(o.clienteId);
  var items=o.detalleIds.map(function(did){return detalles.find(function(d){return d.id===did;});}).filter(Boolean);
  var cantTotal=items.reduce(function(s,d){return s+(Number(d.cantidad)||0);},0);
  var importeTotal=items.reduce(function(s,d){return s+d.precio*d.cantidad;},0);
  var envioRel=envios.find(function(e){return e.ordenId===o.id;});

  var w=380,rowH=22,topH=175,footH=90;
  var h=topH+items.length*rowH+footH;
  var cv=document.createElement("canvas");
  cv.width=w;cv.height=h;
  var ctx=cv.getContext("2d");
  ctx.fillStyle="#ffffff";ctx.fillRect(0,0,w,h);
  ctx.fillStyle="#1a1a1a";
  ctx.textAlign="center";
  ctx.font="bold 20px Arial";
  ctx.fillText("JESSDAY STYLE",w/2,32);
  ctx.font="11px Arial";
  ctx.fillStyle="#777";
  ctx.fillText("Recibo de venta — OV-"+o.id,w/2,50);

  ctx.strokeStyle="#ddd";ctx.beginPath();ctx.moveTo(20,62);ctx.lineTo(w-20,62);ctx.stroke();

  ctx.textAlign="left";
  ctx.fillStyle="#333";ctx.font="12px Arial";
  var y=82;
  ctx.fillText("Fecha: "+fechaCorta(o.fecha),20,y); y+=20;
  ctx.fillText("Clienta: "+(c?c.nombre:""),20,y); y+=20;
  ctx.fillText("Celular: "+(c&&c.telefono?c.telefono:"—"),20,y); y+=20;
  ctx.fillText("Dirección: "+(o.direccion||"—"),20,y); y+=24;

  // Encabezado de tabla
  ctx.font="bold 11px Arial";
  ctx.fillText("Producto",20,y);
  ctx.textAlign="right";
  ctx.fillText("Cant.",w-190,y);
  ctx.fillText("Precio",w-110,y);
  ctx.fillText("SubTotal",w-20,y);
  y+=8;
  ctx.strokeStyle="#333";ctx.beginPath();ctx.moveTo(20,y);ctx.lineTo(w-20,y);ctx.stroke();
  y+=16;

  ctx.font="11px Arial";
  items.forEach(function(d){
    var nombreCorto=d.producto.length>24?d.producto.slice(0,24)+"…":d.producto;
    ctx.textAlign="left";ctx.fillStyle="#222";
    ctx.fillText(nombreCorto,20,y);
    ctx.textAlign="right";
    ctx.fillText(String(d.cantidad),w-190,y);
    ctx.fillText(d.precio.toFixed(2),w-110,y);
    ctx.fillText((d.precio*d.cantidad).toFixed(2),w-20,y);
    y+=rowH;
  });

  ctx.strokeStyle="#ddd";ctx.beginPath();ctx.moveTo(20,y);ctx.lineTo(w-20,y);ctx.stroke();
  y+=22;

  ctx.textAlign="left";ctx.font="bold 12px Arial";ctx.fillStyle="#333";
  ctx.fillText("Cantidad Total",20,y);
  ctx.textAlign="right";
  ctx.fillText(String(cantTotal),w-20,y);
  y+=22;
  ctx.font="bold 15px Arial";ctx.fillStyle="#B5384D";
  ctx.textAlign="left";ctx.fillText("Importe Total",20,y);
  ctx.textAlign="right";ctx.fillText(fmt(importeTotal),w-20,y);
  y+=26;

  ctx.font="11px Arial";ctx.fillStyle="#666";ctx.textAlign="left";
  ctx.fillText(envioRel?("Envío relacionado: #"+(envioRel.tracking||"SN")):"Envío relacionado: —",20,y);

  var imgData=cv.toDataURL("image/jpeg",0.95);
  var pdfBlob=buildSimplePDF(imgData,w,h);
  var url=URL.createObjectURL(pdfBlob);
  var a=document.createElement("a");
  a.href=url;
  a.download="Recibo_OV-"+o.id+".pdf";
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); },1000);
}

// Recibo de venta de una Orden — descarga en Excel
function descargarReciboOrdenExcel(id){
  if(typeof XLSX==="undefined"){
    alert("No se pudo cargar el generador de Excel. Revisa tu conexión e inténtalo de nuevo.");
    return;
  }
  var o=ordenes.find(function(x){return x.id===id;});if(!o) return;
  var c=cById(o.clienteId);
  var items=o.detalleIds.map(function(did){return detalles.find(function(d){return d.id===did;});}).filter(Boolean);
  var cantTotal=items.reduce(function(s,d){return s+(Number(d.cantidad)||0);},0);
  var importeTotal=items.reduce(function(s,d){return s+d.precio*d.cantidad;},0);
  var envioRel=envios.find(function(e){return e.ordenId===o.id;});

  var datos=[
    ["JESSDAY STYLE"],
    ["Recibo de venta — OV-"+o.id],
    [],
    ["Fecha",fechaCorta(o.fecha)],
    ["Clienta",c?c.nombre:""],
    ["Celular",c&&c.telefono?c.telefono:"—"],
    ["Dirección",o.direccion||"—"],
    [],
    ["Producto","Cantidad","Precio","SubTotal"],
  ];
  items.forEach(function(d){
    datos.push([d.producto,d.cantidad,Number(d.precio.toFixed(2)),Number((d.precio*d.cantidad).toFixed(2))]);
  });
  datos.push([]);
  datos.push(["Cantidad Total",cantTotal]);
  datos.push(["Importe Total",Number(importeTotal.toFixed(2))]);
  datos.push([]);
  datos.push(["Envío relacionado",envioRel?("#"+(envioRel.tracking||"SN")):"—"]);

  var ws=XLSX.utils.aoa_to_sheet(datos);
  ws["!cols"]=[{wch:30},{wch:14},{wch:12},{wch:12}];
  var wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Recibo OV-"+o.id);
  XLSX.writeFile(wb,"Recibo_OV-"+o.id+".xlsx");
}

// Construye un PDF de una sola página con una imagen JPEG embebida (sin librerías externas)
function buildSimplePDF(jpegDataUrl,wPx,hPx){
  var base64=jpegDataUrl.split(",")[1];
  var binary=atob(base64);
  var len=binary.length;
  var bytes=new Uint8Array(len);
  for(var i=0;i<len;i++) bytes[i]=binary.charCodeAt(i);

  // Convertimos px a puntos PDF (72dpi base, asumimos 96dpi de origen)
  var wPt=Math.round(wPx*72/96),hPt=Math.round(hPx*72/96);

  var objs=[];
  objs.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objs.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  objs.push("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+wPt+" "+hPt+"] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n");
  var imgObjHeader="4 0 obj\n<< /Type /XObject /Subtype /Image /Width "+wPx+" /Height "+hPx+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+bytes.length+" >>\nstream\n";
  var imgObjFooter="\nendstream\nendobj\n";
  var contentStream="q "+wPt+" 0 0 "+hPt+" 0 0 cm /Im0 Do Q";
  objs.push("5 0 obj\n<< /Length "+contentStream.length+" >>\nstream\n"+contentStream+"\nendstream\nendobj\n");

  var enc=new TextEncoder();
  var parts=[];
  var offsets=[];
  var pos=0;

  function pushText(t){ var b=enc.encode(t); parts.push(b); pos+=b.length; }
  function pushBytes(b){ parts.push(b); pos+=b.length; }

  pushText("%PDF-1.4\n");

  offsets[1]=pos; pushText(objs[0]);
  offsets[2]=pos; pushText(objs[1]);
  offsets[3]=pos; pushText(objs[2]);
  offsets[4]=pos; pushText(imgObjHeader); pushBytes(bytes); pushText(imgObjFooter);
  offsets[5]=pos; pushText(objs[3]);

  var xrefStart=pos;
  var xref="xref\n0 6\n0000000000 65535 f \n";
  for(var k=1;k<=5;k++){
    var off=String(offsets[k]).padStart(10,"0");
    xref+=off+" 00000 n \n";
  }
  pushText(xref);
  pushText("trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n"+xrefStart+"\n%%EOF");

  var totalLen=0;
  for(var i=0;i<parts.length;i++) totalLen+=parts[i].length;
  var finalBytes=new Uint8Array(totalLen);
  var off2=0;
  for(var i=0;i<parts.length;i++){ finalBytes.set(parts[i],off2); off2+=parts[i].length; }

  return new Blob([finalBytes],{type:"application/pdf"});
}

function updateEstadoPreview(){
  var stk=Number(document.getElementById("f-stk")?document.getElementById("f-stk").value:0)||0;
  var el=document.getElementById("estpreview");
  if(!el) return;
  el.style.color=estProdColor(stk);
  el.innerHTML="● "+estProd(stk)+'  <span style="font-weight:400;color:var(--gray);font-size:12px">(Stock: '+stk+' uds)</span>';
}
function updateQRImg(){
  var code=document.getElementById("f-qr")?document.getElementById("f-qr").value.trim():"";
  var prev=document.getElementById("qrpreview");
  if(!prev) return;
  if(!code){tmpQRImg="";prev.innerHTML='<span style="font-size:11px;color:var(--gray);text-align:center">Sin código</span>';return;}
  var cv=document.getElementById("qrcanvas");
  var dataUrl=genQR(code,cv,160);
  if(dataUrl){tmpQRImg=dataUrl;prev.innerHTML='<img src="'+dataUrl+'" style="width:100%;height:100%;object-fit:contain;padding:4px"/>';}
}

function simQRp(){
  document.getElementById("f-qr").value="PROD-"+String(Math.floor(Math.random()*9000)+1000);
  updateQRImg();
}


function guardarProductoEnColeccion(obj,isNew){
  if(!db) return;
  db.collection("productos").doc(String(obj.id)).set(obj,{merge:true}).catch(function(err){
    console.error("Error guardando producto en Firestore:",err);
    setSyncStatus("error","Error al guardar producto");
  });
}
function delP(id){confirm2("¿Eliminar este producto?").then(function(ok){if(!ok) return;productos=productos.filter(function(p){return p.id!==id;});renderProductos(document.getElementById("src-p")?document.getElementById("src-p").value:"");updateNav();if(db){db.collection("productos").doc(String(id)).delete().catch(function(err){console.error("Error eliminando producto:",err);setSyncStatus("error","Error al eliminar producto");});}});}

// Exponemos las funciones al entorno global (Órdenes y Envíos)
window.renderOrdenes = renderOrdenes;
window.fmOrden = fmOrden;
window.updateDispOV = updateDispOV;
window.toggleSelectAllOV = toggleSelectAllOV;
window.toggleOV = toggleOV;
window.updSubO = updSubO;
window.saveO = saveO;
window.guardarOrdenEnColeccion = guardarOrdenEnColeccion;
window.delO = delO;
window.viewOrden = viewOrden;

window.renderEnvios = renderEnvios;
window.marcarPedidoOK = marcarPedidoOK;
window.marcarEnviado = marcarEnviado;
window.fmEnvio = fmEnvio;
window.selectPedidoBtn = selectPedidoBtn;
window.updateEnvioCantPreview = updateEnvioCantPreview;
window.onOrdenEnvioChange = onOrdenEnvioChange;
window.buildWhatsappMsgFromForm = buildWhatsappMsgFromForm;
window.buildWhatsappMsg = buildWhatsappMsg;
window.enviarWhatsappDeliveryPreview = enviarWhatsappDeliveryPreview;
window.enviarWhatsappDelivery = enviarWhatsappDelivery;
window.descargarQREnvio = descargarQREnvio;
window.saveE = saveE;
window.guardarEnvioEnColeccion = guardarEnvioEnColeccion;
window.delE = delE;
window.wrapTextLines = wrapTextLines;
window.descargarReciboOrdenPDF = descargarReciboOrdenPDF;
window.descargarReciboOrdenExcel = descargarReciboOrdenExcel;
window.buildSimplePDF = buildSimplePDF;