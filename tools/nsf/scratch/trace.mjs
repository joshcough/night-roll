// scratch: which opcodes / addresses does FF1's driver actually execute?
import { readFileSync } from "node:fs";
import { CPU6502 } from "../cpu6502.mjs";
import { parseNSF, runNSF } from "../nsf.mjs";

const opCount = new Map();
const pcCount = new Map();
const orig = CPU6502.prototype.step;
CPU6502.prototype.step = function () {
  if (!this.halted) {
    const pc = this.pc;
    const op = this.bus.read(pc);
    opCount.set(op, (opCount.get(op) || 0) + 1);
    pcCount.set(pc, (pcCount.get(pc) || 0) + 1);
  }
  return orig.call(this);
};

const nsf = parseNSF(readFileSync("albums/final-fantasy-i/reference/ff1.nsf"));
const { apuLog, frames } = runNSF(nsf, 2, 10);
console.log("frames", frames, "apu writes", apuLog.length);
console.log("distinct opcodes executed:", opCount.size);
console.log("instructions executed:", [...opCount.values()].reduce((a, b) => a + b, 0));
console.log("distinct addresses executed:", pcCount.size, "of", nsf.data.length, "rom bytes");
const hot = [...pcCount].sort((a, b) => b[1] - a[1]).slice(0, 8);
console.log("hottest PCs:", hot.map(([a, c]) => "$" + a.toString(16) + "×" + c).join(" "));
const tops = [...opCount].sort((a, b) => b[1] - a[1]).slice(0, 8);
console.log("hottest opcodes:", tops.map(([o, c]) => "$" + o.toString(16).padStart(2, "0") + "×" + c).join(" "));
