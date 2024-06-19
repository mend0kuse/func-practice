import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, beginCell, toNano } from '@ton/core';
import { Proxy } from '../wrappers/Proxy';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Proxy', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Proxy');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let proxy: SandboxContract<Proxy>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');

        proxy = blockchain.openContract(Proxy.createFromConfig({ owner: deployer.address }, code));

        const deployResult = await proxy.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: proxy.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and proxy are ready to use
    });

    it('should not forward from owner', async () => {
        const result = await deployer.send({
            to: proxy.address,
            value: toNano('1'),
        });

        expect(result.transactions).not.toHaveTransaction({
            from: proxy.address,
            to: deployer.address,
        });
    });

    it('should forward from other user', async () => {
        const caller = await blockchain.treasury('caller');
       
        console.log("caller.address", caller.address);
        console.log("deployer.address", deployer.address);
        console.log("proxy.address", proxy.address);

        const result = await caller.send({
            to: proxy.address,
            value: toNano('1'),
            body: beginCell().storeStringTail('Hello, world!').endCell(),
        });

        expect(result.transactions).toHaveTransaction({
            from: proxy.address,
            to: deployer.address,
            body: beginCell()
                .storeAddress(caller.address)
                .storeRef(beginCell().storeStringTail('Hello, world!').endCell())
                .endCell(),
            value: (x) => toNano('0.99') <= x! && x! <= toNano('1'),
        });
    });
});
