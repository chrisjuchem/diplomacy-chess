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
