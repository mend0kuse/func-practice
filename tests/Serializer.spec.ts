import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { Serializer } from '../wrappers/Serializer';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Serializer', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Serializer');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let serializer: SandboxContract<Serializer>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        serializer = blockchain.openContract(Serializer.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await serializer.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: serializer.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // TODO: tests
        // the check is done inside beforeEach
        // blockchain and serializer are ready to use
    });
});
