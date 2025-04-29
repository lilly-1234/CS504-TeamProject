import logo from './logo.svg';
import './App.css';

function App() {

  const handleSignup = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/signup`)        
      const data = await response.json();
      console.log('Server response:', data);
    } catch (err) {
      console.error('Error signing up:', err);
    }
  };
  return (
    <div style={{ padding: 20 }}>
      <h1>Backend Test</h1>
      <button onClick={handleSignup}>Signup</button>
    </div>
  );
}

export default App;
