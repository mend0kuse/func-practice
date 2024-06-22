import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, beginCell, toNano, Dictionary, Slice } from '@ton/core';
import { MergeDictionaries } from '../wrappers/MergeDictionaries';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

function objectDict(obj: Record<number, number>) {
    const dict = Dictionary.empty<bigint, Slice>();

    for (const key in obj) {
        dict.set(BigInt(key), beginCell().storeUint(obj[key], 256).asSlice());
    }

    return dict;
}

describe('MergeDictionaries', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('MergeDictionaries');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let mergeDictionaries: SandboxContract<MergeDictionaries>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        mergeDictionaries = blockchain.openContract(MergeDictionaries.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await mergeDictionaries.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: mergeDictionaries.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {});

    // TODO:
    it('should mergeMaps', async () => {
        const dict = objectDict({ 1: 2 });
        const dict2 = objectDict({ 2: 3 });

        const result = await mergeDictionaries.getMergedHashmaps(
            beginCell().storeDictDirect(dict).endCell(),
            beginCell().storeDictDirect(dict2).endCell(),
        );
    });
});
