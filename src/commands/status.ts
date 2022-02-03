import axios from 'axios';
import {CliUx, Command} from '@oclif/core'
import cheerio from 'cheerio';
import * as fs from 'fs';
import { compile } from 'html-to-text';
import { TIMUS_HOST, TIMUS_STATUS_URL } from '../constants';
import { Keystore } from '../lib/keystore';

const convert = compile({
  wordwrap: 80,
  selectors: [ 
    { 
      selector: 'table.status', 
      format: 'dataTable',
      options: {
        rowSpacing: 1,
      }
    },
  ],
});

const fetchStatus = async (authorId: string) => {
  const response = await axios.get(`${TIMUS_HOST}/${TIMUS_STATUS_URL}?author=${authorId}&refresh=0`);
  return response.data;
}

export const getDisplayStatus = async (authorId: string) => {
  const rawStatus = await fetchStatus(authorId);

  const $ = cheerio.load(rawStatus);
  $('th.id').remove();
  $('th.date').remove();
  $('th.coder').remove();
  $('th.language').remove();

  $('th.result').replaceWith('<th>Result</th>')
  $('th.memory').replaceWith('<th>Memory</th>')
  $('th.runtime').replaceWith('<th>Time</th>')

  $('td.id').remove();
  $('td.date').remove();
  $('td.coder').remove();
  $('td.language').remove();
  $('td.status_footer').remove();
  $('td.problem > a').each((i, item) => { item.tagName = 'i' })

  const rawTable = $('table.status').parent().html() ?? '';

  fs.writeFileSync('status.txt', rawTable);

  return convert(rawTable);
}

export default class Status extends Command {
  private keystore = new Keystore();
  static description = 'fetch status from the timus'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
  }

  static args = []

  public async run(): Promise<void> {
    const authorId = await this.keystore.getAuthorId();
    CliUx.ux.action.start(`Checking out status`);
    const status = await getDisplayStatus(authorId);
    CliUx.ux.action.stop(`Status loaded`);

    this.log(status);
  }
}
