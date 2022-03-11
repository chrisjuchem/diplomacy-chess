export function asColor(fen, color) {
    fen = fen.split(' ');
    fen[1] = color[0];
    return fen.join(' ');
}

