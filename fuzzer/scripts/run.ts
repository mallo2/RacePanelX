import { runFuzzer } from "../lib/runFuzzer";

const {testCount, bugs} = runFuzzer();

for (const bug of bugs) {
    console.error("🚨 DISPLAY BUG", bug);
}

console.log(`Tests: ${testCount}`);
console.log(`🚨 Bugs detected: ${bugs.length}`);

if (bugs.length > 0) {
    process.exit(1);
}
