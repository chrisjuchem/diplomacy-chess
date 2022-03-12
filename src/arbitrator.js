import * as Fen from './fen.js'
const Chess = require('chess.js');

export default function arbitrate(moveA, moveB, fen) {
    const rulesA = new Chess(fen);
    const rulesB = new Chess(Fen.asOtherColor(fen))

    if (moveA.dest === moveB.dest) return [false, false];
    if (moveA.orig === moveB.dest && moveB.orig === moveA.dest &&
        rulesA.get(moveA.orig).type !== 'n') return [false, false];

    const resA1 = rulesA.move({from:moveA.orig, to:moveA.dest});
    if (!resA1) return console.error("Unexpected invalid move in arbitration");
    const resB2 = rulesA.move({from:moveB.orig, to:moveB.dest});

    let resB1 = rulesB.move({from:moveB.orig, to:moveB.dest});
    if (!resB1) return console.error("Unexpected invalid move in arbitration");
    const resA2 = rulesB.move({from:moveA.orig, to:moveA.dest});

    // if the moving piece is captured, let it move anyway
    const resA = (resB1.captured && (resB1.to === resA1.from)) ? resA1 : resA2;
    const resB = (resA1.captured && (resA1.to === resB1.from)) ? resB1 : resB2; 

    return [resA, resB];
}
