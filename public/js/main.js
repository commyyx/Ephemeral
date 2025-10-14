let secureChat;

document.addEventListener('DOMContentLoaded', () => {
  secureChat = new SecureChat();

  // Controlla se c'è un room ID nell'URL
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const roomId = hashParams.get('room');
  const key = hashParams.get('key');

  if (roomId && key) {
    document.getElementById('join-room-input').value = window.location.href;
    setTimeout(() => {
      if (secureChat.isConnected) {
        secureChat.joinRoom();
      } else {
        setTimeout(() => secureChat.joinRoom(), 2000);
      }
    }, 1000);
  }
});
