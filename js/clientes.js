// CLIENTES
function catClienteColor(cat){
  return {Regular:{bg:"#F0EDE9",fg:"#6B6B6B"},Frecuente:{bg:"rgba(107,181,181,.18)",fg:"#3D8A8A"},Black:{bg:"rgba(44,44,44,.1)",fg:"#2C2C2C"},Mayorista:{bg:"rgba(155,127,212,.18)",fg:"#7355B0"}}[cat]||{bg:"#F0EDE9",fg:"#6B6B6B"};
}
function renderClientes(q){
  q=q||"";
  var f=clientes.filter(function(c){return c.nombre.toLowerCase().indexOf(q.toLowerCase())>=0||(c.nick||"").toLowerCase().indexOf(q.toLowerCase())>=0||(c.ciudad||"").toLowerCase().indexOf(q.toLowerCase())>=0;});
  f=f.slice().sort(function(a,b){return new Date(b.creado||0)-new Date(a.creado||0);});
  var pg=pagSlice("clientes",f);
  document.getElementById("lst-cl").innerHTML=(pg.items.length?pg.items.map(function(c){
    var items=detalles.filter(function(d){return d.clienteId===c.id;});
    var total=items.reduce(function(s,d){return s+d.precio*d.cantidad;},0);
    var sc=c.redSocial==="TikTok"?"#010101":"#C13584";
    var catC=catClienteColor(c.categoria||"Regular");
    return '<div class="card" onclick="cardEdit(event,\'cliente\','+c.id+')"><div class="crow"><div class="av">'+esc(c.nombre.charAt(0))+'</div><div class="ci"><div class="cn">'+esc(c.nombre)+' <span style="font-size:10px;font-weight:700;background:'+catC.bg+';color:'+catC.fg+';padding:2px 8px;border-radius:10px;margin-left:4px">'+esc(c.categoria||"Regular")+'</span></div><div class="cm"><span>'+esc(c.telefono||"")+'</span>'+(c.nick?'<span style="color:'+sc+';font-weight:500">'+esc(c.nick)+'</span>':'')+(c.cumpleDia?'<span>🎂 '+cumStr(c.cumpleDia,c.cumpleMes)+'</span>':"")+'</div></div><div class="ca"><div class="amt" style="color:var(--pink)">'+fmt(total)+'</div><div class="sub">'+items.length+' items</div></div><div class="cact"><button class="ib" onclick="viewCliente('+c.id+')">'+SVGey+'</button><button class="ib" onclick="openForm(\'cliente\','+c.id+')">'+SVGe+'</button><button class="ib ibd" onclick="delCl('+c.id+')">'+SVGt+'</button></div></div></div>';
  }).join(""):'<div class="empty"><div style="font-size:32px;margin-bottom:12px">🌸</div>Sin clientas encontradas</div>')+pagControlHTML("clientes",pg,"renderClientesCur");
}
function renderClientesCur(){ renderClientes(document.getElementById("src-cl")?document.getElementById("src-cl").value:""); }
function delCl(id){confirm2("¿Eliminar esta clienta?").then(function(ok){if(!ok) return;clientes=clientes.filter(function(c){return c.id!==id;});renderClientes(document.getElementById("src-cl").value);updateNav();if(db){db.collection("clientes").doc(String(id)).delete().catch(function(err){console.error("Error eliminando clienta:",err);setSyncStatus("error","Error al eliminar clienta");});}});}
function viewCliente(id){
  var c=cById(id);if(!c) return;
  var items=detalles.filter(function(d){return d.clienteId===c.id;});
  items=items.slice().sort(function(a,b){
    var diff=new Date(b.fecha||0)-new Date(a.fecha||0);
    return diff!==0?diff:(b.id-a.id);
  });
  var total=items.reduce(function(s,d){return s+d.precio*d.cantidad;},0);
  var sc=c.redSocial==="TikTok"?"#010101":"#C13584";
  var catC=catClienteColor(c.categoria||"Regular");
  document.getElementById("fotitle").textContent="Perfil de Clienta";
  document.getElementById("fobody").innerHTML='<div style="display:flex;align-items:center;gap:16px;margin-bottom:18px;padding-bottom:16px;border-bottom:1px solid var(--light)"><div class="av" style="width:52px;height:52px;font-size:22px">'+esc(c.nombre.charAt(0))+'</div><div><div style="font-family:\'Playfair Display\',serif;font-size:17px;font-weight:600">'+esc(c.nombre)+' <span style="font-size:11px;font-weight:700;background:'+catC.bg+';color:'+catC.fg+';padding:2px 9px;border-radius:10px;vertical-align:middle">'+esc(c.categoria||"Regular")+'</span></div><div style="font-size:13px;color:'+sc+';margin-top:3px;font-weight:500">'+esc(c.nick||"")+'</div></div></div><div class="pgrid"><div class="pbox"><div class="lbl">📞</div><div class="val">'+esc(c.telefono||"—")+'</div></div><div class="pbox"><div class="lbl">📍</div><div class="val">'+esc(c.ciudad||"SN")+'</div></div><div class="pbox"><div class="lbl">🎂</div><div class="val">'+cumStr(c.cumpleDia,c.cumpleMes)+'</div></div><div class="pbox"><div class="lbl">Red Social</div><div class="val">'+esc(c.redSocial||"—")+'</div></div><div class="pbox"><div class="lbl">'+esc(c.docIdent||"DNI")+'</div><div class="val">'+esc(c.numDI||"—")+'</div></div></div>'+(c.notas?'<div class="pbox" style="margin-bottom:14px"><div class="lbl">📝 Notas</div><div class="val">'+esc(c.notas)+'</div></div>':'')+'<div style="font-size:11px;font-weight:600;color:var(--gray);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Historial</div>'+items.map(function(d){return '<div class="hr"><div><div style="font-size:13px;font-weight:500">'+esc(d.producto)+'</div><div style="font-size:11px;color:var(--gray)">'+d.fecha+" · "+esc(d.canal)+'</div></div><div style="text-align:right"><div style="font-size:13px;font-weight:600">'+fmt(d.precio*d.cantidad)+'</div>'+bdg(d.estado)+'</div></div>';}).join("")+'<div style="margin-top:12px;padding:12px 14px;background:linear-gradient(135deg,rgba(242,196,206,.2),rgba(201,169,110,.2));border-radius:12px;display:flex;justify-content:space-between"><span style="font-weight:600">Total acumulado</span><span style="font-family:\'Playfair Display\',serif;font-size:15px;font-weight:600;color:var(--pink)">'+fmt(total)+'</span></div>';
  document.getElementById("fo").classList.add("open");
}
function fmCliente(id,body){
  var c=id?cById(id):{};
  var catSel=c.categoria||"Regular";
  var docSel=c.docIdent||"DNI";
  body.innerHTML=
    '<div class="frow"><div class="field"><label>Nombre *</label><input id="f-nombre" type="text" value="'+esc(c.nombre||"")+'" placeholder="Valentina García"/></div><div class="field"><label>Red Social</label><select id="f-red">'+["Instagram","TikTok","Facebook","WhatsApp"].map(function(r){return '<option'+(((c.redSocial||"Instagram")===r)?' selected':'')+'>'+r+'</option>';}).join("")+'</select></div></div>'+
    '<div class="field"><label>Nick (@)</label><input id="f-nick" type="text" value="'+esc((c.nick||"").replace(/^@/,""))+'" placeholder="vale.looks"/></div>'+
    '<div class="frow"><div class="field"><label>Categoría</label><select id="f-cat2">'+CAT_CLIENTE.map(function(cat){return '<option'+(catSel===cat?' selected':'')+'>'+cat+'</option>';}).join("")+'</select></div><div class="field"><label>Nro. WhatsApp</label><div style="display:flex;gap:8px"><input id="f-tel" type="tel" value="'+esc(c.telefono||"")+'" placeholder="300-000-0000" style="flex:1"/><button type="button" class="btn btn-p btn-sm" style="background:#25D366;flex-shrink:0" onclick="enviarWhatsappCliente()" title="Enviar mensaje de WhatsApp">📨</button></div></div></div>'+
    '<div class="frow"><div class="field"><label>Doc. Ident.</label><select id="f-docid">'+DOCID_CLIENTE.map(function(d){return '<option'+(docSel===d?' selected':'')+'>'+d+'</option>';}).join("")+'</select></div><div class="field"><label># DI</label><input id="f-numdi" type="text" value="'+esc(c.numDI||"")+'" placeholder="12345678"/></div></div>'+
    '<div class="frow"><div class="field"><label>Dpto.</label><input id="f-dpto" type="text" value="'+esc(c.dpto||"")+'" placeholder="Lima"/></div><div class="field"><label>Provincia</label><input id="f-prov2" type="text" value="'+esc(c.provincia||"")+'" placeholder="Lima"/></div></div>'+
    '<div class="frow"><div class="field"><label>Distrito</label><input id="f-ciu" type="text" value="'+esc(c.ciudad||"SN")+'" placeholder="SN"/></div><div class="field"><label>Nombre Local Agencia</label><input id="f-localag" type="text" value="'+esc(c.nombreLocalAgencia||"")+'" placeholder="Agencia Av. Larco"/></div></div>'+
    '<div class="field"><label>Dirección</label><input id="f-dir" type="text" value="'+esc(c.direccion||"")+'" placeholder="Av. Los Álamos 123"/></div>'+
    '<div class="field"><label>Referencia</label><input id="f-ref" type="text" value="'+esc(c.referencia||"")+'" placeholder="Frente al parque, casa azul…"/></div>'+
    '<div class="field"><label>Ubicación (Link Google Maps)</label><input id="f-maps" type="url" value="'+esc(c.ubicacionMaps||"")+'" placeholder="https://maps.app.goo.gl/…"/></div>'+
    '<div class="frow"><div class="field"><label>Cumpleaños — Día</label><input id="f-dia" type="number" min="1" max="31" value="'+esc(c.cumpleDia||"")+'" placeholder="15"/></div><div class="field"><label>Mes</label><select id="f-mes"><option value="">— Mes —</option>'+MES.map(function(m,i){return '<option value="'+(i+1)+'"'+(c.cumpleMes===i+1?' selected':'')+'>'+m+'</option>';}).join("")+'</select></div></div>'+
    '<div class="field"><label>Notas</label><textarea id="f-notas" placeholder="Preferencias, tallas…">'+esc(c.notas||"")+'</textarea></div>'+
    '<div class="fftr"><button class="btn btn-s" onclick="closeForm()">Cancelar</button><button class="btn btn-p" onclick="saveCl('+( id||"null")+')">✓ Guardar</button></div>';
}
function enviarWhatsappCliente(){
  var tel=document.getElementById("f-tel")?document.getElementById("f-tel").value.replace(/\D/g,""):"";
  if(!tel){alert("Ingresa un número de WhatsApp primero.");return;}
  var nombre=document.getElementById("f-nombre")?document.getElementById("f-nombre").value:"";
  var msg="Hola"+(nombre?" "+nombre:"")+"! 👋 Te escribimos de JESSDAY STYLE.";
  var phone=tel.length<=9?"51"+tel:tel; // asume Perú si no trae código de país
  window.open("https://wa.me/"+phone+"?text="+encodeURIComponent(msg),"_blank");
}
function saveCl(id){
  var nombre=document.getElementById("f-nombre").value.trim();
  if(!nombre){alert("El nombre es requerido");return;}
  var obj={
    nombre:nombre,
    nick:"@"+(document.getElementById("f-nick").value.replace(/^@/,"")),
    redSocial:document.getElementById("f-red").value,
    categoria:document.getElementById("f-cat2").value,
    telefono:document.getElementById("f-tel").value,
    docIdent:document.getElementById("f-docid").value,
    numDI:document.getElementById("f-numdi").value,
    ciudad:document.getElementById("f-ciu").value||"SN",
    dpto:document.getElementById("f-dpto").value,
    provincia:document.getElementById("f-prov2").value,
    nombreLocalAgencia:document.getElementById("f-localag").value,
    direccion:document.getElementById("f-dir").value,
    referencia:document.getElementById("f-ref").value,
    ubicacionMaps:document.getElementById("f-maps").value,
    cumpleDia:Number(document.getElementById("f-dia").value)||"",
    cumpleMes:Number(document.getElementById("f-mes").value)||"",
    notas:document.getElementById("f-notas").value
  };
  var isNew=!id;
  if(id){ obj.id=id; clientes=clientes.map(function(c){return c.id===id?Object.assign({},c,obj):c;}); }
  else{ obj.id=uid(); obj.creado=today(); clientes.push(obj); }
  // Actualización optimista: la UI refleja el cambio de inmediato,
  // y en paralelo se escribe solo este documento en la colección "clientes".
  closeForm();renderClientes(document.getElementById("src-cl").value);updateNav();
  guardarClienteEnColeccion(obj,isNew);
}

// Escribe (crea o actualiza) UN documento en la colección "clientes".
// A diferencia del modelo anterior, esto ya NO reescribe el resto del negocio.
function guardarClienteEnColeccion(obj,isNew){
  if(!db){ return; } // sin conexión a Firestore todavía (modo offline inicial)
  db.collection("clientes").doc(String(obj.id)).set(obj,{merge:true}).catch(function(err){
    console.error("Error guardando clienta en Firestore:",err);
    setSyncStatus("error","Error al guardar clienta");
  });
}
// Exponemos las funciones al entorno global
window.renderClientes = renderClientes;
window.renderClientesCur = renderClientesCur;
window.delCl = delCl;
window.viewCliente = viewCliente;
window.fmCliente = fmCliente;
window.enviarWhatsappCliente = enviarWhatsappCliente;
window.saveCl = saveCl;
window.guardarClienteEnColeccion = guardarClienteEnColeccion;
