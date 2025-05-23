import './App.css';
import { useLiff } from './useLiff';

function App() {
  const { profile, error, isReady, login, logout } = useLiff(import.meta.env.VITE_LIFF_ID);

  return (
    <div className='App'>
      <h1>create-liff-app</h1>
      {isReady && profile && <p>LIFF init succeeded. {profile.displayName}</p>}
      {isReady && !profile && <p>LIFF init succeeded.</p>}
      {error && (
        <p>
          <code>{error}</code>
        </p>
      )}
      <div style={{ margin: '1em 0' }}>
        <button onClick={login} style={{ marginRight: 8 }}>
          登入
        </button>
        <button onClick={logout}>登出</button>
      </div>
      <a href='https://developers.line.biz/ja/docs/liff/' target='_blank' rel='noreferrer'>
        LIFF Documentation
      </a>
    </div>
  );
}

export default App;
