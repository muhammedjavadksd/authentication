


let utilHelper = {

    generateAnOTP: (length) => {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        return randomNumber;
    },

    createRandomText: (length) => {
        const characters = 'abcdefghijklmnopqrstuvwxyz';

        let result = '';
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    },


    organizationFileName: (file_name, type) => {
        return type + file_name
    }
}

module.exports = utilHelper;