// Función para obtener la marca de tiempo en el formato solicitado
function getTimestamp() {
    const now = new Date();
    const pad = (num) => num.toString().padStart(2, '0');
    const d = pad(now.getDate());
    const m = pad(now.getMonth() + 1);
    const y = now.getFullYear();
    const h = pad(now.getHours());
    const min = pad(now.getMinutes());
    const s = pad(now.getSeconds());
    const ml = now.getMilliseconds().toString().padStart(3, '0');
    return `${d}-${m}-${y}-${h}-${min}-${s}-${ml}`;
}

// Función para agregar una entrada a la bitácora en el DOM
function logStatus(status) {
    const logList = document.getElementById('log');
    if (logList) {
        const entry = document.createElement('li');
        entry.className = 'log-entry';
        const timestamp = getTimestamp();
        entry.innerHTML = `<span class="status">${status}</span> <span class="timestamp">${timestamp}</span>`;
        logList.appendChild(entry);
    }
}

// Registro del Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {


        // Extrae el nombre del repositorio de la URL (e.g., /ServiceWorker/)
        const path = window.location.pathname.split('/');
        const repoName = path.length > 1 && path[1] ? `/${path[1]}` : '';

        // Forma la ruta completa: /ServiceWorker/sw.js
        const swPath = `${repoName}/sw.js`;

        navigator.serviceWorker.register(swPath).then(registration => {
            console.log('Service Worker registrado con éxito:', registration);

            // Escuchar el estado de instalación y activación
            const updateLog = (state) => {
                logStatus(state);
            };

            // Escuchar los cambios en el estado del Service Worker
            if (registration.installing) {
                updateLog('Instalando');
                registration.installing.addEventListener('statechange', (event) => {
                    if (event.target.state === 'installed') {
                        updateLog('Instalado / Esperando');
                    }
                });
            }

            if (registration.waiting) {
                updateLog('Instalado / Esperando');
            }

            if (registration.active) {
                updateLog('Activo');
            }

            // Detectar el estado "Ocioso" y actualiza cada 3 segundos
            setInterval(() => {
                if (registration.active && registration.active.state === 'activated' && !registration.installing && !registration.waiting) {
                    logStatus('Ocioso');
                }
            }, 3000);


            // Detección de actualización del Service Worker
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    logStatus('Actualizando');
                    newWorker.addEventListener('statechange', (event) => {
                        if (event.target.state === 'installed') {
                            logStatus('Instalado / Esperando (nueva versión)');
                        } else if (event.target.state === 'activated') {
                            logStatus('Activo (nueva versión)');
                        }
                    });
                }
            });

        }).catch(error => {
            console.error('Fallo en el registro del Service Worker:', error);
        });
    });
} else {
    logStatus('Service Workers no son soportados en este navegador.');
}