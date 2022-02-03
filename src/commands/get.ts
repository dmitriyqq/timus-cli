import { Command } from '@oclif/core'
import axios from 'axios';
import { writeFileSync } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { SOURCE_TEMPLATE, TIMUS_HOST, TIMUS_PROBLEM_URL } from '../constants';
import cheerio from 'cheerio';
import { compile } from 'html-to-text';

const convert = compile({
  wordwrap: 80,
  selectors: [
    {
      selector: '.sample',
      format: 'dataTable',
      options: {
        rowSpacing: 1,
      }
    }
  ],
});

const fetchStatement = async (taskId: number) => {
  const response = await axios.get(`${TIMUS_HOST}/${TIMUS_PROBLEM_URL}?space=1&num=${taskId}`);
  return response.data;
}

export default class Get extends Command {
  static description = 'fetch problem with id'

  static examples = [
    '<%= config.bin %> <%= command.id %> 1001',
  ]

  static args = [{
    name: 'taskId',
    required: true,
    // parse: (input: any) => parseInt(input),
  }]

  public async run(): Promise<void> {
    const { args } = await this.parse(Get)

    const { taskId } = args;

    if (!taskId) {
      throw new Error(`TaskId is not set!`);
    }

    if (Number.isSafeInteger(taskId) && taskId.length !== 4) {
      throw new Error(`Task id is invalid: ${taskId}`);
    }

    const dirName = join('.', taskId);
    await mkdir(dirName);

    const sourceFileName = join(dirName, 'main.cpp');
    writeFileSync(sourceFileName, SOURCE_TEMPLATE)


    const rawStatementText = await fetchStatement(taskId);

    const $ = cheerio.load(rawStatementText);
    const statementText = $('.problem_content').html() ?? '';

    const statementFileName = join(dirName, 'task.txt');
    writeFileSync(statementFileName, convert(statementText));
  }
}
