import {CliUx, Command} from '@oclif/core'
import { Keystore } from '../lib/keystore'


export default class Credentials extends Command {
  private keystore = new Keystore();
  static description = 'Set your AUTHOR_ID and JUDGE_ID'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static args = []

  public async run(): Promise<void> {
    const authorId = await CliUx.ux.prompt('What is your AUTHOR_ID?');
    const judgeId = await CliUx.ux.prompt('What is your JUDGE_ID?', { type: 'mask' });

    await this.keystore.saveCredentials(authorId, judgeId);

    this.log('Credentials updated');
  }
}
