import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
    Slice,
} from '@ton/core';

export type HashMapConfig = {};

export function hashMapConfigToCell(config: HashMapConfig): Cell {
    return beginCell().endCell();
}

export class HashMap implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new HashMap(address);
    }

    static createFromConfig(config: HashMapConfig, code: Cell, workchain = 0) {
        const data = hashMapConfigToCell(config);
        const init = { code, data };
        return new HashMap(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendNewKeyVal(provider: ContractProvider, via: Sender, value: bigint, key: bigint, valid_until: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(1n, 32)
                .storeUint(111n, 64)
                .storeUint(key, 256)
                .storeUint(valid_until, 64)
                .endCell(),
        });
    }

    async sendClearExpiredValues(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(2, 32).storeUint(120, 64).endCell(),
        });
    }

    async getValue(provider: ContractProvider, key: bigint) {
        const result = (await provider.get('get_value', [{ type: 'int', value: key }])).stack;
        return result.readBigNumber();
    }
}
