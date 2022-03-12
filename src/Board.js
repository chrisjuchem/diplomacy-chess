import Chessground from '@react-chess/chessground';
import { useEffect, useState, useMemo, useCallback } from 'react';
import arbitrate from './arbitrator.js';
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

export default function Board ({color, started}) {
    const [fen, setFen] = useState(Fen.asColor(STARTING_FEN, color));
    useEffect(() => setFen(Fen.asColor(STARTING_FEN, color)), [color]);

    const [moves, setMoves] = useState([[]]); // {orig, dest, status}
    const [submitted, setSubmitted] = useState(false);
    const [oppHash, setOppHash] = useState(false);
    const [oppMoveStr, setOppMoveStr] = useState(false);

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
    

    const sendFullMove = useCallback((moveStr) => sendData("move", moveStr), [])

    const submitMove = () => {
        const move = moves.at(-1).filter(m => moveBy(myRules, m))[0];
        const moveStr = "noise"+"=="+move.orig+"=="+move.dest+"=="+"noise"
        const hash = "AAA";
        setSubmitted({move, moveStr, hash})

        // remove opp moves
        // TODO: verify working
        setMoves(mvs => [
            ...mvs.slice(0, -1),
            mvs.at(-1).filter(m => moveBy(myRules, m)),
        ]);

        sendData("submit", hash);

        if (oppHash) sendFullMove(moveStr); // TODO need to do after render
    };

    useHandler("submit", useCallback((hash) => {
        if (oppHash) return console.error("recieved double move");
        if (!hash) return console.error("submit missing hash");

        setOppHash(hash); // TODO need to do after render

        if (submitted) sendFullMove(submitted.moveStr);
    }, [submitted, oppHash, sendFullMove]));

    useHandler("move", setOppMoveStr);

    const processMove = useCallback(() => {
        // if (hash(moveStr) !== oppSubmitted) {
        if ("AAA" !== oppHash) return console.error("hash mismatch", oppHash);
        const parts = oppMoveStr.split("==");
        if (parts.length !== 4) return console.error("invalid move string");
        const [orig, dest] = parts.slice(1,3);
        const oppMove = {orig, dest};
        const myMove = submitted.move;
        if (!moveBy(oppRules, oppMove)) return console.error("illegal move");

        //validate rules
        const [myMoveRes, oppMoveRes] = arbitrate(myMove, oppMove, fen);
        setFen(Fen.processMoves(fen, myMoveRes, oppMoveRes));

        if (myMoveRes) {
            myMove.san = myMoveRes.san;
            myMove.status = 'valid';
        } else {
            myMove.status = 'invalid';
        }
        if (oppMoveRes) {
            oppMove.san = oppMoveRes.san;
            oppMove.status = 'valid';
        } else {
            oppMove.status = 'invalid';
        }

        setMoves(mvs => [
            ...mvs.slice(0, -1),
            [myMove, oppMove],
            []
        ]);

        setSubmitted(false);
        setOppHash(false);
        setOppMoveStr(false);
    }, [oppMoveStr, oppHash, oppRules, submitted, fen]);
    
    useEffect(() => {
        if (oppMoveStr) processMove();
    }, [oppMoveStr, processMove])

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
                color: (submitted.move || color === 'random') ? undefined : 'both',
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
        { started && <button onClick={submitMove} disabled={submitted}> Submit </button> }
    </div> 
}
