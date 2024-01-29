import io from 'socket.io-client';
import { getWebSocketUrl } from './environment';

const tenantUid = localStorage.getItem('tenantUid');

const socket = io(getWebSocketUrl(), {
  path: '/api/v1/socket.io/',
  transports: ['websocket'],
  query: { id: tenantUid },
}); // Replace the URL with your Socket.io server URL

export default socket;
