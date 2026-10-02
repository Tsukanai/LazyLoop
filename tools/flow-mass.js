"use strict";
const $=id=>document.getElementById(id);
const num=id=>$(id).value.trim()===""?NaN:Number($(id).value);
const fmt=(n,d=6)=>Number(n.toFixed(d)).toString();
let direction="volume";
function calc(){
 let m=num("mass"),v=num("volume"),d=num("density");
 const source=direction==="mass"?m:v;
 const bad=![source,d].every(Number.isFinite)||source<0||d<=0;
 $("error").textContent=bad?"Enter a non-negative flow and a positive density.":"";
 if(bad){$("tonnes").textContent="—";$("litres").textContent="—";return;}
 if(direction==="volume"){m=v*d;$("mass").value=fmt(m);}
 else{v=m/d;$("volume").value=fmt(v);}
 $("tonnes").textContent=fmt(m/1000)+" t/h";
 $("litres").textContent=fmt(v*1000/60)+" L/min";
}
["mass","volume"].forEach(id=>$(id).addEventListener("input",()=>{direction=id;calc();}));
$("density").addEventListener("input",calc);calc();
