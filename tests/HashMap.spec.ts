import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, beginCell, toNano } from '@ton/core';
import { HashMap } from '../wrappers/HashMap';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('HashMap', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('HashMap');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let hashMap: SandboxContract<HashMap>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        blockchain.now = 2500;

        hashMap = blockchain.openContract(HashMap.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await hashMap.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: hashMap.address,
            deploy: true,
        });

        await hashMap.sendNewKeyVal(deployer.getSender(), toNano('0.05'), 1n, 1000n);
        await hashMap.sendNewKeyVal(deployer.getSender(), toNano('0.05'), 2n, 2000n);
        await hashMap.sendNewKeyVal(deployer.getSender(), toNano('0.05'), 3n, 3000n);
    });

    it('should deploy', async () => {});

    it('should set new value', async () => {
        expect(await hashMap.getValue(1n)).toBe(1000n);
    });

    it('should throw if no value with passed key', async () => {
        await expect(hashMap.getValue(5n)).rejects.toThrow();
    });

    it('should clear', async () => {
        await hashMap.sendClearExpiredValues(deployer.getSender(), toNano('0.05'));

        await expect(hashMap.getValue(1n)).rejects.toThrow();
        await expect(hashMap.getValue(2n)).rejects.toThrow();
        expect(await hashMap.getValue(3n)).toBe(3000n);
    });

    it('should throw if clear body contain redundant data', async () => {
        const result = await deployer.send({
            to: hashMap.address,
            value: toNano('1'),
            body: beginCell().storeUint(2, 32).storeUint(30, 64).storeUint(123, 256).endCell(),
        });

        expect(result.transactions).toHaveTransaction({
            exitCode: 9,
        });
    });

    it('should throw if unknown op', async () => {
        const result = await deployer.send({
            to: hashMap.address,
            value: toNano('1'),
            body: beginCell().storeUint(123, 32).storeUint(30, 64).endCell(),
        });

        expect(result.transactions).toHaveTransaction({
            exitCode: 6,
        });
    });
});
