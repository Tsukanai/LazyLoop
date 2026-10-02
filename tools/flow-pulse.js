"use strict";
const $=id=>document.getElementById(id);
const num=id=>$(id).value.trim()===""?NaN:Number($(id).value);
const fmt=(n,d=6)=>Number(n.toFixed(d)).toString();
let direction="hz";
function calc(){
 const k=num("k"),hz=num("hz"),flow=num("flow"),count=num("count");
 const source=direction==="hz"?hz:flow;
 const bad=![k,source].every(Number.isFinite)||k<=0||source<0;
 $("error").textContent=bad?"Enter a positive K-factor and a non-negative frequency or flow.":(!Number.isFinite(count)||count<0?"Enter a non-negative pulse count to calculate the total.":"");
 if(!bad){if(direction==="hz")$("flow").value=fmt(hz*3.6/k);else $("hz").value=fmt(flow*k/3.6);}
 const total=!Number.isFinite(k)||k<=0||!Number.isFinite(count)||count<0;
 $("litres").textContent=total?"—":fmt(count/k)+" L";
 $("cubes").textContent=total?"—":fmt(count/k/1000)+" m³";
}
["hz","flow"].forEach(id=>$(id).addEventListener("input",()=>{direction=id;calc();}));
["k","count"].forEach(id=>$(id).addEventListener("input",calc));calc();
