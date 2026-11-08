const $=id=>document.getElementById(id), LS=localStorage;
const fmt=n=>'$'+Math.round(n).toLocaleString('en-US');
let mode=0,user=null,cur='home';
const get=(k,d)=>{try{return JSON.parse(LS.getItem(k))||d}catch(e){return d}};
let users=get('dc_users',{});

/* AUTH */
function tab(m){mode=m;$('tl').classList.toggle('on',!m);$('tr').classList.toggle('on',!!m);$('go').textContent=m?'Создать аккаунт (+$1000 бонус)':'Войти';$('nick').classList.toggle('hide',!m);$('err').textContent=''}
function submitAuth(){
  const e=$('em').value.trim().toLowerCase(),p=$('pw').value;
  const nk=$('nick').value.trim();
  if(mode&&nk.length<2)return $('err').textContent='Введите никнейм (минимум 2 символа)';
  if(!/^\S+@\S+\.\S+$/.test(e))return $('err').textContent='Введите корректный email';
  if(p.length<4)return $('err').textContent='Пароль минимум 4 символа';
  if(mode){
    if(users[e])return $('err').textContent='Такой email уже есть';
    users[e]={nick:nk,p,bal:1000,hist:[],dep:1,rounds:0};save();
  }else if(!users[e]||users[e].p!==p)return $('err').textContent='Неверный email или пароль';
  LS.setItem('dc_ses',e);start(e);
}
function save(){LS.setItem('dc_users',JSON.stringify(users))}
function start(e){user=e;$('auth').classList.add('hide');$('app').classList.remove('hide');go('home')}
function logout(){LS.removeItem('dc_ses');user=null;drawer(0);$('app').classList.add('hide');$('auth').classList.remove('hide')}
const U=()=>users[user];
function money(d,game,note){const u=U();u.bal+=d;if(game){u.rounds++;u.hist.unshift({t:new Date().toLocaleString('ru'),g:game,d,note})}save();$('bal').textContent=fmt(u.bal)}

/* NAV */
const pages=[['home','🏠','Главная'],['slots','🎲','Слоты'],['roulette','⭕','Рулетка'],['blackjack','♠️','Блэкджек'],['cashier','👛','Касса'],['history','🕘','История'],['profile','👤','Профиль']];
function drawer(o){$('drawer').classList.toggle('on',!!o);$('ov').classList.toggle('on',!!o)}
function go(p){cur=p;drawer(0);scrollTo(0,0);
  $('nav').innerHTML=pages.map(x=>`<div class="nav ${x[0]==p?'on':''}" onclick="go('${x[0]}')">${x[1]} ${x[2]}</div>`).join('');
  $('bal').textContent=fmt(U().bal);$('view').innerHTML='';views[p]()}
const V=h=>$('view').innerHTML=h;

/* VIEWS */
const views={
home(){V(`
 <div class="hero"><span class="tag">+80% к первому пополнению</span><h1>Demo Casino <em>Live</em></h1>
 <p>Играйте на виртуальные фишки: слоты, рулетка и блэкджек. Без реальных денег и риска.</p>
 <button class="btn" onclick="go('slots')">Играть сейчас</button></div>
 <h2>Игры</h2>
 <div class="gcard" onclick="go('slots')"><span class="badge">ХИТ</span><div class="ic">🎲</div><h3>Слоты «Удача 777»</h3><p>Три барабана, комбинации до x50</p></div>
 <div class="gcard" onclick="go('roulette')"><span class="badge">КЛАССИКА</span><div class="ic">⭕</div><h3>Европейская рулетка</h3><p>Красное/чёрное, числа, выплаты до x36</p></div>
 <div class="gcard" onclick="go('blackjack')"><span class="badge">КАРТЫ</span><div class="ic">♠️</div><h3>Блэкджек</h3><p>Наберите 21 очко против дилера</p></div>
 <h2>Акции</h2>
 <div class="promo"><div class="ic">🎁</div><div><b>Приветственный бонус</b><p>$1000 на счёт каждому новому игроку</p></div></div>
 <div class="promo"><div class="ic">👛</div><div><b>Касса без границ</b><p>Пополняйте виртуальный баланс на любую сумму</p></div></div>
 <div class="promo"><div class="ic">📈</div><div><b>Статистика игр</b><p>Вся история ставок и выигрышей в профиле</p></div></div>
 <div style="height:20px"></div>
 <div class="stat">Баланс<b>${fmt(U().bal)}</b></div>
 <div class="stat">Сыграно раундов<b>${U().rounds}</b></div>
 <div class="stat">Пополнений<b>${U().dep}</b></div>`)},

slots(){betUI('Слоты «Удача 777»',`<div class="reels"><div class="reel" id="r0">🍒</div><div class="reel" id="r1">🍋</div><div class="reel" id="r2">🔔</div></div>`,'Крутить','spin()','Три одинаковых: x5–x50, две: x2')},

roulette(){betUI('Европейская рулетка',`<div class="wheel g" id="wh">0</div>
 <div class="opts" id="ro"><button class="chip r on" data-t="red">Красное x2</button><button class="chip k" data-t="black">Чёрное x2</button><button class="chip g" data-t="zero">Зеро x36</button></div>
 <input id="num" type="number" min="0" max="36" placeholder="Или число 0–36 (x36)">`,'Крутить','roll()','Ставка на цвет или конкретное число');
 document.querySelectorAll('#ro .chip').forEach(b=>b.onclick=()=>{document.querySelectorAll('#ro .chip').forEach(x=>x.classList.remove('on'));b.classList.add('on');$('num').value=''})},

blackjack(){bj=null;betUI('Блэкджек',`<div id="bjt"><p style="color:var(--mut)">Сделайте ставку и нажмите «Раздать»</p></div>`,'Раздать','deal()','Блэкджек платит x2.5, победа x2');
 },

cashier(){V(`<h2>Касса</h2><div class="panel"><p style="color:var(--mut)">Пополните виртуальный баланс на любую сумму</p><input id="dep" type="number" min="1" placeholder="Сумма, $" style="margin-top:16px">
 <div class="bet">${[100,500,1000,5000].map(n=>`<button class="chip" onclick="$('dep').value=${n}">$${n}</button>`).join('')}</div>
 <button class="btn full" onclick="deposit()">Пополнить</button><div class="msg" id="m"></div></div>`)},

history(){const h=U().hist;V(`<h2>История</h2><div class="panel">${h.length?`<table><tr><th>Время</th><th>Игра</th><th>Итог</th></tr>${h.slice(0,50).map(x=>`<tr><td>${x.t}</td><td>${x.g}</td><td class="${x.d>=0?'win':'lose'}">${x.d>=0?'+':''}${fmt(x.d)}</td></tr>`).join('')}</table>`:'<p style="color:var(--mut)">Пока нет ставок</p>'}</div>`)},

profile(){const u=U();V(`<h2>Профиль</h2><div class="panel"><div class="ava" style="margin:0 auto 12px;width:80px;height:80px;font-size:40px">🎰</div><b>${u.nick||user}</b><div style="color:var(--mut);font-size:14px;margin-top:4px">${user}</div>
 <div class="stat" style="margin-top:20px">Баланс<b>${fmt(u.bal)}</b></div><div class="stat">Сыграно раундов<b>${u.rounds}</b></div><div class="stat">Пополнений<b>${u.dep}</b></div>
 <button class="btn alt full" onclick="resetAcc()">Сбросить баланс до $1000</button></div>`)}
};

function betUI(title,body,label,fn,hint){
 V(`<h2>${title}</h2><div class="panel">${body}<div class="bet" id="bets">${[10,50,100,500].map((n,i)=>`<button class="chip ${i==1?'on':''}" data-v="${n}">$${n}</button>`).join('')}</div>
 <div class="msg" id="m"></div><div class="row" id="act"><button class="btn" id="mainb" onclick="${fn}">${label}</button></div><p style="color:var(--mut);font-size:13px;margin-top:14px">${hint}</p></div>`);
 document.querySelectorAll('#bets .chip').forEach(b=>b.onclick=()=>{document.querySelectorAll('#bets .chip').forEach(x=>x.classList.remove('on'));b.classList.add('on')});
}
const betVal=()=>+document.querySelector('#bets .chip.on').dataset.v;
function say(t,c){$('m').textContent=t;$('m').className='msg '+(c||'')}
function canBet(b){if(U().bal<b){say('Недостаточно средств — пополните кассу','lose');return false}return true}
const rnd=n=>Math.floor(Math.random()*n);

/* SLOTS */
const SY=['🍒','🍋','🔔','⭐','💎','7️⃣'],MULT={'🍒':5,'🍋':8,'🔔':10,'⭐':15,'💎':25,'7️⃣':50};
let busy=false;
function spin(){if(busy)return;const b=betVal();if(!canBet(b))return;busy=true;money(-b);say('');
 const els=[0,1,2].map(i=>$('r'+i));els.forEach(e=>e.classList.add('spin'));
 const res=[SY[rnd(6)],SY[rnd(6)],SY[rnd(6)]];
 if(Math.random()<.12)res[1]=res[2]=res[0];
 els.forEach((e,i)=>setTimeout(()=>{e.classList.remove('spin');e.textContent=res[i];
  if(i==2){busy=false;let w=0;
   if(res[0]==res[1]&&res[1]==res[2])w=b*MULT[res[0]];
   else if(res[0]==res[1]||res[1]==res[2]||res[0]==res[2])w=b*2;
   if(w){money(w);say('Выигрыш '+fmt(w)+'!','win')}else say('Не повезло','lose');
   U().rounds++;U().hist.unshift({t:new Date().toLocaleString('ru'),g:'Слоты',d:w-b});save();$('bal').textContent=fmt(U().bal)}},600+i*400))}

/* ROULETTE */
const REDS=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
function roll(){const b=betVal();if(!canBet(b))return;
 const n=rnd(37),col=n==0?'g':REDS.includes(n)?'r':'k';
 const nv=$('num').value,sel=document.querySelector('#ro .chip.on');
 let w=0;
 if(nv!==''){if(+nv==n)w=b*36}
 else{const t=sel.dataset.t;if((t=='red'&&col=='r')||(t=='black'&&col=='k'))w=b*2;if(t=='zero'&&n==0)w=b*36}
 const wh=$('wh');wh.className='wheel '+col;wh.textContent=n;
 money(w-b,'Рулетка',n);if(w)say('Выпало '+n+'. Выигрыш '+fmt(w)+'!','win');else say('Выпало '+n+'. Проигрыш','lose')}

/* BLACKJACK */
let bj=null;
const deck=()=>{const s=['♠','♥','♦','♣'],r=['2','3','4','5','6','7','8','9','10','J','Q','K','A'],d=[];s.forEach(x=>r.forEach(y=>d.push({r:y,s:x})));return d.sort(()=>Math.random()-.5)};
const val=h=>{let t=0,a=0;h.forEach(c=>{if(c.r=='A'){a++;t+=11}else t+=['J','Q','K'].includes(c.r)?10:+c.r});while(t>21&&a){t-=10;a--}return t};
const cardH=(c,hide)=>hide?'<div class="pc back"></div>':`<div class="pc ${'♥♦'.includes(c.s)?'red':''}">${c.r}${c.s}</div>`;
function drawBJ(end){$('bjt').innerHTML=`<p style="color:var(--mut)">Дилер ${end?val(bj.d):''}</p><div class="cards">${bj.d.map((c,i)=>cardH(c,!end&&i==1)).join('')}</div>
 <p style="color:var(--mut)">Вы ${val(bj.p)}</p><div class="cards">${bj.p.map(c=>cardH(c)).join('')}</div>`}
function deal(){const b=betVal();if(!canBet(b))return;money(-b);
 const dk=deck();bj={dk,b,p:[dk.pop(),dk.pop()],d:[dk.pop(),dk.pop()]};say('');
 $('bets').classList.add('hide');
 $('act').innerHTML='<button class="btn" onclick="hit()">Ещё</button><button class="btn alt" onclick="stand()">Хватит</button>';
 drawBJ(false);if(val(bj.p)==21)stand(true)}
function hit(){bj.p.push(bj.dk.pop());drawBJ(false);if(val(bj.p)>21)finish(0,'Перебор!');else if(val(bj.p)==21)stand()}
function stand(nat){while(val(bj.d)<17)bj.d.push(bj.dk.pop());
 const p=val(bj.p),d=val(bj.d);
 if(nat&&p==21&&bj.p.length==2)finish(2.5,'Блэкджек!');
 else if(d>21||p>d)finish(2,'Вы победили!');else if(p==d)finish(1,'Ничья');else finish(0,'Дилер выиграл')}
function finish(m,t){drawBJ(true);const w=bj.b*m;
 U().rounds++;U().hist.unshift({t:new Date().toLocaleString('ru'),g:'Блэкджек',d:w-bj.b});U().bal+=w;save();$('bal').textContent=fmt(U().bal);
 say(t+(w>bj.b?' +'+fmt(w-bj.b):''),m>1?'win':m==1?'':'lose');
 $('bets').classList.remove('hide');$('act').innerHTML='<button class="btn" onclick="deal()">Раздать снова</button>'}

/* CASHIER / PROFILE */
function deposit(){const v=+$('dep').value;if(!(v>0))return say('Введите сумму','lose');
 U().dep++;money(v);say('Баланс пополнен на '+fmt(v),'win');$('dep').value=''}
function resetAcc(){U().bal=1000;save();go('profile')}

/* INIT */
const ses=LS.getItem('dc_ses');if(ses&&users[ses])start(ses);
