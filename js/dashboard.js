// HOME
function renderHome(){
  // 1. Obtener mes y año actual
  var fechaHoy = new Date();
  var anioActualStr = String(fechaHoy.getFullYear());
  var mesActualStr = String(fechaHoy.getMonth() + 1).padStart(2, "0");
  var nombreMesActual = MES[fechaHoy.getMonth()].toUpperCase();

  // 2. Filtrar ventas solo del mes actual
  var ventasMesActual = detalles.filter(function(d){
    return d.fecha && d.fecha.slice(0,4) === anioActualStr && d.fecha.slice(5,7) === mesActualStr;
  });

  // 3. Calcular montos y cantidades del mes actual
  var tvMes = ventasMesActual.reduce(function(s,d){ return s + d.precio * d.cantidad; }, 0);
  var cantProdMes = ventasMesActual.reduce(function(s,d){ return s + (Number(d.cantidad) || 0); }, 0);

  var sinov=detalles.filter(function(d){return d.estado==="Sin_OV";}).length;
  var stk=productos.reduce(function(s,p){return s+p.stock;},0);
  var ventasPend=detalles.filter(function(d){return (d.estadoPago||"Pendiente de Pago")==="Pendiente de Pago";});
  var udsPend=ventasPend.reduce(function(s,d){return s+(Number(d.cantidad)||0);},0);
  var montoPend=ventasPend.reduce(function(s,d){return s+d.precio*d.cantidad;},0);
  
  document.getElementById("hstats").innerHTML=
    '<div class="sc" style="border-left:4px solid var(--rose)"><div class="sl">Ventas Pendientes de Pago</div><div class="sv" style="font-size:18px">'+udsPend+' uds.</div><div class="ss">'+fmt(montoPend)+'</div></div>'+
    '<div class="sc" style="border-left:4px solid var(--gold)"><div class="sl">Sin OV</div><div class="sv">'+sinov+'</div><div class="ss">pendientes envío</div></div>'+
    '<div class="sc" style="border-left:4px solid var(--teal)"><div class="sl">Productos</div><div class="sv">'+productos.length+'</div><div class="ss">'+stk+' uds en stock</div></div>';
    
  // 4. Actualizar el bloque principal (hhero)
  document.getElementById("hhero").innerHTML='<div style="font-size:11px;font-weight:600;letter-spacing:1px;opacity:.8;margin-bottom:6px">VENTAS DEL MES DE ' + nombreMesActual + '</div><div style="font-family:\'Playfair Display\',serif;font-size:32px;font-weight:600">'+fmt(tvMes)+'</div><div style="font-size:13px;opacity:.75;margin-top:4px">'+cantProdMes+' productos vendidos</div>';

  // ── Cumpleaños (con filtro Año/Mes + resumen de ventas hasta hoy) ────────
  var hoy=new Date();
  var hoyStr=hoy.toISOString().slice(0,10);
  var anioActual=hoy.getFullYear();
  var mesActualNum=hoy.getMonth()+1;

  var aniosB={};
  detalles.forEach(function(d){ if(d.fecha) aniosB[d.fecha.slice(0,4)]=true; });
  aniosB[String(anioActual)]=true;
  var listaAniosB=Object.keys(aniosB).sort(function(a,b){return b-a;});
  var selBA=document.getElementById("hb-anio");
  var selBM=document.getElementById("hb-mes");
  if(selBA){
    var curBA=selBA.value||String(anioActual);
    selBA.innerHTML=listaAniosB.map(function(a){return '<option value="'+a+'"'+(curBA===a?' selected':'')+'>'+a+'</option>';}).join("");
    if(listaAniosB.indexOf(curBA)<0) selBA.value=listaAniosB[0];
  }
  if(selBM&&!selBM.innerHTML){
    var curBM=String(mesActualNum);
    selBM.innerHTML=MES.map(function(m,i){return '<option value="'+(i+1)+'"'+((i+1)===mesActualNum?' selected':'')+'>'+m+'</option>';}).join("");
  }
  var anioBSel=selBA?selBA.value:String(anioActual);
  var mesBSel=selBM?Number(selBM.value):mesActualNum;

  var cump=clientes.filter(function(c){return c.cumpleMes===mesBSel;});
  var filasCumple=cump.map(function(c){
    // Ventas de esta clienta en el año filtrado, desde el inicio del año hasta la fecha actual (o hasta fin de año si no es el año en curso)
    var fechaLimite=(anioBSel===String(anioActual))?hoyStr:(anioBSel+"-12-31");
    var ventasCliente=detalles.filter(function(d){
      if(d.clienteId!==c.id) return false;
      if(!d.fecha||d.fecha.slice(0,4)!==anioBSel) return false;
      if(d.fecha>fechaLimite) return false;
      return true;
    });
    var subtotalCliente=ventasCliente.reduce(function(s,d){return s+d.precio*d.cantidad;},0);
    var cantCliente=ventasCliente.reduce(function(s,d){return s+(Number(d.cantidad)||0);},0);
    return {c:c,subtotal:subtotalCliente,cant:cantCliente};
  });
  window._filasCumpleanos=filasCumple.map(function(f){return {nombre:f.c.nombre,nick:f.c.nick||"",cant:f.cant,subtotal:f.subtotal};});
  document.getElementById("hcump").innerHTML=filasCumple.length?filasCumple.map(function(f){
    var c=f.c;
    return '<div style="padding:9px 0;border-bottom:1px solid var(--light)">'+
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">'+
        '<span style="font-size:18px">🌸</span>'+
        '<div style="flex:1"><div style="font-size:13px;font-weight:500">'+esc(c.nombre)+'</div><div style="font-size:11px;color:var(--gray)">'+esc(c.nick)+" · "+cumStr(c.cumpleDia,c.cumpleMes)+'</div></div>'+
      '</div>'+
      '<div style="display:flex;gap:8px;padding-left:28px">'+
        '<span style="font-size:11px;background:rgba(217,136,154,.12);color:var(--pink);padding:2px 9px;border-radius:10px;font-weight:600">'+fmt(f.subtotal)+'</span>'+
        '<span style="font-size:11px;background:rgba(107,181,181,.12);color:var(--teal);padding:2px 9px;border-radius:10px;font-weight:600">'+f.cant+' uds</span>'+
      '</div>'+
    '</div>';
  }).join(""):'<div style="font-size:13px;color:var(--gray);text-align:center;padding:16px">Ninguna cumpleañera en '+MES[mesBSel-1]+'</div>';

  // ── Ventas por Mes (con filtro Año/Mes + resumen) ────────────────────────
  var aniosVentas={};
  detalles.forEach(function(d){ if(d.fecha) aniosVentas[d.fecha.slice(0,4)]=true; });
  aniosVentas[String(new Date().getFullYear())]=true;
  var listaAniosV=Object.keys(aniosVentas).sort(function(a,b){return b-a;});
  var selVA=document.getElementById("hv-anio");
  var selVM=document.getElementById("hv-mes");
  if(selVA){
    var curVA=selVA.value||String(new Date().getFullYear());
    selVA.innerHTML=listaAniosV.map(function(a){return '<option value="'+a+'"'+(curVA===a?' selected':'')+'>'+a+'</option>';}).join("");
    if(listaAniosV.indexOf(curVA)<0) selVA.value=listaAniosV[0];
  }
  if(selVM&&!selVM.innerHTML){
    selVM.innerHTML='<option value="none" selected>Ninguno</option><option value="">Todos los meses</option>'+MES.map(function(m,i){return '<option value="'+(i+1)+'">'+m+'</option>';}).join("");
  }
  var anioVSel=selVA?selVA.value:String(new Date().getFullYear());
  var mesVSel=selVM?selVM.value:"none";

  var selVD=document.getElementById("hv-dia");
  var diaVSel="";
  if(selVD){
    if(mesVSel&&mesVSel!=="none"){
      var diasEnMesV=new Date(Number(anioVSel),Number(mesVSel),0).getDate();
      var diasNom=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
      var curVD=selVD.value;
      var opts='<option value="">Todos</option>';
      for(var dd=1;dd<=diasEnMesV;dd++){
        var fechaDia=new Date(Number(anioVSel),Number(mesVSel)-1,dd);
        opts+='<option value="'+dd+'">'+diasNom[fechaDia.getDay()]+'. '+dd+'</option>';
      }
      selVD.innerHTML=opts;
      selVD.disabled=false;
      if(curVD&&Number(curVD)<=diasEnMesV) selVD.value=curVD;
      diaVSel=selVD.value;
    } else {
      selVD.innerHTML='<option value="">Todos</option>';
      selVD.disabled=true;
      diaVSel="";
    }
  }

  var desdeSel = document.getElementById("hv-desde") ? document.getElementById("hv-desde").value : "";
  var hastaSel = document.getElementById("hv-hasta") ? document.getElementById("hv-hasta").value : "";

  var ventasFiltradas = detalles.filter(function(d){
    if(!d.fecha) return false;

    // Si hay un rango de fechas explícito, priorizamos este filtro
    if(desdeSel || hastaSel) {
        if(desdeSel && d.fecha < desdeSel) return false;
        if(hastaSel && d.fecha > hastaSel) return false;
        return true;
    }

    // Si NO hay rango de fechas, usamos la lógica original de Año/Mes/Día
    if(mesVSel === "none") return false;
    if(d.fecha.slice(0,4) !== anioVSel) return false;
    if(mesVSel && mesVSel !== "none" && Number(d.fecha.slice(5,7)) !== Number(mesVSel)) return false;
    if(diaVSel && Number(d.fecha.slice(8,10)) !== Number(diaVSel)) return false;
    
    return true;
  });
  var sumaVentasFiltradas=ventasFiltradas.reduce(function(s,d){return s+d.precio*d.cantidad;},0);
  var cantProdVentasFiltradas=ventasFiltradas.reduce(function(s,d){return s+(Number(d.cantidad)||0);},0);
  var resumenV=document.getElementById("hventasmes-resumen");
  if(resumenV){
    resumenV.innerHTML=
      '<div style="flex:1;min-width:140px;background:rgba(217,136,154,.12);border-radius:12px;padding:12px 16px"><div style="font-size:11px;color:var(--gray);margin-bottom:4px">SUMA TOTAL VENTAS</div><div style="font-family:\'Playfair Display\',serif;font-size:19px;font-weight:600;color:var(--pink)">'+fmt(sumaVentasFiltradas)+'</div></div>'+
      '<div style="flex:1;min-width:140px;background:rgba(107,181,181,.12);border-radius:12px;padding:12px 16px"><div style="font-size:11px;color:var(--gray);margin-bottom:4px">CANT. PRODUCTOS VENDIDOS</div><div style="font-family:\'Playfair Display\',serif;font-size:19px;font-weight:600;color:var(--teal)">'+cantProdVentasFiltradas+'</div></div>';
  }
  // Gráfico de barras: si hay mes seleccionado, mostramos solo ese mes destacado; si no, los 12 meses del año
  var ventasPorMes=new Array(12).fill(0);
  detalles.forEach(function(d){
    if(!d.fecha||d.fecha.slice(0,4)!==anioVSel) return;
    var m=Number(d.fecha.slice(5,7))-1;
    if(m>=0&&m<12) ventasPorMes[m]+=(d.precio*d.cantidad);
  });
  var maxV=Math.max.apply(null,ventasPorMes.concat([1]));
  document.getElementById("hventasmes").innerHTML=ventasPorMes.map(function(v,i){
    var pct=maxV>0?Math.round((v/maxV)*100):0;
    var esSel=mesVSel&&Number(mesVSel)===(i+1);
    return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:7px;'+(esSel?'background:rgba(242,196,206,.18);border-radius:8px;padding:4px 6px;margin-left:-6px;margin-right:-6px':'')+'"><div style="width:34px;font-size:11px;color:var(--gray);font-weight:'+(esSel?'700':'400')+'">'+MESES_CORTOS[i]+'</div><div style="flex:1;background:var(--light);border-radius:6px;height:18px;position:relative;overflow:hidden"><div style="position:absolute;left:0;top:0;bottom:0;width:'+pct+'%;background:linear-gradient(90deg,var(--rose),var(--gold));border-radius:6px"></div></div><div style="width:80px;text-align:right;font-size:12px;font-weight:600">'+fmt(v)+'</div></div>';
  }).join("");

  // Tabla: dos modos posibles según "hv-modo"
  //  - "detalle": por clienta (Nombre, Nick, Cant, SubTotal) — comportamiento original
  //  - "total": solo importe total, agrupado por día (si hay un mes específico elegido)
  //             o por mes (si está "Todos los meses" elegido), incluyendo los períodos sin ventas en 0
  var modoV=document.getElementById("hv-modo")?document.getElementById("hv-modo").value:"detalle";
  window._hvModo=modoV;
  var tablaV=document.getElementById("hventasmes-tabla");

  if(modoV==="total"){
    var diasNomLower=["dom","lun","mar","mié","jué","vie","sáb"];
    var filasTotal=[];
    
    if(desdeSel || hastaSel){
      // Construir filas por cada día encontrado en el rango
      var porDia = {};
      ventasFiltradas.forEach(function(d){
        if(!porDia[d.fecha]) porDia[d.fecha] = {cant:0, subtotal:0};
        porDia[d.fecha].cant += (Number(d.cantidad)||0);
        porDia[d.fecha].subtotal += (d.precio * d.cantidad);
      });
      var fechasOrdenadas = Object.keys(porDia).sort();
      fechasOrdenadas.forEach(function(f){
        var dObj = new Date(f+"T00:00:00");
        var labelF = diasNomLower[dObj.getDay()]+". "+f.slice(8,10)+"/"+f.slice(5,7)+"/"+f.slice(2,4);
        filasTotal.push({label: labelF, cant: porDia[f].cant, subtotal: porDia[f].subtotal});
      });
    } else if(mesVSel&&mesVSel!=="none"){
      var diasEnMesT=new Date(Number(anioVSel),Number(mesVSel),0).getDate();
      for(var dT=1;dT<=diasEnMesT;dT++){
        var fechaObjT=new Date(Number(anioVSel),Number(mesVSel)-1,dT);
        var fechaStrT=anioVSel+"-"+String(mesVSel).padStart(2,"0")+"-"+String(dT).padStart(2,"0");
        var vDelDia=detalles.filter(function(d){return d.fecha===fechaStrT;});
        var cantT=vDelDia.reduce(function(s,d){return s+(Number(d.cantidad)||0);},0);
        var subT=vDelDia.reduce(function(s,d){return s+d.precio*d.cantidad;},0);
        filasTotal.push({
          label:diasNomLower[fechaObjT.getDay()]+". "+String(dT).padStart(2,"0")+"/"+String(mesVSel).padStart(2,"0")+"/"+String(anioVSel).slice(-2),
          cant:cantT,subtotal:subT
        });
      }
    } else if(mesVSel===""){
      for(var mT=1;mT<=12;mT++){
        var vDelMes=detalles.filter(function(d){return d.fecha&&d.fecha.slice(0,4)===anioVSel&&Number(d.fecha.slice(5,7))===mT;});
        var cantM=vDelMes.reduce(function(s,d){return s+(Number(d.cantidad)||0);},0);
        var subM=vDelMes.reduce(function(s,d){return s+d.precio*d.cantidad;},0);
        filasTotal.push({label:MES[mT-1]+" "+anioVSel,cant:cantM,subtotal:subM});
      }
    }
    window._filasVentasTotal=filasTotal;
    if(tablaV){
      tablaV.innerHTML=filasTotal.length?(
        '<div style="display:flex;font-size:11px;color:var(--gray);font-weight:600;padding:0 0 8px;border-bottom:1px solid var(--light)">'+
          '<div style="flex:2">FECHA</div><div style="width:70px;text-align:right">CANT.</div><div style="width:110px;text-align:right">SUMA SUBTOTAL</div>'+
        '</div>'+
        filasTotal.map(function(f){
          return '<div style="display:flex;align-items:center;padding:8px 0;border-bottom:1px solid var(--light);font-size:13px">'+
            '<div style="flex:2;min-width:0;font-weight:500">'+esc(f.label)+'</div>'+
            '<div style="width:70px;text-align:right;color:var(--teal);font-weight:600">'+f.cant+'</div>'+
            '<div style="width:110px;text-align:right;color:var(--pink);font-weight:600">'+fmt(f.subtotal)+'</div>'+
          '</div>';
        }).join("")
      ):'<div style="font-size:13px;color:var(--gray);text-align:center;padding:16px">Elige un mes específico o "Todos los meses" para ver el detalle por período.</div>';
    }
  } else {
  var porClienteV={};
  ventasFiltradas.forEach(function(d){
    if(!porClienteV[d.clienteId]) porClienteV[d.clienteId]={cant:0,subtotal:0};
    porClienteV[d.clienteId].cant+=(Number(d.cantidad)||0);
    porClienteV[d.clienteId].subtotal+=d.precio*d.cantidad;
  });
  var filasVentasMes=Object.keys(porClienteV).map(function(cid){
    var c=cById(cid);
    return {nombre:c?c.nombre:"—",nick:c?c.nick||"":"",cant:porClienteV[cid].cant,subtotal:porClienteV[cid].subtotal};
  }).sort(function(a,b){return b.subtotal-a.subtotal;});
  window._filasVentasMes=filasVentasMes;
  if(tablaV){
    tablaV.innerHTML=filasVentasMes.length?(
      '<div style="display:flex;font-size:11px;color:var(--gray);font-weight:600;padding:0 0 8px;border-bottom:1px solid var(--light)">'+
        '<div style="flex:2">NOMBRE / NICK</div><div style="width:70px;text-align:right">CANT.</div><div style="width:100px;text-align:right">SUBTOTAL</div>'+
      '</div>'+
      filasVentasMes.map(function(f){
        return '<div style="display:flex;align-items:center;padding:8px 0;border-bottom:1px solid var(--light);font-size:13px">'+
          '<div style="flex:2;min-width:0"><div style="font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(f.nombre)+'</div>'+(f.nick?'<div style="font-size:11px;color:var(--pink)">'+esc(f.nick)+'</div>':'')+'</div>'+
          '<div style="width:70px;text-align:right;color:var(--teal);font-weight:600">'+f.cant+'</div>'+
          '<div style="width:100px;text-align:right;color:var(--pink);font-weight:600">'+fmt(f.subtotal)+'</div>'+
        '</div>';
      }).join("")
    ):'<div style="font-size:13px;color:var(--gray);text-align:center;padding:16px">Sin ventas en este periodo</div>';
  }
  }

  // ── Mejores Clientas (con filtro Año/Mes + resumen) ──────────────────────
  var aniosC={};
  detalles.forEach(function(d){ if(d.fecha) aniosC[d.fecha.slice(0,4)]=true; });
  aniosC[String(new Date().getFullYear())]=true;
  var listaAniosC=Object.keys(aniosC).sort(function(a,b){return b-a;});
  var selCA=document.getElementById("hc-anio");
  var selCM=document.getElementById("hc-mes");
  if(selCA){
    selCA.innerHTML='<option value="">Todos los años</option>'+listaAniosC.map(function(a){return '<option value="'+a+'">'+a+'</option>';}).join("");
  }
  if(selCM&&!selCM.innerHTML){
    selCM.innerHTML='<option value="none" selected>Ninguno</option><option value="">Todos los meses</option>'+MES.map(function(m,i){return '<option value="'+(i+1)+'">'+m+'</option>';}).join("");
  }
  var anioCSel=selCA?selCA.value:"";
  var mesCSel=selCM?selCM.value:"none";

  var detallesParaTop=mesCSel==="none"?[]:detalles.filter(function(d){
    if(anioCSel&&(!d.fecha||d.fecha.slice(0,4)!==anioCSel)) return false;
    if(mesCSel&&(!d.fecha||Number(d.fecha.slice(5,7))!==Number(mesCSel))) return false;
    return true;
  });
  var top=clientes.slice().map(function(c){
    var itemsC=detallesParaTop.filter(function(d){return d.clienteId===c.id;});
    return {c:c,total:itemsC.reduce(function(s,d){return s+d.precio*d.cantidad;},0),cant:itemsC.reduce(function(s,d){return s+(Number(d.cantidad)||0);},0),items:itemsC.length};
  }).filter(function(x){return x.items>0;}).sort(function(a,b){return b.total-a.total;}).slice(0,5);
  window._filasClientas=top.map(function(x){return {nombre:x.c.nombre,nick:x.c.nick||"",cant:x.cant,subtotal:x.total};});

  var sumaTop=top.reduce(function(s,x){return s+x.total;},0);
  var cantTop=top.reduce(function(s,x){return s+x.cant;},0);
  var resumenC=document.getElementById("htop-resumen");
  if(resumenC){
    resumenC.innerHTML=
      '<div style="flex:1;min-width:140px;background:rgba(217,136,154,.12);border-radius:12px;padding:12px 16px"><div style="font-size:11px;color:var(--gray);margin-bottom:4px">SUMA MONTOS VENDIDOS</div><div style="font-family:\'Playfair Display\',serif;font-size:19px;font-weight:600;color:var(--pink)">'+fmt(sumaTop)+'</div></div>'+
      '<div style="flex:1;min-width:140px;background:rgba(107,181,181,.12);border-radius:12px;padding:12px 16px"><div style="font-size:11px;color:var(--gray);margin-bottom:4px">CANT. PRODUCTOS VENDIDOS</div><div style="font-family:\'Playfair Display\',serif;font-size:19px;font-weight:600;color:var(--teal)">'+cantTop+'</div></div>';
  }
  document.getElementById("htop").innerHTML=top.length?top.map(function(x,i){return '<div style="display:flex;align-items:center;gap:12px;padding:9px 0;'+(i<top.length-1?'border-bottom:1px solid var(--light)':'')+'"><div class="av" style="width:34px;height:34px;font-size:14px">'+esc(x.c.nombre.charAt(0))+'</div><div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(x.c.nombre)+'</div><div style="font-size:11px;color:var(--gray)">'+esc(x.c.nick)+" · "+x.cant+' uds</div></div><div style="font-size:13px;font-weight:600;color:var(--pink)">'+fmt(x.total)+'</div></div>';}).join(""):'<div style="font-size:13px;color:var(--gray);text-align:center;padding:20px">Sin datos en este periodo</div>';

  // ── Compras y Gastos por Año/Mes ────────────────────────────────────────
  var aniosCG={};
  compras.forEach(function(c){ if(c.fecha) aniosCG[c.fecha.slice(0,4)]=true; });
  gastos.forEach(function(g){ if(g.fecha) aniosCG[g.fecha.slice(0,4)]=true; });
  aniosCG[String(new Date().getFullYear())]=true;
  var listaAniosCG=Object.keys(aniosCG).sort(function(a,b){return b-a;});
  var selCGA=document.getElementById("hcg-anio");
  var selCGM=document.getElementById("hcg-mes");
  if(selCGA){
    var curCGA=selCGA.value||String(new Date().getFullYear());
    selCGA.innerHTML=listaAniosCG.map(function(a){return '<option value="'+a+'"'+(curCGA===a?' selected':'')+'>'+a+'</option>';}).join("");
    if(listaAniosCG.indexOf(curCGA)<0) selCGA.value=listaAniosCG[0];
  }
  if(selCGM&&!selCGM.innerHTML){
    selCGM.innerHTML='<option value="">Todos los meses</option>'+MES.map(function(m,i){return '<option value="'+(i+1)+'">'+m+'</option>';}).join("");
  }
  var anioCGSel=selCGA?selCGA.value:String(new Date().getFullYear());
  var mesCGSel=selCGM?selCGM.value:"";
  var modoCG=document.getElementById("hcg-modo")?document.getElementById("hcg-modo").value:"detalle";

  var selCGD=document.getElementById("hcg-dia");
  var diaCGSel="";
  if(modoCG==="montosxmes"){
    if(selCGM){ selCGM.disabled=true; }
    if(selCGD){ selCGD.innerHTML='<option value="">Todos</option>'; selCGD.disabled=true; }
  } else {
    if(selCGM){ selCGM.disabled=false; }
  if(selCGD){
    if(mesCGSel){
      var diasEnMesCG=new Date(Number(anioCGSel),Number(mesCGSel),0).getDate();
      var diasNomCG=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
      var curCGD=selCGD.value;
      var optsCG='<option value="">Todos</option>';
      for(var dg=1;dg<=diasEnMesCG;dg++){
        var fechaDiaCG=new Date(Number(anioCGSel),Number(mesCGSel)-1,dg);
        optsCG+='<option value="'+dg+'">'+diasNomCG[fechaDiaCG.getDay()]+'. '+dg+'</option>';
      }
      selCGD.innerHTML=optsCG;
      selCGD.disabled=false;
      if(curCGD&&Number(curCGD)<=diasEnMesCG) selCGD.value=curCGD;
      diaCGSel=selCGD.value;
    } else {
      selCGD.innerHTML='<option value="">Todos</option>';
      selCGD.disabled=true;
      diaCGSel="";
    }
  }
  }

  if(modoCG==="montosxmes"){
    var comprasPorMes=[],gastosPorMes=[];
    for(var mIdx=1;mIdx<=12;mIdx++){
      var cDelMes=compras.filter(function(c){return c.fecha&&c.fecha.slice(0,4)===anioCGSel&&Number(c.fecha.slice(5,7))===mIdx;});
      var gDelMes=gastos.filter(function(g){return g.fecha&&g.fecha.slice(0,4)===anioCGSel&&Number(g.fecha.slice(5,7))===mIdx;});
      var cantC=cDelMes.reduce(function(s,c){return s+c.items.reduce(function(s2,it){return s2+(Number(it.cantidad)||0);},0);},0);
      var montoC=cDelMes.reduce(function(s,c){return s+(c.montoTotal!=null?c.montoTotal:c.items.reduce(function(s2,it){return s2+(it.precioUnit||0)*(it.cantidad||0);},0));},0);
      var cantG=gDelMes.reduce(function(s,g){return s+(Number(g.cantidad)||0);},0);
      var montoG=gDelMes.reduce(function(s,g){return s+(Number(g.montoTotal)||0);},0);
      comprasPorMes.push({label:MES[mIdx-1],cant:cantC,subtotal:montoC});
      gastosPorMes.push({label:MES[mIdx-1],cant:cantG,subtotal:montoG});
    }
    window._filasComprasPorMes=comprasPorMes;
    window._filasGastosPorMes=gastosPorMes;
    var totCompAnio=comprasPorMes.reduce(function(s,f){return s+f.subtotal;},0);
    var totGastAnio=gastosPorMes.reduce(function(s,f){return s+f.subtotal;},0);
    function filaHTML(f){
      return '<div style="display:flex;padding:7px 0;border-bottom:1px solid var(--light);font-size:13px"><span style="flex:1;min-width:0">'+f.label+'</span><span style="width:50px;text-align:right;color:var(--gray)">'+f.cant+'</span><span style="width:90px;text-align:right;font-weight:600">'+fmt(f.subtotal)+'</span></div>';
    }
    document.getElementById("hcomprasgastos").innerHTML=
      '<div style="display:flex;gap:16px;flex-wrap:wrap">'+
        '<div style="flex:1;min-width:240px">'+
          '<div style="font-weight:600;font-size:13px;margin-bottom:6px;color:var(--purple)">COMPRAS — Total '+anioCGSel+': '+fmt(totCompAnio)+'</div>'+
          '<div style="display:flex;font-size:11px;color:var(--gray);padding-bottom:4px"><span style="flex:1;min-width:0">MESES</span><span style="width:50px;text-align:right">CANT.</span><span style="width:90px;text-align:right">MONTO</span></div>'+
          comprasPorMes.map(filaHTML).join("")+
        '</div>'+
        '<div style="flex:1;min-width:240px">'+
          '<div style="font-weight:600;font-size:13px;margin-bottom:6px;color:var(--pink)">COSTOS IND. + GASTOS — Total '+anioCGSel+': '+fmt(totGastAnio)+'</div>'+
          '<div style="display:flex;font-size:11px;color:var(--gray);padding-bottom:4px"><span style="flex:1;min-width:0">MESES</span><span style="width:50px;text-align:right">CANT.</span><span style="width:90px;text-align:right">MONTO</span></div>'+
          gastosPorMes.map(filaHTML).join("")+
        '</div>'+
      '</div>';
    return;
  }

  var comprasFiltradas=compras.filter(function(c){
    if(!c.fecha||c.fecha.slice(0,4)!==anioCGSel) return false;
    if(mesCGSel&&Number(c.fecha.slice(5,7))!==Number(mesCGSel)) return false;
    if(diaCGSel&&Number(c.fecha.slice(8,10))!==Number(diaCGSel)) return false;
    return true;
  });
  var gastosFiltrados=gastos.filter(function(g){
    if(!g.fecha||g.fecha.slice(0,4)!==anioCGSel) return false;
    if(mesCGSel&&Number(g.fecha.slice(5,7))!==Number(mesCGSel)) return false;
    if(diaCGSel&&Number(g.fecha.slice(8,10))!==Number(diaCGSel)) return false;
    return true;
  });
  var totCompras=comprasFiltradas.reduce(function(s,c){return s+(c.montoTotal!=null?c.montoTotal:c.items.reduce(function(s2,it){return s2+(it.precioUnit||0)*(it.cantidad||0);},0));},0);
  var totGastos=gastosFiltrados.reduce(function(s,g){return s+(Number(g.montoTotal)||0);},0);
  var gastosCostoInd=gastosFiltrados.filter(function(g){return resolverCatGasto(g).cat==="Costo Ind.";});
  var gastosGasto=gastosFiltrados.filter(function(g){return resolverCatGasto(g).cat==="Gasto";});
  var totCostoInd=gastosCostoInd.reduce(function(s,g){return s+(Number(g.montoTotal)||0);},0);
  var totGasto=gastosGasto.reduce(function(s,g){return s+(Number(g.montoTotal)||0);},0);

  var filasCG=[];
  comprasFiltradas.forEach(function(c){
    var cantC=c.items.reduce(function(s,it){return s+(Number(it.cantidad)||0);},0);
    var subC=c.montoTotal!=null?c.montoTotal:c.items.reduce(function(s,it){return s+(it.precioUnit||0)*(it.cantidad||0);},0);
    var nombresProd=c.items.map(function(it){var p=pById(it.productoId);return p?p.nombre:"";}).filter(Boolean).join(", ");
    filasCG.push({fecha:c.fecha,descripcion:nombresProd||"—",tipo:"Compras",clasificacion:"Costo Dir.",cant:cantC,subtotal:subC});
  });
  gastosFiltrados.forEach(function(g){
    filasCG.push({fecha:g.fecha,descripcion:g.descripcion||"—",tipo:"Costos Ind. + Gastos",clasificacion:g.categoria||"—",cant:Number(g.cantidad)||0,subtotal:Number(g.montoTotal)||0});
  });
  filasCG.sort(function(a,b){return new Date(a.fecha||0)-new Date(b.fecha||0);});
  window._filasComprasGastos=filasCG;
  window._filasComprasGastosInfo={anio:anioCGSel,mes:mesCGSel?MES[Number(mesCGSel)-1]:"Todos los meses",dia:diaCGSel||"Todos"};

  document.getElementById("hcomprasgastos").innerHTML=
    '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:4px">'+
      '<div style="flex:1;min-width:140px;background:rgba(155,127,212,.12);border-radius:12px;padding:12px 16px"><div style="font-size:11px;color:var(--gray);margin-bottom:4px">COMPRAS ('+comprasFiltradas.length+')</div><div style="font-family:\'Playfair Display\',serif;font-size:19px;font-weight:600;color:var(--purple)">'+fmt(totCompras)+'</div></div>'+
      '<div style="flex:1;min-width:140px;background:rgba(217,136,154,.12);border-radius:12px;padding:12px 16px"><div style="font-size:11px;color:var(--gray);margin-bottom:4px">COSTO IND. ('+gastosCostoInd.length+')</div><div style="font-family:\'Playfair Display\',serif;font-size:19px;font-weight:600;color:var(--pink)">'+fmt(totCostoInd)+'</div></div>'+
      '<div style="flex:1;min-width:140px;background:rgba(217,136,154,.12);border-radius:12px;padding:12px 16px"><div style="font-size:11px;color:var(--gray);margin-bottom:4px">GASTO ('+gastosGasto.length+')</div><div style="font-family:\'Playfair Display\',serif;font-size:19px;font-weight:600;color:var(--pink)">'+fmt(totGasto)+'</div></div>'+
      '<div style="flex:1;min-width:140px;background:rgba(44,44,44,.06);border-radius:12px;padding:12px 16px"><div style="font-size:11px;color:var(--gray);margin-bottom:4px">TOTAL EGRESOS</div><div style="font-family:\'Playfair Display\',serif;font-size:19px;font-weight:600">'+fmt(totCompras+totGastos)+'</div></div>'+
    '</div>';
}

// ── Descargar tabla de "Ventas por Mes" (Nombre, Nick, Cantidad, SubTotal) ──
// Descarga (Excel/PDF/Imagen) del modo "Montos X Mes" de Compras | Costos Ind. + Gastos:
// dos bloques de 12 meses (Compras y Costos Ind.+Gastos) para el año seleccionado.
function descargarComprasGastosPorMes(formato){
  var anio=document.getElementById("hcg-anio")?document.getElementById("hcg-anio").value:String(new Date().getFullYear());
  var comprasPM=window._filasComprasPorMes||[];
  var gastosPM=window._filasGastosPorMes||[];
  if(!comprasPM.length&&!gastosPM.length){ flashScanMsg("No hay datos para descargar."); return; }
  var totC=comprasPM.reduce(function(s,f){return s+f.subtotal;},0);
  var totG=gastosPM.reduce(function(s,f){return s+f.subtotal;},0);
  var etiqueta="Compras_CostosInd_Gastos_PorMes_"+anio;

  if(formato==="excel"){
    if(typeof XLSX==="undefined"){
      flashScanMsg("No se pudo cargar el generador de Excel. Revisa tu conexión e inténtalo de nuevo.");
      return;
    }
    var datos=[["AÑO",anio],["TOTAL COMPRAS "+anio,Number(totC.toFixed(2))],["TOTAL COSTOS IND. + GASTOS "+anio,Number(totG.toFixed(2))],[],
      ["COMPRAS","","","COSTOS IND. + GASTOS"],
      ["Meses","Cant.","Monto","Meses","Cant.","Monto"]];
    for(var i=0;i<12;i++){
      var c=comprasPM[i]||{label:MES[i],cant:0,subtotal:0};
      var g=gastosPM[i]||{label:MES[i],cant:0,subtotal:0};
      datos.push([c.label,c.cant,Number(c.subtotal.toFixed(2)),g.label,g.cant,Number(g.subtotal.toFixed(2))]);
    }
    var ws=XLSX.utils.aoa_to_sheet(datos);
    ws["!cols"]=[{wch:12},{wch:8},{wch:12},{wch:12},{wch:8},{wch:12}];
    var wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,"Por Mes "+anio);
    XLSX.writeFile(wb,etiqueta+".xlsx");
    return;
  }

  var w=560,rowH=24,topH=110;
  var h=topH+rowH*12+30;
  var cv=document.createElement("canvas");
  cv.width=w;cv.height=h;
  var ctx=cv.getContext("2d");
  ctx.fillStyle="#FAF7F4";ctx.fillRect(0,0,w,h);
  ctx.fillStyle="#2C2C2C";ctx.font="bold 17px Arial";
  ctx.fillText("Compras | Costos Ind. + Gastos — "+anio,20,30);
  ctx.font="12px Arial";ctx.fillStyle="#8B7BA8";
  ctx.fillText("Total Compras "+anio+": "+fmt(totC),20,50);
  ctx.fillStyle="#D9889A";
  ctx.fillText("Total Costos Ind.+Gastos "+anio+": "+fmt(totG),20,68);

  var colX=[20,300];
  ["COMPRAS","COSTOS IND. + GASTOS"].forEach(function(t,ci){
    ctx.font="bold 12px Arial";ctx.fillStyle=ci===0?"#8B7BA8":"#D9889A";
    ctx.fillText(t,colX[ci],90);
    ctx.font="bold 11px Arial";ctx.fillStyle="#8A8A8A";
    ctx.fillText("MESES",colX[ci],104);
    ctx.fillText("CANT.",colX[ci]+120,104);
    ctx.fillText("MONTO",colX[ci]+180,104);
  });
  ctx.strokeStyle="#E5DED6";ctx.beginPath();ctx.moveTo(20,110);ctx.lineTo(w-20,110);ctx.stroke();

  for(var mi=0;mi<12;mi++){
    var y=topH+22+mi*rowH;
    var c2=comprasPM[mi]||{label:MES[mi],cant:0,subtotal:0};
    var g2=gastosPM[mi]||{label:MES[mi],cant:0,subtotal:0};
    ctx.font="12px Arial";ctx.fillStyle="#2C2C2C";
    ctx.fillText(c2.label,colX[0],y);
    ctx.fillText(g2.label,colX[1],y);
    ctx.fillStyle="#6BB5B5";
    ctx.fillText(String(c2.cant),colX[0]+120,y);
    ctx.fillText(String(g2.cant),colX[1]+120,y);
    ctx.fillStyle="#2C2C2C";ctx.font="bold 12px Arial";
    ctx.fillText(fmt(c2.subtotal),colX[0]+180,y);
    ctx.fillText(fmt(g2.subtotal),colX[1]+180,y);
    ctx.strokeStyle="#F0EDE9";ctx.beginPath();ctx.moveTo(20,y+8);ctx.lineTo(w-20,y+8);ctx.stroke();
  }

  if(formato==="pdf"){
    var imgData=cv.toDataURL("image/jpeg",0.92);
    var pdfBlob=buildSimplePDF(imgData,w,h);
    var url=URL.createObjectURL(pdfBlob);
    var a=document.createElement("a");
    a.href=url;a.download=etiqueta+".pdf";
    document.body.appendChild(a);a.click();
    setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(url);},800);
  } else {
    var url2=cv.toDataURL("image/png");
    var a2=document.createElement("a");
    a2.href=url2;a2.download=etiqueta+".png";
    document.body.appendChild(a2);a2.click();
    setTimeout(function(){document.body.removeChild(a2);},800);
  }
}

// Exporta el detalle combinado de Compras + Costos Ind. + Gastos, con encabezado
// de filtros activos y suma de cantidades, en las 6 columnas acordadas.
function exportarComprasGastosDetalle(){
  var filas=window._filasComprasGastos||[];
  if(!filas.length){ flashScanMsg("No hay datos para descargar en este periodo."); return; }
  if(typeof XLSX==="undefined"){
    flashScanMsg("No se pudo cargar el generador de Excel. Revisa tu conexión e inténtalo de nuevo.");
    return;
  }
  var info=window._filasComprasGastosInfo||{anio:"",mes:"",dia:""};
  var sumaCant=filas.reduce(function(s,f){return s+(Number(f.cant)||0);},0);
  var sumaSubtotal=filas.reduce(function(s,f){return s+(Number(f.subtotal)||0);},0);

  var datos=[
    ["AÑO",info.anio],
    ["MES",info.mes],
    ["DÍA",info.dia],
    ["SUMA DE CANTIDADES",sumaCant],
    ["SUMA SUBTOTAL",Number(sumaSubtotal.toFixed(2))],
    [],
    ["Fecha","Descripción ([PRODUCTOS] | [DESCRIPCION])","Costos y Gastos","Clasificación","Cant.","SubTotal"]
  ];
  filas.forEach(function(f){
    datos.push([fechaCorta(f.fecha),f.descripcion,f.tipo,f.clasificacion,f.cant,Number(f.subtotal.toFixed(2))]);
  });

  var ws=XLSX.utils.aoa_to_sheet(datos);
  ws["!cols"]=[{wch:14},{wch:40},{wch:20},{wch:18},{wch:10},{wch:12}];
  var wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Compras y Gastos");
  var etiqueta="ComprasGastos_"+(info.anio||"Todos")+(info.mes&&info.mes!=="Todos los meses"?"_"+info.mes:"");
  XLSX.writeFile(wb,etiqueta+".xlsx");
}

function descargarTabla(tipo,formato){
  var filas,etiqueta;
  if(tipo==="clientas"){
    filas=window._filasClientas||[];
    var anioC=document.getElementById("hc-anio")?document.getElementById("hc-anio").value:"";
    var mesC=document.getElementById("hc-mes")?document.getElementById("hc-mes").value:"";
    etiqueta="MejoresClientas_"+(anioC||"Todos")+(mesC?"_"+MES[Number(mesC)-1]:"");
  } else if(tipo==="cumpleanos"){
    filas=window._filasCumpleanos||[];
    var anioB=document.getElementById("hb-anio")?document.getElementById("hb-anio").value:"";
    var mesB=document.getElementById("hb-mes")?document.getElementById("hb-mes").value:"";
    etiqueta="Cumpleanos_"+(anioB||"Todos")+(mesB?"_"+MES[Number(mesB)-1]:"");
  } else if(tipo==="comprasgastos"){
    var modoCGdesc=document.getElementById("hcg-modo")?document.getElementById("hcg-modo").value:"detalle";
    if(modoCGdesc==="montosxmes"){
      descargarComprasGastosPorMes(formato);
      return;
    }
    exportarComprasGastosDetalle();
    return;
  } else {
    descargarVentasMes(formato);
    return;
  }
  exportarFilas(filas,etiqueta,formato);
}

// Lógica común de exportación (Excel/PDF/Imagen) a partir de filas {nombre,nick,cant,subtotal}
function exportarFilas(filas,etiqueta,formato){
  if(!filas.length){ flashScanMsg("No hay datos para descargar en este periodo."); return; }

  if(formato==="excel"){
    if(typeof XLSX==="undefined"){
      flashScanMsg("No se pudo cargar el generador de Excel. Revisa tu conexión e inténtalo de nuevo.");
      return;
    }
    var datos=[["Nombre","Nick","Cantidad","SubTotal"]];
    filas.forEach(function(f){
      datos.push([f.nombre,f.nick||"",f.cant,Number(f.subtotal.toFixed(2))]);
    });
    var ws=XLSX.utils.aoa_to_sheet(datos);
    ws["!cols"]=[{wch:28},{wch:24},{wch:10},{wch:12}];
    var wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,"Datos");
    XLSX.writeFile(wb,etiqueta+".xlsx");
    return;
  }

  if(formato==="pdf"){
    var cv=buildVentasMesCanvas(filas,etiqueta);
    var imgData=cv.toDataURL("image/jpeg",0.92);
    var pdfBlob=buildSimplePDF(imgData,cv.width,cv.height);
    var url2=URL.createObjectURL(pdfBlob);
    var a2=document.createElement("a");
    a2.href=url2;a2.download=etiqueta+".pdf";
    document.body.appendChild(a2);a2.click();
    setTimeout(function(){document.body.removeChild(a2);URL.revokeObjectURL(url2);},800);
    return;
  }

  if(formato==="imagen"){
    var cv2=buildVentasMesCanvas(filas,etiqueta);
    var url3=cv2.toDataURL("image/png");
    var a3=document.createElement("a");
    a3.href=url3;a3.download=etiqueta+".png";
    document.body.appendChild(a3);a3.click();
    setTimeout(function(){document.body.removeChild(a3);},800);
    return;
  }
}

function descargarVentasMes(formato){
  var modo=window._hvModo||"detalle";
  var anio=document.getElementById("hv-anio")?document.getElementById("hv-anio").value:String(new Date().getFullYear());
  var mesSel=document.getElementById("hv-mes")?document.getElementById("hv-mes").value:"";
  if(mesSel==="none"){ flashScanMsg("Elige un período (mes o \"Todos los meses\") antes de descargar."); return; }
  var mesLabel=mesSel?MES[Number(mesSel)-1]:"";
  var etiqueta="Ventas_"+(anio||"Todos")+(mesSel?"_"+mesLabel:"_TodosLosMeses");

  if(modo==="total"){
    var filasT=window._filasVentasTotal||[];
    if(!filasT.length){ flashScanMsg("No hay datos para descargar en este periodo."); return; }
    var totalT=filasT.reduce(function(s,f){return s+f.subtotal;},0);
    exportarConEncabezado(filasT,["label","cant","subtotal"],[mesSel?"FECHA":"MES","CANT.","SUMA SUBTOTAL"],etiqueta,formato,{anio:anio,mes:mesLabel,total:totalT});
  } else {
    var filas=window._filasVentasMes||[];
    if(!filas.length){ flashScanMsg("No hay datos para descargar en este periodo."); return; }
    var totalD=filas.reduce(function(s,f){return s+f.subtotal;},0);
    exportarConEncabezado(filas,["nombre_nick","cant","subtotal"],["NOMBRE / NICK","CANT.","SUBTOTAL"],etiqueta,formato,{anio:anio,mes:mesLabel,total:totalD});
  }
}
// Exportación genérica (Excel/PDF/Imagen) con encabezado AÑO / MES / TOTAL arriba de la tabla.
// cols: claves de cada fila ("label","cant","subtotal","nombre_nick"). headers: rótulos visibles.
function exportarConEncabezado(filas,cols,headers,etiqueta,formato,info){
  function celda(f,key){
    if(key==="nombre_nick") return f.nombre+(f.nick?" ("+f.nick+")":"");
    if(key==="subtotal") return f.subtotal;
    return f[key];
  }
  if(formato==="excel"){
    if(typeof XLSX==="undefined"){
      flashScanMsg("No se pudo cargar el generador de Excel. Revisa tu conexión e inténtalo de nuevo.");
      return;
    }
    var datos=[["AÑO",info.anio],["MES",info.mes||"Todos los meses"],["TOTAL"+(info.mes?" "+info.mes.toUpperCase():"")+" "+info.anio,Number(info.total.toFixed(2))],[],headers];
    filas.forEach(function(f){
      datos.push(cols.map(function(k){var v=celda(f,k);return k==="subtotal"?Number(Number(v).toFixed(2)):v;}));
    });
    var ws=XLSX.utils.aoa_to_sheet(datos);
    ws["!cols"]=[{wch:28},{wch:12},{wch:14}];
    var wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,"Ventas");
    XLSX.writeFile(wb,etiqueta+".xlsx");
    return;
  }

  var cv=buildReporteCanvas(filas,cols,headers,etiqueta,info);
  if(formato==="pdf"){
    var imgData=cv.toDataURL("image/jpeg",0.92);
    var pdfBlob=buildSimplePDF(imgData,cv.width,cv.height);
    var url2=URL.createObjectURL(pdfBlob);
    var a2=document.createElement("a");
    a2.href=url2;a2.download=etiqueta+".pdf";
    document.body.appendChild(a2);a2.click();
    setTimeout(function(){document.body.removeChild(a2);URL.revokeObjectURL(url2);},800);
    return;
  }
  if(formato==="imagen"){
    var url3=cv.toDataURL("image/png");
    var a3=document.createElement("a");
    a3.href=url3;a3.download=etiqueta+".png";
    document.body.appendChild(a3);a3.click();
    setTimeout(function(){document.body.removeChild(a3);},800);
    return;
  }
}
// Canvas para PDF/Imagen con encabezado AÑO / MES / TOTAL, seguido de la tabla de filas.
function buildReporteCanvas(filas,cols,headers,titulo,info){
  var rowH=30,padX=20,w=560;
  var headBlockH=info.mes?96:80;
  var tableHeadH=34;
  var h=headBlockH+tableHeadH+rowH*filas.length+24;
  var cv=document.createElement("canvas");
  cv.width=w;cv.height=h;
  var ctx=cv.getContext("2d");
  ctx.fillStyle="#FAF7F4";ctx.fillRect(0,0,w,h);
  ctx.fillStyle="#2C2C2C";
  ctx.font="bold 18px Arial";
  ctx.fillText(titulo.replace(/_/g," "),padX,32);

  ctx.font="13px Arial";ctx.fillStyle="#555555";
  var yh=54;
  ctx.fillText("AÑO: "+info.anio,padX,yh); yh+=18;
  if(info.mes){ ctx.fillText("MES: "+info.mes,padX,yh); yh+=18; }
  ctx.font="bold 13px Arial";ctx.fillStyle="#B5384D";
  ctx.fillText("TOTAL"+(info.mes?" "+info.mes.toUpperCase():"")+" "+info.anio+": "+fmt(info.total),padX,yh);
  yh+=14;
  ctx.strokeStyle="#E5DED6";ctx.beginPath();ctx.moveTo(padX,yh);ctx.lineTo(w-padX,yh);ctx.stroke();

  var headerH=yh+34;
  ctx.font="bold 12px Arial";ctx.fillStyle="#8A8A8A";
  ctx.fillText(headers[0],padX,headerH-12);
  ctx.fillText(headers[1],w-200,headerH-12);
  ctx.fillText(headers[2],w-140,headerH-12);
  ctx.strokeStyle="#F0EDE9";
  ctx.beginPath();ctx.moveTo(padX,headerH-2);ctx.lineTo(w-padX,headerH-2);ctx.stroke();

  var y=headerH+20;
  filas.forEach(function(f){
    ctx.fillStyle="#2C2C2C";ctx.font="13px Arial";
    var label=cols[0]==="nombre_nick"?f.nombre:String(f.label);
    var labelTxt=label.length>26?label.slice(0,26)+"…":label;
    ctx.fillText(labelTxt,padX,y);
    if(cols[0]==="nombre_nick"&&f.nick){
      ctx.font="11px Arial";ctx.fillStyle="#D9889A";
      ctx.fillText(f.nick,padX,y+15);
    }
    ctx.font="bold 13px Arial";ctx.fillStyle="#6BB5B5";
    ctx.fillText(String(f.cant),w-200,y);
    ctx.fillStyle="#D9889A";
    ctx.fillText(fmt(f.subtotal),w-140,y);
    ctx.strokeStyle="#F0EDE9";
    ctx.beginPath();ctx.moveTo(padX,y+18);ctx.lineTo(w-padX,y+18);ctx.stroke();
    y+=rowH;
  });
  return cv;
}

// Reporte 1: "Det. Clientas" — detalle de cada venta con datos de la clienta.
function descargarReporteDetClientas(){
  if(typeof XLSX==="undefined"){
    alert("No se pudo cargar el generador de Excel. Revisa tu conexión e inténtalo de nuevo.");
    return;
  }
  var anio=document.getElementById("hv-anio")?document.getElementById("hv-anio").value:String(new Date().getFullYear());
  var mesSel=document.getElementById("hv-mes")?document.getElementById("hv-mes").value:"none";
  if(mesSel==="none"){ alert("Elige un período (mes o \"Todos los meses\") antes de descargar el reporte."); return; }

  var ventasAnio=detalles.filter(function(d){return d.fecha&&d.fecha.slice(0,4)===anio;});
  var ventas=mesSel?ventasAnio.filter(function(d){return Number(d.fecha.slice(5,7))===Number(mesSel);}):ventasAnio;
  ventas=ventas.slice().sort(function(a,b){return new Date(a.fecha)-new Date(b.fecha);});

  var datos=[];
  if(!mesSel){
    var totalAnual=ventasAnio.reduce(function(s,d){return s+d.precio*d.cantidad;},0);
    datos.push(["AÑO","",anio]);
    datos.push(["TOTAL","",Number(totalAnual.toFixed(2))]);
  } else {
    var totalMes=ventas.reduce(function(s,d){return s+d.precio*d.cantidad;},0);
    var nombreMes=MES[Number(mesSel)-1].toUpperCase();
    datos.push(["AÑO",anio,"MES",nombreMes]);
    datos.push(["TOTAL "+nombreMes+"-"+anio,"",Number(totalMes.toFixed(2))]);
  }
  datos.push([]);
  datos.push(["FECHA","NICK","Nro. WhatsApp","CANTIDAD","SUB TOTAL"]);
  ventas.forEach(function(d){
    var c=cById(d.clienteId);
    datos.push([fechaCorta(d.fecha),c?c.nick||"":"",c?c.telefono||"":"",d.cantidad,Number((d.precio*d.cantidad).toFixed(2))]);
  });

  var ws=XLSX.utils.aoa_to_sheet(datos);
  ws["!cols"]=[{wch:16},{wch:22},{wch:16},{wch:12},{wch:12}];
  var wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Detalle Clientas");
  XLSX.writeFile(wb,"Reporte_DetClientas_"+anio+(mesSel?"_"+MES[Number(mesSel)-1]:"")+".xlsx");
}

// Reporte 2: "Solo Importe Total" — sin datos de clientas, agregado por mes (si es
// todo el año) o por día (si se eligió un mes específico).
function descargarReporteImporteTotal(){
  if(typeof XLSX==="undefined"){
    alert("No se pudo cargar el generador de Excel. Revisa tu conexión e inténtalo de nuevo.");
    return;
  }
  var anio=document.getElementById("hv-anio")?document.getElementById("hv-anio").value:String(new Date().getFullYear());
  var mesSel=document.getElementById("hv-mes")?document.getElementById("hv-mes").value:"none";
  if(mesSel==="none"){ alert("Elige un período (mes o \"Todos los meses\") antes de descargar el reporte."); return; }

  var ventasAnio=detalles.filter(function(d){return d.fecha&&d.fecha.slice(0,4)===anio;});
  var datos=[];

  if(!mesSel){
    var totalAnual=ventasAnio.reduce(function(s,d){return s+d.precio*d.cantidad;},0);
    datos.push(["AÑO","",anio]);
    datos.push(["TOTAL","",Number(totalAnual.toFixed(2))]);
    datos.push([]);
    datos.push(["MES","Cantidad","Sub Total"]);
    for(var m=1;m<=12;m++){
      var delMes=ventasAnio.filter(function(d){return Number(d.fecha.slice(5,7))===m;});
      if(!delMes.length) continue;
      var cant=delMes.reduce(function(s,d){return s+(Number(d.cantidad)||0);},0);
      var sub=delMes.reduce(function(s,d){return s+d.precio*d.cantidad;},0);
      datos.push([MES[m-1],cant,Number(sub.toFixed(2))]);
    }
  } else {
    var ventasMes=ventasAnio.filter(function(d){return Number(d.fecha.slice(5,7))===Number(mesSel);});
    var totalMes=ventasMes.reduce(function(s,d){return s+d.precio*d.cantidad;},0);
    var nombreMes=MES[Number(mesSel)-1].toUpperCase();
    datos.push(["AÑO",anio,"MES",nombreMes]);
    datos.push(["TOTAL "+nombreMes+"-"+anio,"",Number(totalMes.toFixed(2))]);
    datos.push([]);
    datos.push(["FECHA","CANTIDAD","SUB TOTAL"]);
    var porDia={};
    ventasMes.forEach(function(d){
      var dia=d.fecha;
      if(!porDia[dia]) porDia[dia]={cant:0,sub:0};
      porDia[dia].cant+=Number(d.cantidad)||0;
      porDia[dia].sub+=d.precio*d.cantidad;
    });
    Object.keys(porDia).sort().forEach(function(dia){
      datos.push([fechaCorta(dia),porDia[dia].cant,Number(porDia[dia].sub.toFixed(2))]);
    });
  }

  var ws=XLSX.utils.aoa_to_sheet(datos);
  ws["!cols"]=[{wch:18},{wch:12},{wch:14},{wch:12}];
  var wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Importe Total");
  XLSX.writeFile(wb,"Reporte_ImporteTotal_"+anio+(mesSel?"_"+MES[Number(mesSel)-1]:"")+".xlsx");
}

// Descarga (en Excel real) todas las ventas con fecha de más de 30 días de antigüedad
function descargarVentasAntiguas(){
  if(typeof XLSX==="undefined"){
    alert("No se pudo cargar el generador de Excel. Revisa tu conexión e inténtalo de nuevo.");
    return;
  }
  var limite=new Date();
  limite.setDate(limite.getDate()-30);
  limite.setHours(0,0,0,0);
  var antiguas=detalles.filter(function(d){
    if(!d.fecha) return false;
    var f=new Date(d.fecha+"T00:00:00");
    return !isNaN(f.getTime())&&f<limite;
  });
  if(!antiguas.length){
    alert("No hay ventas con más de 30 días de antigüedad.");
    return;
  }
  antiguas=antiguas.slice().sort(function(a,b){return new Date(a.fecha)-new Date(b.fecha);});
  var datos=[["Fecha","Nick","Nombre","Celular","Producto","Talla","Color","Cantidad","Precio","SubTotal","Canal","Estado","Estado de Pago"]];
  antiguas.forEach(function(d){
    var c=cById(d.clienteId);
    datos.push([
      fechaCorta(d.fecha),
      c?c.nick||"":"",
      c?c.nombre||"":"",
      c?c.telefono||"":"",
      d.producto,
      d.talla||"",
      d.color||"",
      d.cantidad,
      Number(d.precio.toFixed(2)),
      Number((d.precio*d.cantidad).toFixed(2)),
      d.canal||"",
      d.estado==="Con_OV"?"Con orden":"Sin orden",
      d.estadoPago||"Pendiente de Pago"
    ]);
  });
  var ws=XLSX.utils.aoa_to_sheet(datos);
  ws["!cols"]=[{wch:14},{wch:22},{wch:24},{wch:12},{wch:26},{wch:10},{wch:12},{wch:9},{wch:10},{wch:10},{wch:16},{wch:12},{wch:16}];
  var wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Ventas +30 días");
  XLSX.writeFile(wb,"Ventas_mayores_30_dias_"+today()+".xlsx");
}

// Igual que descargarVentasAntiguas, pero solo ventas CON orden asignada (Con_OV)
function descargarVentasConOrdenAntiguas(){
  if(typeof XLSX==="undefined"){
    alert("No se pudo cargar el generador de Excel. Revisa tu conexión e inténtalo de nuevo.");
    return;
  }
  var limite=new Date();
  limite.setDate(limite.getDate()-30);
  limite.setHours(0,0,0,0);
  var antiguas=detalles.filter(function(d){
    if(d.estado!=="Con_OV") return false;
    if(!d.fecha) return false;
    var f=new Date(d.fecha+"T00:00:00");
    return !isNaN(f.getTime())&&f<limite;
  });
  if(!antiguas.length){
    alert("No hay ventas con orden asignada (Con_OV) con más de 30 días de antigüedad.");
    return;
  }
  antiguas=antiguas.slice().sort(function(a,b){return new Date(a.fecha)-new Date(b.fecha);});
  var datos=[["Fecha","Nick","Nombre","Celular","Producto","Talla","Color","Cantidad","Precio","SubTotal","Canal","Estado","Estado de Pago"]];
  antiguas.forEach(function(d){
    var c=cById(d.clienteId);
    datos.push([
      fechaCorta(d.fecha),
      c?c.nick||"":"",
      c?c.nombre||"":"",
      c?c.telefono||"":"",
      d.producto,
      d.talla||"",
      d.color||"",
      d.cantidad,
      Number(d.precio.toFixed(2)),
      Number((d.precio*d.cantidad).toFixed(2)),
      d.canal||"",
      "Con orden",
      d.estadoPago||"Pendiente de Pago"
    ]);
  });
  var ws=XLSX.utils.aoa_to_sheet(datos);
  ws["!cols"]=[{wch:14},{wch:22},{wch:24},{wch:12},{wch:26},{wch:10},{wch:12},{wch:9},{wch:10},{wch:10},{wch:16},{wch:12},{wch:16}];
  var wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Con Orden +30 días");
  XLSX.writeFile(wb,"Ventas_ConOrden_mayores_30_dias_"+today()+".xlsx");
}

// Igual que descargarVentasConOrdenAntiguas, pero solo ventas SIN orden asignada (Sin_OV)
function descargarVentasSinOrdenAntiguas(){
  if(typeof XLSX==="undefined"){
    alert("No se pudo cargar el generador de Excel. Revisa tu conexión e inténtalo de nuevo.");
    return;
  }
  var limite=new Date();
  limite.setDate(limite.getDate()-30);
  limite.setHours(0,0,0,0);
  var antiguas=detalles.filter(function(d){
    if(d.estado!=="Sin_OV") return false;
    if(!d.fecha) return false;
    var f=new Date(d.fecha+"T00:00:00");
    return !isNaN(f.getTime())&&f<limite;
  });
  if(!antiguas.length){
    alert("No hay ventas sin orden asignada (Sin_OV) con más de 30 días de antigüedad.");
    return;
  }
  antiguas=antiguas.slice().sort(function(a,b){return new Date(a.fecha)-new Date(b.fecha);});
  var datos=[["Fecha","Nick","Nombre","Celular","Producto","Talla","Color","Cantidad","Precio","SubTotal","Canal","Estado","Estado de Pago"]];
  antiguas.forEach(function(d){
    var c=cById(d.clienteId);
    datos.push([
      fechaCorta(d.fecha),
      c?c.nick||"":"",
      c?c.nombre||"":"",
      c?c.telefono||"":"",
      d.producto,
      d.talla||"",
      d.color||"",
      d.cantidad,
      Number(d.precio.toFixed(2)),
      Number((d.precio*d.cantidad).toFixed(2)),
      d.canal||"",
      "Sin orden",
      d.estadoPago||"Pendiente de Pago"
    ]);
  });
  var ws=XLSX.utils.aoa_to_sheet(datos);
  ws["!cols"]=[{wch:14},{wch:22},{wch:24},{wch:12},{wch:26},{wch:10},{wch:12},{wch:9},{wch:10},{wch:10},{wch:16},{wch:12},{wch:16}];
  var wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Sin Orden +30 días");
  XLSX.writeFile(wb,"Ventas_SinOrden_mayores_30_dias_"+today()+".xlsx");
}

// Descarga en Excel exactamente lo que está filtrado en pantalla en Detalle de Ventas
// (búsqueda, Estado Sin_OV/Con_OV, Canal y Estado de Pago).
// Descarga el directorio completo de Clientas con TODOS los campos (Excel/PDF/Imagen)
var CLIENTAS_EXPORT_COLS=[
  {k:"nombre",h:"Nombre"},{k:"nick",h:"Nick"},{k:"redSocial",h:"Red Social"},
  {k:"categoria",h:"Categoría"},{k:"telefono",h:"WhatsApp"},{k:"docIdent",h:"Doc. Ident."},
  {k:"numDI",h:"N° DI"},{k:"dpto",h:"Dpto."},{k:"provincia",h:"Provincia"},
  {k:"ciudad",h:"Distrito"},{k:"nombreLocalAgencia",h:"Nombre Local Agencia"},
  {k:"direccion",h:"Dirección"},{k:"referencia",h:"Referencia"},{k:"ubicacionMaps",h:"Ubicación (Maps)"},
  {k:"cumpleDia",h:"Cumple Día"},{k:"cumpleMes",h:"Cumple Mes"},{k:"notas",h:"Notas"},{k:"creado",h:"Creado"}
];
function descargarClientasCompleto(formato){
  var lista=clientes.slice().sort(function(a,b){return a.nombre.localeCompare(b.nombre);});
  if(!lista.length){ flashScanMsg("No hay clientas para exportar."); return; }
  var etiqueta="Clientas_completo_"+today();

  if(formato==="excel"){
    if(typeof XLSX==="undefined"){
      flashScanMsg("No se pudo cargar el generador de Excel. Revisa tu conexión e inténtalo de nuevo.");
      return;
    }
    var datos=[CLIENTAS_EXPORT_COLS.map(function(c){return c.h;})];
    lista.forEach(function(c){
      datos.push(CLIENTAS_EXPORT_COLS.map(function(col){return c[col.k]||"";}));
    });
    var ws=XLSX.utils.aoa_to_sheet(datos);
    ws["!cols"]=CLIENTAS_EXPORT_COLS.map(function(){return {wch:18};});
    var wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,"Clientas");
    XLSX.writeFile(wb,etiqueta+".xlsx");
    return;
  }

  // PDF / Imagen: tabla ancha dibujada en canvas
  var colW=130,rowH=22,padX=16,headerH=50;
  var w=padX*2+colW*CLIENTAS_EXPORT_COLS.length;
  var h=headerH+rowH*(lista.length+1)+16;
  var cv=document.createElement("canvas");
  cv.width=w;cv.height=h;
  var ctx=cv.getContext("2d");
  ctx.fillStyle="#ffffff";ctx.fillRect(0,0,w,h);
  ctx.fillStyle="#1a1a1a";ctx.font="bold 18px Arial";
  ctx.fillText("JESSDAY STYLE — Directorio de Clientas ("+lista.length+")",padX,28);

  var y=headerH;
  ctx.font="bold 10px Arial";ctx.fillStyle="#555";
  CLIENTAS_EXPORT_COLS.forEach(function(col,i){
    ctx.fillText(col.h,padX+i*colW,y);
  });
  y+=6;
  ctx.strokeStyle="#999";ctx.beginPath();ctx.moveTo(padX,y);ctx.lineTo(w-padX,y);ctx.stroke();
  y+=16;

  ctx.font="10px Arial";
  lista.forEach(function(c,ri){
    if(ri%2===1){ ctx.fillStyle="#F7F3EF";ctx.fillRect(padX-4,y-13,w-padX*2+8,rowH);ctx.fillStyle="#222"; }
    else ctx.fillStyle="#222";
    CLIENTAS_EXPORT_COLS.forEach(function(col,i){
      var val=String(c[col.k]||"");
      if(val.length>18) val=val.slice(0,18)+"…";
      ctx.fillText(val,padX+i*colW,y);
    });
    y+=rowH;
  });

  if(formato==="pdf"){
    var imgData=cv.toDataURL("image/jpeg",0.9);
    var pdfBlob=buildSimplePDF(imgData,w,h);
    var url=URL.createObjectURL(pdfBlob);
    var a=document.createElement("a");
    a.href=url;a.download=etiqueta+".pdf";
    document.body.appendChild(a);a.click();
    setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(url);},800);
  } else if(formato==="imagen"){
    var url2=cv.toDataURL("image/png");
    var a2=document.createElement("a");
    a2.href=url2;a2.download=etiqueta+".png";
    document.body.appendChild(a2);a2.click();
    setTimeout(function(){document.body.removeChild(a2);},800);
  }
}
function descargarVentasFiltradas(){
  if(typeof XLSX==="undefined"){
    alert("No se pudo cargar el generador de Excel. Revisa tu conexión e inténtalo de nuevo.");
    return;
  }
  var q=(document.getElementById("src-v")?document.getElementById("src-v").value:"").toLowerCase();
  var fe=document.getElementById("fv-est")?document.getElementById("fv-est").value:"";
  var fc=document.getElementById("fv-can")?document.getElementById("fv-can").value:"";
  var fp=document.getElementById("fv-pago")?document.getElementById("fv-pago").value:"";
  var filtradas=detalles.filter(function(d){
    var c=cById(d.clienteId);
    return(d.producto.toLowerCase().indexOf(q)>=0||(c&&c.nombre.toLowerCase().indexOf(q)>=0)||(c&&(c.nick||"").toLowerCase().indexOf(q)>=0)||(d.codigoQR||"").toLowerCase().indexOf(q)>=0)&&(!fe||d.estado===fe)&&(!fc||d.canal===fc)&&(!fp||(d.estadoPago||"Pendiente de Pago")===fp);
  });
  if(!filtradas.length){
    alert("No hay ventas que coincidan con el filtro actual.");
    return;
  }
  filtradas=filtradas.slice().sort(function(a,b){return new Date(a.fecha)-new Date(b.fecha);});
  var datos=[["Fecha","Nick","Nombre","Celular","Producto","Talla","Color","Cantidad","Precio","SubTotal","Canal","Estado","Estado de Pago"]];
  filtradas.forEach(function(d){
    var c=cById(d.clienteId);
    datos.push([
      fechaCorta(d.fecha),
      c?c.nick||"":"",
      c?c.nombre||"":"",
      c?c.telefono||"":"",
      d.producto,
      d.talla||"",
      d.color||"",
      d.cantidad,
      Number(d.precio.toFixed(2)),
      Number((d.precio*d.cantidad).toFixed(2)),
      d.canal||"",
      d.estado==="Con_OV"?"Con orden":"Sin orden",
      d.estadoPago||"Pendiente de Pago"
    ]);
  });
  var ws=XLSX.utils.aoa_to_sheet(datos);
  ws["!cols"]=[{wch:14},{wch:22},{wch:24},{wch:12},{wch:26},{wch:10},{wch:12},{wch:9},{wch:10},{wch:10},{wch:16},{wch:12},{wch:16}];
  var wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Ventas filtradas");
  XLSX.writeFile(wb,"Ventas_filtro_"+today()+".xlsx");
}

// Dibuja la tabla (Nombre, Nick, Cantidad, SubTotal) en un canvas para exportar como PDF o imagen
function buildVentasMesCanvas(filas,titulo){
  var rowH=30,headerH=70,padX=20,w=560;
  var h=headerH+rowH*filas.length+30;
  var cv=document.createElement("canvas");
  cv.width=w;cv.height=h;
  var ctx=cv.getContext("2d");
  ctx.fillStyle="#FAF7F4";ctx.fillRect(0,0,w,h);
  ctx.fillStyle="#2C2C2C";
  ctx.font="bold 18px Arial";
  ctx.fillText(titulo.replace(/_/g," "),padX,32);
  ctx.font="bold 12px Arial";
  ctx.fillStyle="#8A8A8A";
  ctx.fillText("NOMBRE / NICK",padX,headerH-12);
  ctx.fillText("CANT.",w-200,headerH-12);
  ctx.fillText("SUBTOTAL",w-110,headerH-12);
  ctx.strokeStyle="#F0EDE9";
  ctx.beginPath();ctx.moveTo(padX,headerH-2);ctx.lineTo(w-padX,headerH-2);ctx.stroke();
  var y=headerH+20;
  filas.forEach(function(f,i){
    ctx.fillStyle="#2C2C2C";
    ctx.font="13px Arial";
    var nombreTxt=f.nombre.length>26?f.nombre.slice(0,26)+"…":f.nombre;
    ctx.fillText(nombreTxt,padX,y);
    if(f.nick){
      ctx.font="11px Arial";
      ctx.fillStyle="#D9889A";
      ctx.fillText(f.nick,padX,y+15);
    }
    ctx.font="bold 13px Arial";
    ctx.fillStyle="#6BB5B5";
    ctx.fillText(String(f.cant),w-200,y);
    ctx.fillStyle="#D9889A";
    ctx.fillText(fmt(f.subtotal),w-110,y);
    ctx.strokeStyle="#F0EDE9";
    ctx.beginPath();ctx.moveTo(padX,y+18);ctx.lineTo(w-padX,y+18);ctx.stroke();
    y+=rowH;
  });
  return cv;
}
// Exponemos las funciones al entorno global (Dashboard y Reportes)
window.renderHome = renderHome;
window.descargarComprasGastosPorMes = descargarComprasGastosPorMes;
window.exportarComprasGastosDetalle = exportarComprasGastosDetalle;
window.descargarTabla = descargarTabla;
window.exportarFilas = exportarFilas;
window.descargarVentasMes = descargarVentasMes;
window.exportarConEncabezado = exportarConEncabezado;
window.buildReporteCanvas = buildReporteCanvas;
window.descargarReporteDetClientas = descargarReporteDetClientas;
window.descargarReporteImporteTotal = descargarReporteImporteTotal;
window.descargarVentasAntiguas = descargarVentasAntiguas;
window.descargarVentasConOrdenAntiguas = descargarVentasConOrdenAntiguas;
window.descargarVentasSinOrdenAntiguas = descargarVentasSinOrdenAntiguas;
window.descargarClientasCompleto = descargarClientasCompleto;
window.descargarVentasFiltradas = descargarVentasFiltradas;
window.buildVentasMesCanvas = buildVentasMesCanvas;