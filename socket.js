module.exports = class Socket {
  constructor() {
    this.io = null;
  }

  static init = (httpServer) => {
    this.io = require("socket.io")(httpServer, {
      cors: {
        origin: "*",
      },
    });
    return this.io;
  };

  static getIO = () => {
    if (!this.io) throw new Error("Socket.io not initialized!");
    return this.io;
  };
};
