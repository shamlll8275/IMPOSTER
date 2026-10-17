import { useState } from 'react';

const categories = {
  Food: [['Bread','bakery · toast'],['Pizza','cheese · slices'],['Burger','bun · filling'],['Rice','staple · grains'],['Soup','bowl · warm'],['Sandwich','lunch · layers'],['Egg','shell · breakfast'],['Cheese','dairy · slices'],['Pancake','flat · syrup'],['Noodles','long · slurp'],['Cookie','baked · crunchy'],['Salad','fresh · dressing'],['Pasta','sauce · Italian'],['French fries','crispy · potato'],['Cake','birthday · candles'],['Ice cream','frozen · scoop'],['Popcorn','movie · kernels'],['Chocolate','sweet · bar'],['Hot dog','sausage · bun'],['Doughnut','round · glaze']],
  Vehicles: [['Car','road · four wheels'],['Bus','stops · many seats'],['Bicycle','pedals · two wheels'],['Train','tracks · stations'],['Airplane','airport · wings'],['Boat','water · harbour'],['Truck','cargo · highway'],['Taxi','fare · city ride'],['Van','sliding door · family'],['Ship','ocean · large'],['Scooter','helmet · city'],['Ambulance','sirens · hospital'],['Motorcycle','helmet · engine'],['Tractor','farm · fields'],['Helicopter','rotors · sky'],['Submarine','underwater · deep']],
  Vegetables: [['Onion','layers · chopping'],['Carrot','orange · crunch'],['Potato','chips · mashed'],['Tomato','red · salad'],['Cucumber','cool · slices'],['Cabbage','leaves · slaw'],['Spinach','green · leafy'],['Corn','yellow · cob'],['Peas','small · pods'],['Broccoli','green · florets'],['Pumpkin','orange · autumn'],['Garlic','cloves · strong smell'],['Chilli','spicy · small'],['Cauliflower','white · florets'],['Lettuce','salad · leaves'],['Mushroom','cap · savoury']],
  Fruits: [['Apple','crunch · fruit bowl'],['Banana','peel · bunch'],['Orange','citrus · juice'],['Grapes','vine · bunch'],['Strawberry','red · seeds outside'],['Watermelon','summer · large'],['Mango','stone · tropical'],['Pineapple','spiky · crown'],['Lemon','sour · yellow'],['Peach','fuzzy · stone'],['Pear','green · shape'],['Cherry','pair · stem'],['Coconut','palm · hard shell'],['Papaya','tropical · black seeds'],['Blueberry','small · muffin'],['Avocado','toast · pit']],
  Equipment: [['Hammer','nail · toolbox'],['Screwdriver','twist · screw'],['Scissors','cut · blades'],['Broom','sweep · handle'],['Bucket','carry · water'],['Ladder','climb · rungs'],['Shovel','dig · garden'],['Wrench','turn · bolt'],['Drill','holes · electric'],['Tape measure','length · retractable'],['Knife','slice · kitchen'],['Kettle','boil · pour'],['Flashlight','dark · batteries'],['Iron','clothes · heat'],['Fan','air · spinning blades'],['Rake','leaves · garden']],
  Home: [['Bed','sleep · pillow'],['Sofa','living room · cushions'],['Table','dinner · flat top'],['Chair','seat · legs'],['Door','handle · entrance'],['Window','glass · curtains'],['Lamp','light · shade'],['Fridge','cold · kitchen'],['Mirror','reflection · wall'],['Pillow','soft · sleep'],['Cupboard','shelves · storage'],['Shower','water · bathroom'],['Stairs','steps · upstairs'],['Clock','time · wall'],['Curtains','window · fabric'],['Blanket','warm · bed']],
  'Malayalam films': [['Drishyam','family · mystery'],['Premam','college · romance'],['Manichitrathazhu','old house · locked room'],['Bangalore Days','cousins · city'],['Lucifer','politics · action'],['Neram','time · trouble'],['Kumbalangi Nights','coastal village · brothers'],['Ustad Hotel','food · grandfather'],['Charlie','artist · journey'],['Minnal Murali','small town · hero'],['Premalu','young love · Hyderabad'],['Classmates','college · reunion']],
  'Kerala places': [['Kochi','port · city'],['Munnar','tea · hills'],['Alappuzha','canals · boats'],['Wayanad','forest · hills'],['Kozhikode','Malabar · coast'],['Thrissur','festival · temple'],['Kollam','lake · coast'],['Kannur','north · beaches'],['Varkala','cliff · beach'],['Kovalam','lighthouse · beach'],['Palakkad','fort · paddy fields'],['Kottayam','lake · letters'],['Thekkady','wildlife · forest'],['Kumarakom','lake · birds'],['Bekal','fort · sea'],['Idukki','dam · mountains']],
};
const dayKey = () => new Date().toLocaleDateString('en-CA');
const readUsed = () => { try { const data = JSON.parse(localStorage.getItem('imposter-used') || '{}'); return data.day === dayKey() ? data.words : []; } catch { return []; } };
const readCustom = () => { try { return JSON.parse(localStorage.getItem('imposter-custom') || '{}'); } catch { return {}; } };

export default function App() {
  const [players, setPlayers] = useState(['', '', '']);
  const [selectedCategories, setSelectedCategories] = useState(['Food']);
  const [imposterCount, setImposterCount] = useState(1);
  const [custom, setCustom] = useState(readCustom);

  const [word, setWord] = useState('');
  const [clue, setClue] = useState('');
  const [round, setRound] = useState(null);
  const [screen, setScreen] = useState('setup');
  const [index, setIndex] = useState(0);
  const [error, setError] = useState('');
  const allWords = { ...categories, 'Custom Words': custom['Custom Words'] || Object.values(custom).flat() };
  const names = players.map(n => n.trim()).filter(Boolean);
  const isImposter = round?.imposters.includes(round?.players[index]);

  function toggleCategory(name) { setSelectedCategories(list => list.includes(name) ? list.filter(item => item !== name) : [...list, name]); }
  function start(e) {
    e.preventDefault();
    if (names.length < 3) return setError('Add at least 3 players.');
    if (new Set(names.map(n => n.toLowerCase())).size !== names.length) return setError('Player names must be different.');
    if (imposterCount >= names.length) return setError('Keep at least one non-imposter.');
    if (!selectedCategories.length) return setError('Choose at least one category.');
    const used = readUsed();
    const options = selectedCategories.flatMap(category => (allWords[category] || []).map(([w,h]) => ({category, word:w, hint:h}))).filter(item => !used.includes(`${item.category}:${item.word}`));
    if (!options.length) return setError('No unused words left in these categories today. Try another category.');
    const chosen = options[Math.floor(Math.random() * options.length)];
    const shuffled = [...names].sort(() => Math.random() - .5);
    const imposters = shuffled.slice(0, imposterCount);
    localStorage.setItem('imposter-used', JSON.stringify({ day: dayKey(), words: [...used, `${chosen.category}:${chosen.word}`] }));
    setRound({ secret:chosen.word, hint:chosen.hint, players:names, imposters }); setIndex(0); setError(''); setScreen('pass');
  }
  function addWord(e) {
    e.preventDefault(); if (!word.trim() || !clue.trim()) return;
    const savedCustomWords = custom['Custom Words'] || Object.values(custom).flat();
    const next = { ...custom, 'Custom Words': [...savedCustomWords, [word.trim(), clue.trim()]] };
    setCustom(next); localStorage.setItem('imposter-custom', JSON.stringify(next)); setWord(''); setClue('');
  }
  function nextPlayer() { if (index < round.players.length - 1) { setIndex(index + 1); setScreen('pass'); } else setScreen('discussion'); }
  function playAgain() { setRound(null); setScreen('setup'); setError(''); }

  return <main className="app"><header><a className="brand" href="/">IMPOSTER</a></header>
    {screen === 'setup' && <section className="panel"><form onSubmit={start}>
      <div className="section-title"><b>01</b><strong>Who's playing?</strong><small>{names.length} players</small></div>
      <div className="players">{players.map((name,i)=><div className="player" key={i}><span>{String(i+1).padStart(2,'0')}</span><input aria-label={`Player ${i+1}`} placeholder={`Player ${i+1}`} value={name} maxLength={24} onChange={e=>setPlayers(p=>p.map((n,j)=>i===j?e.target.value:n))}/>{players.length>3&&<button type="button" className="remove" onClick={()=>setPlayers(p=>p.filter((_,j)=>i!==j))}>×</button>}</div>)}</div>
      <button type="button" className="add" onClick={()=>setPlayers(p=>[...p,''])}>＋ Add another player</button>
      <div className="section-title category-title"><b>02</b><strong>Choose categories</strong><small>{selectedCategories.length} selected</small></div><div className="category-grid">{Object.keys(allWords).map(name=><label className={`category-option ${selectedCategories.includes(name)?'selected':''}`} key={name}><input type="checkbox" checked={selectedCategories.includes(name)} onChange={()=>toggleCategory(name)}/><span className="checkmark">✓</span>{name}</label>)}</div>
      <div className="section-title category-title"><b>03</b><strong>How many imposters?</strong></div><div className="imposter-options">{Array.from({length:Math.max(1,Math.min(5,names.length-1))},(_,i)=><button type="button" className={imposterCount===i+1?'count selected-count':''} onClick={()=>setImposterCount(i+1)} key={i}>{i+1}<small>{i===0?'imposter':'imposters'}</small></button>)}</div>
      <details><summary>＋ Add your own word and clue</summary><div className="custom"><p className="custom-note">Saved to <strong>Custom Words</strong> for future rounds.</p><input placeholder="Secret word" value={word} onChange={e=>setWord(e.target.value)}/><input placeholder="Imposter clue" value={clue} onChange={e=>setClue(e.target.value)}/><button type="button" className="save" onClick={addWord} disabled={!word.trim() || !clue.trim()}>Save to Custom Words</button></div></details>
      {error&&<p className="error">{error}</p>}<button className="primary">Start the game <span>↗</span></button></form></section>}
    {screen === 'pass' && <section className="panel center"><h1 className="player-handoff-name">{round.players[index]}</h1><button className="reveal-turn" onClick={()=>setScreen('reveal')}><span className="reveal-turn-icon">◉</span><strong>Ready to see your card?</strong><span>Make sure nobody else can see the screen.</span><b>SHOW MY CARD　↗</b></button></section>}
    {screen === 'reveal' && <section className="panel"><div className="step">{round.players[index].toUpperCase()} <span>· KEEP IT SECRET</span></div><article className={`card ${isImposter?'is-imposter':''}`}><div className="card-icon">✳</div><div className="eyebrow">{isImposter?'YOU ARE THE IMPOSTER':'YOUR SECRET WORD'}</div><h2>{isImposter?round.hint:round.secret}</h2><p>{isImposter?'This is your clue. Blend in without giving yourself away.':'Keep it secret. Don’t show anyone your screen.'}</p></article><button className="primary" onClick={nextPlayer}>{index<round.players.length-1?'Hide & pass the phone':'Hide & start discussion'} <span>↗</span></button></section>}
    {screen === 'discussion' && <section className="panel center"><div className="eyebrow">EVERYONE HAS SEEN THEIR CARD</div><div className="icon">◷</div><h1>Talk it out.<br/><em>Find the imposter.</em></h1><p className="intro">Describe your word without saying it. When ready, reveal the imposters.</p><button className="primary" onClick={()=>setScreen('result')}>Reveal the imposters <span>↗</span></button></section>}
    {screen === 'result' && <section className="panel center"><div className="eyebrow">THE ROUND IS OVER</div><div className="icon">✳</div><h1>The imposter{round.imposters.length>1?'s were':' was'}...</h1><div className="imposter-list">{round.imposters.map(n=><strong key={n}>{n}</strong>)}</div><div className="answer"><small>SECRET WORD</small><b>{round.secret}</b><span>Imposter clue: {round.hint}</span></div><button className="primary" onClick={playAgain}>Play another round <span>↗</span></button></section>}
    <footer><span>NO ACCOUNTS. JUST YOUR GROUP.</span><span>IMPOSTER</span></footer></main>;
}
