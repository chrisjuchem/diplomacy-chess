import Chessground from '@react-chess/chessground';
import { useEffect, useState, useMemo, useCallback } from 'react';
import * as Fen from './fen.js';
import { useHandler, sendData } from './network.js';
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

const getMoveSquares = (rules, square) => rules.moves({square, verbose:true}).map(mv => mv.to)
const moveBy = (rules, m) => getMoveSquares(rules, m.orig).includes(m.dest);

export default function Board ({color}) {
    const [fen, setFen] = useState(Fen.asColor(STARTING_FEN, color));
    useEffect(() => setFen(Fen.asColor(STARTING_FEN, color)), [color]);

    const [moves, setMoves] = useState([[]]); // {orig, dest, status}
    const [submitted, setSubmitted] = useState(false);
    const [oppSubmitted, setOppSubmitted] = useState(false);

    const [myRules, oppRules, validMoves] = useMemo(() => {
        const rules = new Chess(fen);
        const rules2 = new Chess(Fen.asOtherColor(fen));
        function getMoves(r) {
            const moves = "abcdefgh".split('').map(a => "12345678".split('').map(n => [
                a+n, getMoveSquares(r, a+n)
            ])).flat().filter(([_, moves]) => moves.length);
            return moves;
        }
        return [rules, rules2, new Map([...getMoves(rules), ...getMoves(rules2)])];
    }, [fen]);
    

    const sendFullMove = useCallback(()=>{
        sendData("move", submitted.moveStr)
    }, [submitted]);

    const submitMove = () => {
        const myMove = moves.at(-1).filter(m => moveBy(myRules, m))[0];
        const moveStr = "noise"+"=="+myMove.orig+"=="+myMove.dest+"=="+"noise"
        const hash = "AAA";
        setSubmitted({moveStr, hash})

        sendData("submit", hash)

        if (oppSubmitted) sendFullMove(); // TODO need to do after render
    }

    useHandler("submit", useCallback((hash) => {
        if (oppSubmitted) return console.error("recieved double move");
        if (!hash) return console.error("submit missing hash");

        setOppSubmitted(hash); // TODO need to do after render

        if (submitted) sendFullMove();
    }, [submitted, oppSubmitted, sendFullMove]));


    useHandler("move", useCallback((moveStr) => {
        // if (hash(moveStr) !== oppSubmitted) {
        if ("AAA" !== oppSubmitted) return console.error("hash mismatch");
        const parts = moveStr.split("==");
        if (parts.length !== 4) return console.error("invalid move string");
        const [orig, dest] = parts.slice(1,3);
        const oppMove = {orig, dest};
        if (!moveBy(oppRules, oppMove)) return console.error("illegal move");

        //validate rules

    }, [submitted, oppSubmitted, oppRules]));

    return <div>
        <Chessground width={400} height={420} config={{
            key:'diplomacy-chess',
            fen,
            orientation: color === 'random' ? 'white' : color,
            turnColor: color,
            animation: {
                enabled: false,
                // duration: 50,
            },
            movable: {
                free: false,
                color: submitted ? undefined : 'both',
                dests: validMoves,
                events: {
                    after: (orig, dest, _metadata) => {
                        setMoves(mvs => [
                            ...mvs.slice(0, -1),
                            [
                                ...mvs.at(-1).filter(m => (
                                    // remove moves by same color
                                    moveBy(myRules, m) !== moveBy(myRules, {orig, dest})
                                )),
                                {orig, dest, status:'submitted'},
                            ],
                        ]);
                    }
                },
            },
            
            drawable:{
                brushes:BRUSHES,
                autoShapes: moves.at(-1).map(({orig, dest, status}) => ({orig, dest, brush:status})),
            },
        }}/>
        <button onClick={submitMove}> Submit </button> 
    </div> 
}
