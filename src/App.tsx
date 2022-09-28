import { SwapWidget } from '@uniswap/widgets';
import TOKEN_LIST from './Token_List.json'
import './App.css';
import './fonts.css';

const TOKENS = {
	"DMD": "0x6702D328CDc0cC438AB5C667E7A2033f8065C64F",
	"WMATIC": "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
	"WETH": "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa",
	"NATIVE": "NATIVE"
}

const TxSuccessCallback = () =>{
	console.log("swap successfull");
	window.close();
}

const windowUrl = window.location.search;
const params = new URLSearchParams(windowUrl);
const isSwap = params.get('isSwap');
const defaultInputAmount: any = params.get('defaultInput');

const defaultInputToken = (isSwap === "true") ? TOKENS.NATIVE : TOKENS.DMD;
const defaultOutputToken = (isSwap === "true") ? TOKENS.DMD : TOKENS.NATIVE;
function App() {
	return (
		<div className="App">
			<div className = 'uniswap-widget'>
				<SwapWidget
					width="30em"
					tokenList={TOKEN_LIST}
					defaultInputTokenAddress={defaultInputToken}
					defaultOutputTokenAddress={defaultOutputToken}
					defaultInputAmount={defaultInputAmount}
					onTxSuccess={TxSuccessCallback}
				/>
			</div>
		</div>
	);
}

export default App;
