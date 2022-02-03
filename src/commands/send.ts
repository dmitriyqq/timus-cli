import { Command, CliUx } from '@oclif/core'
import axios from 'axios';
import FormData = require('form-data');
import { TIMUS_HOST, TIMUS_SEND_URL } from '../constants';
import { parse } from 'path';
import { readFileSync } from 'fs';
import { getDisplayStatus } from './status';
import { Keystore } from '../lib/keystore';

export default class Send extends Command {
  private keystore = new Keystore();

  async sendSolution(problemId: string, source: string, judgeId: string) {
    CliUx.ux.action.start(`Sending solution for problemt ${problemId}`);

    const form = new FormData();
    form.append('Action', 'submit');
    form.append('SpaceID', '1');
    form.append('JudgeID', judgeId);
    form.append('Language', '68');
    form.append('ProblemNum', problemId);
    form.append('Source', source);

    const response = await axios.post(`${TIMUS_HOST}/${TIMUS_SEND_URL}?space=1`, form.getBuffer(), {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...form.getHeaders(),
      }
    });

    CliUx.ux.action.stop(`Solution sent (${response.statusText})`);
  }


  static description = 'send solution to the timus'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
  }

  static args = [{ name: 'file' }]

  public async run(): Promise<void> {
    try {

      const cwd = process.cwd();
      const path = parse(cwd);

      const judgeId = await this.keystore.getJudgeId();
      const authorId = await this.keystore.getAuthorId();

      if (!Number.isSafeInteger(Number(path.name)) || path.name.length !== 4) {
        throw new Error(`Invalid task id ${path.name} ${path.name.length !== 4} ${Number.isSafeInteger(path.name)}`);
      }

      const source = readFileSync('main.cpp', { encoding: 'utf-8' });

      await this.sendSolution(path.name, source, judgeId);

      CliUx.ux.action.start(`Waiting before checking out status`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const status = await getDisplayStatus(authorId);
      CliUx.ux.action.stop(`Status loaded`);

      this.log(status);
    } catch (error) {
      this.error(`Error: ${error}`);
    }
  }
}
