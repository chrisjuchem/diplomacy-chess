import Chessground from '@react-chess/chessground';
import { useEffect, useState } from 'react';
import * as Fen from './fen.js';
const Chess = require('chess.js');

const BRUSHES = {
    valid:{
        key: 'valid',
        color:'black',
        lineWidth:8,
    },
    invalid:{
        key: 'invalid',
        color:'red',
        lineWidth:8,
    },
    submitted:{
        key: 'submitted',
        color:'green',
        lineWidth:8,
    },
};
const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function Board () {
    const color = 'black';
    const [fen, setFen] = useState(Fen.asColor(STARTING_FEN, color));
    // const [showMove, setShowMoves] = useState([]); // {orig, dest, status}
    const [moves, setMoves] = useState([]); // {orig, dest, status}
    const [turn, setTurn] = useState(0);

    const rules = new Chess(fen);


    return <Chessground width={600} height={600} config={{
        key:'diplomacy-chess',
        fen,
        orientation: color,
        turnColor: color,
        animation: {
            enabled: false,
            // duration: 50,
        },
        movable: {
            free: false,
            color,
            dests: new Map("abcdefgh".split('').map(a => "12345678".split('').map(n => [
                a+n, rules.moves({square: a+n, verbose:true}).map(mv => mv.to)
            ])).flat()),
        },
        events: {
            move: (orig, dest, metadata) => setMoves([{orig, dest, status:'submitted'}])
        },
        drawable:{
            brushes:BRUSHES,
            autoShapes: moves.map(({orig, dest, status}) => ({orig, dest, brush:status})),
        },
    }}/>
}