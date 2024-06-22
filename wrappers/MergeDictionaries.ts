import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Dictionary,
    Sender,
    SendMode,
} from '@ton/core';

export type MergeDictionariesConfig = {};

export function mergeDictionariesConfigToCell(config: MergeDictionariesConfig): Cell {
    return beginCell().endCell();
}

export class MergeDictionaries implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new MergeDictionaries(address);
    }

    static createFromConfig(config: MergeDictionariesConfig, code: Cell, workchain = 0) {
        const data = mergeDictionariesConfigToCell(config);
        const init = { code, data };
        return new MergeDictionaries(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getMergedHashmaps(provider: ContractProvider, a: Cell, b: Cell) {
        const result = (
            await provider.get('get_merge_hashmaps', [
                { type: 'cell', cell: a },
                { type: 'cell', cell: b },
            ])
        ).stack;

        return [result.readCell(), result.readCell()];
    }
}
