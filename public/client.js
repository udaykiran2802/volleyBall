const publicVapidKey = 'BCxb0euQVTNhGOanwQGkhmLp31SB-5LMaZjcrtF6-NspJ10rOWxHchg6Um8ahBxrlz7SwG-pvyVZbQstFlxdSOo';
// Function to subscribe the user to notifications 
function subscribeUserToNotifications() { 
    // Check if service worker and push manager are supported 
    if ('serviceWorker' in navigator && 'PushManager' in window) { 
        navigator.serviceWorker.register('/worker.js') 
            .then(function (registration) { 
                console.log('Service Worker registered with scope:', registration.scope); 
 
                // Check if subscription exists 
                navigator.serviceWorker.ready.then(function (registration) { 
                    return registration.pushManager.getSubscription().then(async function (subscription) { 
                        if (!subscription) { 
                            // Subscribe the user 
                            const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey); 
                            subscription = await registration.pushManager.subscribe({ 
                                userVisibleOnly: true, // Ensure notifications are shown to the user 
                                applicationServerKey: convertedVapidKey 
                            }); 
 
                            // Send subscription to your server 
                            await fetch('/subscribe', { 
                                method: 'POST', 
                                body: JSON.stringify(subscription), 
                                headers: { 
                                    'Content-Type': 'application/json' 
                                } 
                            }); 
                        } else { 
                            console.log('User is already subscribed.'); 
                        } 
                    }); 
                }); 
            }) 
            .catch(function (error) { 
                console.error('Service Worker registration failed:', error); 
            }); 
    } else { 
        console.warn('Push messaging is not supported'); 
    } 
} 
 
// Utility function to convert VAPID public key to UInt8Array 
function urlBase64ToUint8Array(base64String) { 
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4); 
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/'); 
 
    const rawData = window.atob(base64); 
    const outputArray = new Uint8Array(rawData.length); 
 
    for (let i = 0; i < rawData.length; ++i) { 
        outputArray[i] = rawData.charCodeAt(i); 
    } 
 
    return outputArray; 
} 