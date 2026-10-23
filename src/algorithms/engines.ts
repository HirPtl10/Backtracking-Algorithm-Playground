import type { AlgoEvent } from './types';

export function* solveQueens(n:number, all:boolean):Generator<AlgoEvent>{
 const q=Array(n).fill(-1); let count=0;
 function* visit(row:number):Generator<AlgoEvent>{
  if(row===n){count++;yield {type:'SOLUTION',message:`Solution ${count} found`,depth:row,board:[...q]};return !all;}
  for(let c=0;c<n;c++){
   yield {type:'CHECK',row,col:c,depth:row,message:`Check row ${row+1}, column ${c+1}`};
   const safe=q.slice(0,row).every((x,r)=>x!==c&&Math.abs(x-c)!==row-r);
   if(!safe){yield {type:'INVALID',row,col:c,depth:row,message:`Column ${c+1} conflicts with an earlier queen`};continue;}
   q[row]=c; yield {type:'PLACE',row,col:c,depth:row+1,message:`Place queen at row ${row+1}, column ${c+1}`,board:[...q]};
   yield {type:'RECURSE',row,col:c,depth:row+1,message:`Recurse to row ${row+2}`};
   const stop=yield* visit(row+1); if(stop)return true;
   q[row]=-1; yield {type:'BACKTRACK',row,col:c,depth:row+1,message:`Remove queen from row ${row+1}, column ${c+1}`,board:[...q]};
  } return false;
 }
 yield* visit(0);yield {type:'DONE',message:`Search complete · ${count} solution${count===1?'':'s'}`,depth:0,board:[...q]};
}

export function* solveSudoku(input:number[][]):Generator<AlgoEvent>{
 const b=input.map(r=>[...r]);let found=false;
 const candidates=(r:number,c:number)=>Array.from({length:9},(_,i)=>i+1).filter(v=>!b[r].includes(v)&&!b.some(row=>row[c]===v)&&!Array.from({length:3},(_,i)=>Array.from({length:3},(_,j)=>b[Math.floor(r/3)*3+i][Math.floor(c/3)*3+j])).flat().includes(v));
 for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(b[r][c]){const v=b[r][c];b[r][c]=0;const valid=!b[r].includes(v)&&!b.some(row=>row[c]===v)&&!Array.from({length:3},(_,i)=>Array.from({length:3},(_,j)=>b[Math.floor(r/3)*3+i][Math.floor(c/3)*3+j])).flat().includes(v);b[r][c]=v;if(!valid){yield {type:'DONE',message:`Invalid puzzle: duplicate ${v} near row ${r+1}, column ${c+1}`,depth:0,board:b.map(x=>[...x])};return;}}
 function* visit(depth:number):Generator<AlgoEvent>{
  let r=-1,c=-1,best=10;for(let i=0;i<9;i++)for(let j=0;j<9;j++)if(!b[i][j]){const count=candidates(i,j).length;if(count<best){best=count;r=i;c=j;}}
  if(r<0){found=true;yield {type:'SOLUTION',message:'Sudoku solved',depth,board:b.map(x=>[...x])};return true;}
  if(best===0)return false;
  for(let v=1;v<=9;v++){
   yield {type:'CHECK',row:r,col:c,value:v,depth,message:`Try ${v} in row ${r+1}, column ${c+1}`};
   let ok=true;for(let k=0;k<9;k++)if(b[r][k]===v||b[k][c]===v)ok=false;
   const br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;for(let i=br;i<br+3;i++)for(let j=bc;j<bc+3;j++)if(b[i][j]===v)ok=false;
   if(!ok){yield {type:'INVALID',row:r,col:c,value:v,depth,message:`${v} violates a row, column or box constraint`};continue;}
   b[r][c]=v;yield {type:'PLACE',row:r,col:c,value:v,depth:depth+1,message:`Place ${v} at row ${r+1}, column ${c+1}`,board:b.map(x=>[...x])};
   yield {type:'RECURSE',row:r,col:c,depth:depth+1,message:'Recurse to the next empty cell'};
   if(yield* visit(depth+1))return true;
   b[r][c]=0;yield {type:'BACKTRACK',row:r,col:c,value:v,depth:depth+1,message:`Undo ${v} at row ${r+1}, column ${c+1}`,board:b.map(x=>[...x])};
  }return false;
 }
 yield* visit(0);yield {type:'DONE',message:found?'Sudoku solved':'No solution exists for this puzzle',depth:0,board:b.map(x=>[...x])};
}

export function createSampleMaze():number[][]{
 const rows=11,cols=15,grid=Array.from({length:rows},()=>Array(cols).fill(1));
 let seed=86;const rand=(max:number)=>{seed=(seed*16807)%2147483647;return seed%max;};
 const visited=new Set<string>(['1,1']),stack:Array<[number,number]>=[[1,1]];grid[1][1]=0;
 while(stack.length){const [r,c]=stack[stack.length-1];const next:[[number,number]]|any=[[r,c+2],[r+2,c],[r,c-2],[r-2,c]].filter(([nr,nc]:number[])=>nr>0&&nr<rows-1&&nc>0&&nc<cols-1&&!visited.has(`${nr},${nc}`));if(!next.length){stack.pop();continue;}const [nr,nc]=next[rand(next.length)];grid[(r+nr)/2][(c+nc)/2]=0;grid[nr][nc]=0;visited.add(`${nr},${nc}`);stack.push([nr,nc]);}
 grid[0][0]=0;grid[0][1]=0;grid[10][13]=0;grid[10][14]=0;return grid;
}

export const GRAPH_EDGES:Array<[number,number]> = [[0,1],[0,3],[1,3],[1,4],[2,3],[2,4],[3,4]];
export function* colorGraph(n:number,k:number):Generator<AlgoEvent>{
 const colors=Array(n).fill(-1);let solutions=0;
 function* visit(v:number):Generator<AlgoEvent>{
  if(v===n){solutions++;yield {type:'SOLUTION',message:'Valid coloring found',depth:v,board:[...colors]};return true;}
  for(let color=0;color<k;color++){
   yield {type:'CHECK',row:v,col:color,depth:v,message:`Try color ${color+1} on vertex ${v+1}`};
   const valid=!GRAPH_EDGES.some(([a,b])=>((a===v&&colors[b]===color)||(b===v&&colors[a]===color)));
   if(!valid){yield {type:'INVALID',row:v,col:color,depth:v,message:`Color ${color+1} conflicts with an adjacent vertex`};continue;}
   colors[v]=color;yield {type:'PLACE',row:v,col:color,value:color,depth:v+1,message:`Assign color ${color+1} to vertex ${v+1}`,board:[...colors]};
   if(yield* visit(v+1))return true;
   colors[v]=-1;yield {type:'BACKTRACK',row:v,col:color,depth:v+1,message:`Remove color from vertex ${v+1}`,board:[...colors]};
  }return false;
 }
 yield* visit(0);yield {type:'DONE',message:`Search complete · ${solutions} solution${solutions===1?'':'s'}`,depth:0,board:[...colors]};
}

export function* solveMaze(grid:number[][]):Generator<AlgoEvent>{
 const path=new Set<string>(), seen=new Set<string>(), dirs=[[0,1],[1,0],[0,-1],[-1,0]];let solved=false;const R=grid.length,C=grid[0].length;
 function* visit(r:number,c:number,d:number):Generator<AlgoEvent>{
  const key=`${r},${c}`;if(r<0||c<0||r>=R||c>=C||grid[r][c]===1||seen.has(key))return false;
  seen.add(key);path.add(key);yield {type:'PLACE',row:r,col:c,depth:d,message:`Explore cell (${r+1}, ${c+1})`,board:Array.from(path)};
  if(r===R-1&&c===C-1){solved=true;yield {type:'SOLUTION',row:r,col:c,depth:d,message:'Start-to-finish path found',board:Array.from(path)};return true;}
  for(const [dr,dc] of dirs){const nr=r+dr,nc=c+dc;yield {type:'CHECK',row:nr,col:nc,depth:d,message:`Check cell (${nr+1}, ${nc+1})`};if(yield* visit(nr,nc,d+1))return true;}
  path.delete(key);yield {type:'BACKTRACK',row:r,col:c,depth:d,message:`Dead end · leave cell (${r+1}, ${c+1})`,board:Array.from(path)};return false;
 }
 yield* visit(0,0,1);yield {type:'DONE',message:solved?'Maze solved':'No path exists',depth:0,board:Array.from(path)};
}
