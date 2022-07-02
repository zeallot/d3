import './App.css';
import { Chart } from './components/Chart';
import data from './data.json';

function App() {
  return (
    <Chart datasets={data} />
  );
}

export default App;
