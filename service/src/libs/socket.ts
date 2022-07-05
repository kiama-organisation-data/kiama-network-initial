class Socket {
    public io: any = {}

    init(httpServer: any, opts: any = {}) {
        this.io = require('socket.io')(httpServer, opts)
        return this.io
    }

    getIO() {
        if (!this.io) throw new Error("[Socket.IO] Socket is not initialize!")
        return this.io
    }
}

export default new Socket()