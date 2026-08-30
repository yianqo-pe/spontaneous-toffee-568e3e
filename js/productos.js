// PRODUCTOS
function renderProductos(q){
  q=q||"";
  var selProv=document.getElementById("flt-p-prov");
  if(selProv&&selProv.options.length<=1){
    var nombresProv=proveedores.slice().sort(function(a,b){return a.empresa.localeCompare(b.empresa);}).map(function(pr){return pr.empresa;});
    selProv.innerHTML='<option value="">Todos los proveedores</option>'+nombresProv.map(function(n){return '<option>'+esc(n)+'</option>';}).join("");
  }
  var f=productos.filter(function(p){return p.nombre.toLowerCase().indexOf(q.toLowerCase())>=0||(p.codigoQR||"").toLowerCase().indexOf(q.toLowerCase())>=0||(p.proveedor||"").toLowerCase().indexOf(q.toLowerCase())>=0;});
  var estFiltro=document.getElementById("flt-p-estado")?document.getElementById("flt-p-estado").value:"";
  if(estFiltro){ f=f.filter(function(p){return estProd(p.stock)===estFiltro;}); }
  var catFiltro=document.getElementById("flt-p-cat")?document.getElementById("flt-p-cat").value:"";
  if(catFiltro){ f=f.filter(function(p){return p.categoria===catFiltro;}); }
  var provFiltro=document.getElementById("flt-p-prov")?document.getElementById("flt-p-prov").value:"";
  if(provFiltro){ f=f.filter(function(p){return p.proveedor===provFiltro;}); }
  var orden=document.getElementById("flt-p-orden")?document.getElementById("flt-p-orden").value:"recientes";
  f=f.slice().sort(function(a,b){return orden==="antiguos"?a.id-b.id:b.id-a.id;});
  var pg=pagSlice("productos",f);
  document.getElementById("lst-p").innerHTML=pg.items.length?pg.items.map(function(p){
    var est=estProd(p.stock);
    var estColor=estProdColor(p.stock);
    var thumbBg=p.foto?'background-image:url('+encodeURI(p.foto)+');background-size:contain;background-repeat:no-repeat;background-position:center;background-color:#FAF7F4':'background:linear-gradient(135deg,rgba(242,196,206,.4),rgba(232,201,160,.4))';
    return '<div class="pc" onclick="cardEdit(event,\'producto\','+p.id+')">'+
      '<div class="pi" data-noedit style="'+thumbBg+'" onclick="viewProductPhoto('+p.id+')" title="Ver imagen completa">'+
        (p.foto?'':'<span style="font-size:44px">'+catE(p.categoria)+'</span>')+
        '<div style="position:absolute;top:9px;right:9px;display:flex;align-items:center;gap:6px">'+(p.qrImagen?'<img src="'+p.qrImagen+'" style="width:30px;height:30px;border-radius:4px;background:#fff;padding:2px"/>':'')+'</div>'+
        '<div style="position:absolute;bottom:9px;left:9px">'+bdg(p.categoria)+'</div>'+
      '</div>'+
      '<div class="pb">'+
        '<div style="font-size:15px;font-weight:600;margin-bottom:8px">'+esc(p.nombre)+(p.nota?' <span title="'+esc(p.nota)+'" style="cursor:help;font-size:12px">📝</span>':'')+'</div>'+
        (p.descripcion?'<div style="font-size:12px;color:var(--gray);margin-bottom:8px;line-height:1.4">'+esc(p.descripcion)+'</div>':'')+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
          '<span style="font-size:12px;background:'+(p.stock>0?'rgba(123,196,160,.2)':'#FFF0F0')+';color:'+(p.stock>0?'var(--success)':'var(--danger)')+';padding:3px 9px;border-radius:10px;font-weight:600">Stock: '+p.stock+' uds</span>'+
          '<span style="font-size:12px;font-weight:700;color:'+estColor+'">● '+est+'</span>'+
        '</div>'+
        '<div style="background:rgba(217,136,154,.12);border-radius:8px;padding:8px 12px;text-align:center;margin-bottom:9px">'+
          '<div style="font-size:10px;color:var(--gray);margin-bottom:2px">PRECIO VENTA</div>'+
          '<div style="font-size:16px;font-weight:700;color:var(--pink)">'+fmt(p.precioVenta)+'</div>'+
        '</div>'+
        '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--gray);margin-bottom:12px">'+
          '<span>'+esc(p.categoria)+'</span>'+
          '<span>🏪 '+esc(p.proveedor||"Sin proveedor")+'</span>'+
        '</div>'+
        '<div style="display:flex;gap:6px">'+
          '<button class="btn btn-g btn-sm" style="flex:1;justify-content:center" onclick="descargarEtiquetaPDF('+p.id+')">⬇ PDF</button>'+
          '<button class="ib" onclick="openForm(\'producto\','+p.id+')">'+SVGe+'</button>'+
          '<button class="ib ibd" onclick="delP('+p.id+')">'+SVGt+'</button>'+
        '</div>'+
      '</div>'+
    '</div>';
  }).join(""):'<div class="empty" style="grid-column:1/-1"><div style="font-size:32px;margin-bottom:12px">🏷️</div>Sin productos</div>';
  document.getElementById("lst-p-pag").innerHTML=pagControlHTML("productos",pg,"renderProductosCur");
  document.getElementById("lst-p-pag-top").innerHTML=pagControlHTML("productos",pg,"renderProductosCur");
}
function renderProductosCur(){ renderProductos(document.getElementById("src-p")?document.getElementById("src-p").value:""); }

// Ver foto del producto en grande
function viewProductPhoto(id){
  var p=pById(id);if(!p) return;
  document.getElementById("fotitle").textContent=p.nombre;
  var img=p.foto?'<img src="'+p.foto+'" style="width:100%;border-radius:14px;display:block"/>':'<div style="width:100%;height:220px;border-radius:14px;background:linear-gradient(135deg,rgba(242,196,206,.4),rgba(232,201,160,.4));display:flex;align-items:center;justify-content:center;font-size:64px">'+catE(p.categoria)+'</div>';
  document.getElementById("fobody").innerHTML=
    img+
    '<div style="margin-top:16px;display:flex;justify-content:space-between;align-items:center">'+
      '<span style="font-size:13px;color:var(--gray)">'+esc(p.categoria)+' · 🏪 '+esc(p.proveedor||"Sin proveedor")+'</span>'+
      '<span style="font-size:12px;font-weight:700;color:'+estProdColor(p.stock)+'">● '+estProd(p.stock)+'</span>'+
    '</div>';
  document.getElementById("fo").classList.add("open");
}
function descargarEtiquetaPDF(id){
  var p=pById(id);if(!p){return;}
  if(!p.qrImagen){ flashScanMsg("Este producto no tiene código QR generado."); return; }

  // Generamos un PDF muy simple (una página, tamaño etiqueta) usando un canvas
  // convertido a imagen embebida en un PDF mínimo válido (sin librerías externas).
  // Etiqueta horizontal 7.94 x 5 cm (≈300 x 189 px a 96dpi). QR 2.5cm (≈95px) a la
  // izquierda, texto a la derecha (nombre hasta 3 líneas).
  var labelW=300,labelH=189;
  var cv=document.createElement("canvas");
  cv.width=labelW;cv.height=labelH;
  var ctx=cv.getContext("2d");
  ctx.fillStyle="#ffffff";ctx.fillRect(0,0,labelW,labelH);
  ctx.fillStyle="#000000";
  ctx.textAlign="left";

  var qrImgEl=new Image();
  qrImgEl.onload=function(){
    var qrSize=95; // 2.5 cm a 96dpi
    var qrX=16,qrY=(labelH-qrSize)/2;
    ctx.drawImage(qrImgEl,qrX,qrY,qrSize,qrSize);

    var textX=qrX+qrSize+16;
    var maxW=labelW-16-textX;

    ctx.font="bold 15px Arial";
    var nombreLines=wrapTextLines(ctx,p.nombre,maxW,3);

    var lineHCodigo=14,gap1=5,lineHNombre=18,gap2=7,lineHVenta=20,gap3=5,lineHCosto=14;
    var totalH=lineHCodigo+gap1+nombreLines.length*lineHNombre+gap2+lineHVenta+gap3+lineHCosto;
    var y=(labelH-totalH)/2;

    ctx.font="bold 12px Arial";
    ctx.fillStyle="#000000";
    y+=lineHCodigo;
    ctx.fillText(p.codigoQR||"",textX,y);

    y+=gap1;
    ctx.font="bold 15px Arial";
    nombreLines.forEach(function(line){
      y+=lineHNombre;
      ctx.fillText(line,textX,y);
    });

    y+=gap2;
    ctx.font="bold 17px Arial";
    y+=lineHVenta;
    ctx.fillText("Venta: "+fmt(p.precioVenta),textX,y);

    y+=gap3;
    ctx.font="12px Arial";
    ctx.fillStyle="#555555";
    y+=lineHCosto;
    ctx.fillText("Costo: "+fmt(p.precioCompra||0),textX,y);
    ctx.fillStyle="#000000";

    var imgData=cv.toDataURL("image/jpeg",0.92);
    var pdfBlob=buildSimplePDF(imgData,labelW,labelH);
    var url=URL.createObjectURL(pdfBlob);
    var a=document.createElement("a");
    a.href=url;
    a.download="Etiqueta-"+(p.codigoQR||p.id)+".pdf";
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); },1000);
  };
  qrImgEl.src=p.qrImagen;
}
// Construye una tabla con scroll vertical (si hay muchas filas) y horizontal
// (para ver todas las columnas en pantallas angostas). Usada en el historial
// de Ventas y de Compras/Inventario dentro de "Editar Producto".
function histTableHTML(headers,rows){
  if(!rows.length) return '<div style="font-size:12px;color:var(--gray);padding:10px 2px">Sin movimientos registrados.</div>';
  var thead='<tr>'+headers.map(function(h){return '<th style="text-align:left;padding:7px 10px;font-size:11px;color:var(--gray);border-bottom:1.5px solid var(--light);white-space:nowrap;position:sticky;top:0;background:#fff">'+h+'</th>';}).join("")+'</tr>';
  var tbody=rows.map(function(r){return '<tr>'+r.map(function(c){return '<td style="padding:7px 10px;font-size:12px;white-space:nowrap;border-bottom:1px solid var(--light)">'+c+'</td>';}).join("")+'</tr>';}).join("");
  return '<div style="max-height:220px;overflow-y:auto;overflow-x:auto;border:1px solid var(--light);border-radius:8px"><table style="border-collapse:collapse;width:100%;min-width:580px"><thead>'+thead+'</thead><tbody>'+tbody+'</tbody></table></div>';
}
// Filas del historial de ventas de un producto (requiere que la venta tenga
// productoId vinculado — ventas con el producto escrito solo como texto libre
// no aparecerán aquí).
function ventasHistRows(pid){
  return detalles.filter(function(d){return d.productoId===pid;})
    .slice().sort(function(a,b){return new Date(b.fecha||0)-new Date(a.fecha||0);})
    .map(function(d){
      var subtotal=(Number(d.precio)||0)*(Number(d.cantidad)||0);
      var c=cById(d.clienteId);
      return [fechaCorta(d.fecha),esc(c?c.nick||"—":"—"),d.cantidad,fmt(d.precio),fmt(subtotal),esc(d.estadoPago||"Pendiente de Pago"),esc(d.estado==="Con_OV"?"Con_OV":"Sin_OV")];
    });
}
// Filas del historial de compras/inventario de un producto, tomadas de las
// líneas de cada compra (compras.items) que referencian este productoId.
function comprasHistRows(pid){
  var rows=[];
  compras.forEach(function(c){
    (c.items||[]).forEach(function(it){
      if(it.productoId===pid){
        rows.push({fecha:c.fecha,cant:it.cantidad,costo:it.precioUnit,proveedor:c.proveedor,numDoc:c.numDoc});
      }
    });
  });
  rows.sort(function(a,b){return new Date(b.fecha||0)-new Date(a.fecha||0);});
  return rows.map(function(r){
    var subtotal=(Number(r.cant)||0)*(Number(r.costo)||0);
    return [fechaCorta(r.fecha),r.cant,fmt(r.costo),fmt(subtotal),esc(r.proveedor||"—"),esc(r.numDoc||"—")];
  });
}
var tmpFoto="";
var tmpQRImg="";
function fmProducto(id,body){
  var p=id?pById(id):null;
  tmpFoto=p&&p.foto?p.foto:"";
  tmpQRImg=p&&p.qrImagen?p.qrImagen:"";
  var cats=["Ropa Dama","Accesorios","Calzado","Bolsos Carteras","Maquillaje y Salud","Tecnología","Ropa Interior y Lencería","Otro"];
  var stockVal=p?p.stock||0:0;
  body.innerHTML=
    '<div class="pu"><div class="pp" id="pp" onclick="document.getElementById(\'fi\').click()">'+(tmpFoto?'<img src="'+tmpFoto+'" id="pimg"/>':"📷")+'</div><div><input type="file" id="fi" accept="image/*" style="display:none" onchange="handleFoto(this)"/><button class="btn btn-g btn-sm" onclick="document.getElementById(\'fi\').click()">📷 Subir foto</button><div id="fotomsg" style="font-size:11px;color:var(--success);margin-top:6px">'+(tmpFoto?"✓ Imagen cargada":"")+'</div></div></div>'+
    '<div class="field"><label>Nombre del producto *</label><input id="f-nom" type="text" value="'+esc(p?p.nombre||"":"")+'" placeholder="Blusa floral manga larga"/></div>'+
    '<div class="field"><label>Descripción del producto</label><textarea id="f-desc" rows="2" placeholder="Tela, corte, detalles...">'+esc(p?p.descripcion||"":"")+'</textarea></div>'+
    '<div class="frow"><div class="field"><label>Código QR</label><div style="display:flex;gap:8px"><input id="f-qr" type="text" value="'+esc(p?p.codigoQR||"":"")+'" placeholder="PROD-001" style="flex:1" oninput="updateQRImg()"/><button class="btn btn-p btn-sm" onclick="simQRp()">🔲</button></div></div><div class="field"><label>Categoría</label><select id="f-cat">'+cats.map(function(c){return '<option'+((p&&p.categoria===c||(!p&&c==="Ropa Dama"))?' selected':'')+'>'+c+'</option>';}).join("")+'</select></div></div>'+
    '<div class="field"><label>QR Imagen (generado automáticamente)</label><div style="display:flex;align-items:center;gap:14px;background:var(--cream);border-radius:10px;padding:12px"><canvas id="qrcanvas" style="display:none"></canvas><div id="qrpreview" style="width:80px;height:80px;background:#fff;border-radius:8px;display:flex;align-items:center;justify-content:center;border:1px solid var(--light)">'+(tmpQRImg?'<img src="'+tmpQRImg+'" style="width:100%;height:100%;object-fit:contain;padding:4px"/>':'<span style="font-size:11px;color:var(--gray);text-align:center">Sin código</span>')+'</div><div style="font-size:12px;color:var(--gray)">Se genera automáticamente a partir del Código QR ingresado.</div></div></div>'+
    '<div class="frow"><div class="field"><label>Precio Compra (S/)</label><input id="f-pc" type="number" value="'+esc(p?p.precioCompra||"":"")+'" placeholder="42.00" oninput="calcMg()"/></div><div class="field"><label>Precio Venta (S/) *</label><input id="f-pv" type="number" value="'+esc(p?p.precioVenta||"":"")+'" placeholder="85.00" oninput="calcMg()"/></div></div>'+
    '<div id="mgbox" style="display:none;background:rgba(123,196,160,.15);border-radius:10px;padding:9px 14px;margin-bottom:12px;font-size:13px"></div>'+
    '<div class="field"><label>Proveedor</label><div class="sdr"><input type="text" id="f-prov" value="'+esc(p?p.proveedor||"":"")+'" placeholder="Buscar o escribir proveedor..." autocomplete="off" oninput="filterProvDrop(this.value)" onfocus="filterProvDrop(this.value)"/><div class="sdrd" id="prov-drop"></div></div></div>'+

    '<div class="field"><label>Stock_Inventario (cantidad actualizada)</label><input id="f-stk" type="number" min="0" value="'+stockVal+'" oninput="updateEstadoPreview()"/></div>'+
    '<div class="field"><label>Estado_Producto</label><div id="estpreview" style="padding:10px 14px;background:var(--cream);border-radius:10px;font-size:14px;font-weight:700"></div></div>'+
    '<div class="field"><label>Nota del producto</label><textarea id="f-nota" rows="2" placeholder="Notas internas (uso, cuidados, observaciones...)">'+esc(p?p.nota||"":"")+'</textarea></div>'+
    (p?('<div class="field"><label>Movimiento de Ventas</label>'+histTableHTML(["Fecha","Nick","Cantidad","Precio Unitario","SubTotal","Estado de Pago","Estado (Orden de Venta)"],ventasHistRows(p.id))+'</div>'+
        '<div class="field"><label>Movimiento de Compra | Inventario</label>'+histTableHTML(["Fecha","Cant.","P. Costo","SubTotal","Proveedor","N° Documento"],comprasHistRows(p.id))+'</div>'):'')+
    '<div class="fftr"><button class="btn btn-s" onclick="closeForm()">Cancelar</button><button class="btn btn-p" onclick="saveP('+(id||"null")+')">✓ Guardar</button></div>';
  calcMg();
  updateEstadoPreview();
  if(document.getElementById("f-qr").value) updateQRImg();
}
function handleFoto(inp){
  var file=inp.files[0];if(!file) return;
  document.getElementById("fotomsg").textContent="Comprimiendo…";
  compress(file,400,0.72,function(data){
    tmpFoto=data;
    var pp=document.getElementById("pp");
    if(pp) pp.innerHTML='<img src="'+data+'" style="width:100%;height:100%;object-fit:cover"/>';
    document.getElementById("fotomsg").textContent="✓ Imagen comprimida automáticamente";
  });
}
function calcMg(){
  var pc=Number(document.getElementById("f-pc")?document.getElementById("f-pc").value:0)||0;
  var pv=Number(document.getElementById("f-pv")?document.getElementById("f-pv").value:0)||0;
  var el=document.getElementById("mgbox");
  if(el&&pc&&pv){var mg=Math.round((1-pc/pv)*100);el.style.display="block";el.innerHTML='Margen: <strong style="color:var(--success)">'+mg+'%</strong> · Ganancia: <strong>'+fmt(pv-pc)+'</strong>';}
  else if(el) el.style.display="none";
}
function saveP(id){
  var nom=document.getElementById("f-nom").value.trim();
  var pv=Number(document.getElementById("f-pv").value);
  var qrCode=document.getElementById("f-qr").value;
  if(!nom){alert("El nombre es requerido");return;}
  if(!pv){alert("Ingresa un precio de venta");return;}
  if(qrCode&&!tmpQRImg){updateQRImg();}
  var stockVal=Number(document.getElementById("f-stk").value)||0;
  var obj={nombre:nom,descripcion:document.getElementById("f-desc").value.trim(),codigoQR:qrCode,qrImagen:tmpQRImg,categoria:document.getElementById("f-cat").value,precioCompra:Number(document.getElementById("f-pc").value)||0,precioVenta:pv,proveedor:document.getElementById("f-prov").value,foto:tmpFoto,stock:stockVal,estadoProducto:estProd(stockVal),nota:document.getElementById("f-nota").value.trim()};
  var isNew=!id;
  if(id){ obj.id=id; productos=productos.map(function(p){return p.id===id?Object.assign({},p,obj):p;}); }
  else{ obj.id=uid(); productos.push(obj); }
  closeForm();renderProductos(document.getElementById("src-p")?document.getElementById("src-p").value:"");updateNav();
  guardarProductoEnColeccion(obj,isNew);
}
function delP(id){confirm2("¿Eliminar este producto?").then(function(ok){if(!ok) return;productos=productos.filter(function(p){return p.id!==id;});renderProductos(document.getElementById("src-p")?document.getElementById("src-p").value:"");updateNav();if(db){db.collection("productos").doc(String(id)).delete().catch(function(err){console.error("Error eliminando producto:",err);setSyncStatus("error","Error al eliminar producto");});}});}

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
// Exponemos las funciones al entorno global
window.renderProductos = renderProductos;
window.renderProductosCur = renderProductosCur;
window.viewProductPhoto = viewProductPhoto;
window.descargarEtiquetaPDF = descargarEtiquetaPDF;
window.fmProducto = fmProducto;
window.updateEstadoPreview = updateEstadoPreview;
window.updateQRImg = updateQRImg;
window.handleFoto = handleFoto;
window.simQRp = simQRp;
window.calcMg = calcMg;
window.saveP = saveP;
window.guardarProductoEnColeccion = guardarProductoEnColeccion;
window.delP = delP;