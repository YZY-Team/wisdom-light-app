// 这是一个简单的 WebSocket 服务端代码示例，基于 Node.js 和 ws 库
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// 存储连接的客户端
let clients = [];

// 当WebSocket服务器启动时输出一条消息
console.log('信令服务器已启动，监听端口 8080');

wss.on('connection', (ws) => {
  // 为客户端分配唯一ID
  ws.id = Date.now().toString();
  
  // 保存新连接的客户端
  clients.push(ws);
  console.log(`新连接加入，当前连接数: ${clients.length}`);

  // 接收消息
  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message);
      console.log(`接收到消息类型: ${msg.type}`);

      switch (msg.type) {
        case 'offer':
          console.log('接收到offer信令');
          broadcastToOthers(ws, msg);
          break;
        case 'answer':
          console.log('接收到answer信令');
          broadcastToOthers(ws, msg);
          break;
        case 'candidate':
          console.log('接收到ICE候选信令');
          broadcastToOthers(ws, msg);
          break;
        case 'hangup':
          console.log('接收到挂断信令');
          handleHangup(ws);
          break;
        default:
          console.log('未处理的消息类型:', msg.type);
      }
    } catch (e) {
      console.error('处理消息时出错:', e);
    }
  });

  // 处理连接错误
  ws.on('error', (error) => {
    console.error('WebSocket错误:', error);
  });

  // 关闭连接时清理
  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
    console.log(`连接已关闭，剩余连接数: ${clients.length}`);
  });
});

// 向除发送者外的所有客户端广播消息
function broadcastToOthers(sender, msg) {
  clients.forEach(client => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  });
}

// 处理挂断请求
function handleHangup(sender) {
  // 向所有其他客户端广播挂断信号
  const hangupMessage = {
    type: 'hangup'
  };
  
  broadcastToOthers(sender, hangupMessage);
}

// 定期清理断开的连接
setInterval(() => {
  clients = clients.filter(client => client.readyState === WebSocket.OPEN);
}, 30000);