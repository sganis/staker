const {runLocal} = require('../src/main/command');

describe("Run local command tests", () => {
    test('hostname', async () => {
        let r = await runLocal('hostname');
        expect(r.stderr).toBe('');
        expect(r.stdout).not.toBe('');
    });
    test('Invalid command', async () => {
        let r = await runLocal('dir111');
        expect(r.stdout).toBe('');
        expect(r.stderr).toMatch(/not/);
    });
});
