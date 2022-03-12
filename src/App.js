import './App.css';
import { useEffect, useState } from 'react';
import Board from './Board';
import { registerHandler, unregisterHandler, connect, sendData } from './network'

function App() {
  const [started, setStarted] = useState(false);
  const [peerId, setPeerId] = useState(null);
  const [enteredId, setEnteredId] = useState('');

  const [settings, setSettings] = useState({
    color: 'random',
  });

  // id
  useEffect(() => {
    registerHandler('id', setPeerId);
    return () => unregisterHandler('id', setPeerId)
  }, [])

  // connected
  useEffect(() => {
    const f = () => {
      setStarted(true);

      const sendSettings = {...settings};
      if (settings.color === 'white' ||
          (settings.color === 'random' && Math.random() < 0.5)) {
        setSettings(old => ({...old, color: 'white'}));
        sendSettings.color = 'black';
      } else {
        setSettings(old => ({...old, color: 'white'}));
        sendSettings.color = 'black';
      }
      sendData("settings", sendSettings);
    }

    registerHandler('connected', f);
    return () => unregisterHandler('connected', f);
  }, [settings])

  // settings
  useEffect(() => {
    const f = (data, host) => {
      if (host) {
        console.error("Recieved settings as host");
        return;
      }
      setSettings(data);
      setStarted(true);
    };
    registerHandler('settings', f)
    return () => unregisterHandler('settings', f);
  }, [])

  return (
    <div className="App">
      {!started && (
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
      <Board {...settings}/>
    </div>
  );
}

export default App;
