// COMPRAS
var TDOC=["Factura","Boleta","Ticket","Remisión","Otro"];
var cmpItems=[];
function renderCompras(){
  var q=(document.getElementById("src-c")?document.getElementById("src-c").value:"").toLowerCase();
  var lista=compras.filter(function(c){
    if(!q) return true;
    var sum=c.items.reduce(function(s,i){return s+(i.precioUnit||0)*(i.cantidad||0);},0);
    var total=c.montoTotal!=null?c.montoTotal:sum;
    var fecha=(c.fecha||"").toLowerCase();
    var fechaLegible=fechaCorta(c.fecha).toLowerCase();
    var proveedor=(c.proveedor||"").toLowerCase();
    var numDoc=(c.numDoc||"").toLowerCase();
    var notas=(c.notas||"").toLowerCase();
    var totalStr=String(total.toFixed(2));
    var productosMatch=c.items.some(function(it){
      var p=pById(it.productoId);
      return p&&p.nombre.toLowerCase().indexOf(q)>=0;
    });
    return fecha.indexOf(q)>=0||fechaLegible.indexOf(q)>=0||proveedor.indexOf(q)>=0||numDoc.indexOf(q)>=0||notas.indexOf(q)>=0||totalStr.indexOf(q)>=0||productosMatch;
  }).sort(function(a,b){
    var diff=new Date(b.fecha||0)-new Date(a.fecha||0);
    return diff!==0?diff:(b.id-a.id);
  });
  var pg=pagSlice("compras",lista);
  document.getElementById("lst-c").innerHTML=(pg.items.length?pg.items.map(function(c){
    var sum=c.items.reduce(function(s,i){return s+(i.precioUnit||0)*(i.cantidad||0);},0);
    var total=c.montoTotal!=null?c.montoTotal:sum;
    var cantTotal=c.items.reduce(function(s,i){return s+(Number(i.cantidad)||0);},0);
    return '<div class="card" id="cmp-'+c.id+'" onclick="cardEdit(event,\'compra\','+c.id+')"><div class="crow" style="margin-bottom:8px"><div style="width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,var(--purple),var(--teal));display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">🧾</div><div class="ci"><div class="cn">'+esc(c.proveedor||"Sin proveedor")+'</div><div class="cm"><span>📄 '+esc(c.tipoDoc)+' '+esc(c.numDoc)+'</span><span>'+c.fecha+'</span></div></div><div class="ca"><div class="sub" style="font-size:10px;color:var(--gray)">Cantidad</div><div class="amt" style="margin-bottom:6px">'+cantTotal+'</div><div class="sub" style="font-size:10px;color:var(--gray)">Total</div><div class="amt">'+fmt(total)+'</div>'+bdg(c.estado)+'</div><div class="cact" style="flex-wrap:wrap">'+(c.estado==="Pendiente"?'<button class="btn-inv" onclick="regInv('+c.id+')">📦 → Inv.</button>':'<span style="font-size:12px;color:var(--success);font-weight:600">✓ Ingresado</span>')+'<button class="ib" onclick="viewCompra('+c.id+')">'+SVGey+'</button><button class="ib" onclick="openForm(\'compra\','+c.id+')">'+SVGe+'</button><button class="ib ibd" onclick="delC('+c.id+')">'+SVGt+'</button></div></div><div style="display:flex;flex-wrap:wrap;gap:6px">'+c.items.map(function(it){var p=pById(it.productoId);return '<span style="font-size:11px;background:var(--light);padding:2px 9px;border-radius:20px">'+esc(p?p.nombre:"Producto")+' '+it.cantidad+'</span>';}).join("")+'</div></div>';
  }).join(""):'<div class="empty"><div style="font-size:32px;margin-bottom:12px">🧾</div>Sin compras registradas</div>')+pagControlHTML("compras",pg,"renderCompras");
}
// ==========================================
// FUNCIÓN regInv LIMPIA Y SEGURA
// ==========================================
// ==========================================
// FUNCIÓN regInv LIMPIA Y SEGURA
// ==========================================
function regInv(id){
  var c = window.compras.find(function(x){return x.id===id;});
  if(!c) return;
  if(c.estado==="Ingresado"){alert("Ya fue ingresada.");return;}
  
  try {
    var nuevasEntradas=[];
    c.items.forEach(function(item){
      var idx = window.productos.findIndex(function(p){return p.id===item.productoId;});
      if(idx>=0){
        var newStock = (window.productos[idx].stock||0) + item.cantidad;
        window.productos[idx] = Object.assign({}, window.productos[idx], {
          stock: newStock, 
          estadoProducto: window.estProd(newStock) 
        });
        if(window.guardarProductoEnColeccion) window.guardarProductoEnColeccion(window.productos[idx], false); 
      }
      var entrada={id: window.uid(), productoId: item.productoId, compraId: c.id, cantidad: item.cantidad, fecha: window.today()};
      window.inventario.push(entrada);
      nuevasEntradas.push(entrada);
    });
    
    window.compras = window.compras.map(function(x){return x.id===id?Object.assign({},x,{estado:"Ingresado"}):x;});
    renderCompras();
    
    if(window.updateNav) window.updateNav();
    
    var saved = window.compras.find(function(x){return x.id===id;});
    window.guardarCompraEnColeccion(saved, false);
    if(window.guardarInventarioEnColeccion) window.guardarInventarioEnColeccion(nuevasEntradas);
    
    var el=document.getElementById("cmp-"+id);
    if(el){el.classList.add("flash");setTimeout(function(){el.classList.remove("flash");},2500);}
    
  } catch (error) {
    console.error("Error al registrar inventario:", error);
    alert("Ocurrió un problema al enviar al inventario: " + error.message);
  }
}
function fmCompra(id,body){
  var c=id?compras.find(function(x){return x.id===id;}):null;
  cmpItems=c&&c.items?c.items.map(function(i){return Object.assign({},i);}):[];
  body.innerHTML=
    '<div class="frow"><div class="field"><label>Proveedor *</label><div class="sdr"><input type="text" id="f-prov" value="'+esc(c?c.proveedor||"":"")+'" placeholder="Distribuidora Moda SAS" autocomplete="off" oninput="filterProvDrop(this.value)" onfocus="filterProvDrop(this.value)"/><div class="sdrd" id="prov-drop"></div></div></div><div class="field"><label>Tipo Documento</label><div class="sdr"><input type="text" id="f-tipo" value="'+esc(c?c.tipoDoc||"Factura":"Factura")+'" placeholder="Factura, Boleta, Otro…" autocomplete="off" oninput="filterTipoDocDrop(this.value)" onfocus="filterTipoDocDrop(this.value)"/><div class="sdrd" id="tipo-drop"></div></div></div></div>'+
    '<div class="frow"><div class="field"><label>N° Documento *</label><input id="f-ndoc" type="text" value="'+esc(c?c.numDoc||"":"")+'" placeholder="FAC-2025-001"/></div><div class="field"><label>Fecha</label><input id="f-fecha" type="date" value="'+(c?c.fecha:today())+'"/></div></div>'+
    '<div class="field"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><label style="margin-bottom:0">Productos</label><button class="btn btn-g btn-sm" onclick="addCI()">+ Agregar</button></div><div id="citems"></div>'+
    '<div style="display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-top:12px;padding:10px 14px;background:rgba(201,169,110,.15);border-radius:10px">'+
      '<span style="font-size:14px;font-weight:600">Total a Pagar: S/</span>'+
      '<input id="f-ctotal" type="number" step="any" value="" style="width:110px;padding:6px 10px;border-radius:8px;border:1.5px solid var(--gold);font-weight:bold;font-size:15px;color:var(--dark);outline:none;font-family:\'Inter\',sans-serif;" />'+
    '</div></div>'+
    '<div class="field"><label>Notas</label><textarea id="f-not" rows="3" placeholder="Observaciones…">'+esc(c?c.notas||"":"")+'</textarea></div>'+
    '<div class="fftr"><button class="btn btn-s" onclick="closeForm()">Cancelar</button><button class="btn btn-p" onclick="saveC('+(id||"null")+')">✓ Guardar</button></div>';
  renderCI();
  // Si estamos editando y hay un total personalizado, lo colocamos en el input
  if(c && c.montoTotal != null) {
    document.getElementById("f-ctotal").value = c.montoTotal;
  }
}

// ==========================================
// REEMPLAZA TU FUNCIÓN renderCI
// ==========================================
function renderCI(){
  var el=document.getElementById("citems");if(!el) return;
  if(!cmpItems.length){el.innerHTML='<p style="font-size:13px;color:var(--gray);text-align:center;padding:12px">Agrega productos con el botón +</p>';updCT();return;}
  el.innerHTML=cmpItems.map(function(it,i){
    var pSel = it.productoId ? window.pById(it.productoId) : null;
    var sub = (Number(it.cantidad)||0)*(Number(it.precioUnit)||0);
    
    // NUEVO: Indicador visual para saber si seleccionaste bien el producto
    var estadoProd = pSel 
      ? '<span style="color:var(--success);font-size:10px;font-weight:bold;margin-left:8px">✓ Vinculado</span>' 
      : '<span style="color:var(--danger);font-size:10px;font-weight:bold;margin-left:8px">⚠️ Selecciona de la lista</span>';

    return '<div class="cir" style="flex-wrap:wrap;align-items:flex-end;gap:8px">'+
      '<div class="field" style="flex:2;min-width:140px;margin-bottom:0"><label>Producto ' + estadoProd + '</label><div class="sdr"><input type="text" class="ci-prod-inp" data-idx="'+i+'" value="'+window.esc(pSel?pSel.nombre:"")+'" placeholder="Buscar producto…" autocomplete="off" oninput="filterProdDropCompra('+i+',this.value)" onfocus="filterProdDropCompra('+i+',this.value)"/><div class="sdrd" id="prod-drop-'+i+'"></div></div></div>'+
      '<div class="field" style="flex:1;min-width:60px;margin-bottom:0"><label>Cant.</label><input type="number" min="1" step="any" value="'+(it.cantidad||1)+'" oninput="ciCh('+i+',\'cantidad\',this.value)"/></div>'+
      '<div class="field" style="flex:1;min-width:80px;margin-bottom:0"><label>C. Unitario</label><input type="number" id="ci-pu-'+i+'" step="any" value="'+(it.precioUnit||"")+'" oninput="ciCh('+i+',\'precioUnit\',this.value)"/></div>'+
      '<div class="field" style="flex:1;min-width:80px;margin-bottom:0"><label>SubTotal</label><input type="number" id="ci-sub-'+i+'" step="any" value="'+(sub?Number(sub.toFixed(2)):"")+'" oninput="ciCh('+i+',\'subtotal\',this.value)"/></div>'+
      '<button class="ib ibd" style="flex-shrink:0;margin-bottom:8px" onclick="rmCI('+i+')">'+window.SVGt+'</button>'+
    '</div>';
  }).join("");
  updCT();
}

function ciCh(i,k,v){
  if(k==="productoId"){
    cmpItems[i][k]=Number(v)||"";
    var p=pById(Number(v));
    if(p) cmpItems[i].precioUnit=p.precioCompra;
    renderCI();
  } else if(k==="subtotal"){
    var sub = Number(v)||0;
    var cant = Number(cmpItems[i].cantidad)||0;
    if(cant > 0) {
      cmpItems[i].precioUnit = Number((sub / cant).toFixed(4));
      // Actualiza el campo de C. Unitario visualmente sin perder el foco
      var puEl = document.getElementById("ci-pu-"+i);
      if(puEl) puEl.value = cmpItems[i].precioUnit;
    }
    updCT();
  } else {
    // Si cambia 'cantidad' o 'precioUnit'
    cmpItems[i][k]=Number(v)||"";
    var sub = (Number(cmpItems[i].cantidad)||0) * (Number(cmpItems[i].precioUnit)||0);
    // Actualiza el campo de SubTotal visualmente sin perder el foco
    var subEl = document.getElementById("ci-sub-"+i);
    if(subEl) subEl.value = sub ? Number(sub.toFixed(2)) : "";
    updCT();
  }
}

function updCT(){
  var t=cmpItems.reduce(function(s,i){return s+(Number(i.precioUnit)||0)*(Number(i.cantidad)||0);},0);
  var el=document.getElementById("f-ctotal");
  if(el) el.value=Number(t).toFixed(2);
}
// Añadir una nueva fila de producto a la compra
function addCI(){
  cmpItems.push({productoId:"", cantidad:1, precioUnit:""});
  renderCI();
}

// Eliminar una fila
function rmCI(idx){
  cmpItems.splice(idx, 1);
  renderCI();
}

// Buscador desplegable de productos dentro del formulario de compras
function filterProdDropCompra(idx, q) {
  var dd = document.getElementById("prod-drop-" + idx);
  if (!dd) return;
  var qq = (q || "").toLowerCase();
  var list = productos.filter(function (p) {
    return !qq || p.nombre.toLowerCase().indexOf(qq) >= 0 || (p.codigoQR || "").toLowerCase().indexOf(qq) >= 0;
  });
  if (!list.length) {
    dd.classList.add("open");
    dd.innerHTML = '<div style="padding:12px 14px;font-size:13px;color:var(--gray)">Sin resultados</div>';
    return;
  }
  dd.classList.add("open");
  dd.innerHTML = list.map(function (p) {
    return '<div class="sdri" onclick="selectProdCompra(' + idx + ', ' + p.id + ')">' +
      '<div class="sdrav" style="background:' + (p.foto ? 'url(' + encodeURI(p.foto) + ') center/cover' : 'linear-gradient(135deg,#F2C4CE,#E8C9A0)') + '">' + (p.foto ? '' : '📦') + '</div>' +
      '<div style="flex:1;min-width:0">' +
      '<div style="font-size:14px;font-weight:500">' + esc(p.nombre) + '</div>' +
      '<div style="font-size:11px;color:var(--gray)">Costo: ' + fmt(p.precioCompra) + ' | Stock actual: ' + p.stock + '</div>' +
      '</div>' +
      '</div>';
  }).join("");
}

// Seleccionar un producto de la lista en la compra
function selectProdCompra(idx, pid) {
  var dd = document.getElementById("prod-drop-" + idx);
  if (dd) dd.classList.remove("open");
  ciCh(idx, 'productoId', pid);
}

// Cierra los desplegables de productos si se hace clic fuera de ellos
document.addEventListener("click", function(e){
  document.querySelectorAll('#citems .sdrd.open').forEach(function(dd){
     if(!dd.parentElement.contains(e.target)) dd.classList.remove('open');
  });
});

// ── Autocompletado de Proveedor en "Nueva Compra" ──
function filterProvDrop(q){
  var dd = document.getElementById("prov-drop");
  if (!dd) return;
  var qq = (q || "").toLowerCase();
  var list = proveedores.filter(function (p) {
    return !qq || (p.empresa || "").toLowerCase().indexOf(qq) >= 0 || (p.contacto || "").toLowerCase().indexOf(qq) >= 0;
  });
  
  if (!list.length) {
    dd.classList.add("open");
    dd.innerHTML = '<div style="padding:12px 14px;font-size:13px;color:var(--gray)">' + (proveedores.length ? "Sin coincidencias — puedes guardar el texto que escribiste" : "Aún no tienes proveedores registrados") + '</div>';
    return;
  }
  
  dd.classList.add("open");
  dd.innerHTML = list.map(function (p) {
    return '<div class="sdri" onclick="selectProv(' + p.id + ')">' +
      '<div class="sdrav" style="background:linear-gradient(135deg,var(--purple),var(--teal))">' + esc((p.empresa || "?").charAt(0).toUpperCase()) + '</div>' +
      '<div style="flex:1;min-width:0">' +
      '<div style="font-size:14px;font-weight:500">' + esc(p.empresa) + '</div>' +
      '<div style="font-size:11px;color:var(--gray)">' + (p.contacto ? '👤 ' + esc(p.contacto) + ' ' : '') + (p.celular ? '📱 ' + esc(p.celular) : '') + '</div>' +
      '</div>' +
      '</div>';
  }).join("");
}

function selectProv(id) {
  var p = proveedores.find(function (x) { return x.id === id; });
  if (!p) return;
  document.getElementById("f-prov").value = p.empresa;
  var dd = document.getElementById("prov-drop");
  if (dd) dd.classList.remove("open");
}

document.addEventListener("click", function (e) {
  var dd = document.getElementById("prov-drop");
  var inp = document.getElementById("f-prov");
  if (dd && inp && !dd.contains(e.target) && e.target !== inp) dd.classList.remove("open");
});

// ── Autocompletado de Tipo Documento y generación de N° Documento "SN" ──
var TIPO_DOC_OPCIONES = ["Factura", "Boleta", "SN", "Otro"];

function filterTipoDocDrop(q) {
  var dd = document.getElementById("tipo-drop");
  if (!dd) return;
  var qq = (q || "").toLowerCase();
  var list = TIPO_DOC_OPCIONES.filter(function (t) { return !qq || t.toLowerCase().indexOf(qq) >= 0; });
  
  if (!list.length) { dd.classList.remove("open"); dd.innerHTML = ""; return; }
  
  dd.classList.add("open");
  dd.innerHTML = list.map(function (t) {
    return '<div class="sdri" onclick="selectTipoDoc(\'' + t + '\')">' +
      '<div style="flex:1;min-width:0">' +
      '<div style="font-size:14px;font-weight:500">' + t + '</div>' +
      (t === "SN" ? '<div style="font-size:11px;color:var(--gray)">Genera un N° de control automático</div>' : '') +
      '</div>' +
      '</div>';
  }).join("");
}

function selectTipoDoc(t) {
  document.getElementById("f-tipo").value = t;
  var dd = document.getElementById("tipo-drop");
  if (dd) dd.classList.remove("open");
  aplicarNumDocAutoSiSN(t);
}

function aplicarNumDocAutoSiSN(val) {
  var ndocEl = document.getElementById("f-ndoc");
  if (!ndocEl) return;
  
  if ((val || "").trim().toUpperCase() === "SN") {
    ndocEl.value = generarNumDocSN();
  } else {
    if(ndocEl.value.indexOf("SN20") === 0) {
        ndocEl.value = "";
    }
  }
}

function generarNumDocSN() {
  var hoy = new Date();
  var ymd = hoy.getFullYear() + String(hoy.getMonth() + 1).padStart(2, "0") + String(hoy.getDate()).padStart(2, "0");
  var prefix = "SN" + ymd + "-";
  var maxSeq = 0;
  
  compras.forEach(function (c) {
    if (c.numDoc && c.numDoc.indexOf(prefix) === 0) {
      var seq = parseInt(c.numDoc.slice(prefix.length), 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }
  });
  
  return prefix + String(maxSeq + 1).padStart(4, "0");
}

document.addEventListener("click", function (e) {
  var dd = document.getElementById("tipo-drop");
  var inp = document.getElementById("f-tipo");
  if (dd && inp && !dd.contains(e.target) && e.target !== inp) dd.classList.remove("open");
});

// ==========================================
// REEMPLAZA TU FUNCIÓN saveC
// ==========================================
function saveC(id){
  var prov=document.getElementById("f-prov").value.trim();
  var ndoc=document.getElementById("f-ndoc").value.trim();
  var ctotal=Number(document.getElementById("f-ctotal").value)||0;
  if(!prov){alert("Ingresa el proveedor");return;}
  if(!ndoc){alert("Ingresa el N° de documento");return;}
  if(!cmpItems.length){alert("Agrega al menos un producto");return;}
  
  // NUEVO: Bloquear guardado si el usuario escribió el producto pero no lo seleccionó
  var sinVincular = cmpItems.some(function(i){ return !i.productoId; });
  if (sinVincular) {
    alert("⚠️ ATENCIÓN: Hay productos sin vincular. Por favor, asegúrate de SELECCIONAR el producto haciendo clic en la lista desplegable, no solo escribiendo su nombre.");
    return;
  }

  var obj={
    proveedor:prov,
    tipoDoc:document.getElementById("f-tipo").value,
    numDoc:ndoc,
    fecha:document.getElementById("f-fecha").value,
    items:cmpItems.map(function(i){return {productoId:Number(i.productoId),cantidad:Number(i.cantidad)||1,precioUnit:Number(i.precioUnit)||0};}),
    notas:document.getElementById("f-not").value,
    estado:"Pendiente",
    montoTotal:ctotal
  };

  var isNew=!id;
  if(id){ obj.id=id; window.compras=window.compras.map(function(c){return c.id===id?Object.assign({},c,obj,{estado:c.estado}):c;}); }
  else{ obj.id=window.uid(); window.compras.push(obj); }
  window.closeForm();
  renderCompras();
  if(window.updateNav) window.updateNav();
  
  var saved=window.compras.find(function(c){return c.id===(id||obj.id);});
  if(window.guardarCompraEnColeccion) window.guardarCompraEnColeccion(saved,isNew);
}

function guardarCompraEnColeccion(obj, isNew){
  if(!db || !obj) return;
  db.collection("compras").doc(String(obj.id)).set(obj, {merge:true}).catch(function(err){
    console.error("Error guardando compra en Firestore:", err);
    setSyncStatus("error", "Error al guardar compra");
  });
}

function viewCompra(id){
  var c=compras.find(function(x){return x.id===id;});if(!c) return;
  var sum=c.items.reduce(function(s,i){return s+(i.precioUnit||0)*(i.cantidad||0);},0);
  var total=c.montoTotal!=null?c.montoTotal:sum;
  document.getElementById("fotitle").textContent="Detalle de Compra";
  document.getElementById("fobody").innerHTML='<div style="background:linear-gradient(135deg,rgba(155,127,212,.15),rgba(107,181,181,.15));border-radius:12px;padding:13px 17px;margin-bottom:16px"><div style="font-family:\'Playfair Display\',serif;font-size:16px;font-weight:600">'+esc(c.tipoDoc)+' · '+esc(c.numDoc)+'</div><div style="font-size:13px;color:var(--gray);margin-top:3px">🏪 '+esc(c.proveedor)+' · '+c.fecha+'</div></div>'+c.items.map(function(it){var p=pById(it.productoId);return '<div class="hr"><div><div style="font-size:13px;font-weight:500">'+esc(p?p.nombre:"Producto eliminado")+'</div><div style="font-size:11px;color:var(--gray)">×'+it.cantidad+' · '+fmt(it.precioUnit)+' c/u</div></div><div style="font-weight:600">'+fmt(it.precioUnit*it.cantidad)+'</div></div>';}).join("")+'<div style="display:flex;justify-content:space-between;padding:12px 0 0;font-family:\'Playfair Display\',serif;font-size:16px;font-weight:600"><span>Total</span><span style="color:var(--pink)">'+fmt(total)+'</span></div>'+(c.notas?'<div style="margin-top:10px;font-size:13px;color:var(--gray)">📝 '+esc(c.notas)+'</div>':"");
  document.getElementById("fo").classList.add("open");
}
// ==========================================
// FUNCIÓN delC LIMPIA Y SEGURA
// ==========================================
function delC(id){
  window.confirm2("¿Segura que deseas eliminar esta compra?").then(function(ok){
    if(!ok) return;
    
    try {
      var c = window.compras.find(function(x){ return x.id === id; });
      if(!c) return;

      if(c.estado === "Ingresado"){
        var idsInventarioAEliminar = [];
        
        c.items.forEach(function(item){
          var idx = window.productos.findIndex(function(p){ return p.id === item.productoId; });
          if(idx >= 0){
            var nuevoStock = Math.max(0, (window.productos[idx].stock || 0) - item.cantidad);
            window.productos[idx] = Object.assign({}, window.productos[idx], { 
              stock: nuevoStock, 
              estadoProducto: window.estProd(nuevoStock) 
            });
            if(window.guardarProductoEnColeccion) window.guardarProductoEnColeccion(window.productos[idx], false);
          }
        });

        var entradas = window.inventario.filter(function(i){ return i.compraId === id; });
        idsInventarioAEliminar = entradas.map(function(e){ return e.id; });
        
        window.inventario = window.inventario.filter(function(i){ return i.compraId !== id; });
        
        if(idsInventarioAEliminar.length > 0 && window.borrarInventarioEnColeccion){
          window.borrarInventarioEnColeccion(idsInventarioAEliminar);
        }
      }

      window.compras = window.compras.filter(function(x){ return x.id !== id; });
      renderCompras();
      if(window.updateNav) window.updateNav();

      if(window.db){
        window.db.collection("compras").doc(String(id)).delete().catch(function(err){
          console.error("Error eliminando compra:", err);
        });
      }
    } catch (error) {
      console.error("Error al eliminar compra:", error);
      alert("Ocurrió un problema al eliminar la compra: " + error.message);
    }
  });
}
// INVENTARIO
function renderInv(q){
  q=q||"";
  var f=productos.filter(function(p){return p.nombre.toLowerCase().indexOf(q.toLowerCase())>=0||(p.codigoQR||"").toLowerCase().indexOf(q.toLowerCase())>=0;});
  f=f.slice().sort(function(a,b){return b.id-a.id;});
  var pg=pagSlice("inventario",f);
  document.getElementById("lst-i").innerHTML=(pg.items.length?pg.items.map(function(p){
    var ents=inventario.filter(function(i){return i.productoId===p.id;});
    ents=ents.slice().sort(function(a,b){
      var diff=new Date(b.fecha||0)-new Date(a.fecha||0);
      return diff!==0?diff:(b.id-a.id);
    });
    var tu=ents.reduce(function(s,i){return s+i.cantidad;},0);
    var bg=p.foto?'background-image:url('+p.foto+');background-size:cover;background-position:center':'background:linear-gradient(135deg,rgba(242,196,206,.4),rgba(232,201,160,.4))';
    var est=estProd(p.stock);
    var estColor=estProdColor(p.stock);
    var qrTag=p.qrImagen?'<img src="'+p.qrImagen+'" style="width:28px;height:28px;background:#fff;border-radius:4px;padding:2px;border:1px solid var(--light)"/>':'';
    return '<div class="card"><div class="crow" style="margin-bottom:'+(ents.length?8:0)+'px"><div style="width:44px;height:44px;border-radius:10px;'+bg+';display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">'+(p.foto?'':catE(p.categoria))+'</div><div class="ci"><div class="cn">'+esc(p.nombre)+'</div><div class="cm"><span>'+esc(p.codigoQR||"")+'</span><span>'+esc(p.proveedor||"Sin proveedor")+'</span><span style="font-weight:700;color:'+estColor+'">● '+est+'</span></div></div>'+qrTag+'<div style="display:flex;gap:10px;flex-wrap:wrap"><div style="text-align:center;background:var(--cream);border-radius:10px;padding:7px 14px"><div style="font-size:10px;color:var(--gray);margin-bottom:2px">EN COMPRAS</div><div style="font-size:15px;font-weight:700;color:var(--purple)">'+tu+' uds</div></div><div style="text-align:center;background:'+(p.stock>0?'rgba(123,196,160,.2)':'#FFF0F0')+';border-radius:10px;padding:7px 14px"><div style="font-size:10px;color:var(--gray);margin-bottom:2px">STOCK_INVENTARIO</div><div style="font-size:15px;font-weight:700;color:'+(p.stock>0?'var(--success)':'var(--danger)')+'">'+p.stock+' uds</div></div><button class="ib ibd" onclick="delInv('+p.id+')" title="Eliminar del inventario" style="align-self:center">'+SVGt+'</button></div></div>'+(ents.length?'<div style="background:var(--cream);border-top:1px solid var(--light);padding:8px 14px;margin:0 -18px -14px;border-radius:0 0 14px 14px"><div style="font-size:10px;color:var(--gray);margin-bottom:6px;font-weight:600;letter-spacing:.5px">ENTRADAS</div><div style="display:flex;flex-wrap:wrap;gap:8px">'+ents.map(function(e){return '<span class="etag">'+e.fecha+' — '+e.cantidad+' uds <span style="cursor:pointer;color:var(--danger);font-weight:700" onclick="delInvEntry('+e.id+')" title="Eliminar esta entrada">✕</span></span>';}).join("")+'</div></div>':"")+'</div>';
  }).join(""):'<div class="empty"><div style="font-size:32px;margin-bottom:12px">📦</div>Sin movimientos aún</div>')+pagControlHTML("inventario",pg,"renderInvCur");
}
function renderInvCur(){ renderInv(document.getElementById("src-i")?document.getElementById("src-i").value:""); }
// Eliminar TODO el registro de inventario de un producto (todas sus entradas) y restar ese stock acumulado
function delInv(productoId){
  var ents=inventario.filter(function(i){return i.productoId===productoId;});
  if(!ents.length){ flashScanMsg("Este producto no tiene movimientos de inventario."); return; }
  confirm2("¿Eliminar todo el inventario registrado de este producto? El stock se reducirá en "+ents.reduce(function(s,i){return s+i.cantidad;},0)+" uds.").then(function(ok){
    if(!ok) return;
    var totalARestar=ents.reduce(function(s,i){return s+i.cantidad;},0);
    var idx=productos.findIndex(function(p){return p.id===productoId;});
    if(idx>=0){
      var nuevoStock=Math.max(0,(productos[idx].stock||0)-totalARestar);
      productos[idx]=Object.assign({},productos[idx],{stock:nuevoStock,estadoProducto:estProd(nuevoStock)});
      guardarProductoEnColeccion(productos[idx]);
    }
    inventario=inventario.filter(function(i){return i.productoId!==productoId;});
    renderInv(document.getElementById("src-i")?document.getElementById("src-i").value:"");
    updateNav();
    borrarInventarioEnColeccion(ents.map(function(e){return e.id;}));
  });
}
// Eliminar una sola entrada (movimiento) de inventario, restando su cantidad del stock
function delInvEntry(entryId){
  var entry=inventario.find(function(i){return i.id===entryId;});
  if(!entry) return;
  confirm2("¿Eliminar esta entrada de "+entry.cantidad+" uds del inventario?").then(function(ok){
    if(!ok) return;
    var idx=productos.findIndex(function(p){return p.id===entry.productoId;});
    if(idx>=0){
      var nuevoStock=Math.max(0,(productos[idx].stock||0)-entry.cantidad);
      productos[idx]=Object.assign({},productos[idx],{stock:nuevoStock,estadoProducto:estProd(nuevoStock)});
      guardarProductoEnColeccion(productos[idx]);
    }
    inventario=inventario.filter(function(i){return i.id!==entryId;});
    renderInv(document.getElementById("src-i")?document.getElementById("src-i").value:"");
    updateNav();
    borrarInventarioEnColeccion([entryId]);
  });
}

// ══════════════════════════════════════════════════════════════════════════
// GASTOS Y COMPRAS (Costos Indirectos y Gastos)
// ══════════════════════════════════════════════════════════════════════════
var MESES_CORTOS=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
function gastosAniosDisponibles(){
  var set={};
  gastos.forEach(function(g){ if(g.fecha) set[g.fecha.slice(0,4)]=true; });
  set[String(new Date().getFullYear())]=true;
  return Object.keys(set).sort(function(a,b){return b-a;});
}
function fillGastosFiltros(){
  var selA=document.getElementById("fg-anio");
  var selM=document.getElementById("fg-mes");
  var selC=document.getElementById("fg-cat");
  if(!selA||!selM) return;
  var curA=selA.value;
  var anios=gastosAniosDisponibles();
  selA.innerHTML='<option value="">Todos los años</option>'+anios.map(function(a){return '<option value="'+a+'"'+(curA===a?' selected':'')+'>'+a+'</option>';}).join("");
  if(curA&&anios.indexOf(curA)>=0) selA.value=curA;
  if(!selM.innerHTML){
    selM.innerHTML='<option value="">Todos los meses</option>'+MESES_CORTOS.map(function(m,i){return '<option value="'+(i+1)+'">'+m+'</option>';}).join("");
  }
  if(selC&&!selC.innerHTML){
    selC.innerHTML='<option value="">Todas las categorías</option>'+CAT_GASTO.map(function(c){return '<option value="'+c+'">'+c+'</option>';}).join("");
  }
}
function renderGastos(){
  fillGastosFiltros();
  var q=(document.getElementById("src-g")?document.getElementById("src-g").value:"").toLowerCase();
  var fa=document.getElementById("fg-anio")?document.getElementById("fg-anio").value:"";
  var fm=document.getElementById("fg-mes")?document.getElementById("fg-mes").value:"";
  var fc=document.getElementById("fg-cat")?document.getElementById("fg-cat").value:"";
  var f=gastos.filter(function(g){
    var matchQ=!q||(g.descripcion||"").toLowerCase().indexOf(q)>=0;
    var matchA=!fa||(g.fecha||"").slice(0,4)===fa;
    var matchM=!fm||Number((g.fecha||"").slice(5,7))===Number(fm);
    var matchC=!fc||resolverCatGasto(g).cat===fc;
    return matchQ&&matchA&&matchM&&matchC;
  });
  f=f.slice().sort(function(a,b){
    var diff=new Date(b.fecha||0)-new Date(a.fecha||0);
    return diff!==0?diff:(b.id-a.id);
  });
  var totalFiltrado=f.reduce(function(s,g){return s+(Number(g.montoTotal)||0);},0);
  var totBox=document.getElementById("gastos-total");
  if(totBox){
    totBox.innerHTML='<div class="hero" style="background:linear-gradient(135deg,var(--purple),var(--teal));padding:16px 20px;margin-bottom:0"><div style="font-size:11px;font-weight:600;letter-spacing:1px;opacity:.85;margin-bottom:4px">TOTAL GASTOS '+(fa?fa:"TODOS LOS AÑOS")+(fm?" · "+MESES_CORTOS[Number(fm)-1]:"")+(fc?" · "+fc:"")+'</div><div style="font-family:\'Playfair Display\',serif;font-size:26px;font-weight:600">'+fmt(totalFiltrado)+'</div><div style="font-size:12px;opacity:.8;margin-top:2px">'+f.length+' registro(s)</div></div>';
  }
  var pg=pagSlice("gastos",f);
  document.getElementById("lst-g").innerHTML=(pg.items.length?pg.items.map(function(g){
    var compIcon=g.comprobante?(g.comprobante.indexOf("application/pdf")>=0?"📄":"🖼️"):"";
    var catRes=resolverCatGasto(g);
    return '<div class="card" onclick="cardEdit(event,\'gasto\','+g.id+')"><div class="crow">'+
      '<div style="width:38px;height:38px;border-radius:10px;background:rgba(155,127,212,.18);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">💸</div>'+
      '<div class="ci"><div class="cn" style="white-space:pre-line">'+esc(g.descripcion||"Sin descripción")+'</div><div class="cm"><span style="background:var(--light);padding:2px 8px;border-radius:10px">'+esc(catRes.cat)+' · '+esc(catRes.sub)+'</span><span>'+(g.fecha||"")+'</span><span>Cant: '+(g.cantidad||1)+'</span><span>P.Unit: '+fmt(g.precio||0)+'</span></div></div>'+
      '<div class="ca"><div class="amt" style="color:var(--purple)">'+fmt(g.montoTotal||0)+'</div>'+(compIcon?'<div class="sub" data-noedit style="cursor:pointer" onclick="viewComprobante('+g.id+')">'+compIcon+' Ver comprobante</div>':'<div class="sub" style="color:var(--gray)">Sin comprobante</div>')+'</div>'+
      '<div class="cact"><button class="ib" onclick="openForm(\'gasto\','+g.id+')">'+SVGe+'</button><button class="ib ibd" onclick="delGasto('+g.id+')">'+SVGt+'</button></div>'+
    '</div></div>';
  }).join(""):'<div class="empty"><div style="font-size:32px;margin-bottom:12px">💸</div>Sin gastos registrados</div>')+pagControlHTML("gastos",pg,"renderGastos");
}
var tmpComprobante="";
var CAT_GASTO=["Costo Ind.","Gasto"];
var SUBCAT_GASTO={"Costo Ind.":["Productos/Artículos","Servicios","Movilidad"],"Gasto":["Gastos Personales","Movilidad"]};
// Resuelve el par [categoria,subcategoria] a partir de un gasto, sea del formato
// nuevo (2 niveles) o de un registro antiguo que solo tenía una categoría plana.
function resolverCatGasto(g){
  if(!g) return {cat:"Costo Ind.",sub:"Productos/Artículos"};
  if(g.categoria==="Costo Ind."||g.categoria==="Gasto"){
    var sub=g.subcategoria||SUBCAT_GASTO[g.categoria][0];
    return {cat:g.categoria,sub:sub};
  }
  // Formato antiguo: la categoria ERA la subcategoria
  if(g.categoria==="Gastos Personales") return {cat:"Gasto",sub:"Gastos Personales"};
  if(g.categoria==="Movilidad") return {cat:"Costo Ind.",sub:"Movilidad"};
  if(g.categoria==="Servicios") return {cat:"Costo Ind.",sub:"Servicios"};
  if(g.categoria==="Productos/Artículos") return {cat:"Costo Ind.",sub:"Productos/Artículos"};
  return {cat:"Costo Ind.",sub:"Productos/Artículos"};
}
function updateSubcatGasto(subSelActual){
  var catEl=document.getElementById("f-gcat");
  var subEl=document.getElementById("f-gsubcat");
  if(!catEl||!subEl) return;
  var opts=SUBCAT_GASTO[catEl.value]||[];
  subEl.innerHTML=opts.map(function(s){return '<option'+(s===subSelActual?' selected':'')+'>'+s+'</option>';}).join("");
}
function fmGasto(id,body){
  var g=id?gastos.find(function(x){return x.id===id;}):null;
  tmpComprobante=g&&g.comprobante?g.comprobante:"";
  var isPdf=tmpComprobante&&tmpComprobante.indexOf("application/pdf")>=0;
  var resuelto=resolverCatGasto(g);
  var catSel=resuelto.cat;
  var subSel=resuelto.sub;
  body.innerHTML=
    '<div class="field"><label>Fecha</label><input id="f-gfecha" type="date" value="'+(g?g.fecha:today())+'"/></div>'+
    '<div class="field"><label>Categoría</label><select id="f-gcat" onchange="updateSubcatGasto()">'+CAT_GASTO.map(function(c){return '<option'+(catSel===c?' selected':'')+'>'+c+'</option>';}).join("")+'</select></div>'+
    '<div class="field"><label>SubCategoría</label><select id="f-gsubcat"></select></div>'+
    '<div class="field"><label>Descripción</label><textarea id="f-gdesc" rows="3" placeholder="Bolsas, pasajes, internet, etc.">'+esc(g?g.descripcion||"":"")+'</textarea></div>'+
    '<div class="frow">'+
      '<div class="field"><label>Cantidad</label><input id="f-gcant" type="number" min="0" step="any" value="'+(g?g.cantidad!=null?g.cantidad:1:1)+'" oninput="gastoCalc(\'cant\')"/></div>'+
      '<div class="field"><label>Precio (unitario)</label><input id="f-gprecio" type="number" min="0" step="any" value="'+(g?(g.precio!=null?g.precio:""):"")+'" placeholder="0.00" oninput="gastoCalc(\'precio\')"/></div>'+
    '</div>'+
    '<div class="field"><label>Monto Total</label><input id="f-gtotal" type="number" min="0" step="any" value="'+(g?(g.montoTotal!=null?g.montoTotal:""):"")+'" placeholder="0.00" oninput="gastoCalc(\'total\')"/></div>'+
    '<div class="field"><label>Comprobante de Compra (foto o PDF)</label>'+
      '<div class="pu">'+
        '<div class="pp" id="gcomp-prev" onclick="document.getElementById(\'gcomp-input\').click()">'+
          (tmpComprobante?(isPdf?'<span style="font-size:13px;font-weight:600;color:var(--gray)">📄 PDF</span>':'<img src="'+tmpComprobante+'"/>'):'<span style="font-size:28px;color:var(--gray)">📎</span>')+
        '</div>'+
        '<div>'+
          '<input type="file" id="gcomp-input" accept="image/*,application/pdf" style="display:none" onchange="handleComprobante(this)"/>'+
          '<button class="btn btn-g btn-sm" onclick="document.getElementById(\'gcomp-input\').click()">📎 Subir comprobante</button>'+
          '<div id="gcomp-msg" style="font-size:11px;color:var(--success);margin-top:6px">'+(tmpComprobante?"✓ Comprobante cargado":"")+'</div>'+
        '</div>'+
      '</div>'+
    '</div>'+
    '<div class="fftr"><button class="btn btn-s" onclick="closeForm()">Cancelar</button><button class="btn btn-p" onclick="saveGasto('+(id||"null")+')">✓ Guardar</button></div>';
  updateSubcatGasto(subSel);
}
// Cálculo bidireccional: Precio × Cantidad = Monto Total
function gastoCalc(origen){
  var cantEl=document.getElementById("f-gcant");
  var precioEl=document.getElementById("f-gprecio");
  var totalEl=document.getElementById("f-gtotal");
  if(!cantEl||!precioEl||!totalEl) return;
  var cant=Number(cantEl.value)||0;
  var precio=Number(precioEl.value)||0;
  var total=Number(totalEl.value)||0;
  if(origen==="total"){
    if(cant>0) precioEl.value=(total/cant).toFixed(2);
  } else {
    // origen es 'cant' o 'precio': recalculamos el total
    totalEl.value=(cant*precio).toFixed(2);
  }
}
function handleComprobante(inp){
  var file=inp.files&&inp.files[0];if(!file) return;
  var msg=document.getElementById("gcomp-msg");
  if(file.type==="application/pdf"){
    var reader=new FileReader();
    reader.onload=function(e){
      tmpComprobante=e.target.result;
      var prev=document.getElementById("gcomp-prev");
      if(prev) prev.innerHTML='<span style="font-size:13px;font-weight:600;color:var(--gray)">📄 PDF</span>';
      if(msg) msg.textContent="✓ PDF cargado";
    };
    reader.readAsDataURL(file);
  } else {
    if(msg) msg.textContent="Comprimiendo…";
    compress(file,800,0.8,function(data){
      tmpComprobante=data;
      var prev=document.getElementById("gcomp-prev");
      if(prev) prev.innerHTML='<img src="'+data+'" style="width:100%;height:100%;object-fit:cover"/>';
      if(msg) msg.textContent="✓ Imagen comprimida automáticamente";
    });
  }
}
function viewComprobante(id){
  var g=gastos.find(function(x){return x.id===id;});if(!g||!g.comprobante) return;
  document.getElementById("fotitle").textContent="Comprobante — "+(g.descripcion||"");
  var isPdf=g.comprobante.indexOf("application/pdf")>=0;
  document.getElementById("fobody").innerHTML=isPdf?
    '<iframe src="'+g.comprobante+'" style="width:100%;height:60vh;border:1px solid var(--light);border-radius:12px"></iframe>'
    :'<img src="'+g.comprobante+'" style="width:100%;border-radius:14px;display:block"/>';
  document.getElementById("fo").classList.add("open");
}
function saveGasto(id){
  var desc=document.getElementById("f-gdesc").value.trim();
  var cant=Number(document.getElementById("f-gcant").value)||0;
  var precio=Number(document.getElementById("f-gprecio").value)||0;
  var total=Number(document.getElementById("f-gtotal").value)||0;
  if(!desc){alert("Ingresa una descripción");return;}
  if(!total&&!precio){alert("Ingresa el precio o el monto total");return;}
  var obj={
    fecha:document.getElementById("f-gfecha").value||today(),
    categoria:document.getElementById("f-gcat").value,
    subcategoria:document.getElementById("f-gsubcat").value,
    descripcion:desc,
    cantidad:cant,
    precio:precio,
    montoTotal:total,
    comprobante:tmpComprobante
  };
  var isNew=!id;
  if(id){ obj.id=id; gastos=gastos.map(function(g){return g.id===id?Object.assign({},g,obj):g;}); }
  else{ obj.id=uid(); gastos.push(obj); }
  closeForm();renderGastos();updateNav();
  guardarGastoEnColeccion(obj,isNew);
}

function guardarGastoEnColeccion(obj,isNew){
  if(!db) return;
  db.collection("gastos").doc(String(obj.id)).set(obj,{merge:true}).catch(function(err){
    console.error("Error guardando gasto en Firestore:",err);
    setSyncStatus("error","Error al guardar gasto");
  });
}
function delGasto(id){confirm2("¿Eliminar este gasto?").then(function(ok){if(!ok) return;gastos=gastos.filter(function(g){return g.id!==id;});renderGastos();updateNav();if(db){db.collection("gastos").doc(String(id)).delete().catch(function(err){console.error("Error eliminando gasto:",err);setSyncStatus("error","Error al eliminar gasto");});}});}
// Exponemos las funciones al entorno global (Compras, Inventario y Gastos)
window.renderCompras = renderCompras;
window.regInv = regInv;
window.fmCompra = fmCompra;
window.ciCh = ciCh;
window.addCI = addCI;
window.rmCI = rmCI;
window.filterProdDropCompra = filterProdDropCompra;
window.selectProdCompra = selectProdCompra;
window.filterProvDrop = filterProvDrop;
window.selectProv = selectProv;
window.filterTipoDocDrop = filterTipoDocDrop;
window.selectTipoDoc = selectTipoDoc;
window.saveC = saveC;
window.viewCompra = viewCompra;
window.delC = delC;
window.guardarCompraEnColeccion = guardarCompraEnColeccion;

window.renderInv = renderInv;
window.renderInvCur = renderInvCur;
window.delInv = delInv;
window.delInvEntry = delInvEntry;

window.renderGastos = renderGastos;
window.updateSubcatGasto = updateSubcatGasto;
window.fmGasto = fmGasto;
window.gastoCalc = gastoCalc;
window.handleComprobante = handleComprobante;
window.viewComprobante = viewComprobante;
window.saveGasto = saveGasto;
window.delGasto = delGasto;
window.guardarGastoEnColeccion = guardarGastoEnColeccion;
window.MESES_CORTOS = MESES_CORTOS;
window.resolverCatGasto = resolverCatGasto;