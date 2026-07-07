import { render } from 'preact'
import './index.css'
import { App } from './app.tsx'
import { applicationStore } from './store/appStore'

void applicationStore.initialize();

render(<App />, document.getElementById('app')!)
