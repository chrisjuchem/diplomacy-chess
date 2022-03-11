import './App.css';
import { useEffect, useState } from 'react';
import Board from './Board';
import { registerHandler, connect } from './network'

function App() {
  const [peerId, setPeerId] = useState(null);
  const [enteredId, setEnteredId] = useState('');
  const [conn, setConn] = useState(null);

  useEffect(() => {
    registerHandler('id', setPeerId);
    registerHandler('connected', setConn);
  }, [])

  return (
    <div className="App">
      {!conn && (
        <div> 
          <div> 
            Enter a friend's id: 
            <input className="idInput" onChange={e=>setEnteredId(e.target.value)}/>
            <button onClick={()=>connect(enteredId)}> Go </button>
          </div>
          <div> 
            Or send them yours: {peerId}
          </div>
        </div>
      )}
      <Board />
    </div>
  );
}

export default App;
