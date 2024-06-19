import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type IdentifierConfig = {
    managerAddress: Address;
};

export function identifierConfigToCell(config: IdentifierConfig): Cell {
    return beginCell().storeAddress(config.managerAddress).endCell();
}

export class Identifier implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new Identifier(address);
    }

    static createFromConfig(config: IdentifierConfig, code: Cell, workchain = 0) {
        const data = identifierConfigToCell(config);
        const init = { code, data };
        return new Identifier(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendAddressByManager(provider: ContractProvider, via: Sender, value: bigint, savedAddress: Address) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(1, 32) // op
                .storeUint(11, 64) // query_id
                .storeAddress(savedAddress)
                .endCell(),
        });
    }

    async getManagerAddress(provider: ContractProvider) {
        const result = (await provider.get('get_manager_address', [])).stack;
        return result.readAddress();
    }

    async getSavedByManagerAddress(provider: ContractProvider) {
        const result = (await provider.get('get_saved_by_manager_address', [])).stack;

        try {
            return result.readAddress();
        } catch {
            return null;
        }
    }

    async sendProxyMessage(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(2, 32) // op
                .storeUint(30, 64) // query_id
                .endCell(),
        });
    }
}
