const chunks = [];
let allocated = 0;
const chunkMB = 100;
const targetMB = 2048;

function allocate() {
  if (allocated >= targetMB) {
    console.log('Target reached: ' + allocated + 'MB');
    return;
  }
  const buf = Buffer.alloc(chunkMB * 1024 * 1024, 1);
  chunks.push(buf);
  allocated += chunkMB;
  console.log('Allocated: ' + allocated + 'MB');
  setImmediate(allocate);
}

allocate();
