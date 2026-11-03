// Decode Chromium's RGB/RGBA PNG screenshot without an extra runtime dependency.
const zlib=require('node:zlib'),assert=require('node:assert/strict');
module.exports=function assertOcean(buffer){
 assert.equal(buffer.subarray(1,4).toString(),'PNG');let width,height,channels;const chunks=[];
 for(let offset=8;offset<buffer.length;){const size=buffer.readUInt32BE(offset),type=buffer.toString('ascii',offset+4,offset+8),data=buffer.subarray(offset+8,offset+8+size);offset+=size+12;
  if(type==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);assert.equal(data[8],8);channels=({2:3,6:4})[data[9]];assert(channels,'Expected RGB/RGBA screenshot');assert.equal(data[12],0,'Non-interlaced screenshot required')}
  if(type==='IDAT')chunks.push(data);
 }
 const raw=zlib.inflateSync(Buffer.concat(chunks)),stride=width*channels;let previous=Buffer.alloc(stride),offset=0,dark=0;
 for(let y=0;y<height;y++){const filter=raw[offset++],row=Buffer.from(raw.subarray(offset,offset+stride));offset+=stride;assert(filter<=4);
  for(let x=0;x<stride;x++){const a=x>=channels?row[x-channels]:0,b=previous[x],c=x>=channels?previous[x-channels]:0;let predict=0;
   if(filter===1)predict=a;else if(filter===2)predict=b;else if(filter===3)predict=Math.floor((a+b)/2);else if(filter===4){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);predict=pa<=pb&&pa<=pc?a:pb<=pc?b:c}
   row[x]=(row[x]+predict)&255;
  }
  for(let x=0;x<stride;x+=channels){const r=row[x],g=row[x+1],b=row[x+2];if(r<70&&g<100&&b<100&&g>r+8)dark++}
  previous=row;
 }
 const ratio=dark/(width*height);assert(ratio>.12,'World ocean paint dropped: dark coverage '+ratio);return ratio;
};
