
var MODELS=[
  {p:'Anthropic',c:'#D85A30',n:'Claude Haiku 4.5',t:'fast',i:1.00,o:5.00,str:['Taches repetitives','Extraction','Chatbot basique']},
  {p:'Anthropic',c:'#D85A30',n:'Claude Sonnet 4.6',t:'balanced',i:3.00,o:15.00,str:['Code','Redaction','Analyse']},
  {p:'Anthropic',c:'#D85A30',n:'Claude Opus 4.6',t:'powerful',i:5.00,o:25.00,str:['Code complexe','Raisonnement','Juridique']},
  {p:'OpenAI',c:'#059669',n:'GPT-5 nano',t:'fast',i:0.05,o:0.40,str:['Ultra-economique','Classification']},
  {p:'OpenAI',c:'#059669',n:'GPT-5 mini',t:'fast',i:0.25,o:2.00,str:['Economique','Polyvalent']},
  {p:'OpenAI',c:'#059669',n:'GPT-4o',t:'balanced',i:1.25,o:5.00,str:['Vision','Multimodal','Polyvalent']},
  {p:'OpenAI',c:'#059669',n:'GPT-5.2',t:'powerful',i:1.75,o:14.00,str:['Raisonnement','Recherche']},
  {p:'OpenAI',c:'#059669',n:'GPT-5.2 Pro',t:'ultra',i:21.00,o:168.00,str:['Meilleur marche','Tres cher']},
  {p:'Google',c:'#D97706',n:'Gemini 3 Flash',t:'fast',i:0.10,o:0.40,str:['Rapide','Economique']},
  {p:'Google',c:'#D97706',n:'Gemini 2.5 Flash',t:'fast',i:0.26,o:1.05,str:['Grand contexte','Economique']},
  {p:'Google',c:'#D97706',n:'Gemini 2.5 Pro',t:'balanced',i:1.25,o:10.00,str:['1M tokens contexte','Multimodal']},
  {p:'Google',c:'#D97706',n:'Gemini 3.1 Pro',t:'powerful',i:2.00,o:12.00,str:['Recherche Google integree']},
  {p:'xAI',c:'#7C3AED',n:'Grok 4.1',t:'fast',i:0.20,o:0.50,str:['Actualite X/Twitter','Economique']},
  {p:'xAI',c:'#7C3AED',n:'Grok 4.1 Heavy',t:'powerful',i:3.00,o:15.00,str:['Raisonnement','Actualite temps reel']},
  {p:'DeepSeek',c:'#6B6860',n:'DeepSeek V3',t:'balanced',i:0.27,o:1.10,str:['Tres economique','Traduction','Polyvalent']},
  {p:'DeepSeek',c:'#6B6860',n:'DeepSeek R1',t:'powerful',i:0.55,o:2.19,str:['Code','Maths','Raisonnement','Tres economique']}
];
var SPEC={
  code:{best:['Claude Sonnet 4.6','Claude Opus 4.6','DeepSeek R1'],note:'Claude et DeepSeek R1 excellent en code'},
  analyze:{best:['Claude Opus 4.6','DeepSeek R1','GPT-5.2'],note:'Claude Opus et DeepSeek R1 pour l\'analyse complexe a prix bas'},
  resume:{best:['Claude Haiku 4.5','Gemini 2.5 Flash','GPT-5 nano'],note:'Les modeles rapides sont amplement suffisants pour resumer'},
  extract:{best:['Claude Haiku 4.5','GPT-5 nano','Gemini 3 Flash'],note:'Tache simple : choisir le moins cher'},
  write:{best:['Claude Sonnet 4.6','GPT-4o'],note:'Claude Sonnet et GPT-4o excellent en redaction'},
  chat:{best:['Claude Haiku 4.5','GPT-5 mini','Gemini 3 Flash'],note:'Modeles rapides et economiques pour le chatbot'},
  translate:{best:['DeepSeek V3','Claude Haiku 4.5','GPT-5 mini'],note:'DeepSeek V3 offre le meilleur rapport qualite/prix en traduction'},
  classify:{best:['GPT-5 nano','Gemini 3 Flash','Claude Haiku 4.5'],note:'Les modeles les moins chers sont parfaits pour classifier'}
};
var TO={fast:0,balanced:1,powerful:2,ultra:3};
var TL={fast:'Rapide',balanced:'Equilibre',powerful:'Puissant',ultra:'Ultra'};
var TC={fast:'tf',balanced:'tba',powerful:'tpw',ultra:'tu'};
var tfilt='all';var simSel={};var chartsOk=false;
var favs=JSON.parse(localStorage.getItem('tw_favs')||'[]');
var currentCat='all';var searchQ='';

function f(n){return n<0.01?'$'+n.toFixed(4):n<1?'$'+n.toFixed(3):'$'+n.toFixed(2);}
function fb(n){return n>=1000?'$'+Math.round(n).toLocaleString('fr-FR'):'$'+n.toFixed(2);}
function fn(n){return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1000?(n/1000).toFixed(0)+'k':n.toLocaleString('fr-FR');}

function goPage(name){
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('show');});
  document.querySelectorAll('.nav-btn').forEach(function(b){b.classList.remove('active');});
  document.getElementById('page-'+name).classList.add('show');
  document.getElementById('btn-'+name).classList.add('active');
  if(name==='tracker'){renderTS();renderT();}
  if(name==='tokens'&&!chartsOk){setTimeout(initCharts,100);chartsOk=true;}
  if(name==='prompts'){renderPrompts();}
}

// CHARTS
function initCharts(){
  var gc='rgba(226,222,214,0.6)';var tc='#A8A49C';
  new Chart(document.getElementById('chart-usage'),{type:'bar',data:{
    labels:['FAQ chatbot','Extraction','Traduction','Resume docs','Emails','Rapports','Analyse'],
    datasets:[
      {label:'Input',data:[9,60,90,280,25,90,90],backgroundColor:'rgba(37,99,235,0.65)',borderWidth:0,borderRadius:3},
      {label:'Output',data:[25,12,90,42,250,180,180],backgroundColor:'rgba(5,150,105,0.65)',borderWidth:0,borderRadius:3}
    ]
  },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:tc,font:{size:10},boxWidth:12}}},scales:{
    x:{stacked:true,ticks:{color:tc,font:{size:10}},grid:{color:gc}},
    y:{stacked:true,ticks:{color:tc,font:{size:10},callback:function(v){return '$'+v;}},grid:{color:gc}}
  }}});
  new Chart(document.getElementById('chart-evo'),{type:'line',data:{
    labels:['Jan 2023','Jul 2023','Jan 2024','Jul 2024','Jan 2025','Mar 2026'],
    datasets:[
      {label:'OpenAI',data:[30,20,10,5,2.5,1.75],borderColor:'#059669',backgroundColor:'rgba(5,150,105,0.08)',tension:0.4,fill:true,pointRadius:3,borderWidth:2},
      {label:'Anthropic',data:[24,15,8,4,3,3],borderColor:'#2563EB',backgroundColor:'rgba(37,99,235,0.08)',tension:0.4,fill:true,pointRadius:3,borderWidth:2},
      {label:'Google',data:[null,null,7,3,2,2],borderColor:'#D97706',backgroundColor:'rgba(217,119,6,0.08)',tension:0.4,fill:true,pointRadius:3,borderWidth:2,spanGaps:true}
    ]
  },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:tc,font:{size:10},boxWidth:12}}},scales:{
    x:{ticks:{color:tc,font:{size:10}},grid:{color:gc}},
    y:{ticks:{color:tc,font:{size:10},callback:function(v){return '$'+v+'/M';}},grid:{color:gc}}
  }}});
  new Chart(document.getElementById('chart-optim'),{type:'bar',indexAxis:'y',data:{
    labels:['Aucune optim','Bon modele','+ Prompts courts','+ Reponses courtes','+ Batch mode'],
    datasets:[{data:[1000,100,70,38,18],backgroundColor:['rgba(220,38,38,0.7)','rgba(217,119,6,0.7)','rgba(37,99,235,0.7)','rgba(5,150,105,0.7)','rgba(124,58,237,0.7)'],borderWidth:0,borderRadius:3}]
  },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{
    x:{ticks:{color:tc,font:{size:10},callback:function(v){return '$'+v;}},grid:{color:gc}},
    y:{ticks:{color:tc,font:{size:10}},grid:{color:'transparent'}}
  }}});
}

// TOKENS NAV
function tokNav(btn){
  document.querySelectorAll('.tok-tab').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  var sec=document.getElementById('tok-'+btn.dataset.sec);
  if(sec){var top=sec.getBoundingClientRect().top+window.scrollY-110;window.scrollTo({top:top,behavior:'smooth'});}
}

// VOICE
var recog=null,listening=false;
function toggleMic(){
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){alert('Utilisez Chrome pour la reconnaissance vocale.');return;}
  if(listening){recog.stop();return;}
  recog=new SR();recog.lang='fr-FR';recog.continuous=true;recog.interimResults=true;
  recog.onstart=function(){listening=true;document.getElementById('mic-btn').classList.add('on');document.getElementById('vhint').textContent='Ecoute... Parle maintenant';};
  recog.onresult=function(e){var t='';for(var i=e.resultIndex;i<e.results.length;i++)t+=e.results[i][0].transcript;var ta=document.getElementById('ui');ta.value=(ta.dataset.base||'')+t;};
  recog.onspeechend=function(){var ta=document.getElementById('ui');ta.dataset.base=ta.value+' ';};
  recog.onerror=function(){listening=false;document.getElementById('mic-btn').classList.remove('on');};
  recog.onend=function(){listening=false;document.getElementById('mic-btn').classList.remove('on');document.getElementById('vhint').textContent='Appuie sur le micro pour parler';};
  recog.start();
}
function setEx(txt){document.getElementById('ui').value=txt;}
function hk(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();analyze();}}

// CONSEILLER NLP
function analyzeText(txt){
  var t=txt.toLowerCase();
  var tp={resume:['resum','synthes','condens'],extract:['extrai','extraire','recuper','facture','invoice','donnee','data','structur','champ'],
    write:['redige','rediger','ecrire','rapport','article','blog','email','lettre','contenu'],
    code:['code','coder','programmer','script','fonction','api','bug','logiciel','application','python','javascript','html'],
    analyze:['analys','audit','evaluer','comparer','financier','bilan','prevision','strateg'],
    chat:['chatbot','chat','conversation','repondre','support','service client','faq','assistant'],
    translate:['tradui','traduire','langue','anglais','espagnol','allemand'],
    classify:['classer','classifier','categoris','trier','filtrer']};
  var ts={};Object.keys(tp).forEach(function(k){var s=0;tp[k].forEach(function(p){if(t.indexOf(p)>=0)s++;});ts[k]=s;});
  var task='chat',best=0;Object.keys(ts).forEach(function(k){if(ts[k]>best){best=ts[k];task=k;}});
  var inputTok=600;
  var pm=t.match(/(\d+)\s*page/);
  if(pm)inputTok=Math.min(parseInt(pm[1])*700,50000);
  else if(t.indexOf('long')>=0||t.indexOf('complet')>=0)inputTok=5000;
  else if(t.indexOf('court')>=0||t.indexOf('email')>=0||t.indexOf('message')>=0)inputTok=300;
  else if(t.indexOf('facture')>=0)inputTok=500;
  var om2={resume:function(){return Math.max(150,Math.round(inputTok*0.12));},extract:function(){return 150;},write:function(){return Math.max(700,inputTok*0.8);},code:function(){return 1400;},analyze:function(){return 550;},chat:function(){return 230;},translate:function(){return Math.max(350,inputTok*0.85);},classify:function(){return 70;}};
  var outputTok=om2[task]?om2[task]():380;
  var volume=500;
  var vp=[
    {r:/(\d+)\s*fois?\s*(par|\/)\s*jour/,m:22},{r:/(\d+)\s*fois?\s*(par|\/)\s*semaine/,m:4},{r:/(\d+)\s*fois?\s*(par|\/)\s*mois/,m:1},
    {r:/(\d+)\s*(message|requete|document|facture|contrat|rapport|email|fichier|pdf)s?\s*(par|\/)\s*jour/,m:22},
    {r:/(\d+)\s*(message|requete|document|facture|contrat|rapport|email|fichier|pdf)s?\s*(par|\/)\s*semaine/,m:4},
    {r:/(\d+)\s*(message|requete|document|facture|contrat|rapport|email|fichier|pdf)s?\s*(par|\/)\s*mois/,m:1}
  ];
  for(var pi=0;pi<vp.length;pi++){var vm=t.match(vp[pi].r);if(vm){volume=parseInt(vm[1])*vp[pi].m;break;}}
  if(volume<1)volume=500;if(volume>500000)volume=500000;
  var quality='fast';
  ['expert','precis','professionnel','juridique','legal','financier','audit','complexe','strateg','critique'].forEach(function(w){if(t.indexOf(w)>=0)quality='powerful';});
  if(quality==='fast')['bon','correct','rapport','client','standard','professionnel'].forEach(function(w){if(t.indexOf(w)>=0)quality='balanced';});
  if(task==='analyze'||task==='code')quality=quality==='fast'?'balanced':quality;
  var taskLbls={resume:'resume de documents',extract:'extraction de donnees',write:'redaction de contenu',code:'generation de code',analyze:'analyse / raisonnement',chat:'chatbot / conversation',translate:'traduction',classify:'classification'};
  var summary='<strong>Tache detectee :</strong> '+taskLbls[task]+'<br>'+
    '<strong>Texte envoye :</strong> ~'+fn(inputTok)+' tokens / requete<br>'+
    '<strong>Reponse attendue :</strong> ~'+fn(outputTok)+' tokens / requete<br>'+
    '<strong>Volume :</strong> ~'+volume.toLocaleString('fr-FR')+' requetes / mois';
  var minO=TO[quality]||0;var spec=SPEC[task];
  var tIM=volume*inputTok/1e6,tOM=volume*outputTok/1e6;
  var cands=MODELS.filter(function(m){return TO[m.t]>=minO;});
  if(!cands.length)cands=MODELS.slice();
  cands=cands.map(function(m){
    var ci=m.i*tIM,co=m.o*tOM,tot=ci+co;
    var isSpec=spec&&spec.best.indexOf(m.n)>=0;
    return {p:m.p,c:m.c,n:m.n,t:m.t,i:m.i,o:m.o,ci:ci,co:co,tot:tot,isSpec:isSpec,str:m.str};
  }).sort(function(a,b){return (a.tot*(a.isSpec?0.92:1))-(b.tot*(b.isSpec?0.92:1));});
  var maxC=Math.max.apply(null,cands.map(function(x){return x.tot;}));
  var wm={resume:["Gros input","Peu d'output","Vitesse ok"],extract:["Precision","Output minimal","Economique"],write:["Output long","Qualite","Creativite"],code:["Code","Precision","Logique"],analyze:["Raisonnement","Complexe","Fiable"],chat:["Temps reel","Economique","Volume"],translate:["Fidelite","Nuance","Rapide"],classify:["Volume","Minimal","Economique"]};
  return {summary:summary,inputTok:inputTok,outputTok:outputTok,volume:volume,quality:quality,task:task,top3:cands.slice(0,3),maxC:maxC,wt:wm[task]||['Adapte','Economique'],spec:spec};
}

function analyze(){
  var input=document.getElementById('ui').value.trim();
  if(!input||input.length<8){alert('Decris un peu plus ta demande.');return;}
  if(listening)recog.stop();
  document.getElementById('thinking').classList.add('show');
  document.getElementById('result-block').classList.remove('show');
  document.getElementById('send-btn').disabled=true;

  fetch('/api/analyze',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({userMessage:input})
  })
  .then(function(res){return res.json();})
  .then(function(data){
    if(data.error){throw new Error(data.error);}
    var r=JSON.parse(data.result);
    displayAIResult(r,input);
  })
  .catch(function(){
    setTimeout(function(){
    var r=analyzeText(input);
    document.getElementById('rsumm').innerHTML=r.summary;
    document.getElementById('pgrid').innerHTML=
      '<div class="pc"><div class="plbl">Input</div><div class="pval">'+fn(r.inputTok)+'</div><div class="phint">tokens/req</div></div>'+
      '<div class="pc"><div class="plbl">Output</div><div class="pval">'+fn(r.outputTok)+'</div><div class="phint">tokens/req</div></div>'+
      '<div class="pc"><div class="plbl">Volume</div><div class="pval">'+fn(r.volume)+'</div><div class="phint">req/mois</div></div>'+
      '<div class="pc"><div class="plbl">Qualite</div><div class="pval">'+TL[r.quality]+'</div><div class="phint">minimum</div></div>';
    var sn=r.spec?'<div class="spec-note">Conseil : '+r.spec.note+'</div>':'';
    document.getElementById('recs').innerHTML=r.top3.map(function(m,i){
      var sv=r.maxC>0?((1-m.tot/r.maxC)*100).toFixed(0):0;
      var sb=m.isSpec?'<span class="tag tp" style="font-size:9px;margin-left:4px">Expert</span>':'';
      return '<div class="rec'+(i===0?' best':'')+'"><div class="rn'+(i===0?' g':'')+'">'+( i===0?'★':i+1)+'</div>'+
        '<div><div class="rm">'+m.n+sb+'</div><div class="rp2">'+m.p+' · '+TL[m.t]+'</div>'+
        '<div class="rtags">'+r.wt.map(function(t){return '<span class="rtag">'+t+'</span>';}).join('')+
        m.str.slice(0,2).map(function(s){return '<span class="rtag" style="color:var(--accent);border-color:#93C5FD;background:var(--accent-bg)">'+s+'</span>';}).join('')+'</div></div>'+
        '<div class="rright"><div class="rcost">'+fb(m.tot)+'</div><div class="runit">par mois</div><div class="rsave">-'+sv+'% vs pire</div></div></div>';
    }).join('')+(sn?'<div style="margin-top:6px">'+sn+'</div>':'');
    var b=r.top3[0];
    document.getElementById('bdown').innerHTML='<div class="bdt">Detail — '+b.n+'</div>'+
      '<div class="brow"><span>Tokens envoyes/req</span><span>'+fn(r.inputTok)+'</span></div>'+
      '<div class="brow"><span>Tokens recus/req</span><span>'+fn(r.outputTok)+'</span></div>'+
      '<div class="brow"><span>Volume mensuel</span><span>'+r.volume.toLocaleString('fr-FR')+' req</span></div>'+
      '<div class="brow"><span>Cout input ('+f(b.i)+'/M)</span><span>'+fb(b.ci)+'</span></div>'+
      '<div class="brow"><span>Cout output ('+f(b.o)+'/M)</span><span>'+fb(b.co)+'</span></div>'+
      '<div class="brow"><span>Total mensuel</span><span>'+fb(b.tot)+'</span></div>';
    document.getElementById('thinking').classList.remove('show');
    document.getElementById('result-block').classList.add('show');
    document.getElementById('send-btn').disabled=false;
    document.getElementById('result-block').scrollIntoView({behavior:'smooth',block:'start'});
  },800);
});
  });
}

function displayAIResult(r,input){
  document.getElementById('thinking').classList.remove('show');
  document.getElementById('send-btn').disabled=false;
  var totalIM=r.volume_monthly*r.input_tokens/1e6;
  var totalOM=r.volume_monthly*r.output_tokens/1e6;
  var allCosts=MODELS.map(function(m){return m.i*totalIM+m.o*totalOM;});
  var maxC=Math.max.apply(null,allCosts);
  document.getElementById('rsumm').innerHTML='<strong>Ce que j\'ai compris :</strong> '+r.summary+'<br><em style="font-size:11px;color:var(--text3)">'+r.reasoning+'</em>';
  document.getElementById('pgrid').innerHTML=
    '<div class="pc"><div class="plbl">Input</div><div class="pval">'+fn(r.input_tokens)+'</div><div class="phint">tokens/req</div></div>'+
    '<div class="pc"><div class="plbl">Output</div><div class="pval">'+fn(r.output_tokens)+'</div><div class="phint">tokens/req</div></div>'+
    '<div class="pc"><div class="plbl">Volume</div><div class="pval">'+fn(r.volume_monthly)+'</div><div class="phint">req/mois</div></div>'+
    '<div class="pc"><div class="plbl">Qualite</div><div class="pval">'+TL[r.quality_needed]+'</div><div class="phint">minimum</div></div>';
  var recos=r.recommendations||[];
  document.getElementById('recs').innerHTML=recos.map(function(rec,i){
    var m=MODELS.find(function(x){return x.n===rec.model;})||MODELS[0];
    var sv=maxC>0?((1-rec.monthly_cost/maxC)*100).toFixed(0):0;
    return '<div class="rec'+(i===0?' best':'')+'"><div class="rn'+(i===0?' g':'')+'">'+( i===0?'★':i+1)+'</div>'+
      '<div><div class="rm">'+m.n+'</div><div class="rp2">'+m.p+' · '+TL[m.t]+'</div>'+
      '<div class="rtags"><span class="rtag">'+rec.why+'</span></div></div>'+
      '<div class="rright"><div class="rcost">'+fb(rec.monthly_cost)+'</div><div class="runit">par mois</div><div class="rsave">-'+sv+'% vs pire</div></div></div>';
  }).join('')+(r.specialty_note?'<div class="spec-note" style="margin-top:6px">'+r.specialty_note+'</div>':'');
  var best=recos[0];
  if(best){
    var bm=MODELS.find(function(x){return x.n===best.model;})||MODELS[0];
    var ci=bm.i*totalIM,co=bm.o*totalOM;
    document.getElementById('bdown').innerHTML='<div class="bdt">Detail - '+bm.n+'</div>'+
      '<div class="brow"><span>Tokens/req input</span><span>'+fn(r.input_tokens)+'</span></div>'+
      '<div class="brow"><span>Tokens/req output</span><span>'+fn(r.output_tokens)+'</span></div>'+
      '<div class="brow"><span>Volume mensuel</span><span>'+r.volume_monthly.toLocaleString('fr-FR')+' req</span></div>'+
      '<div class="brow"><span>Cout input ('+f(bm.i)+'/M)</span><span>'+fb(ci)+'</span></div>'+
      '<div class="brow"><span>Cout output ('+f(bm.o)+'/M)</span><span>'+fb(co)+'</span></div>'+
      '<div class="brow"><span>Total mensuel</span><span>'+fb(best.monthly_cost)+'</span></div>';
  }
  document.getElementById('result-block').classList.add('show');
  document.getElementById('result-block').scrollIntoView({behavior:'smooth',block:'start'});
}

function resetAdv(){document.getElementById('ui').value='';document.getElementById('ui').dataset.base='';document.getElementById('result-block').classList.remove('show');document.getElementById('thinking').classList.remove('show');document.getElementById('send-btn').disabled=false;window.scrollTo({top:0,behavior:'smooth'});}

// TRACKER
function filt(btn){document.querySelectorAll('.fc').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');tfilt=btn.dataset.p;renderT();}
function renderT(){
  var s=document.getElementById('t-sort').value;
  var d=tfilt==='all'?MODELS.slice():MODELS.filter(function(m){return m.p===tfilt;});
  if(s==='ia')d.sort(function(a,b){return a.i-b.i;});else if(s==='id')d.sort(function(a,b){return b.i-a.i;});
  else if(s==='oa')d.sort(function(a,b){return a.o-b.o;});else if(s==='pv')d.sort(function(a,b){return a.p.localeCompare(b.p);});
  else if(s==='tr')d.sort(function(a,b){return TO[a.t]-TO[b.t];});
  var maxI=Math.max.apply(null,MODELS.map(function(m){return m.i;}));
  var minI=Math.min.apply(null,MODELS.map(function(m){return m.i;}));
  document.getElementById('t-body').innerHTML=d.map(function(m){
    var pct=maxI>minI?((m.i-minI)/(maxI-minI)*100).toFixed(0):50;
    return '<tr><td><span class="dot2" style="background:'+m.c+'"></span>'+m.n+(m.i===minI?'<span class="cstar">Moins cher</span>':'')+'</td>'+
      '<td style="color:var(--text2)">'+m.p+'</td><td><span class="tier-t '+TC[m.t]+'">'+TL[m.t]+'</span></td>'+
      '<td class="mono">'+f(m.i)+'</td><td class="mono">'+f(m.o)+'</td>'+
      '<td class="mono" style="color:var(--text2)">'+(m.o/m.i).toFixed(1)+'x</td>'+
      '<td><div class="mb"><div class="mbf" style="width:'+Math.max(2,pct)+'%;background:'+m.c+'"></div></div></td></tr>';
  }).join('');
}
function renderTS(){
  var minI=Math.min.apply(null,MODELS.map(function(m){return m.i;}));
  var maxI=Math.max.apply(null,MODELS.map(function(m){return m.i;}));
  var avg=MODELS.reduce(function(s,m){return s+m.i;},0)/MODELS.length;
  var ch=MODELS.find(function(m){return m.i===minI;});
  var provs=[];MODELS.forEach(function(m){if(provs.indexOf(m.p)<0)provs.push(m.p);});
  document.getElementById('t-stats').innerHTML=
    '<div class="stat"><div class="slbl2">Modeles</div><div class="sval">'+MODELS.length+'</div><div class="shint">'+provs.length+' fournisseurs</div></div>'+
    '<div class="stat"><div class="slbl2">Moins cher</div><div class="sval">'+f(minI)+'</div><div class="shint">'+ch.n+'</div></div>'+
    '<div class="stat"><div class="slbl2">Plus cher</div><div class="sval">'+f(maxI)+'</div><div class="shint">GPT-5.2 Pro</div></div>'+
    '<div class="stat"><div class="slbl2">Moyenne</div><div class="sval">'+f(parseFloat(avg.toFixed(3)))+'</div><div class="shint">par M tokens</div></div>'+
    '<div class="stat"><div class="slbl2">Ecart</div><div class="sval">'+Math.round(maxI/minI)+'x</div><div class="shint">min vs max</div></div>';
  document.getElementById('t-time').textContent='Mis a jour: '+new Date().toLocaleString('fr-FR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit',year:'numeric'});
}

// SIMULATEUR
var IS2={tiny:80,small:550,medium:4500,large:32000};
var OM2={chat:220,resume:function(i){return Math.max(120,Math.round(i*0.12));},extract:130,write:function(i){return Math.max(550,i*0.75);},code:1300,analyze:500,translate:function(i){return Math.max(280,i*0.85);},classify:60};
function sp(el){
  var g=el.closest('.sim-opts').dataset.g;
  el.closest('.sim-opts').querySelectorAll('.sopt').forEach(function(x){x.classList.remove('on');});
  el.classList.add('on');simSel[g]=el.dataset.v;
}
function runSim(){
  if(!simSel.task||!simSel.volume||!simSel.isize||!simSel.quality){alert('Reponds aux 4 questions pour continuer.');return;}
  var task=simSel.task,volume=parseInt(simSel.volume);
  var inputTok=IS2[simSel.isize];
  var om=OM2[task];var outputTok=typeof om==='function'?om(inputTok):om;
  var quality=simSel.quality,minO=TO[quality]||0;
  var spec=SPEC[task];var tIM=volume*inputTok/1e6,tOM=volume*outputTok/1e6;
  var d=MODELS.filter(function(m){return TO[m.t]>=minO;});
  if(!d.length)d=MODELS.slice();
  d=d.map(function(m){
    var tot=m.i*tIM+m.o*tOM;var isSpec=spec&&spec.best.indexOf(m.n)>=0;
    return {p:m.p,c:m.c,n:m.n,t:m.t,tot:tot,isSpec:isSpec};
  }).sort(function(a,b){return (a.tot*(a.isSpec?0.92:1))-(b.tot*(b.isSpec?0.92:1));});
  var maxC=Math.max.apply(null,d.map(function(x){return x.tot;}));
  var best=d[0];
  document.getElementById('sim-best-name').textContent=best.n+' ('+best.p+')';
  document.getElementById('sim-best-sub').textContent=TL[best.t]+(best.isSpec?' · Specialiste pour cette tache':'');
  document.getElementById('sim-best-cost').textContent=fb(best.tot)+'/mois';
  document.getElementById('sim-body').innerHTML=d.map(function(m,i){
    var pct=maxC>0?(m.tot/maxC*100).toFixed(0):0;
    var sv=maxC>0?((1-m.tot/maxC)*100).toFixed(0):0;
    return '<tr class="'+(i===0?'br':'')+'">'+
      '<td style="font-weight:700;color:'+(i===0?'var(--accent)':'var(--text3)')+'">'+( i===0?'★':i+1)+'</td>'+
      '<td><span class="dot2" style="background:'+m.c+'"></span><span style="font-weight:'+(i===0?700:400)+';font-size:12px">'+m.n+'</span>'+(m.isSpec?' <span class="tag tp" style="font-size:9px">Expert</span>':'')+'<div style="font-size:10px;color:var(--text3)">'+m.p+' · '+TL[m.t]+'</div></td>'+
      '<td style="font-weight:700;font-family:monospace;font-size:12px;color:'+(i===0?'var(--green)':'var(--text)')+'">'+fb(m.tot)+'</td>'+
      '<td style="font-weight:700;color:var(--green);font-size:11px">-'+sv+'%</td>'+
      '<td><div style="font-size:10px;color:var(--text3);margin-bottom:2px">'+pct+'%</div><div class="cbar"><div class="cbarf" style="width:'+pct+'%;background:'+m.c+'"></div></div></td></tr>';
  }).join('');
  document.getElementById('sim-res').classList.add('show');
  document.getElementById('sim-res').scrollIntoView({behavior:'smooth',block:'start'});
}
function resetSim(){simSel={};document.querySelectorAll('.sopt').forEach(function(x){x.classList.remove('on');});document.getElementById('sim-res').classList.remove('show');window.scrollTo({top:0,behavior:'smooth'});}

// PROMPTS DATA
var PROMPTS=[
  // BUSINESS
  {cat:'business',title:'Analyse de concurrents',ia:'Claude Sonnet',level:'balanced',tok:'~800 in / ~600 out',body:`Tu es un expert en strategie business. Analyse les concurrents suivants pour [NOM ENTREPRISE] qui vend [PRODUIT/SERVICE].

Concurrents: [LISTE]

Pour chaque concurrent:
1. Points forts principaux
2. Faiblesses
3. Positionnement prix
4. Ce qui me differencie

Conclus par 3 opportunites de marche a saisir.`},
  {cat:'business',title:'Plan d\'action 30 jours',ia:'Claude Sonnet',level:'balanced',tok:'~400 in / ~700 out',body:`Cree un plan d'action sur 30 jours pour:

Objectif: [TON OBJECTIF]
Contexte: [TA SITUATION ACTUELLE]
Ressources: [TEMPS / BUDGET / EQUIPE]
Contraintes: [LIMITES ET OBSTACLES]

Format semaine par semaine avec: qui fait quoi, en combien de temps, et comment mesurer le succes.`},
  {cat:'business',title:'Pitch investisseur en 5 minutes',ia:'Claude Opus',level:'powerful',tok:'~500 in / ~800 out',body:`Tu es un expert en levee de fonds. Redige un pitch de 5 minutes pour:

Entreprise: [NOM]
Produit: [DESCRIPTION]
Marche cible: [QUI SONT TES CLIENTS]
Traction actuelle: [CE QUE TU AS DEJA]
Besoin de financement: [MONTANT ET USAGE]

Structure: probleme → solution → marche → modele economique → equipe → ask`},
  {cat:'business',title:'SWOT automatique',ia:'DeepSeek V3',level:'balanced',tok:'~300 in / ~500 out',body:`Realise une analyse SWOT complete pour:

Entreprise / projet: [DESCRIPTION]
Secteur: [DOMAINE]
Contexte marche: [SITUATION ACTUELLE]

Pour chaque element (Forces, Faiblesses, Opportunites, Menaces): 4 points concrets et actionnables. Conclus par 3 priorites strategiques.`},
  // FINANCE
  {cat:'finance',title:'Resume de rapport financier',ia:'Claude Haiku',level:'fast',tok:'~5000 in / ~400 out',body:`Voici un rapport financier. Resume en 5 points cles maximum:

[COLLER LE RAPPORT ICI]

Format:
- Point 1: [element le plus important]
- Point 2-5: ...
- Alerte: [si quelque chose necessite attention urgente]
- Action recommandee: [priorite numero 1]`},
  {cat:'finance',title:'Extraction de donnees de facture',ia:'Claude Haiku',level:'fast',tok:'~600 in / ~150 out',body:`Extrais les informations de cette facture. Reponds UNIQUEMENT en JSON valide, rien d'autre:

[TEXTE DE LA FACTURE]

JSON attendu:
{
  "numero_facture": "",
  "date": "",
  "fournisseur": "",
  "montant_ht": 0,
  "tva_pct": 0,
  "tva_montant": 0,
  "montant_ttc": 0,
  "description_principale": "",
  "lignes": []
}`},
  {cat:'finance',title:'Analyse de rentabilite',ia:'DeepSeek R1',level:'powerful',tok:'~800 in / ~600 out',body:`Analyse la rentabilite de ce projet / produit:

Investissement initial: [MONTANT]
Charges fixes mensuelles: [MONTANT]
Charges variables par unite: [MONTANT]
Prix de vente unitaire: [MONTANT]
Volume prevu: [UNITE / MOIS]

Calcule: point mort, marge brute, ROI a 12 mois, ROI a 36 mois. Donne une recommandation claire: GO ou NO GO et pourquoi.`},
  {cat:'finance',title:'Prevision de tresorerie',ia:'Claude Sonnet',level:'balanced',tok:'~600 in / ~700 out',body:`Etablis une prevision de tresorerie sur 6 mois a partir de ces donnees:

Solde initial: [MONTANT]
Revenus mensuels prevus: [DETAILS PAR SOURCE]
Charges fixes: [LISTE ET MONTANTS]
Charges variables estimees: [DETAILS]
Investissements prevus: [DETAILS ET DATES]

Presente sous forme de tableau mensuel avec solde de fin de mois. Signale les mois a risque.`},
  // REDACTION
  {cat:'redaction',title:'Email professionnel persuasif',ia:'Claude Sonnet',level:'balanced',tok:'~200 in / ~350 out',body:`Ecris un email professionnel pour [OBJECTIF].

Destinataire: [QUI]
Mon entreprise: [NOM]
Ce que je veux obtenir: [OBJECTIF PRECIS]
Informations cles: [DETAILS]

Contraintes: max 150 mots, ton chaleureux mais professionnel, appel a l'action clair, objet accrocheur inclus.`},
  {cat:'redaction',title:'Post LinkedIn engageant',ia:'GPT-4o',level:'balanced',tok:'~200 in / ~300 out',body:`Ecris un post LinkedIn sur:

Sujet: [SUJET]
Mon expertise: [TON METIER]
Message cle: [CE QUE TU VEUX TRANSMETTRE]
Cible: [QUI LIT TES POSTS]

Regles: commencer par une accroche forte (pas "Je suis fier"), raconter une histoire courte, 3 points en bullet, question finale pour engager, 150-220 mots, 4-5 hashtags.`},
  {cat:'redaction',title:'Article de blog SEO',ia:'Claude Sonnet',level:'balanced',tok:'~300 in / ~1200 out',body:`Redige un article de blog optimise SEO sur:

Sujet: [SUJET]
Mot-cle principal: [MOT-CLE]
Cible: [QUI VA LIRE]
Objectif: [INFORMER / CONVERTIR / FIDELISER]
Longueur: 800 mots environ

Structure: H1 accrocheur, introduction avec hook, 3-4 sections H2 avec contenu concret, conclusion avec call-to-action, meta-description de 155 caracteres.`},
  {cat:'redaction',title:'Fiche produit e-commerce',ia:'GPT-4o',level:'balanced',tok:'~300 in / ~400 out',body:`Redige une fiche produit pour:

Produit: [NOM ET DESCRIPTION]
Prix: [PRIX]
Cible client: [QUI L'ACHETE ET POURQUOI]
Concurrents: [ALTERNATIVES SUR LE MARCHE]
USP: [CE QUI LE DIFFERENCIE]

Inclure: titre accrocheur, description courte (50 mots), description longue (150 mots), 5 bullet points benefices (pas caracteristiques), FAQ 3 questions.`},
  // CODE
  {cat:'code',title:'Generer du code Python propre',ia:'Claude Opus',level:'powerful',tok:'~300 in / ~800 out',body:`Tu es un developpeur Python senior. Ecris du code propre pour:

[DESCRIPTION DE CE QUE DOIT FAIRE LE CODE]

Contraintes:
- Python 3.10+
- Gestion des erreurs obligatoire (try/except)
- Docstrings pour chaque fonction
- Type hints
- Exemple d'utilisation commenté a la fin

Si plusieurs approches possibles, explique ton choix.`},
  {cat:'code',title:'Revue et correction de code',ia:'Claude Sonnet',level:'balanced',tok:'~1000 in / ~800 out',body:`Fais une revue complete de ce code:

[COLLER TON CODE ICI]

Analyse:
1. Bugs et erreurs potentielles
2. Failles de securite
3. Problemes de performance
4. Lisibilite et maintenabilite
5. Code corrige et ameliore

Pour chaque modification, explique pourquoi en une ligne.`},
  {cat:'code',title:'Expliquer du code complexe',ia:'DeepSeek R1',level:'powerful',tok:'~800 in / ~600 out',body:`Explique ce code de facon claire et pedagogique:

[COLLER LE CODE ICI]

Je veux comprendre:
1. Ce que fait ce code globalement (2 phrases)
2. Le role de chaque fonction / bloc principal
3. Les parties les plus complexes, ligne par ligne
4. Les risques ou limitations potentielles

Niveau: [DEBUTANT / INTERMEDIAIRE / AVANCE]`},
  {cat:'code',title:'Creer une API REST',ia:'Claude Sonnet',level:'balanced',tok:'~400 in / ~1200 out',body:`Cree une API REST complete avec:

Framework: [FASTAPI / FLASK / EXPRESS / autre]
Fonctionnalites: [LISTE DES ENDPOINTS]
Base de donnees: [TYPE ET SCHEMA]
Authentification: [OUI/NON, type JWT/OAuth]

Fournis: le code complet, la documentation des endpoints, les exemples de requetes curl, et les variables d'environnement necessaires.`},
  // ANALYSE
  {cat:'analyse',title:'Analyse de donnees chiffrees',ia:'DeepSeek R1',level:'powerful',tok:'~1000 in / ~600 out',body:`Analyse ces donnees et donne des insights actionnables:

[COLLER LES DONNEES / TABLEAU]

Je veux:
1. Les 3 tendances principales
2. Les anomalies ou points d'attention
3. La metrique la plus importante a surveiller
4. 2 recommandations prioritaires basees sur les donnees

Sois precis et base-toi uniquement sur les donnees fournies.`},
  {cat:'analyse',title:'Comparaison de deux options',ia:'DeepSeek V3',level:'balanced',tok:'~400 in / ~450 out',body:`Compare ces deux options et aide-moi a decider:

Option A: [DESCRIPTION]
Option B: [DESCRIPTION]
Mon contexte: [TA SITUATION]
Ce qui compte le plus pour moi: [TES PRIORITES]

Analyse: avantages / inconvenients de chaque option, dans quel cas choisir l'une ou l'autre, ta recommandation finale et pourquoi. Sois direct.`},
  {cat:'analyse',title:'Audit de strategie marketing',ia:'Claude Opus',level:'powerful',tok:'~600 in / ~700 out',body:`Audite ma strategie marketing actuelle:

Canal principal: [RESEAUX / SEO / PUB PAYANTE / AUTRE]
Budget mensuel: [MONTANT]
Cible: [DESCRIPTION CLIENT IDEAL]
Resultats actuels: [METRIQUES CLES]
Objectif: [CE QUE TU VEUX ATTEINDRE]

Analyse: ce qui fonctionne, ce qui ne fonctionne pas, 3 actions prioritaires pour ameliorer les resultats dans les 90 prochains jours.`},
  // SERVICE CLIENT
  {cat:'client',title:'Reponse a un client mecontent',ia:'Claude Haiku',level:'fast',tok:'~300 in / ~220 out',body:`Voici le message d'un client mecontent:

"[MESSAGE DU CLIENT]"

Redige une reponse qui:
1. Reconnait le probleme avec empathie
2. S'excuse sincerement
3. Propose une solution concrete: [TA SOLUTION]
4. Rassure sur la suite
5. Se termine positivement

Ton: professionnel, empathique, constructif. Max 100 mots.`},
  {cat:'client',title:'FAQ produit automatisee',ia:'Claude Haiku',level:'fast',tok:'~700 in / ~180 out',body:`Tu es l'assistant de [NOM ENTREPRISE] qui vend [PRODUIT/SERVICE].

Infos produit: [DESCRIPTION]
Politique remboursement: [POLITIQUE]
Delai livraison: [DELAI]
Contact support: [EMAIL / TELEPHONE]

Question du client: [QUESTION]

Reponds: precise, utile, max 80 mots, ton amical. Si tu ne peux pas repondre completement, fournis le contact support.`},
  {cat:'client',title:'Email de suivi apres achat',ia:'GPT-5 mini',level:'fast',tok:'~200 in / ~250 out',body:`Redige un email de suivi post-achat pour:

Produit achete: [PRODUIT]
Delai depuis l'achat: [X JOURS]
Objectif: [SATISFACTION / AVIS / UPSELL]

L'email doit: verifier la satisfaction, proposer de l'aide si necessaire, inclure un lien vers [RESSOURCE / AVIS / OFFRE], rester court (max 100 mots).`},
  // RH
  {cat:'rh',title:'Offre d\'emploi attractive',ia:'Claude Sonnet',level:'balanced',tok:'~400 in / ~700 out',body:`Redige une offre d'emploi attractive pour:

Poste: [TITRE]
Entreprise: [NOM ET DESCRIPTION COURTE]
Missions principales: [LISTE]
Profil recherche: [COMPETENCES ET EXPERIENCE]
Avantages: [CE QUE TU OFFRES]
Localisation: [LIEU / REMOTE]

Ton: humain, engageant, pas corporatif. Evite les formules generiques. Inclure une section "Ce qui nous rend differents".`},
  {cat:'rh',title:'Compte-rendu d\'entretien',ia:'Claude Haiku',level:'fast',tok:'~1000 in / ~400 out',body:`Voici les notes de mon entretien avec [PRENOM CANDIDAT] pour le poste de [POSTE]:

[NOTES D'ENTRETIEN]

Redige un compte-rendu structure avec:
1. Synthese du profil (3 phrases)
2. Points forts identifies
3. Points de vigilance
4. Adequation au poste: Faible / Moyenne / Bonne / Excellente
5. Recommandation: Passer en etape suivante ou Non`},
  {cat:'rh',title:'Plan de formation individuel',ia:'Claude Sonnet',level:'balanced',tok:'~400 in / ~600 out',body:`Cree un plan de formation sur 3 mois pour:

Collaborateur: [PROFIL ET POSTE]
Competences a developper: [LISTE]
Objectif final: [CE QUI EST ATTENDU APRES LA FORMATION]
Budget: [MONTANT]
Temps disponible: [HEURES PAR SEMAINE]

Inclure: formations recommandees, livres / ressources, objectifs mesurables par mois, comment evaluer la progression.`},
  // JURIDIQUE
  {cat:'juridique',title:'Resume de contrat',ia:'Claude Opus',level:'powerful',tok:'~8000 in / ~600 out',body:`Lis ce contrat et fais-en un resume en langage simple:

[COLLER LE CONTRAT]

Je veux comprendre:
1. Les obligations principales de chaque partie
2. Les clauses importantes a connaitre
3. Les risques ou pieges potentiels
4. Les conditions de resiliation
5. Ce qui me semble inhabituel ou problematique

Note: ce resume est informatif, pas un avis juridique.`},
  {cat:'juridique',title:'Modele de CGV simple',ia:'Claude Sonnet',level:'balanced',tok:'~300 in / ~1200 out',body:`Redige des Conditions Generales de Vente pour:

Activite: [DESCRIPTION]
Type de clients: [B2B / B2C / LES DEUX]
Pays: France
Produits / Services: [DESCRIPTION]
Politique de remboursement: [TA POLITIQUE]

Inclure: objet, commandes, prix, paiement, livraison, retractation, garanties, responsabilite, donnees personnelles, litiges. Langage clair, pas de jargon inutile.`},
  // MARKETING
  {cat:'marketing',title:'Strategie de contenu mensuelle',ia:'Claude Sonnet',level:'balanced',tok:'~300 in / ~800 out',body:`Cree un calendrier editorial pour le mois prochain:

Secteur: [TON SECTEUR]
Cible: [QUI TU VISES]
Canaux: [RESEAUX SOCIAUX / BLOG / EMAIL / AUTRE]
Objectif: [NOTORIETE / LEADS / FIDELISATION]
Frequence: [COMBIEN DE POSTS PAR SEMAINE]

Pour chaque contenu: format, sujet, angle, call-to-action, meilleur moment de publication.`},
  {cat:'marketing',title:'Analyse d\'audience cible',ia:'DeepSeek R1',level:'powerful',tok:'~400 in / ~600 out',body:`Definis mon persona client ideal pour:

Produit / Service: [DESCRIPTION]
Probleme que je resous: [LE PROBLEME]
Prix: [FOURCHETTE]
Concurrents directs: [NOMS]

Cree 2 personas detailles avec: age, situation, revenus, douleurs principales, objections a l'achat, ou ils cherchent de l'information, comment ils prennent leurs decisions d'achat.`},
  // IMMO
  {cat:'immo',title:'Description de bien immobilier',ia:'GPT-4o',level:'balanced',tok:'~300 in / ~350 out',body:`Redige une description attractive pour cette annonce immobiliere:

Type de bien: [APPARTEMENT / MAISON / BUREAU]
Surface: [M2]
Localisation: [VILLE / QUARTIER]
Caracteristiques: [PIECES / ETAGE / ANNEXES]
Points forts: [CE QUI DIFFERENCIE CE BIEN]
Prix: [MONTANT]

Ton: chaleureux et professionnel. Mettre en valeur les atouts. Max 200 mots. Inclure accroche forte.`},
  {cat:'immo',title:'Email de relance prospect',ia:'Claude Haiku',level:'fast',tok:'~200 in / ~180 out',body:`Redige un email de relance pour un prospect qui a visite un bien il y a [X JOURS]:

Bien visite: [DESCRIPTION]
Ce que j'ai retenu de sa recherche: [SES CRITERES]
Nouveau bien a lui proposer: [DESCRIPTION COURTE]

Email: court (max 80 mots), personnalise, avec une raison concrete de le recontacter, appel a l'action clair.`},
  // SANTE / BIEN-ETRE
  {cat:'sante',title:'Plan nutritionnel personnalise',ia:'Claude Sonnet',level:'balanced',tok:'~300 in / ~700 out',body:`Cree un plan nutritionnel pour:

Objectif: [PERTE DE POIDS / PRISE DE MASSE / BIEN-ETRE]
Age, sexe, poids, taille: [DONNEES]
Activite physique: [NIVEAU]
Restrictions alimentaires: [ALLERGIES / REGIMES]
Budget alimentaire: [BUDGET HEBDOMADAIRE]

Plan sur 7 jours avec: petit-dejeuner, dejeuner, diner, collations, et conseils d'hydratation. Note: ceci est informatif, consulter un dieteticien pour un suivi personnalise.`},
  {cat:'sante',title:'Synthese d\'article medical',ia:'Claude Opus',level:'powerful',tok:'~3000 in / ~400 out',body:`Voici un article medical / scientifique. Fais-en une synthese comprehensible:

[COLLER L'ARTICLE]

Je veux comprendre:
1. La question de recherche principale
2. La methodologie en 2 phrases
3. Les resultats cles
4. Ce que ca change concrètement
5. Les limites de l'etude

Niveau: grand public, sans jargon. Note: ne remplace pas un avis medical.`},
  // EDUCATION
  {cat:'education',title:'Explication d\'un concept complexe',ia:'Claude Sonnet',level:'balanced',tok:'~150 in / ~500 out',body:`Explique [CONCEPT] de facon simple et memorable.

Public cible: [AGE / NIVEAU]
Contexte: [POURQUOI ILS ONT BESOIN DE COMPRENDRE CA]

Utilise:
- Une analogie avec quelque chose de quotidien
- Un exemple concret
- Les 3 points essentiels a retenir
- Une question pour verifier la comprehension

Max 300 mots.`},
  {cat:'education',title:'Creation d\'un quiz',ia:'GPT-4o',level:'balanced',tok:'~400 in / ~700 out',body:`Cree un quiz de 10 questions sur:

Sujet: [SUJET]
Niveau: [DEBUTANT / INTERMEDIAIRE / AVANCE]
Public: [QUI VA PASSER CE QUIZ]

Format pour chaque question:
Q: [Question]
A) [option]  B) [option]  C) [option]  D) [option]
Reponse: [LETTRE]
Explication: [Pourquoi c'est la bonne reponse en 1 phrase]`},
  // LOGISTIQUE
  {cat:'logistique',title:'Optimisation de processus',ia:'DeepSeek R1',level:'powerful',tok:'~500 in / ~600 out',body:`Analyse ce processus et propose des optimisations:

Processus actuel: [DESCRIPTION ETAPE PAR ETAPE]
Problemes identifies: [GOULOTS / PERTES DE TEMPS / ERREURS]
Contraintes: [CE QUI NE PEUT PAS CHANGER]
Objectif: [REDUIRE LE TEMPS / LES COUTS / LES ERREURS]

Propose: les 3 ameliorations les plus impactantes, le gain estime pour chacune, et un plan de mise en oeuvre priorise.`},
  {cat:'logistique',title:'Appel d\'offres fournisseur',ia:'Claude Sonnet',level:'balanced',tok:'~400 in / ~700 out',body:`Redige un appel d'offres pour:

Besoin: [DESCRIPTION PRECISE]
Volume / Quantite: [DETAILS]
Delai: [QUAND TU EN AS BESOIN]
Budget indicatif: [FOURCHETTE]
Criteres de selection: [PRIX / QUALITE / DELAI / SERVICE]

Inclure: presentation du besoin, specifications techniques, conditions de reponse, criteres d'evaluation, date limite de soumission.`}
  ,
  // E-COMMERCE
  {cat:'ecommerce',title:'Description produit optimisee',ia:'GPT-4o',level:'balanced',tok:'~300 in / ~400 out',body:`Redige une description produit pour:

Produit: [NOM ET CARACTERISTIQUES]
Prix: [PRIX]
Client cible: [QUI L'ACHETE]
Plateforme: [AMAZON / SHOPIFY / AUTRE]

Inclure: titre SEO (60 car max), description courte (50 mots), description longue (150 mots), 5 bullet points benefices, mots-cles.`},
  {cat:'ecommerce',title:'Email panier abandonne',ia:'Claude Haiku',level:'fast',tok:'~200 in / ~200 out',body:`Email de relance panier abandonne:

Produit: [PRODUIT ET PRIX]
Delai: [X HEURES]
Offre: [REDUCTION / LIVRAISON GRATUITE / RIEN]

Court (max 80 mots), urgence naturelle, CTA clair, objet accrocheur.`},
  {cat:'ecommerce',title:'Reponse avis negatif',ia:'Claude Sonnet',level:'balanced',tok:'~300 in / ~200 out',body:`Reponse professionnelle a cet avis:

Avis: "[AVIS]"
Note: [X/5]
Solution: [CE QUE TU PEUX FAIRE]

Publique, reconnait le probleme, propose solution concrete. Max 100 mots.`},
  {cat:'ecommerce',title:'Strategie de prix',ia:'DeepSeek R1',level:'powerful',tok:'~500 in / ~600 out',body:`Optimise ma strategie de prix:

Produit: [DESCRIPTION]
Prix actuel: [PRIX]
Cout de revient: [COUT]
Prix concurrents: [FOURCHETTE]
Objectif: [VOLUME / MARGE / POSITIONNEMENT]

Recommande la strategie optimale, le prix ideal et comment le justifier.`},
  // IA
  {cat:'ia',title:'Prompt systeme pour un assistant',ia:'Claude Sonnet',level:'balanced',tok:'~300 in / ~500 out',body:`Cree un prompt systeme pour un assistant IA:

Role: [DESCRIPTION]
Entreprise: [NOM ET SECTEUR]
Utilisateur cible: [QUI VA L'UTILISER]
Taches: [LISTE]
Ton: [FORMEL / AMICAL / EXPERT]
Limites: [CE QU'IL NE DOIT PAS FAIRE]

Definir: role, ton, capacites, limites, cas hors-perimetre.`},
  {cat:'ia',title:'Optimiser un prompt existant',ia:'Claude Opus',level:'powerful',tok:'~500 in / ~400 out',body:`Ameliore ce prompt:

Prompt actuel: [TON PROMPT]
Resultat obtenu: [RESULTAT ACTUEL]
Resultat voulu: [RESULTAT IDEAL]
IA utilisee: [CLAUDE / GPT / AUTRE]

Analyse les problemes et propose une version amelioree avec explications.`},
  {cat:'ia',title:'Choisir la bonne IA',ia:'DeepSeek V3',level:'balanced',tok:'~400 in / ~500 out',body:`Aide-moi a choisir la meilleure IA:

Projet: [DESCRIPTION]
Budget mensuel: [MONTANT]
Competences techniques: [DEBUTANT / INTERMEDIAIRE / EXPERT]
Priorites: [PRIX / QUALITE / VITESSE / CONFIDENTIALITE]

Compare les options et recommande la meilleure solution.`},
  {cat:'ia',title:'Automatiser une tache repetitive',ia:'Claude Sonnet',level:'balanced',tok:'~300 in / ~600 out',body:`Automatise cette tache avec IA:

Tache manuelle: [DESCRIPTION]
Frequence: [COMBIEN DE FOIS PAR JOUR]
Temps actuel: [COMBIEN DE TEMPS]
Outils: [LOGICIELS UTILISES]

Propose: approche, outils recommandes (n8n, Zapier, API), etapes, ROI estime.`},
  // RESEAUX SOCIAUX
  {cat:'social',title:'Strategie Instagram mensuelle',ia:'Claude Sonnet',level:'balanced',tok:'~300 in / ~700 out',body:`Strategie Instagram 30 jours:

Marque: [DESCRIPTION]
Cible: [QUI TU VEUX ATTEINDRE]
Objectif: [FOLLOWERS / ENGAGEMENT / VENTES]
Budget: [TEMPS ET ARGENT]

Plan par semaine: type de contenu, heures, hashtags, idees de posts.`},
  {cat:'social',title:'Legende Instagram engageante',ia:'GPT-4o',level:'balanced',tok:'~200 in / ~250 out',body:`Legende Instagram pour:

Visuel: [DESCRIPTION DU CONTENU]
Message: [CE QUE TU VEUX DIRE]
Ton: [HUMORISTIQUE / INSPIRANT / INFORMATIF]
Cible: [TON AUDIENCE]

2 versions (courte 50 mots / longue 150 mots) + 10-15 hashtags.`},
  {cat:'social',title:'10 idees videos TikTok Reels',ia:'Claude Sonnet',level:'balanced',tok:'~300 in / ~600 out',body:`10 idees de videos courtes pour:

Secteur: [TON DOMAINE]
Cible: [QUI TU VEUX TOUCHER]
Style: [EDUCATIF / DIVERTISSANT / COULISSES]
Duree: [15S / 30S / 60S]

Pour chaque idee: concept, accroche (3 premieres secondes), structure, texte ecran.`},
  {cat:'social',title:'Reponse commentaire sensible',ia:'Claude Haiku',level:'fast',tok:'~250 in / ~150 out',body:`Reponse a ce commentaire sensible:

Commentaire: "[COMMENTAIRE]"
Objectif: [DESAMORCER / CORRIGER / ENGAGER]

Courte (max 60 mots), professionnelle, ne pas alimenter la controverse. 2 versions: neutre et engagee.`}
];

var CATS=[
  {id:'all',label:'Tous'},
  {id:'business',label:'Business'},
  {id:'finance',label:'Finance'},
  {id:'redaction',label:'Redaction'},
  {id:'code',label:'Code'},
  {id:'analyse',label:'Analyse'},
  {id:'client',label:'Service client'},
  {id:'rh',label:'RH'},
  {id:'juridique',label:'Juridique'},
  {id:'marketing',label:'Marketing'},
  {id:'immo',label:'Immobilier'},
  {id:'sante',label:'Sante'},
  {id:'education',label:'Education'},
  {id:'logistique',label:'Logistique'},
  {id:'ecommerce',label:'E-commerce'},
  {id:'ia',label:'Utiliser IA'},
  {id:'social',label:'Reseaux sociaux'},
  {id:'favs',label:'Favoris'}
];

function renderCats(){
  document.getElementById('prm-cats').innerHTML=CATS.map(function(c){
    return '<button class="pcat'+(c.id==='all'?' on':'')+'" data-cat="'+c.id+'" onclick="filterPrm(this)">'+c.label+'</button>';
  }).join('');
}

function filterPrm(btn){
  document.querySelectorAll('.pcat').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on');currentCat=btn.dataset.cat;
  document.getElementById('prm-search').value='';searchQ='';
  renderPrompts();
}

function searchPrompts(q){searchQ=q.toLowerCase();renderPrompts();}

function renderPrompts(){
  var LVL={fast:'Rapide',balanced:'Equilibre',powerful:'Puissant'};
  var list=PROMPTS.filter(function(p){
    var catOk=currentCat==='all'||(currentCat==='favs'?favs.indexOf(PROMPTS.indexOf(p))>=0:p.cat===currentCat);
    var searchOk=!searchQ||(p.title.toLowerCase().indexOf(searchQ)>=0||p.body.toLowerCase().indexOf(searchQ)>=0||p.cat.indexOf(searchQ)>=0);
    return catOk&&searchOk;
  });
  document.getElementById('prm-count').textContent=list.length+' prompt'+(list.length>1?'s':'');
  if(favs.length>0)document.getElementById('prm-favs').classList.add('show');
  document.getElementById('prm-grid').innerHTML=list.map(function(p){
    var idx=PROMPTS.indexOf(p);
    var isFav=favs.indexOf(idx)>=0;
    var lvlCls={fast:'tt',balanced:'tb',powerful:'ta'};
    return '<div class="prm-card"><div class="prm-card-hdr">'+
      '<div class="prm-title">'+p.title+'</div>'+
      '<div class="prm-meta">'+
        '<span class="tag '+lvlCls[p.level]+'">'+LVL[p.level]+'</span>'+
        '<span class="tag" style="background:var(--bg3);color:var(--text2)">'+p.ia+'</span>'+
      '</div></div>'+
      '<div class="prm-body" id="pb'+idx+'">'+p.body+'</div>'+
      '<div class="prm-footer">'+
        '<div class="prm-stats">'+p.tok+'</div>'+
        '<div class="prm-actions">'+
          '<button class="fav-btn'+(isFav?' on':'')+'" onclick="toggleFav('+idx+',this)" title="'+(isFav?'Retirer des favoris':'Ajouter aux favoris')+'">⭐</button>'+
          '<button class="expand-btn" onclick="toggleExpand('+idx+',this)">Voir tout</button>'+
          '<button class="copy-btn" onclick="copyPrm(this,'+idx+')">Copier</button>'+
        '</div>'+
      '</div></div>';
  }).join('');
}

function toggleFav(idx,btn){
  var i=favs.indexOf(idx);
  if(i>=0){favs.splice(i,1);btn.classList.remove('on');btn.title='Ajouter aux favoris';}
  else{favs.push(idx);btn.classList.add('on');btn.title='Retirer des favoris';}
  localStorage.setItem('tw_favs',JSON.stringify(favs));
  if(favs.length>0)document.getElementById('prm-favs').classList.add('show');
  else document.getElementById('prm-favs').classList.remove('show');
}

function toggleExpand(idx,btn){
  var el=document.getElementById('pb'+idx);
  if(el.classList.contains('expanded')){el.classList.remove('expanded');btn.textContent='Voir tout';}
  else{el.classList.add('expanded');btn.textContent='Reduire';}
}

function copyPrm(btn,idx){
  var txt=PROMPTS[idx].body;
  navigator.clipboard.writeText(txt).then(function(){done();}).catch(function(){
    var ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);done();
  });
  function done(){btn.textContent='Copie !';btn.classList.add('copied');setTimeout(function(){btn.textContent='Copier';btn.classList.remove('copied');},2000);}
}

renderTS();renderT();renderCats();renderPrompts();
setInterval(function(){var el=document.getElementById('t-time');if(el)el.textContent='Mis a jour: '+new Date().toLocaleString('fr-FR',hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit',year:'numeric'});},60000);
