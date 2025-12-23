// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import inquirer from 'inquirer';
import { askProjectName } from '../create-app/user-prompts';

jest.mock('inquirer');

describe('user prompts', () => {
  const promptMock = inquirer.prompt as jest.MockedFunction<typeof inquirer.prompt>;

  beforeEach(() => {
    promptMock.mockReset();
  });

  it('shows a visible default and transformer for project name input', async () => {
    const captured: any[] = [];
    promptMock.mockImplementation(async (questions: any) => {
      captured.push(...questions);
      return { projectName: 'custom-app' };
    });

    const result = await askProjectName({}, 'sparkling-app');

    expect(result).toBe('custom-app');
    const question = captured[0];
    expect(question.type).toBe('input');
    expect(question.default).toBe('sparkling-app');
    expect(question.transformer('')).toBe('sparkling-app');
    expect(question.transformer('typed')).toBe('typed');
  });
});
