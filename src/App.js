import './App.css';
import { useCallback, useState } from 'react';
import Board from './Board';
import { useHandler, connect, sendData } from './network'

function App() {
    const [started, setStarted] = useState(false);
    const [peerId, setPeerId] = useState(null);
    const [enteredId, setEnteredId] = useState('');

    const [settings, setSettings] = useState({
        color: 'random',
    });

    // id
    useHandler('id', setPeerId);

    // connected
    useHandler("connected", useCallback(() => {
        setStarted(true);

        const sendSettings = {...settings};
        if (settings.color === 'white' ||
                (settings.color === 'random' && Math.random() < 0.5)) {
            setSettings(old => ({...old, color: 'white'}));
            sendSettings.color = 'black';
        } else {
            setSettings(old => ({...old, color: 'black'}));
            sendSettings.color = 'white';
        }
        sendData("settings", sendSettings);
    }, [settings]));

    // settings
    useHandler('settings', useCallback((data, host) => {
        if (host) {
            console.error("Recieved settings as host");
            return;
        }
        setSettings(data);
        setStarted(true);
    }, []));

    return (
        <div className="App">
            {started
                ? <Board {...settings} {...{started}}/>
                : (
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
        </div>
    );
}

export default App;
