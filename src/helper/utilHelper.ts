interface UtilHelper {
    generateAnOTP: (length: number) => number;
    createRandomText: (length: number) => string;
    organizationFileName: (file_name: string, type: string) => string;
    isFalsyValue: (data: any) => boolean
}

const utilHelper: UtilHelper = {
    generateAnOTP: (length: number): number => {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        return randomNumber;
    },

    createRandomText: (length: number): string => {
        const characters = 'abcdefghijklmnopqrstuvwxyz';

        let result = '';
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    },

    organizationFileName: (file_name: string, type: string): string => {
        return type + file_name;
    },

    isFalsyValue: (data: any) => {
        return data == "" || data == null || data == undefined
    }
};

export default utilHelper;


