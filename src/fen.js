const Chess = require("chess.js");

export function asColor(fen, color) {
    fen = fen.split(' ');
    fen[1] = color[0];
    return fen.join(' ');
}

export function asOtherColor(fen) {
    fen = fen.split(' ');
    fen[1] = fen[1] === 'w' ? 'b' : 'w';
    return fen.join(' ');
}

export function processMoves(fen, mv1, mv2) {
    const rules = new Chess(fen);

    fen = fen.split(' ');

    // if (mv1) rules.remove(mv1.capture);
    // if (mv2) rules.remove(mv2.capture);
    if (mv1) rules.remove(mv1.from);
    if (mv2) rules.remove(mv2.from);
    if (mv1) rules.put({color: mv1.color, type: mv1.promotion || mv1.piece}, mv1.to);
    if (mv2) rules.put({color: mv2.color, type: mv2.promotion || mv2.piece}, mv2.to);

    const fen2 = rules.fen().split(' ');

    return [fen2[0], ...fen.slice(1)].join(' ');
}
