const CACHE_NAME = 'estoque-sistema-v2.0.0';
const STATIC_CACHE_NAME = 'estoque-static-v2.0.0';
const DYNAMIC_CACHE_NAME = 'estoque-dynamic-v2.0.0';

// Arquivos para cache estático (sempre em cache)
const STATIC_FILES = [
  '/',
  '/sistema',
  '/login',
  '/cadastro',
  '/listar',
  '/adicionar',
  '/utilizados',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/new-app-icon.svg'
];

// Arquivos para cache dinâmico (cache conforme uso)
const DYNAMIC_FILES = [
  '/api/',
  '/_next/static/',
  '/_next/image'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME)
        .then((cache) => {
          console.log('Service Worker: Cache estático criado');
          return cache.addAll(STATIC_FILES);
        }),
      // Forçar ativação imediata
      self.skipWaiting()
    ])
    .then(() => {
      console.log('Service Worker: Instalação completa');
      // Notificar clientes sobre instalação
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_INSTALLED',
            message: 'Service Worker instalado com sucesso'
          });
        });
      });
    })
    .catch((error) => {
      console.error('Service Worker: Erro na instalação:', error);
    })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Remover caches antigos
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('Service Worker: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Ativado com sucesso');
        return self.clients.claim();
      })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }

  // Estratégia Cache First para arquivos estáticos
  if (STATIC_FILES.some(file => url.pathname === file) || 
      url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((response) => {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
              return response;
            });
        })
        .catch(() => {
          // Fallback para página offline
          if (request.destination === 'document') {
            return caches.match('/');
          }
        })
    );
    return;
  }

  // Estratégia Network First para APIs e dados dinâmicos
  if (url.pathname.startsWith('/api/') || 
      url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache apenas respostas bem-sucedidas
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback para cache em caso de erro de rede
          return caches.match(request);
        })
    );
    return;
  }

  // Estratégia Stale While Revalidate para outras requisições
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
            return response;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
  );
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Sincronização em background:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Implementar sincronização de dados offline
      syncOfflineData()
    );
  }
});

// Notificações push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Notificação push recebida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir Sistema',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Sistema de Estoque', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Clique em notificação:', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Função para sincronizar dados offline
async function syncOfflineData() {
  try {
    // Implementar lógica de sincronização
    console.log('Service Worker: Sincronizando dados offline...');
    
    // Buscar dados pendentes no IndexedDB
    // Enviar para servidor quando online
    // Atualizar cache local
    
    return Promise.resolve();
  } catch (error) {
    console.error('Service Worker: Erro na sincronização:', error);
    return Promise.reject(error);
  }
}

// Limpeza periódica de cache
setInterval(() => {
  caches.open(DYNAMIC_CACHE_NAME)
    .then((cache) => {
      cache.keys()
        .then((requests) => {
          // Manter apenas os 50 itens mais recentes
          if (requests.length > 50) {
            const oldRequests = requests.slice(0, requests.length - 50);
            oldRequests.forEach((request) => {
              cache.delete(request);
            });
          }
        });
    });
}, 24 * 60 * 60 * 1000); // A cada 24 horas