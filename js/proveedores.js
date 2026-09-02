// ══════════════════════════════════════════════════════════════════════════
// PROVEEDORES
// ══════════════════════════════════════════════════════════════════════════
function renderProveedores(q){
  q=(q||"").toLowerCase();
  var f=proveedores.filter(function(p){
    return p.empresa.toLowerCase().indexOf(q)>=0||(p.contacto||"").toLowerCase().indexOf(q)>=0||(p.ubicacion||"").toLowerCase().indexOf(q)>=0;
  });
  f=f.slice().sort(function(a,b){return new Date(b.creado||0)-new Date(a.creado||0);});
  var pg=pagSlice("proveedores",f);
  document.getElementById("lst-pv").innerHTML=(pg.items.length?pg.items.map(function(p){
    var numCompras=compras.filter(function(c){return c.proveedor===p.empresa;}).length;
    return '<div class="card" onclick="cardEdit(event,\'proveedor\','+p.id+')"><div class="crow">'+
      '<div class="av" style="background:linear-gradient(135deg,var(--purple),var(--teal))">'+esc(p.empresa.charAt(0))+'</div>'+
      '<div class="ci"><div class="cn">'+esc(p.empresa)+'</div><div class="cm">'+(p.contacto?'<span>👤 '+esc(p.contacto)+'</span>':"")+(p.celular?'<span>📱 '+esc(p.celular)+'</span>':"")+'</div>'+(p.ubicacion?'<div class="cm" style="margin-top:3px"><span>📍 '+esc(p.ubicacion)+'</span></div>':"")+'</div>'+
      '<div class="ca"><div class="sub" style="font-size:11px;color:var(--gray)">'+numCompras+' compra(s)</div></div>'+
      '<div class="cact"><button class="ib" onclick="openForm(\'proveedor\','+p.id+')">'+SVGe+'</button><button class="ib ibd" onclick="delProveedor('+p.id+')">'+SVGt+'</button></div>'+
    '</div>'+(p.nota?'<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--light);font-size:13px;color:var(--gray)">📝 '+esc(p.nota)+'</div>':"")+'</div>';
  }).join(""):'<div class="empty"><div style="font-size:32px;margin-bottom:12px">🏭</div>Sin proveedores registrados</div>')+pagControlHTML("proveedores",pg,"renderProveedoresCur");
}
function renderProveedoresCur(){ renderProveedores(document.getElementById("src-pv")?document.getElementById("src-pv").value:""); }
function fmProveedor(id,body){
  var p=id?proveedores.find(function(x){return x.id===id;}):null;
  body.innerHTML=
    '<div class="field"><label>Empresa *</label><input id="f-pvempresa" type="text" value="'+esc(p?p.empresa||"":"")+'" placeholder="Distribuidora Moda SAS"/></div>'+
    '<div class="field"><label>Nombre Contacto</label><input id="f-pvcontacto" type="text" value="'+esc(p?p.contacto||"":"")+'" placeholder="Juan Pérez"/></div>'+
    '<div class="frow"><div class="field"><label>Ubicación</label><input id="f-pvubic" type="text" value="'+esc(p?p.ubicacion||"":"")+'" placeholder="Lima, Gamarra"/></div><div class="field"><label>Celular</label><input id="f-pvcel" type="tel" value="'+esc(p?p.celular||"":"")+'" placeholder="987654321"/></div></div>'+
    '<div class="field"><label>Nota</label><textarea id="f-pvnota" placeholder="Condiciones de pago, horario, etc.">'+esc(p?p.nota||"":"")+'</textarea></div>'+
    '<div class="fftr"><button class="btn btn-s" onclick="closeForm()">Cancelar</button><button class="btn btn-p" onclick="saveProveedor('+(id||"null")+')">✓ Guardar</button></div>';
}
function saveProveedor(id){
  var empresa=document.getElementById("f-pvempresa").value.trim();
  if(!empresa){alert("La empresa es requerida");return;}
  var obj={
    empresa:empresa,
    contacto:document.getElementById("f-pvcontacto").value,
    ubicacion:document.getElementById("f-pvubic").value,
    celular:document.getElementById("f-pvcel").value,
    nota:document.getElementById("f-pvnota").value
  };
  var isNew=!id;
  if(id){ obj.id=id; proveedores=proveedores.map(function(p){return p.id===id?Object.assign({},p,obj):p;}); }
  else{ obj.id=uid(); obj.creado=today(); proveedores.push(obj); }
  closeForm();renderProveedores(document.getElementById("src-pv")?document.getElementById("src-pv").value:"");updateNav();
  guardarProveedorEnColeccion(obj,isNew);
}

function guardarProveedorEnColeccion(obj,isNew){
  if(!db){ return; }
  db.collection("proveedores").doc(String(obj.id)).set(obj,{merge:true}).catch(function(err){
    console.error("Error guardando proveedor en Firestore:",err);
    setSyncStatus("error","Error al guardar proveedor");
  });
}
function delProveedor(id){confirm2("¿Eliminar este proveedor?").then(function(ok){if(!ok) return;proveedores=proveedores.filter(function(p){return p.id!==id;});renderProveedores(document.getElementById("src-pv")?document.getElementById("src-pv").value:"");updateNav();if(db){db.collection("proveedores").doc(String(id)).delete().catch(function(err){console.error("Error eliminando proveedor:",err);setSyncStatus("error","Error al eliminar proveedor");});}});}

// Exponemos las funciones al entorno global
window.renderProveedores = renderProveedores;
window.renderProveedoresCur = renderProveedoresCur;
window.fmProveedor = fmProveedor;
window.saveProveedor = saveProveedor;
window.guardarProveedorEnColeccion = guardarProveedorEnColeccion;
window.delProveedor = delProveedor;