// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import help from '../help';

describe('help', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should display help message with all available commands', async () => {
    await help();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Sparkling CLI Usage: sparkling [command]')
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('build[:type]  Builds the current Sparkling project')
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('help          Displays this help message')
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('init [options]  Scaffold a new Sparkling project (alias: create)')
    );
  });

  it('should call console.log exactly once', async () => {
    await help();

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });
});
