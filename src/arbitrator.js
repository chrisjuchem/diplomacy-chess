import * as Fen from './fen.js'
const Chess = require('chess.js');

export default function arbitrate(moveA, moveB, fen) {
    const rulesA = new Chess(fen);
    const rulesB = new Chess(Fen.asOtherColor(fen))

    console.log(moveA, moveB);

    if (moveA.dest === moveB.dest) return [false, false];
    if (moveA.orig === moveB.dest && moveB.orig === moveA.dest &&
        rulesA.get(moveA.orig).type !== 'n') return [false, false];

    const resA1 = rulesA.move({from:moveA.orig, to:moveA.dest, promotion: 'q'});
    // if (!resA1) return console.error("Unexpected invalid move in arbitration");
    const bInCheck = rulesA.in_check();
    const resB2 = rulesA.move({from:moveB.orig, to:moveB.dest, promotion: 'q'});

    let resB1 = rulesB.move({from:moveB.orig, to:moveB.dest, promotion: 'q'});
    // if (!resB1) return console.error("Unexpected invalid move in arbitration");
    const aInCheck = rulesB.in_check();
    const resA2 = rulesB.move({from:moveA.orig, to:moveA.dest, promotion: 'q'});

    // if the moving piece is captured, let it move anyway
    // or if a check was made
    const resA = resA2 ? resA2 : (
        (resB1.captured && (resB1.to === resA1.from)) || aInCheck
    ) ? resA1 : resA2;
    const resB = resB2 ? resB2 : (
        (resA1.captured && (resA1.to === resB1.from)) || bInCheck
    ) ? resB1 : resB2;

    return [resA, resB];
}
