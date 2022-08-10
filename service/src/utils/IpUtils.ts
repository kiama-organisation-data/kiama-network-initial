import os from 'os';

class IpUtils {
    constructor() {
    }

    getAdress() {
        const ifaces = os.networkInterfaces();
        // get the first ipv4 address
        for (const dev in ifaces) {
            if (ifaces.hasOwnProperty(dev)) {
                const iface = ifaces[dev];
                for (const alias of iface) {
                    if (alias.family === 'IPv4' && alias.address !== '.address') {
                        const ip = alias;
                        return ip;
                    }
                }
            }
        }
    }

    getIpAdress() {
        const ifaces = os.networkInterfaces();
        // get the first ipv4 address
        for (const dev in ifaces) {
            if (ifaces.hasOwnProperty(dev)) {
                const iface = ifaces[dev];
                for (const alias of iface) {
                    if (alias.family === 'IPv4' && alias.address !== '.address') {
                        const ip = alias.address;
                        return ip;
                    }
                }
            }
        }
    }

    getMacAddress() {
        const ifaces = os.networkInterfaces();
        for (const dev in ifaces) {
            if (ifaces.hasOwnProperty(dev)) {
                const iface = ifaces[dev];
                for (const alias of iface) {
                    if (alias.family === 'IPv4' && alias.address !== '.address') {
                        const mac = alias.mac;
                        return mac;
                    }
                }
            }
        }
    }
}

export const ipUtils = new IpUtils();