import OneSignal from 'react-onesignal';

function App() {
    useEffect(() => {
        OneSignal.init({
            appId: "905b9270-0212-408e-829f-c6d15374291a"
        });
    }, []);
    return (
        <div className="App">
            App
        </div>
    )
}

export default App
