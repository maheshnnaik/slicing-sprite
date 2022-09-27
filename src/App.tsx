import { SwapWidget } from '@uniswap/widgets';
import TOKEN_LIST from './Token_List.json'
import './App.css';
import './fonts.css';

const DMD = "0x6702D328CDc0cC438AB5C667E7A2033f8065C64F"

function App() {
	return (
		<div className="App">
			<div className = 'uniswap-widget'>
				<SwapWidget
					tokenList={TOKEN_LIST}
					defaultOutputTokenAddress={DMD}
					defaultOutputAmount={100}
				/>
			</div>
		</div>
	);
}

export default App;
