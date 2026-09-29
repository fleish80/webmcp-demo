import { ensureModelContext } from '@webmcp-demo/devkit';
import { CounterStore } from './app/counter-store';
import { ExplainerLab } from './app/lab';
import { installProgress } from './app/progress';
import { mountCall } from './app/sections/call';
import callHtml from './app/sections/call.html?raw';
import { mountCounter } from './app/sections/counter';
import counterHtml from './app/sections/counter.html?raw';
import { mountDiscover } from './app/sections/discover';
import discoverHtml from './app/sections/discover.html?raw';
import { mountHero } from './app/sections/hero';
import heroHtml from './app/sections/hero.html?raw';
import problemHtml from './app/sections/problem.html?raw';
import recapHtml from './app/sections/recap.html?raw';
import { mountRegister } from './app/sections/register';
import registerHtml from './app/sections/register.html?raw';

// The polyfill (or native modelContext) must be in place before any registerTool call.
const info = await ensureModelContext();
const counter = new CounterStore();
const lab = new ExplainerLab(info, counter);

const page = document.querySelector<HTMLElement>('#app')!;
page.innerHTML = [heroHtml, problemHtml, counterHtml, registerHtml, discoverHtml, callHtml, recapHtml].join('');

const section = (name: string) => page.querySelector<HTMLElement>(`[data-section="${name}"]`)!;
mountHero(section('hero'), lab);
mountCounter(section('counter'), counter);
mountRegister(section('register'), lab);
mountDiscover(section('discover'), lab);
mountCall(section('call'), lab);
installProgress(page, lab);
