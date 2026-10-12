const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'../寶可夢3D-V5');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const rosterSource=read('js/roster.js');
const specialSource=read('js/v5-special.js');
const html=read('index.html');
const sandbox={};
new Function('window',rosterSource)(sandbox);
new Function('PalletRoster',specialSource)(sandbox.PalletRoster);
const roster=sandbox.PalletRoster;
const from=html.indexOf('const WORLD_LEGENDARY_SCALE = ');
const to=html.indexOf('const GYM_BOSS_SCALE',from);
if(from<0||to<from)throw Error('Expected overworld scaling policy');
const scale=new Function('PalletRoster',html.slice(from,to)+'\nreturn MODEL_SCALE;')(roster);
const expected=[
 'articuno','zapdos','moltres','raikou','entei','suicune',
 'kyogre','groudon','rayquaza','dialga','palkia','giratina'
];
test('first-four-generation legendary roster contains 12 and each scale is exactly 1.5',()=>{
 assert.deepEqual([...roster.legends],expected);
 assert.equal(roster.legends.length,12);
 for(const id of expected)assert.equal(scale[id],1.5,id);
});
test('Mew and Mewtwo keep original world scale; all ordinary and gym species unchanged',()=>{
 for(const id of Object.keys(roster.dex)){
   assert.equal(scale[id],expected.includes(id)?1.5:1,id);
 }
 assert.equal(scale.mew,1);
 assert.equal(scale.mewtwo,1);
 assert.equal(scale.pikachu,1);
 assert.equal(scale.jigglypuff,1);
 assert.equal(scale.wigglytuff,1);
 assert.equal(scale.blissey,1);
});
test('all world Pokémon spawn paths share Pokemon constructor baseScale',()=>{
 assert.match(html,/this\.baseScale = MODEL_SCALE\[type\] \|\| 1\.0;/);
 assert.match(html,/this\.mesh\.scale\.setScalar\(this\.baseScale\);/);
 assert.match(html,/const p = new Pokemon\(leg, player\.position\.x \+ 10, player\.position\.z \+ 10\)/);
 assert.match(html,/const p = new Pokemon\(type, player\.position\.x \+ Math\.cos\(angle\) \* dist, player\.position\.z \+ Math\.sin\(angle\) \* dist\)/);
});
test('respawn, GLB loading, catch-failure and shrink retain base scale, not repeated multiplication',()=>{
 assert.match(html,/this\.mesh\.scale\.set\(curScale, curScale, curScale\)/);
 assert.match(html,/pokemon\.mesh\.scale\.set\(pokemon\.baseScale, pokemon\.baseScale, pokemon\.baseScale\)/);
 assert.match(html,/pokemon\.mesh\.clear\(\); pokemon\.mesh\.add\(replacement\)/);
 assert.match(html,/pokemon\.modelHeight=assetSize\.y\*pokemon\.baseScale/);
 assert.doesNotMatch(html,/pokemon\.baseScale\s*\*=\s*WORLD_LEGENDARY_SCALE/);
});
test('dedicated gym boss and 3D trainer battle scales are separate',()=>{
 assert.match(html,/const GYM_BOSS_SCALE =/);
 assert.match(html,/this\.baseScale = GYM_BOSS_SCALE\[type\] \|\| 1\.9/);
 assert.ok(!expected.includes('mewtwo')&&!expected.includes('mew'));
});
