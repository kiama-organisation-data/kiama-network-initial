import Users, { IUser } from "../model/UsersAuth.Model";

class userServices {
    constructor() { }

    /**
     * verify username and propose a new username until it is unique
     * @param {String} username
     * @return {Promise} - Promise containing the unique account name
     */

    proposeUsername = async (username: string) => {
        let newUsername = username;
        let usernameExist = await Users.findOne({ username: newUsername });
        while (usernameExist) {
            newUsername = username + Math.floor(Math.random() * 100);
            usernameExist = await Users.findOne({ username: newUsername });
        }
        return newUsername;
    }

    userFindOne(id: string) {
        return Users.findById(id)
    }

    // get user _id blocked
    getUserBlocked(id: string) {
        const users = Users.findById(id).select("blockedUsers");
        // @ts-ignore
        return users.blockedUsers
    }
}

export default new userServices();
