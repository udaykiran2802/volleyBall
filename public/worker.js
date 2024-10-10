console.log("Service Worker Loaded...");

// Handle push notifications
self.addEventListener('push', function(event) { 
    let data; 

    // Try to parse the JSON payload sent from the server 
    try { 
        data = event.data.json(); 
    } catch (e) { 
        console.error('Push event but no data or invalid JSON', event.data.text()); 
        return; 
    } 

    // Options for the notification
    const options = { 
        body: data.body || 'You have a new notification', 
        icon: data.icon || '/images/defaultIcon.png', // fallback icon 
        actions: data.actions || [], // Custom actions
        badge: data.badge || '/images/volleyballA.png', 
        vibrate: data.vibrate || [200, 100, 200], 
    }; 

    // Show the notification
    event.waitUntil( 
        self.registration.showNotification(data.title || 'Notification', options) 
    ); 
}); 

// Handle notification click events
self.addEventListener('notificationclick', function(event) { 
    event.notification.close(); 

    event.waitUntil( 
        clients.matchAll({ type: 'window' }).then(function(clientList) { 
            for (var i = 0; i < clientList.length; i++) { 
                var client = clientList[i]; 
                if (client.url == '/' && 'focus' in client) return client.focus(); 
            }
            if (clients.openWindow) return clients.openWindow('/'); 
        }) 
    );  
});  

// Fetch event to handle caching, but bypass Cloudinary and upload requests
