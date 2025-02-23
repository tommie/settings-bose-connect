/// <reference types="w3c-web-serial" />
/// <reference lib="es2024.arraybuffer" />

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.min.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App2.vue'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')
