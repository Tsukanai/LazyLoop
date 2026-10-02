"use strict";
const $=id=>document.getElementById(id);
const num=id=>$(id).value.trim()===""?NaN:Number($(id).value);
const fmt=(n,d=6)=>Number(n.toFixed(d)).toString();
let direction="dp";
function calc(){
 const maxDp=num("dpSpan"),maxQ=num("flowSpan");
 let dp=num("appliedDp"),q=num("actualFlow");
 const source=direction==="dp"?dp:q,limit=direction==="dp"?maxDp:maxQ;
 const bad=![maxDp,maxQ,source].every(Number.isFinite)||maxDp<=0||maxQ<=0||source<0||source>limit;
 $("error").textContent=bad?"Enter positive full-scale ranges and a value between zero and full scale.":"";
 if(bad){["dpPct","flowPct","linearMa","sqrtMa"].forEach(id=>$(id).textContent="—");return;}
 if(direction==="dp"){q=maxQ*Math.sqrt(dp/maxDp);$("actualFlow").value=fmt(q);}
 else{dp=maxDp*(q/maxQ)**2;$("appliedDp").value=fmt(dp);}
 const p=dp/maxDp,f=q/maxQ;
 $("dpPct").textContent=fmt(p*100,3)+" %";
 $("flowPct").textContent=fmt(f*100,3)+" %";
 $("linearMa").textContent=fmt(4+16*p,4)+" mA";
 $("sqrtMa").textContent=fmt(4+16*f,4)+" mA";
}
["appliedDp","actualFlow"].forEach(id=>$(id).addEventListener("input",()=>{direction=id==="appliedDp"?"dp":"flow";calc();}));
["dpSpan","flowSpan"].forEach(id=>$(id).addEventListener("input",calc));calc();
