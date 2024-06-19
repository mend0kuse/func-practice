import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, beginCell, toNano } from '@ton/core';
import { Identifier } from '../wrappers/Identifier';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Identifier', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Identifier');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let manager: SandboxContract<TreasuryContract>;
    let identifier: SandboxContract<Identifier>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        manager = await blockchain.treasury('manager');
        identifier = blockchain.openContract(Identifier.createFromConfig({ managerAddress: manager.address }, code));

        const deployResult = await identifier.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: identifier.address,
            deploy: true,
        });
    });

    it('should deploy', async () => {});

    it('should save address by manager message', async () => {
        const savedUser = await blockchain.treasury('savedUser');
        await identifier.sendAddressByManager(manager.getSender(), toNano('0.05'), savedUser.address);
        expect(await identifier.getSavedByManagerAddress()).toEqualAddress(savedUser.address);

        const savedUser2 = await blockchain.treasury('savedUser2');
        await identifier.sendAddressByManager(manager.getSender(), toNano('0.05'), savedUser2.address);
        expect(await identifier.getSavedByManagerAddress()).toEqualAddress(savedUser2.address);
    });

    it('should throw error if saving address message sent not by manager', async () => {
        const user = await blockchain.treasury('user');

        const result = await user.send({
            to: identifier.address,
            value: toNano('1'),
            body: beginCell()
                .storeUint(1, 32) // op
                .storeUint(11, 64) // query_id
                .storeAddress(user.address)
                .endCell(),
        });

        expect(result.transactions).toHaveTransaction({
            exitCode: 1001,
            from: user.address,
            to: identifier.address,
            success: false,
        });

        expect(await identifier.getSavedByManagerAddress()).toBeNull();
    });

    it('should proxy message', async () => {
        const user = await blockchain.treasury('user');

        const result = await user.send({
            to: identifier.address,
            value: toNano('1'),
            body: beginCell().storeUint(2, 32).storeUint(30, 64).endCell(),
        });

        console.log('user address:', user.address);
        console.log('stored address:', await identifier.getSavedByManagerAddress());
        console.log('manager address:', await identifier.getManagerAddress());

        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: identifier.address,
            success: true,
        });

        expect(result.transactions).toHaveTransaction({
            from: identifier.address,
            to: user.address,
            success: true,
            op: 3,
        });
    });

    it('should throw error in unknown op', async () => {
        const user = await blockchain.treasury('user');

        const result = await user.send({
            to: identifier.address,
            value: toNano('1'),
            body: beginCell().storeUint(123, 32).storeUint(30, 64).endCell(),
        });

        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: identifier.address,
            success: false,
            exitCode: 6,
        });
    });
});
