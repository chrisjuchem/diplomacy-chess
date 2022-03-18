import './App.css';
import { useCallback, useState } from 'react';
import Board from './Board';
import { useHandler, connect, sendData } from './network'

function App() {
    const [started, setStarted] = useState(false);
    const [settings, setSettings] = useState({
        color: 'random',
        version: '0.0.2',
    });

    const [myId, setMyId] = useState(null);
    const peerId = new URLSearchParams(window.location.search).get('id');
    const inviteLink = `${window.location.href}?id=${myId}`;

    // id
    useHandler('id', useCallback((id) => {
        if (peerId) {
            connect(peerId);
        } else {
            setMyId(id);
        }
    }, [peerId]));

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
        if (host) return console.error("Recieved settings as host");
        if (data.version !== settings.version) return console.error("Client version mismatch");
        setSettings(data);
        setStarted(true);
    }, []));

    const copyInviteLink = (e) => {
        navigator.clipboard.writeText(inviteLink);
        e.target.innerText = 'Copied!';
    };

    return (
        <div className="App">
            {started
                ? <Board {...settings} {...{started}}/>
                : (
                    <div>
                        {peerId
                          ? "Joining game..."
                          : myId
                            ? <>
                                <div> Send this invite link to a friend: </div>
                                <div>
                                    {inviteLink} <button onClick={copyInviteLink}>
                                        Copy
                                    </button>
                                </div>
                                </>
                            : "Generating invite link..."
                        }
                    </div>
                )}
        </div>
    );
}

export default App;
