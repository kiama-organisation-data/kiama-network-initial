import os from 'os';
import geoip from 'geoip-lite';

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

    // to verify if it is a valid ipv4 address or not
    getLocation() {
        geoip.reloadDataSync();

        //Asynchronously
        geoip.reloadData(function () {
            console.log("Done");
        });
        var ip = this.getIpAdress();
        // @ts-ignore
        var geo = geoip.lookup(ip);
        return geo;
    }
}

export const ipUtils = new IpUtils();