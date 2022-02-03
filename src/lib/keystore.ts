import * as keytar from 'keytar'
import { AUTHOR_ID_KEY, JUDGE_ID_KEY, SERVICE } from '../constants'

export class Keystore {
    async saveCredentials(authorId: string, judgeId: string) {
        const credentials = await keytar.findCredentials(SERVICE);
        for (const { account } of credentials) {
          await keytar.deletePassword(SERVICE, account);
        }
    
        await keytar.setPassword(SERVICE, AUTHOR_ID_KEY, authorId);
        await keytar.setPassword(SERVICE, JUDGE_ID_KEY, judgeId);
    }

    async getAuthorId() {
        const password = await keytar.getPassword(SERVICE, AUTHOR_ID_KEY);
        if (!password) {
            throw new Error(`${AUTHOR_ID_KEY} is not saved`);
        }
        return password;
    }

    async getJudgeId() {
        const password = await keytar.getPassword(SERVICE, JUDGE_ID_KEY);
        if (!password) {
            throw new Error(`${JUDGE_ID_KEY} is not saved`);
        }
        return password;
    }
}