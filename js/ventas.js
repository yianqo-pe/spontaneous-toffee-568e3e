// FORM: VENTA (with searchable cliente)
function fmVenta(id,body){
  var d=id?detalles.find(function(x){return x.id===id;}):null;
  var selC=d&&d.clienteId?cById(d.clienteId):null;
  var selVal=selC?selC.nombre+(selC.nick?" ("+selC.nick+")":""):"";
  var cats=["Ropa Dama","Accesorios","Calzado","Bolsos Carteras","Maquillaje y Salud","Tecnología","Ropa Interior y Lencería","Otro"];
  var cans=["TikTok Live","Instagram Live","Instagram Story","TikTok","WhatsApp","Presencial","Otro"];
  body.innerHTML=
    '<div class="field"><label>Clienta *</label><div class="sdr"><input type="text" id="cv-search" placeholder="Buscar por nombre o @nick…" value="'+esc(selVal)+'" autocomplete="off" oninput="filterDrop(\'cv-search\',\'cv-drop\',\'selectCV\')" onfocus="filterDrop(\'cv-search\',\'cv-drop\',\'selectCV\')"/><input type="hidden" id="cv-id" value="'+(d&&d.clienteId?d.clienteId:"")+'" /><div class="sdrd" id="cv-drop"></div></div></div>'+
    '<div class="frow"><div class="field"><label>Fecha</label><input id="f-fecha" type="date" value="'+(d?d.fecha:today())+'"/></div><div class="field"><label>Canal</label><select id="f-canal">'+cans.map(function(c){return '<option'+((d&&d.canal===c||(!d&&c==="TikTok Live"))?' selected':'')+'>'+c+'</option>';}).join("")+'</select></div></div>'+
    '<div class="field"><label>Código QR</label><div style="display:flex;gap:8px"><input id="f-qr" type="text" value="'+esc(d&&d.codigoQR||"")+'" placeholder="Código QR" style="flex:1"/><button class="btn btn-p btn-sm" onclick="simQR()">🔲 Escanear</button><input type="file" id="qrphotoinput" accept="image/*" capture="environment" style="display:none" onchange="handleQRPhoto(this)"/><button class="btn btn-g btn-sm" onclick="document.getElementById(\'qrphotoinput\').click()" title="Tomar foto del QR">📷</button></div></div>'+
    '<input type="hidden" id="f-prodid" value="'+esc(d&&d.productoId||"")+'"/>'+
    '<div class="field"><label>O selecciona un producto disponible</label><div class="sdr"><input type="text" id="pv-search" placeholder="Buscar producto disponible…" autocomplete="off" oninput="filterProdDrop(this.value)" onfocus="filterProdDrop(this.value)"/><div class="sdrd" id="pv-drop"></div></div></div>'+
    '<div class="field"><label>Producto *</label><input id="f-prod" type="text" value="'+esc(d&&d.producto||"")+'" placeholder="Blusa floral manga larga" oninput="document.getElementById(\'f-prodid\').value=\'\'"/></div>'+
    '<div class="frow"><div class="field"><label>Categoría</label><select id="f-cat">'+cats.map(function(c){return '<option'+((d&&d.categoria===c||(!d&&c==="Ropa Dama"))?' selected':'')+'>'+c+'</option>';}).join("")+'</select></div><div class="field"><label>Talla</label><input id="f-talla" type="text" value="'+esc(d&&d.talla||"")+'" placeholder="S, M, L…"/></div></div>'+
    '<div class="frow"><div class="field"><label>Color</label><input id="f-color" type="text" value="'+esc(d&&d.color||"")+'" placeholder="Blanco…"/></div><div class="field"><label>Cantidad</label><input id="f-cant" type="number" min="1" value="'+(d?d.cantidad:1)+'" oninput="updSubV(\'cant\')"/></div></div>'+
    '<div class="frow"><div class="field"><label>Precio unitario (S/)</label><input id="f-precio" type="number" step="any" value="'+(d && d.precio != null ? d.precio : "")+'" placeholder="85.00" oninput="updSubV(\'precio\')"/></div><div class="field"><label>Subtotal (S/)</label><input id="f-subtotal" type="number" step="any" value="'+(d && d.precio != null ? Number((d.precio*d.cantidad).toFixed(2)) : "")+'" placeholder="0" oninput="updSubV(\'subtotal\')"/></div></div>'+
    '<div class="field"><label>Descripción</label><textarea id="f-vdesc" rows="2" placeholder="Detalles adicionales del producto vendido…">'+esc(d&&d.descripcion||"")+'</textarea></div>'+
    '<div class="field"><label>Nota</label><textarea id="f-vnota" rows="2" placeholder="Observaciones de la venta…">'+esc(d&&d.nota||"")+'</textarea></div>'+
    '<div class="field"><label>Estado de pago</label>'+
'<input type="hidden" id="f-estpago" value="'+((d&&d.estadoPago)||"Pendiente de Pago")+'"/>'+
'<div style="display:flex;gap:8px;flex-wrap:wrap">'+
epBtnHTML("Pendiente de Pago",(d&&d.estadoPago)||"Pendiente de Pago")+
epBtnHTML("Pagado",(d&&d.estadoPago)||"Pendiente de Pago")+
'</div>'+
'</div>'+
    '<div class="field"><label>Estado (orden de venta)</label><select id="f-estov"><option value="Sin_OV"'+((!d||d.estado==="Sin_OV")?' selected':'')+'>Sin_OV — Sin orden asignada</option><option value="Con_OV"'+(d&&d.estado==="Con_OV"?' selected':'')+'>Con_OV — Con orden asignada</option></select><div style="font-size:11px;color:var(--gray);margin-top:4px">⚠️ Cambiar esto manualmente no crea ni elimina una orden real — solo corrige la etiqueta si quedó desincronizada.</div></div>'+
    '<div class="stbox" id="stv" style="display:none"></div>'+
    '<div class="fftr"><button class="btn btn-s" onclick="closeForm()">Cancelar</button><button class="btn btn-p" onclick="saveV('+(id||"null")+')">✓ Guardar</button></div>';
  updSubV();
}
// Cálculo bidireccional Precio Unitario ↔ Subtotal.
// source indica qué campo disparó el cambio, para saber cuál recalcular:
// - "precio" o "cant" -> recalcula Subtotal = Precio × Cantidad
// - "subtotal" -> recalcula Precio = Subtotal ÷ Cantidad (Cantidad se mantiene fija)
function updSubV(source){
  var pEl=document.getElementById("f-precio");
  var cEl=document.getElementById("f-cant");
  var sEl=document.getElementById("f-subtotal");
  if(!pEl||!cEl||!sEl) return;
  var p=Number(pEl.value)||0;
  var c=Number(cEl.value)||0;
  var s=Number(sEl.value)||0;
  if(source==="subtotal"){
    if(c>0) pEl.value=Number((s/c).toFixed(4));
  } else {
    sEl.value=(p&&c)?Number((p*c).toFixed(2)):"";
  }
  var el=document.getElementById("stv");
  if(el){el.style.display="none";}
}
function simQR(){
  openScanner(function(code){
    document.getElementById("f-qr").value=code;
    var prod=productos.find(function(p){return p.codigoQR===code;});
    if(prod){
      document.getElementById("f-prod").value=prod.nombre;
      document.getElementById("f-prodid").value=prod.id;
      document.getElementById("f-cat").value=prod.categoria;
      document.getElementById("f-precio").value=prod.precioVenta;
      updSubV();
      flashScanMsg("✓ "+prod.nombre+" — autocompletado");
    } else {
      document.getElementById("f-prodid").value="";
      flashScanMsg("Código leído: "+code+" (no está en el catálogo)");
    }
  });
}
function filterProdDrop(q){
  var dd=document.getElementById("pv-drop");
  if(!dd) return;
  var qq=(q||"").toLowerCase();
  var disponibles=productos.filter(function(p){return estProd(p.stock)==="Disponible";});
  var list=disponibles.filter(function(p){
    return !qq||p.nombre.toLowerCase().indexOf(qq)>=0||(p.codigoQR||"").toLowerCase().indexOf(qq)>=0||(p.categoria||"").toLowerCase().indexOf(qq)>=0;
  });
  if(!list.length){
    dd.classList.add("open");
    dd.innerHTML='<div style="padding:12px 14px;font-size:13px;color:var(--gray)">Sin productos disponibles</div>';
    return;
  }
  dd.classList.add("open");
  dd.innerHTML=list.map(function(p){
    return '<div class="sdri" onclick="selectProdVenta('+p.id+')">'+
      '<div class="sdrav" style="border-radius:10px;background:'+(p.foto?'url('+encodeURI(p.foto)+') center/cover':'linear-gradient(135deg,#F2C4CE,#E8C9A0)')+'">'+(p.foto?'':catE(p.categoria))+'</div>'+
      '<div style="flex:1;min-width:0">'+
        '<div style="font-size:14px;font-weight:500">'+esc(p.nombre)+'</div>'+
        '<div style="font-size:11px;display:flex;gap:6px;flex-wrap:wrap"><span style="color:var(--success);font-weight:600">● Disponible</span><span style="color:var(--gray)">Stock: '+p.stock+'</span><span style="color:var(--pink);font-weight:600">'+fmt(p.precioVenta)+'</span></div>'+
      '</div>'+
    '</div>';
  }).join("");
}
function selectProdVenta(id){
  var p=pById(id);if(!p) return;
  document.getElementById("f-qr").value=p.codigoQR||"";
  document.getElementById("f-prod").value=p.nombre;
  document.getElementById("f-prodid").value=p.id;
  document.getElementById("f-cat").value=p.categoria;
  document.getElementById("f-precio").value=p.precioVenta;
  var search=document.getElementById("pv-search");
  if(search) search.value=p.nombre;
  var dd=document.getElementById("pv-drop");
  if(dd) dd.classList.remove("open");
  updSubV();
  flashScanMsg("✓ "+p.nombre+" — autocompletado");
}
document.addEventListener("click",function(e){
  var dd=document.getElementById("pv-drop");
  var inp=document.getElementById("pv-search");
  if(dd&&inp&&!dd.contains(e.target)&&e.target!==inp) dd.classList.remove("open");
});
// Función principal para GUARDAR LA VENTA
// ==========================================
// FUNCIÓN saveV — usa una transacción de Firestore (runTransaction)
// para que la lectura del stock, su descuento y el registro de la
// venta ocurran de forma atómica. Esto corrige el hallazgo D1 del
// informe técnico: si dos dispositivos venden el mismo producto casi
// al mismo tiempo, Firestore ahora procesa una transacción primero,
// vuelve a leer el stock real y recién después aplica la segunda,
// en vez de que la segunda escritura pise a la primera en silencio.
// ==========================================
function saveV(id){
  var cid=Number(document.getElementById("cv-id").value);
  var prod=document.getElementById("f-prod").value.trim();

  // Capturamos el precio como texto para permitir "0"
  var precioInput = document.getElementById("f-precio").value.trim();
  var precio = Number(precioInput);

  if(!cid){alert("Selecciona una clienta");return;}
  if(!prod){alert("El producto es requerido");return;}
  if(precioInput === "" || isNaN(precio)){alert("Ingresa un precio válido (puede ser 0)");return;}
  if(!window.db){alert("No hay conexión con la base de datos.");return;}

  var nuevoProdId=Number(document.getElementById("f-prodid").value)||null;
  var nuevaCant=Number(document.getElementById("f-cant").value)||1;
  var obj={
    id:id||window.uid(),
    clienteId:cid,
    fecha:document.getElementById("f-fecha").value,
    codigoQR:document.getElementById("f-qr").value,
    producto:prod,
    productoId:nuevoProdId,
    categoria:document.getElementById("f-cat").value,
    talla:document.getElementById("f-talla").value,
    color:document.getElementById("f-color").value,
    cantidad:nuevaCant,
    precio:precio,
    canal:document.getElementById("f-canal").value,
    estado:document.getElementById("f-estov").value,
    estadoPago:document.getElementById("f-estpago").value,
    descripcion:document.getElementById("f-vdesc").value,
    nota:document.getElementById("f-vnota").value
  };

  var anterior=id ? window.detalles.find(function(d){return d.id===id;}) : null;
  var oldProdId=anterior&&anterior.productoId?anterior.productoId:null;
  var oldCant=anterior?(Number(anterior.cantidad)||0):0;

  // Deshabilitamos el botón mientras se confirma la transacción, para
  // evitar un doble clic que cree dos ventas mientras se espera la red.
  var btn=document.querySelector(".fftr .btn-p");
  if(btn){btn.disabled=true;btn.textContent="Guardando…";}

  window.db.runTransaction(function(transaction){
    var oldRef=oldProdId?window.db.collection("productos").doc(String(oldProdId)):null;
    var newRef=nuevoProdId?window.db.collection("productos").doc(String(nuevoProdId)):null;
    var sameProd=!!(oldRef&&newRef&&oldRef.isEqual(newRef));

    // 1) TODAS las lecturas primero: Firestore exige que un runTransaction
    //    haga sus transaction.get() antes de cualquier transaction.set/update.
    var getOld=oldRef?transaction.get(oldRef):Promise.resolve(null);
    var getNew=(newRef&&!sameProd)?transaction.get(newRef):Promise.resolve(null);

    return Promise.all([getOld,getNew]).then(function(snaps){
      var oldSnap=snaps[0], newSnap=snaps[1];
      var stockUpdates={}; // productoId -> {ref, stock, estadoProducto}

      if(sameProd){
        // Se edita una venta sin cambiar de producto: se devuelve la
        // cantidad anterior y se descuenta la nueva en un solo paso,
        // sobre el stock más reciente que exista en Firestore ahora mismo.
        if(oldSnap&&oldSnap.exists){
          var d=oldSnap.data();
          var s=Math.max(0,(Number(d.stock)||0)+oldCant-nuevaCant);
          stockUpdates[nuevoProdId]={ref:newRef,stock:s,estadoProducto:window.estProd(s)};
        }
      } else {
        if(oldRef&&oldSnap&&oldSnap.exists){
          var od=oldSnap.data();
          var os=(Number(od.stock)||0)+oldCant;
          stockUpdates[oldProdId]={ref:oldRef,stock:os,estadoProducto:window.estProd(os)};
        }
        if(newRef&&newSnap&&newSnap.exists){
          var nd=newSnap.data();
          var ns=Math.max(0,(Number(nd.stock)||0)-nuevaCant);
          stockUpdates[nuevoProdId]={ref:newRef,stock:ns,estadoProducto:window.estProd(ns)};
        }
      }

      // 2) Recién ahora las escrituras, todas dentro de la misma transacción.
      Object.keys(stockUpdates).forEach(function(pid){
        var u=stockUpdates[pid];
        transaction.update(u.ref,{stock:u.stock,estadoProducto:u.estadoProducto});
      });
      transaction.set(window.db.collection("detalles").doc(String(obj.id)),obj,{merge:true});

      return stockUpdates;
    });
  }).then(function(stockUpdates){
    // La transacción ya se confirmó en Firestore (con reintentos automáticos
    // si hubo conflicto): recién aquí actualizamos el estado local y la pantalla.
    Object.keys(stockUpdates||{}).forEach(function(pid){
      window.productos=window.productos.map(function(p){
        return String(p.id)===String(pid)?Object.assign({},p,{stock:stockUpdates[pid].stock,estadoProducto:stockUpdates[pid].estadoProducto}):p;
      });
    });
    if(id){
      window.detalles=window.detalles.map(function(d){return d.id===id?Object.assign({},d,obj):d;});
    } else {
      window.detalles.push(obj);
    }
    window.closeForm();
    if(window.renderVentas) window.renderVentas();
    if(window.renderProductosCur) window.renderProductosCur();
    if(window.updateNav) window.updateNav();
  }).catch(function(error){
    console.error("Error al guardar venta:", error);
    alert("Ocurrió un problema al guardar: " + error.message);
  }).finally(function(){
    if(btn){btn.disabled=false;btn.textContent="✓ Guardar";}
  });
}
function guardarDetalleEnColeccion(obj){
  if(!db||!obj) return;
  db.collection("detalles").doc(String(obj.id)).set(obj,{merge:true}).catch(function(err){
    console.error("Error guardando venta en Firestore:",err);
    setSyncStatus("error","Error al guardar venta");
  });
}

function renderVentas(){
  var q=(document.getElementById("src-v")?document.getElementById("src-v").value:"").toLowerCase();
  var fe=document.getElementById("fv-est")?document.getElementById("fv-est").value:"";
  var fc=document.getElementById("fv-can")?document.getElementById("fv-can").value:"";
  var fp=document.getElementById("fv-pago")?document.getElementById("fv-pago").value:"";
  var f=detalles.filter(function(d){
    var c=cById(d.clienteId);
    return(d.producto.toLowerCase().indexOf(q)>=0||(c&&c.nombre.toLowerCase().indexOf(q)>=0)||(c&&(c.nick||"").toLowerCase().indexOf(q)>=0)||(d.codigoQR||"").toLowerCase().indexOf(q)>=0)&&(!fe||d.estado===fe)&&(!fc||d.canal===fc)&&(!fp||(d.estadoPago||"Pendiente de Pago")===fp);
  });
  f=f.slice().sort(function(a,b){
    var diff=new Date(b.fecha||0)-new Date(a.fecha||0);
    return diff!==0?diff:(b.id-a.id);
  });
  var pg=pagSlice("ventas",f);
  document.getElementById("lst-v").innerHTML=(pg.items.length?pg.items.map(function(d){
    var c=cById(d.clienteId);
    var sc=c&&c.redSocial==="TikTok"?"#010101":"#C13584";
    return '<div class="card" onclick="cardEdit(event,\'venta\','+d.id+')"><div class="crow"><div style="width:38px;height:38px;border-radius:10px;background:rgba(242,196,206,.4);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">'+catE(d.categoria)+'</div><div class="ci">'+
      '<div class="cn">'+(c&&c.nick?'<span style="color:'+sc+'">'+esc(c.nick)+'</span>':'<span style="color:var(--gray);font-weight:400">Sin nick</span>')+' <span style="font-size:11px;font-weight:600;color:var(--gray)">· '+fechaCorta(d.fecha)+'</span></div>'+
      '<div class="cm"><span>📞 '+esc(c&&c.telefono||"—")+'</span></div>'+
      '<div class="cm" style="margin-top:4px;font-size:13px;color:var(--dark);font-weight:600">'+esc(d.producto)+'</div>'+
      '<div class="cm">'+(d.talla?'<span>Talla: '+esc(d.talla)+'</span>':"")+(d.color?'<span>'+(d.talla?" | ":"")+'Color: '+esc(d.color)+'</span>':"")+'</div>'+
      '<div class="cm"><span style="background:var(--light);padding:2px 8px;border-radius:10px">'+esc(d.canal)+'</span></div>'+
    '</div><div class="ca" style="flex-shrink:0;max-width:118px"><div class="sub" style="font-size:10px;color:var(--gray)">Cantidad</div><div class="amt" style="margin-bottom:6px">'+d.cantidad+'</div><div class="sub" style="font-size:10px;color:var(--gray)">Subtotal</div><div class="amt">'+fmt(d.precio*d.cantidad)+'</div><div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end">'+bdg(d.estado)+epBadgeHTML((d.estadoPago||"Pendiente de Pago"), d.id)+'</div></div><div class="cact"><button class="ib" onclick="openForm(\'venta\','+d.id+')">'+SVGe+'</button><button class="ib ibd" onclick="delV('+d.id+')">'+SVGt+'</button></div></div></div>';
  }).join(""):'<div class="empty"><div style="font-size:32px;margin-bottom:12px">🛍️</div>Sin ventas encontradas</div>')+pagControlHTML("ventas",pg,"renderVentas");
}
function delV(id){confirm2("¿Eliminar esta venta?").then(function(ok){
  if(!ok) return;
  var d=detalles.find(function(x){return x.id===id;});
  if(d&&d.productoId){
    var p=pById(d.productoId);
    if(p){
      p.stock=(Number(p.stock)||0)+(Number(d.cantidad)||0);
      p.estadoProducto=estProd(p.stock);
      productos=productos.map(function(x){return x.id===p.id?p:x;});
      guardarProductoEnColeccion(p,false);
      renderProductosCur();
    }
  }
  
  detalles=detalles.filter(function(x){return x.id!==id;});
  renderVentas();updateNav();
  if(db){db.collection("detalles").doc(String(id)).delete().catch(function(err){console.error("Error eliminando venta:",err);setSyncStatus("error","Error al eliminar venta");});}
});
}

// ════════════════════════════════════════════════════════════════════════
// ESTADO DE PAGO — botones toggle en el formulario + badge clickeable
// ════════════════════════════════════════════════════════════════════════
var EP_COLOR = { "Pendiente de Pago": "#B8860B", "Pagado": "#2E7D32" };
var EP_ICON  = { "Pendiente de Pago": "⏳ ",      "Pagado": "✓ " };

function epBtnHTML(val, estadoActual){
  var c = EP_COLOR[val];
  var active = (estadoActual === val);
  var st = "background:" + (active ? c : "transparent") +
           ";color:" + (active ? "#fff" : c) +
           ";border:1px solid " + c +
           ";border-radius:8px;padding:7px 14px;font-size:13px;font-weight:600;" +
           "cursor:pointer;transition:all .15s;line-height:1.2";
  return '<button type="button" data-estpago="' + val + '" ' +
         'onclick="selectEstadoPagoBtn(\'' + val + '\')" style="' + st + '">' +
         EP_ICON[val] + val + '</button>';
}

function epBadgeHTML(estado, id){
  var c = EP_COLOR[estado] || EP_COLOR["Pendiente de Pago"];
  var bg = (estado === "Pagado") ? "#D4EDDA" : "#FFF3CD";
  return '<span class="ep-badge" data-noedit onclick="event.stopPropagation(); toggleEstadoPago(' + id + ',this)" ' +
         'title="Clic para alternar estado de pago" style="' +
         'background:' + bg + ';color:' + c + ';border-radius:8px;padding:3px 10px;' +
         'font-size:11px;font-weight:600;cursor:pointer;user-select:none;' +
         'transition:all .15s;white-space:nowrap">' + estado + '</span>';
}

function selectEstadoPagoBtn(val){
  var hidden = document.getElementById("f-estpago");
  if (hidden) hidden.value = val;
  var btns = document.querySelectorAll('[data-estpago]');
  for (var i = 0; i < btns.length; i++){
    var b = btns[i];
    var p = b.getAttribute("data-estpago");
    var c = EP_COLOR[p];
    var active = (p === val);
    b.style.background = active ? c : "transparent";
    b.style.color = active ? "#fff" : c;
    b.style.borderColor = c;
  }
}

function toggleEstadoPago(id, el){
  var d = detalles.find(function(x){ return x.id === id; });
  if (!d) return;
  var actual = d.estadoPago || "Pendiente de Pago";
  var nuevo = (actual === "Pagado") ? "Pendiente de Pago" : "Pagado";
  d.estadoPago = nuevo;
  detalles = detalles.map(function(x){
    return x.id === id ? Object.assign({}, x, { estadoPago: nuevo }) : x;
  });
  if (typeof guardarDetalleEnColeccion === "function"){
    guardarDetalleEnColeccion(d);
  }
  if (el){
    el.outerHTML = epBadgeHTML(nuevo, id);
  }
  if (typeof flashScanMsg === "function"){
    flashScanMsg(nuevo === "Pagado"
      ? "✓ Venta marcada como Pagada"
      : "⏳ Venta marcada como Pendiente de Pago");
  }
}

// ── Exposiciones globales (las originales + las 4 nuevas) ──
window.fmVenta = fmVenta;
window.updSubV = updSubV;
window.simQR = simQR;
window.filterProdDrop = filterProdDrop;
window.selectProdVenta = selectProdVenta;
window.saveV = saveV;
window.guardarDetalleEnColeccion = guardarDetalleEnColeccion;
window.renderVentas = renderVentas;
window.delV = delV;
window.epBtnHTML = epBtnHTML;
window.epBadgeHTML = epBadgeHTML;
window.selectEstadoPagoBtn = selectEstadoPagoBtn;
window.toggleEstadoPago = toggleEstadoPago;