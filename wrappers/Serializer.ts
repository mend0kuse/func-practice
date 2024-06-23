import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type SerializerConfig = {};

export function serializerConfigToCell(config: SerializerConfig): Cell {
    return beginCell().endCell();
}

export class Serializer implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Serializer(address);
    }

    static createFromConfig(config: SerializerConfig, code: Cell, workchain = 0) {
        const data = serializerConfigToCell(config);
        const init = { code, data };
        return new Serializer(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
